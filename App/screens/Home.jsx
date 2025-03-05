import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  Modal, 
  Alert, 
  TouchableWithoutFeedback, 
  Keyboard,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';

const Home = ({ navigation }) => {
    // Replace with your respective API keys
    const MAPY_API_KEY = 'gFeJKlnchNFmUiLYjhegVqd2x7dJ2wq34nmUCYhtWRc';
    const GOOGLE_API_KEY = 'AIzaSyAHby6PMEKN1H4k9QUbTRlBqtzpGiBLsUA';
    
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
    const mapRef = useRef(null);
    const debounceTimeoutRef = useRef(null);
    const abortControllerRef = useRef(null);

    useEffect(() => {
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
    }, [searchQuery]);

    const handleSuggestionPress = (suggestion) => {
        setSearchQuery(suggestion.title);
        setSuggestions([]);
        Keyboard.dismiss();

        // Get the place details to obtain geometry (lat/lng)
        fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.placeId}&key=${GOOGLE_API_KEY}`
        )
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
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
            } else {
                Alert.alert("Error", "Place details not found");
            }
        })
        .catch(error => {
            Alert.alert("Error", "Failed to fetch place details");
            console.error(error);
        });
    };

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            Alert.alert("Enter search query", "Please type a location to search for.");
            return;
        }
        // If suggestions already exist, use the first one
        if (suggestions.length > 0) {
            handleSuggestionPress(suggestions[0]);
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
                    });
                } else {
                    Alert.alert("No results found", "Please try a different search term.");
                }
            })
            .catch(error => {
                Alert.alert("Error", "Failed to search for the location.");
                console.error(error);
            });
        }
    };

    const handleCreatePath = () => {
        console.log('Create Path button pressed');
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

    return (
        <TouchableWithoutFeedback onPress={() => {
            Keyboard.dismiss();
            setInputFocused(false);
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
                    </MapView>

                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for a place..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onFocus={() => setInputFocused(true)}
                            onSubmitEditing={() => setSuggestions([])}
                        />
                        {isLoading && <ActivityIndicator size="small" color="#1E232C" />}
                        <TouchableOpacity style={styles.iconContainer} onPress={openDrawer}>
                            <Icon name="user" size={20} color="#1E232C" />
                        </TouchableOpacity>

                        {inputFocused && suggestions.length > 0 && (
                            <View style={styles.suggestionsContainer}>
                                <ScrollView 
                                    style={styles.suggestionsList}
                                    keyboardShouldPersistTaps="always"
                                >
                                    {suggestions.map((suggestion, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.suggestionItem}
                                            onPress={() => handleSuggestionPress(suggestion)}
                                        >
                                            <Text style={styles.suggestionText}>
                                                {suggestion.title}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleCreatePath}>
                        <Text style={styles.buttonText}>Create Path</Text>
                    </TouchableOpacity>
                </View>

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
        height: 40,
        backgroundColor: 'white',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    searchInput: {
        flex: 1,
    },
    iconContainer: {
        paddingLeft: 10,
    },
    suggestionsContainer: {
        position: 'absolute',
        top: 50,
        left: 10,
        right: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        maxHeight: 200,
        elevation: 3,
        zIndex: 999,
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
});

export default Home;
