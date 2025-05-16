import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/Login.jsx';
import RegisterScreen from './screens/Register.jsx';
import MainScreen from './screens/Main.jsx';
import ChoiceScreen from './screens/Choice.jsx';
import HomeScreen from './screens/Home.jsx';
import FormScreen from './screens/Form.jsx';
import UserScreen from './screens/User.jsx';
import { useFonts } from "expo-font";
import { Urbanist_400Regular, Urbanist_500Medium, Urbanist_600SemiBold, Urbanist_700Bold } from "@expo-google-fonts/urbanist";
import { Text } from 'react-native';

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold
  });
  
  if (!fontsLoaded) {
    return <Text>Loading fonts...</Text>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main" >
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: '' }} />
      <Stack.Screen name="Register" component={RegisterScreen}  options={{ title: '' }} />
      <Stack.Screen name="Main" component={MainScreen} options={{ title: ' ' }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: ' ' , }} />
      <Stack.Screen name="Choice" component={ChoiceScreen} options={{ title: ' ' }} />
      <Stack.Screen name="Form" component={FormScreen} options={{ title: ' ' }} />
      <Stack.Screen name="User" component={UserScreen} options={{ title: ' ' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// navigate - push in forgotten
// popToTop - pop in the first screen in stack
