import { Text, StyleSheet, TouchableOpacity } from 'react-native';
const ButtonDark = ({ width = '85%', text = 'Login', onPress }) => {
    return (
        <TouchableOpacity
            style={[styles.button, { width: width }]}
            onPress={onPress}>
            <Text style={styles.buttonText}>{text}</Text>
        </TouchableOpacity>
    );
};
const styles = StyleSheet.create({
    button: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(30, 35, 44, 0.7)',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E232C',
    },
    buttonText: {
        fontSize: 15,
        fontFamily: 'Urbanist_600SemiBold',
        color: 'white',
    },
});

export default ButtonDark;
