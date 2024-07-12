import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Menu, Button, Provider } from 'react-native-paper';

const HomeScreen = ({ navigation, route }) => {
  const [visible, setVisible] = useState(false);
  const [username, setUsername] = useState('Guest'); // Default username

  useEffect(() => {
    // Fetch username from route params if available
    if (route.params && route.params.username) {
      setUsername(route.params.username);
    }
  }, [route.params]);

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  const handleLogout = () => {
    closeMenu();
    navigation.navigate('Auth', { screen: 'Login' }); // Use the nested navigation path
  };

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.menuContainer}>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={<Button onPress={openMenu}>Menu</Button>}
          >
            <Menu.Item onPress={handleLogout} title="Logout" />
          </Menu>
        </View>
        <Text style={styles.text}>Welcome, {username}</Text>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
  menuContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
});

export default HomeScreen;
