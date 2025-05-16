import React, { useState } from 'react';
import { View, Text, TextInput, StatusBar, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/loginScreenStyles';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(prevState => !prevState);
  };

  return (
    <View style={styles.container}>
      <View style={styles.register}> 
        <Text style={styles.text}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
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
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
        />
        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
          <Icon
            name={isPasswordVisible ? 'eye' : 'eye-slash'} 
            size={20}
            color="#6A707C"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.forgetPassword}>
        <Text style={styles.forgetPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <View style={styles.lowerContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Choice')}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>  
      <StatusBar style="auto" />
    </View>
  );
}
