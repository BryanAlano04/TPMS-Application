const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // your MySQL username
  password: '', // your MySQL password
  database: 'tricycle_permit_management',
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services as well
  auth: {
    user: 'balayanbplo24@gmail.com',
    pass: 'tawn wged durl tngn',
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where images will be stored
  },
  filename: (req, file, cb) => {
    cb(null, 'profile.jpg'); // Name of the uploaded image file
  },
});
const upload = multer({ storage });

// Register endpoint
app.post('/register', (req, res) => {
  const { email, password, username } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const token = crypto.randomBytes(16).toString('hex');

  const checkQuery = 'SELECT * FROM user WHERE email = ?';
  db.query(checkQuery, [email], (checkErr, checkResults) => {
    if (checkErr) {
      console.error('Error checking user:', checkErr);
      res.status(500).send({ error: true, message: 'Database error' });
    } else if (checkResults.length > 0) {
      res.send({ error: true, message: 'Email already exists' });
    } else {
      const insertQuery = 'INSERT INTO user (email, password, username, token, active) VALUES (?, ?, ?, ?, ?)';
      db.query(insertQuery, [email, hashedPassword, username, token, 0], (insertErr, insertResult) => {
        if (insertErr) {
          console.error('Error inserting user:', insertErr);
          res.status(500).send({ error: true, message: 'Database error' });
        } else {
          const mailOptions = {
            from: 'balayanbplo24@gmail.com',
            to: email,
            subject: 'Email Confirmation',
            html: `Please click the link to confirm your email: <a href="http://192.168.65.23:3000/confirm-email?token=${encodeURIComponent(token)}">Confirm Email</a>`,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending email:', error);
              res.status(500).send({ error: true, message: 'Failed to send confirmation email' });
            } else {
              res.send({ error: false, message: 'Registration successful! Please check your email to confirm.' });
            }
          });
        }
      });
    }
  });
});

// Email confirmation endpoint
app.get('/confirm-email', (req, res) => {
  const token = req.query.token;
  console.log('Received token:', token); // Add this line for debugging

  const sql = 'SELECT * FROM user WHERE token = ?';
  db.query(sql, [token], (err, result) => {
    if (err) {
      console.error('Error selecting user with token:', err);
      res.status(500).send('Error confirming email.');
    } else if (result.length === 0) {
      console.error('No user found with the provided token');
      res.status(400).send('Invalid token.');
    } else {
      console.log('User found with token:', result[0]); // Add this line for debugging
      const sqlUpdate = 'UPDATE user SET token = NULL, active = 1 WHERE token = ?';
      db.query(sqlUpdate, [token], (updateErr, updateResult) => {
        if (updateErr) {
          console.error('Error updating user status:', updateErr);
          res.status(500).send('Error confirming email.');
        } else {
          if (updateResult.affectedRows === 0) {
            console.error('No rows updated. Invalid token.');
            res.status(400).send('Invalid token.');
          } else {
            console.log('User status updated:', updateResult); // Add this line for debugging
            res.send('Email confirmed successfully!');
          }
        }
      });
    }
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM user WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      res.status(500).send({ error: true, message: 'Database error' });
    } else if (results.length > 0) {
      const user = results[0];
      if (!user.active) {
        res.send({ error: true, message: 'Please confirm your email before logging in.' });
      } else if (bcrypt.compareSync(password, user.password)) {
        res.send({ error: false, message: 'Login successful' });
      } else {
        res.send({ error: true, message: 'Invalid email or password' });
      }
    } else {
      res.send({ error: true, message: 'Invalid email or password' });
    }
  });
});

// POST endpoint to update profile
app.post('/profile', upload.single('image'), (req, res) => {
  const { userId, firstName, middleName, lastName, address, birthday, plateColor } = req.body;
  const imagePath = req.file ? req.file.path : null;

  const updateQuery = `
    INSERT INTO profiles (user_id, first_name, middle_name, last_name, address, birthday, plate_color, profile_image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    middle_name = VALUES(middle_name),
    last_name = VALUES(last_name),
    address = VALUES(address),
    birthday = VALUES(birthday),
    plate_color = VALUES(plate_color),
    profile_image = VALUES(profile_image)
  `;

  db.query(updateQuery, [userId, firstName, middleName, lastName, address, birthday, plateColor, imagePath], (err, result) => {
    if (err) {
      console.error('Error updating profile:', err);
      res.status(500).send({ error: true, message: 'Database error' });
    } else {
      res.send({ error: false, message: 'Profile updated successfully' });
    }
  });
});

// GET endpoint to fetch profile data
app.get('/profile/:userId', (req, res) => {
  const userId = req.params.userId;
  const selectQuery = 'SELECT * FROM profiles WHERE user_id = ?';
  db.query(selectQuery, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching profile:', err);
      res.status(500).send({ error: true, message: 'Database error' });
    } else {
      if (results.length > 0) {
        res.send({ error: false, profile: results[0] });
      } else {
        res.status(404).send({ error: true, message: 'Profile not found' });
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
