import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import InputField from '../components/InputField';
import ButtonDark from '../components/ButtonDark';
import BottomText from '../components/BottomText';

const SendCode = () => {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verification</Text>
            <Text style={styles.bodyText}>Enter the verification code we just sent on your email address.</Text>
            
            <View style={styles.lowerContainer}> 
                <View style={styles.Inputcontainer}>
                    <InputField 
                        placeholder="" 
                        keyboardType="number-pad"
                        width="18%"
                        maxLength={1}
                    />
                    <InputField 
                        placeholder="" 
                        keyboardType="number-pad"
                        width="18%"
                        maxLength={1}
                    />
                    <InputField 
                        placeholder="" 
                        keyboardType="number-pad"
                        width="18%"
                        maxLength={1}
                    />
                    <InputField 
                        placeholder="" 
                        keyboardType="number-pad"
                        width="18%"
                        maxLength={1}
                    />
                </View>
                
                <ButtonDark 
                    text="Verify" 
                    onPress={() => navigation.navigate('CreateNewPassword')} 
                />
            </View>
        
            <View style={styles.loginContainer}>
                <BottomText 
                    text="Didn't received code? " 
                    buttonText="Resend" 
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#E3E8E8',
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
    },
    Inputcontainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '85%',
        paddingBottom: 15,
    }
});

export default SendCode;