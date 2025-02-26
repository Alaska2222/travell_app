import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';

const BottomText = ({ text = "Don't have an account?", buttonText = "Sign Up", navigation, navigateTo = 'Page' }) => {
    return (
        <View style={styles.conteiner}> 
            <Text style={styles.text}>
                {text} 
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate(navigateTo)}>
                    <Text style={styles.registerText}>{buttonText}</Text>
                </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    conteiner: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    registerText: {
        fontSize: 15,
        color: '#35C2C1',
        fontFamily: 'Urbanist_600SemiBold',
    },
    text: {
        fontSize: 15,
        color: '#1E232C',
        fontFamily: 'Urbanist_600SemiBold',
    },
});

export default BottomText;
