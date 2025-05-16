import { useState } from 'react';
import { Text,View, TouchableOpacity, Alert, TextInput,Keyboard, TouchableWithoutFeedback} from 'react-native';
import ButtonDark from '../components/ButtonDark';
import styles from '../styles/formScreenStyles';

export default function Form({ navigation }) {
  const [experience, setExperience] = useState('');
  const [distance, setDistance] = useState('');
  const [peaks, setPeaks] = useState('');
  const [history, setHistory] = useState([]);

   const SERVER_HOST = 'http://192.168.6.5:8001';

  const handleGenerateRoute = async () => {
    if (!experience) {
      Alert.alert('Validation Error', 'Please select your experience level.');
      console.log('No experience selected');
      return;
    }

    const routeData = {
      experience_level: experience,
      distance_limit: distance ? parseInt(distance, 10) : undefined,
      peak_limit: peaks ? parseInt(peaks, 10) : undefined,
    };
    setHistory(prev => [...prev, routeData]);

    try {
      console.log('Pinging root...');
      const ping = await fetch(`${SERVER_HOST}/`);
      console.log('Root ping status:', ping.status);
      const pingText = await ping.text();
      console.log('Root ping body:', pingText);

      console.log('Fetching from server...');
      const res = await fetch(`${SERVER_HOST}/generate-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeData),
      });
      console.log('HTTP status:', res.status);
      const data = await res.json();
      if (data.status === 'ok') {
        console.log('Route generated, navigating to User');
        navigation.navigate('User', { routeData: data.route });
      } else {
        console.log('No route found');
        Alert.alert('No route found', 'Try different parameters.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Network Error', 'Could not reach route server.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.label}>Experience Level*</Text>
        <View style={styles.dropdownContainer}>
          {['Beginner', 'Amateur', 'Experienced'].map(level => (
            <TouchableOpacity
              key={level}
              onPress={() => {
                console.log('🎚 Experience set to:', level);
                setExperience(level);
              }}
              style={[
                styles.dropdownOption,
                experience === level && styles.dropdownSelected,
              ]}
            >
              <Text>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.inptContainer}>
          <TextInput
            placeholder="Distance"
            keyboardType="numeric"
            value={distance}
            onChangeText={text => {
              console.log(' Distance input:', text);
              setDistance(text);
            }}
            style={styles.input}
          />
        </View>
        <View style={styles.inptContainer}>
          <TextInput
            placeholder="Number of Peaks"
            keyboardType="numeric"
            value={peaks}
            onChangeText={text => {
              console.log('Peaks input:', text);
              setPeaks(text);
            }}
            style={styles.input}
          />
        </View>
        <ButtonDark text="Generate Route" width='90%' onPress={handleGenerateRoute} />
      </View>
    </TouchableWithoutFeedback>
  );
}

