import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const ProfileScreen = () => {
  const [image, setImage] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [birthday, setBirthday] = useState('');
  const [plateColor, setPlateColor] = useState('');

  useEffect(() => {
    fetchProfileData(); // Fetch profile data on component mount
  }, []);

  const fetchProfileData = () => {
    // Replace with your actual user ID logic (e.g., from authentication context)
    const userId = 1; // Example user ID, replace with actual logic
    axios.get(`http://192.168.0.114:3000/profile/${userId}`)
      .then(response => {
        const { profile } = response.data;
        setFirstName(profile.first_name);
        setMiddleName(profile.middle_name);
        setLastName(profile.last_name);
        setAddress(profile.address);
        setBirthday(profile.birthday);
        setPlateColor(profile.plate_color);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to fetch profile data');
      });
  };

  const updateProfile = () => {
    const userId = 1; // Example user ID, replace with actual logic
    // Prepare form data
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('firstName', firstName);
    formData.append('middleName', middleName);
    formData.append('lastName', lastName);
    formData.append('address', address);
    formData.append('birthday', birthday);
    formData.append('plateColor', plateColor);
    if (image) {
      formData.append('image', {
        uri: image,
        name: 'profile.jpg',
        type: 'image/jpg',
      });
    }

    // Make POST request to update profile
    axios.post('http://192.168.0.114:3000/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(response => {
      Alert.alert('Success', response.data.message);
    })
    .catch(error => {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const renderEditableField = (label, value, setValue) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
        />
        <TouchableOpacity onPress={() => Alert.alert('Edit', `Edit ${label}`)}>
          <MaterialIcons name="edit" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={image ? { uri: image } : require('../../logo.png')}
          style={styles.profileImage}
        />
      </TouchableOpacity>
      {renderEditableField('First Name', firstName, setFirstName)}
      {renderEditableField('Middle Name', middleName, setMiddleName)}
      {renderEditableField('Last Name', lastName, setLastName)}
      {renderEditableField('Address', address, setAddress)}
      {renderEditableField('Birthday', birthday, setBirthday)}
      {renderEditableField('Plate Color', plateColor, setPlateColor)}
      <TouchableOpacity style={styles.button} onPress={updateProfile}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  fieldContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
