import React, { useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';

const Home = () => {
    // State for selected points and path
    const [points, setPoints] = useState([]);
    const [path, setPath] = useState([]);

    // Default map region (Mount Hoverla, Ukraine)
    const initialRegion = {
        latitude: 48.1608, // Mount Hoverla coordinates
        longitude: 24.4994,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
    };

    // Handle map press to select points
    const handleMapPress = (event) => {
        if (points.length < 2) {
            const newPoint = event.nativeEvent.coordinate;
            setPoints([...points, newPoint]);

            // If two points are selected, create a path
            if (points.length === 1) {
                setPath([points[0], newPoint]);
            }
        }
    };

    // Reset points and path
    const resetPath = () => {
        setPoints([]);
        setPath([]);
    };

    return (
        <View style={styles.container}>
            {/* Map with Mapy.cz hiking layer */}
            <MapView
                style={styles.map}
                initialRegion={initialRegion}
                onPress={handleMapPress}
                provider={null} // Disable default provider (Google Maps)
            >
                {/* Mapy.cz hiking layer */}
                <UrlTile
                    urlTemplate="https://mapserver.mapy.cz/turist-m/{z}-{x}-{y}"
                    maximumZ={19}
                    zIndex={1}
                />

                {/* Markers for selected points */}
                {points.map((point, index) => (
                    <Marker
                        key={index}
                        coordinate={point}
                        title={`Point ${index + 1}`}
                    />
                ))}

                {/* Polyline for the path */}
                {path.length > 1 && (
                    <Polyline
                        coordinates={path}
                        strokeColor="#FF0000"
                        strokeWidth={3}
                    />
                )}
            </MapView>

            {/* Create Path Button */}
            <View style={styles.buttonContainer}>
                <Button
                    title="Create Path"
                    onPress={resetPath}
                    disabled={points.length < 2}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#E3E8E8',
    },
    map: {
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
    },
});

export default Home;