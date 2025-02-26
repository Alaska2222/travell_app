import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const InputField = ({ 
    value, 
    onChangeText, 
    placeholder = "Enter text", 
    keyboardType = "default", 
    secureTextEntry = false, 
    width = '85%', 
    height = 50, 
    borderVisible = true,
    marginBottom = 12
}) => {
    return (
        <TextInput
            style={[
                styles.input, 
                { width, height, borderWidth: borderVisible ? 1 : 0, marginBottom }
            ]}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        borderRadius: 8,
        borderColor: '#DADADA',
        backgroundColor: 'white',
        marginBottom: 12,
        paddingHorizontal: 8,
        fontFamily: 'Urbanist_500Medium',
    }
});

export default InputField;
