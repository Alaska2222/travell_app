import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, StatusBar, TouchableOpacity } from 'react-native';
import AppleLoginButton from '../components/AppleLoginButton';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email && password) {
      alert('Logged in successfully!');
    } else {
      alert('Please enter email and password!');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.register}> 
        <Text style={styles.text}>Don't have an account? </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
          style={styles.forgetPassword}
          onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgetPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      
      <View style={styles.lowerContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

      </View>  

      <View style={styles.socialLoginContainer}>
        <Text style={styles.forgetPasswordText}>Or Login with</Text>
        <AppleLoginButton onPress={() => alert('Login with Apple ID')} />
      </View>
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E3E7E8',
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(30, 35, 44, 0.7)',
    backgroundColor: 'white',
    marginBottom: 12,
    paddingHorizontal: 8,
    fontFamily: 'Urbanist Medium',
    width: '85%',
    justifyContent: 'center',
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
    backgroundColor: '#1E232C',
  },
  buttonText: {
    fontSize: 15,
    fontFamily: 'Urbanist SemiBold',
    color: 'white',
  },
  lowerContainer: {
    marginTop: 70,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  forgetPassword: { 
    alignSelf: 'flex-end',  
    marginRight: '8%', 
  },
  forgetPasswordText: {
    color: '#6A707C',
    fontFamily: 'Urbanist SemiBold',
    fontSize: 14,
  },
  register: {
    position: 'absolute',
    bottom: 40, 
    flexDirection: 'row',
  },
  registerText: {
    fontSize: 15,
    color: '#35C2C1',
    fontFamily: 'Urbanist SemiBold',
  },
  text: {
    fontSize: 15,
    color: '#1E232C',
    fontFamily: 'Urbanist SemiBold',
  },
  
  socialLoginContainer: {
    marginTop: 20, 
    alignItems: 'center',
    width: '80%',
    justifyContent: 'center',
  }
});
