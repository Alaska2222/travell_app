import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';

const AppleLoginButton = ({ onPress, width = '35%', height = '25%' }) => {
    return (
        <TouchableOpacity 
            style={[styles.button, { width, height }]} 
            onPress={onPress}
        >
            <Image
                source={require('../assets/apple-logo.png')}
                style={styles.logo}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(30, 35, 44, 0.7)',
        backgroundColor: 'white',
        marginTop: 10,
    },
    logo: {
        width: 20,
        height: 25,
    },
});

export default AppleLoginButton;
