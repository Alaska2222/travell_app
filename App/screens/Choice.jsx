import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/choiceScreenStyles';

export default function Form({ navigation }) {
   
  return (
    <View style={styles.container}>
    <Text style={styles.title}>Make your choice 💪 </Text>
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={() => navigation.navigate('Form')}
        >
          <Text style={[styles.buttonText, styles.loginText]}>Generate Route and Risk Analysis</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.registerButton]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={[styles.buttonText, styles.registerText]}>Only Risk Analysis</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

