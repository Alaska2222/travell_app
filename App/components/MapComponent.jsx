import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert, Keyboard } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';
import { fetchSuggestions, fetchPlaceDetails, GOOGLE_API_KEY } from '../services/googleService';

const MapComponent = ({ startLocation, destinationLocation, mapRef }) => {
    return (
      <MapView
        ref={mapRef}
        style={{ width: '100%', height: 300 }}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {startLocation && <Marker coordinate={startLocation} title="Start" />}
        {destinationLocation && <Marker coordinate={destinationLocation} title="Destination" />}
      </MapView>
    );
  };
  
  export default MapComponent ;