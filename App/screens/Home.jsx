import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, ScrollView, TextInput, ActivityIndicator, Keyboard, TouchableWithoutFeedback} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';
import ButtonDark from '../components/ButtonDark';

const Home = ({ navigation }) => {
  const MAPY_API_KEY = 'gFeJKlnchNFmUiLYjhegVqd2x7dJ2wq34nmUCYhtWRc';
  const GOOGLE_API_KEY = 'AIzaSyAHby6PMEKN1H4k9QUbTRlBqtzpGiBLsUA';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  
  const [isCreatingPath, setIsCreatingPath] = useState(false);
  const [activeField, setActiveField] = useState('start'); 
  const [startLocation, setStartLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  const destinationDebounceTimeoutRef = useRef(null);
  const destinationAbortControllerRef = useRef(null);
  const [isStartSuggestionSelected, setIsStartSuggestionSelected] = useState(false);
  const [isDestinationSuggestionSelected, setIsDestinationSuggestionSelected] = useState(false);
  const destinationInputRef = useRef(null);

  useEffect(() => {
    if (activeField !== 'start' || isStartSuggestionSelected) return;
      if (searchQuery.length <= 2) {
    setSuggestions([]);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    return;
  }
  
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  
    debounceTimeoutRef.current = setTimeout(() => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      const encodedQuery = encodeURIComponent(searchQuery);
      fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodedQuery}&key=${GOOGLE_API_KEY}`,
        { signal: abortControllerRef.current.signal }
      )
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        if (data.predictions) {
          const formatted = data.predictions.map(prediction => ({
            title: prediction.description,
            placeId: prediction.place_id,
          }));
          setSuggestions(formatted);
        }
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          Alert.alert("Error", "Failed to fetch suggestions");
          console.error(error);
        }
      })
      .finally(() => setIsLoading(false));
    }, 300);
  
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [searchQuery, activeField, isStartSuggestionSelected]);
  

  useEffect(() => {
    if (activeField !== 'destination' || isDestinationSuggestionSelected) return;
    if (destinationQuery.length <= 2) {
    setDestinationSuggestions([]);
    if (destinationAbortControllerRef.current) destinationAbortControllerRef.current.abort();
    return;
  }
  
    if (destinationDebounceTimeoutRef.current) {
      clearTimeout(destinationDebounceTimeoutRef.current);
    }
  
    destinationDebounceTimeoutRef.current = setTimeout(() => {
      if (destinationAbortControllerRef.current) destinationAbortControllerRef.current.abort();
      destinationAbortControllerRef.current = new AbortController();
      setIsLoading(true);
      const encodedQuery = encodeURIComponent(destinationQuery);
      fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodedQuery}&key=${GOOGLE_API_KEY}`,
        { signal: destinationAbortControllerRef.current.signal }
      )
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        if (data.predictions) {
          const formatted = data.predictions.map(prediction => ({
            title: prediction.description,
            placeId: prediction.place_id,
          }));
          setDestinationSuggestions(formatted);
        }
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          Alert.alert("Error", "Failed to fetch destination suggestions");
          console.error(error);
        }
      })
      .finally(() => setIsLoading(false));
    }, 300);
  
    return () => {
      if (destinationDebounceTimeoutRef.current) clearTimeout(destinationDebounceTimeoutRef.current);
      if (destinationAbortControllerRef.current) destinationAbortControllerRef.current.abort();
    };
  }, [destinationQuery, activeField,isDestinationSuggestionSelected]);
  
  const handleSuggestionPress = (suggestion, field = 'start') => {
    if (field === 'start') {
        setSearchQuery(suggestion.title);
        setSuggestions([]);  
        setIsStartSuggestionSelected(true);
    } else {
        setDestinationQuery(suggestion.title);
        setDestinationSuggestions([]);  
        setIsDestinationSuggestionSelected(true);
    }

    Keyboard.dismiss();

    setTimeout(() => {
        fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.placeId}&key=${GOOGLE_API_KEY}`
        )
        .then((response) => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then((data) => {
            if (data.result && data.result.geometry && data.result.geometry.location) {
                const { lat, lng } = data.result.geometry.location;
                if (mapRef.current) {
                    mapRef.current.animateToRegion({
                        latitude: lat,
                        longitude: lng,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    });
                }
                if (isCreatingPath) {
                    if (field === 'start') {
                        setStartLocation({ latitude: lat, longitude: lng });
                    } else {
                        setDestinationLocation({ latitude: lat, longitude: lng });
                    }
                }
            } else {
                Alert.alert('Error', 'Place details not found');
            }
        })
        .catch((error) => {
            Alert.alert('Error', 'Failed to fetch place details');
            console.error(error);
        });
    }, 0);
};


  
  const handleSearch = (field = 'start') => {
    if (field === 'start') {
      if (!searchQuery.trim()) {
        Alert.alert("Enter search query", "Please type a location to search for.");
        return;
      }
      if (suggestions.length > 0) {
        handleSuggestionPress(suggestions[0], 'start'); 
      } else {
        
        const encodedQuery = encodeURIComponent(searchQuery);
        fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodedQuery}&key=${GOOGLE_API_KEY}`
        )
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then(data => {
          if (data.predictions && data.predictions.length > 0) {
            const firstPrediction = data.predictions[0];
            handleSuggestionPress({
              title: firstPrediction.description,
              placeId: firstPrediction.place_id,
            }, 'start');
          } else {
            Alert.alert("No results found", "Please try a different search term.");
          }
        })
        .catch(error => {
          Alert.alert("Error", "Failed to search for the location.");
          console.error(error);
        });
      }
    } else {
      if (!destinationQuery.trim()) {
        Alert.alert("Enter search query", "Please type a destination to search for.");
        return;
      }
      if (destinationSuggestions.length > 0) {
        handleSuggestionPress(destinationSuggestions[0], 'destination'); // Same here for destination.
      } else {
        const encodedQuery = encodeURIComponent(destinationQuery);
        fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodedQuery}&key=${GOOGLE_API_KEY}`
        )
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then(data => {
          if (data.predictions && data.predictions.length > 0) {
            const firstPrediction = data.predictions[0];
            handleSuggestionPress({
              title: firstPrediction.description,
              placeId: firstPrediction.place_id,
            }, 'destination');
          } else {
            Alert.alert("No results found", "Please try a different search term.");
          }
        })
        .catch(error => {
          Alert.alert("Error", "Failed to search for the destination.");
          console.error(error);
        });
      }
    }
};

  
  const handleCreatePath = () => {
    setIsCreatingPath(true);
    setActiveField('start');
    setStartLocation(null);
    setDestinationLocation(null);
    setSearchQuery('');
    setDestinationQuery('');
    console.log('Create Path mode enabled');
  };
  
  const handleFinishPath = () => {
    if (!startLocation || !destinationLocation) {
      Alert.alert("Incomplete", "Please set both starting point and destination.");
      return;
    }
    setIsCreatingPath(false);
    Alert.alert("Path Created", "Markers for start and destination are displayed on the map.");
  };
  
  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to Logout?",
      [
        { text: "Reject", onPress: () => {}, style: "cancel" },
        { text: "Accept", onPress: () => console.log("Logged out") }
      ]
    );
    closeDrawer();
  };
  const handleProfile = () => {
    closeDrawer();
    navigation.navigate('User');
  };

  const reverseGeocode = (coords, field) => {
    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_API_KEY}`
    )
      .then(response => response.json())
      .then(data => {
        if (data.results.length > 0) {
          const address = data.results[0].formatted_address;
          if (field === 'start') {
            setSearchQuery(address);
          } else {
            setDestinationQuery(address);
          }
        }
      })
      .catch(error => console.error("Reverse geocoding failed:", error));
  };
  
  return (
    <TouchableWithoutFeedback onPress={() => {
      Keyboard.dismiss();
    }}>
      <View style={styles.container}>
        <View style={styles.mapContainer}>
        <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: 48.82944,
              longitude: 23.00083,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <UrlTile
              urlTemplate={`https://api.mapy.cz/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=${MAPY_API_KEY}`}
              zIndex={1}
            />
            {isCreatingPath && startLocation && (
              <Marker
                coordinate={startLocation}
                draggable
                pinColor='#449e48'
                onDragEnd={(e) => {
                  const newCoords = e.nativeEvent.coordinate;
                  setStartLocation(newCoords);
                  reverseGeocode(newCoords, 'start');
                }}
              />
            )}

            {isCreatingPath && destinationLocation && (
              <Marker
                coordinate={destinationLocation}
                draggable
                onDragEnd={(e) => {
                  const newCoords = e.nativeEvent.coordinate;
                  setDestinationLocation(newCoords);
                  reverseGeocode(newCoords, 'destination');
                }}
              />
            )}
          </MapView>
  
          <View style={styles.searchContainer}>
            {isCreatingPath ? (
              <View style={{ flex: 1 }}>
              <TextInput
                style={styles.searchInput}
                placeholder="Starting Point"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setIsStartSuggestionSelected(false); 
                }}
                onFocus={() => setActiveField('start')}
                onSubmitEditing={() => handleSearch('start')}
              />
                {activeField === 'start' && isLoading && <ActivityIndicator size="small" color="#1E232C" />}
                {activeField === 'start' && suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <ScrollView
                      style={styles.suggestionsList}
                      keyboardShouldPersistTaps="always"
                    >
                      {suggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => handleSuggestionPress(suggestion, 'start')}
                        >
                          <Text style={styles.suggestionText}>{suggestion.title}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
  
                <TextInput
                        ref={destinationInputRef}
                        style={[styles.searchInput, { marginTop: 10 }]}
                        placeholder="Destination"
                        value={destinationQuery}
                        onChangeText={(text) => {
                          setDestinationQuery(text);
                          setIsDestinationSuggestionSelected(false);
                        }}
                        onFocus={() => setActiveField('destination')}
                        onSubmitEditing={() => handleSearch('destination')}
                      />


                {activeField === 'destination' && isLoading && <ActivityIndicator size="small" color="#1E232C" />}
                {activeField === 'destination' && destinationSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView
                    style={styles.suggestionsList}
                    keyboardShouldPersistTaps="always"
                  >
                    {destinationSuggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => handleSuggestionPress(suggestion, 'destination')}
                      >
                        <Text style={styles.suggestionText}>{suggestion.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
  
                <View style={styles.finishButtonContainer}>
                    <ButtonDark 
                    text="Finish" 
                    width='100%'
                    onPress={handleFinishPath} 
                        />
                </View>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search for a place..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setActiveField('start')}
                  onSubmitEditing={() => handleSearch('start')}
                />
                {activeField === 'start' && isLoading && <ActivityIndicator size="small" color="#1E232C" />}
                {activeField === 'start' && suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <ScrollView 
                      style={styles.suggestionsList}
                      keyboardShouldPersistTaps="always"
                    >
                      {suggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => handleSuggestionPress(suggestion, 'start')}
                        >
                          <Text style={styles.suggestionText}>
                            {suggestion.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </>
            )}
  
            <TouchableOpacity style={styles.iconContainer} onPress={openDrawer}>
              <Icon name="user" size={20} color="#1E232C" />
            </TouchableOpacity>
          </View>
        </View>
  
        {!isCreatingPath && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleCreatePath}>
              <Text style={styles.buttonText}>Create Path</Text>
            </TouchableOpacity>
          </View>
        )}
  
        <Modal
          visible={drawerVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeDrawer}
        >
          <TouchableOpacity style={styles.modalOverlay} onPress={closeDrawer}>
            <View style={styles.drawerContainer}>
              <TouchableOpacity style={styles.drawerOption} onPress={handleProfile}>
                <Text style={styles.drawerOptionText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.drawerOption} onPress={handleLogout}>
                <Text style={styles.drawerOptionText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

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
});

export default Home;
