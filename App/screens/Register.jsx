import React, { useState } from 'react';
import {View, TouchableOpacity } from 'react-native';
import InputField from '../components/InputField';
import ButtonDark from '../components/ButtonDark';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/registerScreenStyles';

export default function Register({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfPasswordVisible, setConfPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(prevState => !prevState);
  };

  return (
    <View style={styles.container}>
      <InputField 
        value={email} 
        onChangeText={setEmail} 
        placeholder="Email" 
        keyboardType="email-address" 
        width='90%'
        style={styles.inputField} 
      />
      <View style={styles.passwordContainer}> 
        <InputField 
          value={password} 
          onChangeText={setPassword} 
          placeholder="Password" 
          secureTextEntry={!isPasswordVisible} 
          style={styles.input}
          marginBottom={0}
          borderVisible={false}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!isPasswordVisible)} style={styles.iconContainer}>
          <Icon name={isPasswordVisible ? 'eye' : 'eye-slash'} size={20} color="#6A707C" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.passwordContainer}> 
        <InputField 
          value={confirmPassword} 
          onChangeText={setConfirmPassword} 
          placeholder="Confirm Password" 
          secureTextEntry={!isConfPasswordVisible} 
          style={styles.input}
          marginBottom={0}
          borderVisible={false}
        />
        <TouchableOpacity onPress={() => setConfPasswordVisible(!isConfPasswordVisible)} style={styles.iconContainer}>
          <Icon name={isConfPasswordVisible ? 'eye' : 'eye-slash'} size={20} color="#6A707C" />
        </TouchableOpacity>
      </View>

      <ButtonDark text="Sign Up" width='90%' onPress={() => navigation.navigate('Login')} />

    
    </View>
  );
}

