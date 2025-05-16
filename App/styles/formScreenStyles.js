import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E3E7E8',
  },
  anotherRegister: {
    color: '#6A707C',
    fontFamily: 'Urbanist_600SemiBold',
    fontSize: 14,
  },
  lowerContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '80%',
    justifyContent: 'center',
  },
  inptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
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
  label: {
    alignSelf: 'flex-start',
    marginLeft: '5%',
    fontSize: 16,
    fontFamily: 'Urbanist_600SemiBold',
    marginBottom: 8,
  },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 30,
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 6,
    backgroundColor: 'white',
    width: '35%',
    alignItems: 'center',
  },
  dropdownSelected: {
    backgroundColor: '#cdeed6',
    borderColor: '#4CAF50',
  },
});

export default styles;