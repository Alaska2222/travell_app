import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    title: {
        fontSize: 32,
        marginBottom: 16,
        fontFamily: 'Urbanist_700Bold',
        paddingHorizontal: 32,
    },
  container: {
    flex: 1,
    backgroundColor: '#E3E7E8',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(30, 35, 44, 0.7)',
    width: '85%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  loginButton: {
    backgroundColor: '#1E232C',
  },
  registerButton: {
    backgroundColor: 'white',
  },
  buttonText: {
    fontSize: 15,
    fontFamily: 'Urbanist_600SemiBold',
  },
  loginText: {
    color: 'white',
  },
  registerText: {
    color: '#1E232C',
  },
});

export default styles;