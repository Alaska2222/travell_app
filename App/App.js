import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/Login.jsx';
import RegisterScreen from './screens/Register.jsx';
import ForgotPasswordScreen from './screens/ForgotPassword.jsx';
import MainScreen from './screens/Main.jsx';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main" >
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: '' }} />
        <Stack.Screen name="Register" component={RegisterScreen}  options={{ title: '' }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: ' ' }} />
        <Stack.Screen name="Main" component={MainScreen} options={{ title: ' ' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// navigate - push in forgotten
// popToTop - pop in the first screen in stack