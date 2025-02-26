import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import AppleLoginButton from '../components/AppleLoginButton';
import InputField from '../components/InputField';
import ButtonDark from '../components/ButtonDark';
import Icon from 'react-native-vector-icons/FontAwesome';

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
        style={styles.inputField} // Added style for spacing
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
      
      <View style={styles.lowerContainer}>
        <Text style={styles.anotherRegister}>Or Sign up with</Text>
        <AppleLoginButton width={100} height={55} onPress={() => alert('Sign Up with Apple ID')} />
      </View>
    
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
  anotherRegister: {
    color: '#6A707C',
    fontFamily: 'Urbanist_600SemiBold',
    fontSize: 14,
  },
  lowerContainer: {
    marginTop: 20, 
    alignItems: 'center',
    width: '80%',
    justifyContent: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    height: 52,
    marginBottom: 20, 
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  input: {
    flex: 1, // Allow InputField to take available space
    height: '100%', // Ensure InputField covers the full height of the container
    paddingHorizontal: 10, // Add padding for better text alignment
  },
  inputField: {
    marginBottom: 30, // Increased marginBottom for more space between Email and Password
  },
  iconContainer: {
    paddingRight: 10, 
    paddingBottom: 10,
  },
});