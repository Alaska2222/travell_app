import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import InputField from '../components/InputField';
import ButtonDark from '../components/ButtonDark';
import BottomText from '../components/BottomText';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.bodyText}>Please enter your email address to restore your password</Text>
            <View style={styles.lowerContainer}> 
                <InputField 
                    value={email} 
                    onChangeText={setEmail} 
                    placeholder="Enter your email" 
                    keyboardType="email-address" 
                />
                <ButtonDark text="Send Code" onPress={() => navigation.navigate('SendCode')} />
                
            </View>
        
            <View style={styles.loginContainer}>
                <BottomText 
                    text="Remember Password? " 
                    buttonText="Login" 
                    navigation={navigation} 
                    navigateTo="Login" 
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#E3E7E8',
    },
    title: {
        fontSize: 35,
        marginBottom: 16,
        fontFamily: 'Urbanist_700Bold',
        paddingHorizontal: 32,
    },
    bodyText: {
        fontSize: 16,
        marginBottom: 24,
        fontFamily: 'Urbanist_500Medium',
        color: '#8391A1',
        paddingHorizontal: 32,
    },
    lowerContainer: {
        marginTop: 70,
        width: '100%',
        alignItems: 'center',
    },
    loginContainer: {
        position: 'absolute',
        bottom: 40, 
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
});

export default ForgotPassword;
