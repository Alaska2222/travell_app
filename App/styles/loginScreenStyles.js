import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E3E7E8',
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DADADA',
    backgroundColor: 'white',
    marginBottom: 12,
    paddingHorizontal: 8,
    fontFamily: 'Urbanist_500Medium',
    width: '90%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 8,
    fontFamily: 'Urbanist_500Medium',
  },
  iconContainer: {
    padding: 10,
  },
  button: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(30, 35, 44, 0.7)',
    width: '90%',
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
  lowerContainer: {
    marginTop: 70,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  forgetPassword: { 
    alignSelf: 'flex-end',  
    marginRight: '8%', 
  },
  forgetPasswordText: {
    color: '#6A707C',
    fontFamily: 'Urbanist_600SemiBold',
    fontSize: 14,
  },
  register: {
    position: 'absolute',
    bottom: 40, 
    flexDirection: 'row',
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
  socialLoginContainer: {
    marginTop: 20, 
    alignItems: 'center',
    width: '80%',
    justifyContent: 'center',
  }
});

export default styles;