import React from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Text } from 'react-native';

export default function Main({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.buttonText, styles.loginText]}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.registerButton]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={[styles.buttonText, styles.registerText]}>Register</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3E7E8',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(30, 35, 44, 0.7)',
    width: '85%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  loginButton: {
    backgroundColor: '#1E232C',
  },
  registerButton: {
    backgroundColor: 'white',
  },
  buttonText: {
    fontSize: 15,
    fontFamily: 'Urbanist SemiBold',
  },
  loginText: {
    color: 'white',
  },
  registerText: {
    color: '#1E232C',
  },
});