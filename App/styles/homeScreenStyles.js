import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#E3E7E8',
  },
  mapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 1000,
  },
  searchInput: {
    height: 35,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
    top: 15,
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    maxHeight: 200,
    elevation: 3,
    marginTop: 5,
  },
  suggestionsList: {
    paddingHorizontal: 10,
  },
  suggestionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
    color: '#1E232C',
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 30,
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
    backgroundColor: 'white',
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 15,
    fontFamily: 'Urbanist_600SemiBold',
    color: '#1E232C',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  drawerOption: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  drawerOptionText: {
    fontSize: 18,
    fontFamily: 'Urbanist_600SemiBold',
    color: '#1E232C',
  },
  finishButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  controls: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
});

export default styles;