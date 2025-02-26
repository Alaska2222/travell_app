import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  Modal, 
  Alert, 
  TouchableWithoutFeedback, 
  Keyboard 
} from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';

const Home = ({ navigation }) => {
    const API_KEY = 'gFeJKlnchNFmUiLYjhegVqd2x7dJ2wq34nmUCYhtWRc';
    const [searchQuery, setSearchQuery] = useState('');
    const [drawerVisible, setDrawerVisible] = useState(false);

    const handleSearch = () => {
        console.log('Searching for:', searchQuery);
    };

    const handleCreatePath = () => {
        console.log('Create Path button pressed');
    };

    const openDrawer = () => {
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
    };

    const handleLogout = () => {
        Alert.alert(
          "Logout",
          "Are you sure you want to Logout?",
          [
            { text: "Cancel", onPress: () => {}, style: "cancel" },
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
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.container}>
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: 48.82944,
                            longitude: 23.00083,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }}
                    >
                        <UrlTile
                            urlTemplate={`https://api.mapy.cz/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=${API_KEY}`}
                            zIndex={1}
                        />
                    </MapView>

                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for a place..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                        />
                        <TouchableOpacity style={styles.iconContainer} onPress={openDrawer}>
                            <Icon name="user" size={20} color="#1E232C" />
                        </TouchableOpacity>
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
