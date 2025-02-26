import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';

const Home = () => {
    const API_KEY = 'gFeJKlnchNFmUiLYjhegVqd2x7dJ2wq34nmUCYhtWRc'; 
    return (
        <View style={styles.container}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
});

export default Home;
