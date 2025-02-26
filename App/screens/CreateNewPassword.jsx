import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import InputField from '../components/InputField';
import ButtonDark from '../components/ButtonDark';
import Icon from 'react-native-vector-icons/FontAwesome';

const CreateNewPassword = () => {
    const navigation = useNavigation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [isConfPasswordVisible, setConfPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible((prevState) => !prevState);
    };

    const toggleConfPasswordVisibility = () => {
        setConfPasswordVisible((prevState) => !prevState);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>Create new password</Text>
                        <Text style={styles.bodyText}>
                            Your new password must be unique from those previously used.
                        </Text>
                    </View>
                    <View style={styles.lowerContainer}>
                        <View style={styles.passwordContainer}>
                            <InputField
                                value={password}
                                onChangeText={setPassword}
                                placeholder="New Password"
                                secureTextEntry={!isPasswordVisible}
                                style={styles.input}
                                marginBottom={0}
                                borderVisible={false}
                            />
                            <TouchableOpacity
                                onPress={togglePasswordVisibility}
                                style={styles.iconContainer}
                            >
                                <Icon
                                    name={isPasswordVisible ? 'eye' : 'eye-slash'}
                                    size={20}
                                    color="#6A707C"
                                />
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
                            <TouchableOpacity
                                onPress={toggleConfPasswordVisibility}
                                style={styles.iconContainer}
                            >
                                <Icon
                                    name={isConfPasswordVisible ? 'eye' : 'eye-slash'}
                                    size={20}
                                    color="#6A707C"
                                />
                            </TouchableOpacity>
                        </View>
                        <ButtonDark text="Reset Password" />
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E3E7E8',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 35,
        marginBottom: 16,
        fontFamily: 'Urbanist_700Bold',
        textAlign: 'left',
    },
    bodyText: {
        fontSize: 16,
        marginBottom: 24,
        fontFamily: 'Urbanist_500Medium',
        color: '#8391A1',
        textAlign: 'left',
    },
    lowerContainer: {
        marginTop: 50,
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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '85%',
        height: 52,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#DADADA',
        borderRadius: 8,
        backgroundColor: 'white',
    },
    input: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 10,
    },
    inputField: {
        marginBottom: 30,
    },
    iconContainer: {
        paddingRight: 10,
    },
});

export default CreateNewPassword;