import { View, TextInput, ScrollView, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

const SearchInput = ({
  placeholder,
  query,
  setQuery,
  suggestions,
  isLoading,
  onSuggestionPress,
}) => {
  
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={query}
        onChangeText={setQuery}
      />
      {isLoading && <ActivityIndicator size="small" color="#1E232C" />}
      {suggestions.length > 0 && (
        <ScrollView style={styles.suggestionsList}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => onSuggestionPress(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  suggestionsList: {
    maxHeight: 150,
    marginTop: 5,
  },
  suggestionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
    color: '#1E232C',
  },
});

export default SearchInput;