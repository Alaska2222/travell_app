import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Keyboard, TouchableWithoutFeedback, Alert, Button, Switch } from 'react-native';
import MapView, { Marker, UrlTile, Polyline } from 'react-native-maps';
import styles from '../styles/homeScreenStyles';
import ButtonDark from '../components/ButtonDark';
import { useRoutePlanner } from '../hooks/useRoutePlanner';
import { analyzeTowerCoverageOnRouteWithCSV, downloadCSVFromGithub } from "../utils/otherMetricsFunctions";
import { fetchUVandSunTimes, fetchAirPollutionSummary, fetchWildfireRiskFromCSV, fetchWeatherForecastSummary } from "../utils/weatherFunctions";
import { fetchWaterFeatures, fetchShops, fetchNaturalFeatures, fetchOtherPOIs, fetchEmergencyPOIs, fetchInformationPOIs, fetchHazards } from "../utils/mapFunctions";
import { fetchElevationData } from "../utils/elevationFunctions";
import { haversineDistanceMeters } from "../utils/distanceFunctions";
import * as FileSystem from "expo-file-system";
import { classifyRisk } from "../utils/classificationTree";
import { MAPY_API_KEY } from '../config.js';


const Home = () => {
  const mapRef = useRef(null);
  const destinationInputRef = useRef(null);

  const handleClassify = () => {
    const result = classifyRisk(metricsRef.current);
 
    console.log("RISK RESULT:", result);
    setRiskPopup(result);
  };
  const {
    showMarkers,
    searchQuery,
    setSearchQuery,
    suggestions,
    setSuggestions,
    destinationQuery,
    setDestinationQuery,
    destinationSuggestions,
    setDestinationSuggestions,
    isCreatingPath,
    setIsCreatingPath,
    activeField,
    setActiveField,
    startLocation,
    setStartLocation,
    destinationLocation,
    setDestinationLocation,
    handleSearch,
    handleSuggestionPress,
    handleFinishPath,
    setJustSelectedStartSuggestion,
    setJustSelectedDestinationSuggestion,
  } = useRoutePlanner(mapRef);

const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [waterFeatures, setWaterFeatures] = useState([]);
  const [shops, setShops] = useState([]);
  const [naturalFeatures, setNaturalFeatures] = useState([]);
  const [otherPOIs, setOtherPOIs] = useState([]);
  const [emergencyPOIs, setEmergencyPOIs] = useState([]);
  const [informationPOIs, setinformationPOIs] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTowers, setShowTowers] = useState(false);
  const [riskPopup, setRiskPopup] = useState(null);
  const [pathFinished, setPathFinished] = useState(false);
  const towerDataRef = useRef([]);
  const airQuality = useRef({});
  const weatherSummary = useRef({});
  const uvSunData = useRef({});
  const fireRisk = useRef({});
  const cellCoverage = useRef({});
  const poiCounts = useRef({});
  const metricsRef = useRef({});


  const [showPOI, setShowPOI] = useState(false);
  const [poiRadius, setPoiRadius] = useState("5km");
  const radiusOptions = ["1km", "2km", "5km", "10km", ">10km"];
  const [metricsReady, setMetricsReady] = useState(false); // false
  const radiusBounds = {
    "1km": [0, 1000],
    "2km": [1000, 2000],
    "5km": [2000, 5000],
    "10km": [5000, 10000],
    ">10km": [10000, 20000],
  };

  useEffect(() => {
    const loadTowerData = async () => {
      await downloadCSVFromGithub(towerDataRef);
    };
    loadTowerData();
  }, []);

  const levelColors = {
    'Very Low': '#66bb6a',   
    'Low':      '#4caf50',   
    'Medium':   '#ffa726',   
    'High':     '#f44336',  
    'Very High':'#b71c1c',   
  };
  const generatePath = async () => {
    setIsLoading(true);
    setMetricsReady(false);
    try {
      const url = `https://api.mapy.cz/v1/routing/route?start=${startLocation.longitude},${startLocation.latitude}&end=${destinationLocation.longitude},${destinationLocation.latitude}&routeType=foot_fast&lang=en&format=geojson&avoidToll=false&apikey=${MAPY_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      const coordinates = data.geometry.geometry.coordinates.map((coord) => ({ latitude: coord[1], longitude: coord[0] }));
      const fullRoute = [startLocation, ...coordinates, destinationLocation];
      setRouteCoordinates(fullRoute);


      let totalDistanceMeters = 0;
      for (let i = 1; i < fullRoute.length; i++) {
        totalDistanceMeters += haversineDistanceMeters(
          fullRoute[i - 1].latitude,
          fullRoute[i - 1].longitude,
          fullRoute[i].latitude,
          fullRoute[i].longitude
        );
      }
      let localElevation = {};
      await fetchElevationData(fullRoute, (data) => localElevation = data);
      await fetchWaterFeatures(fullRoute, setWaterFeatures, (c) => poiCounts.current["Water"] = c);
      await fetchShops(fullRoute, setShops, (c) => poiCounts.current["Shop"] = c);
      await fetchOtherPOIs(fullRoute, setOtherPOIs, (c) => poiCounts.current["Other POI"] = c);
      await fetchNaturalFeatures(fullRoute, setNaturalFeatures, (c) => poiCounts.current["Natural Feature"] = c);
      await fetchHazards(fullRoute, setHazards, (c) => poiCounts.current["Hazard"] = c);
      await fetchEmergencyPOIs(fullRoute, setEmergencyPOIs, (c) => poiCounts.current["Emergency POI"] = c);
      await fetchInformationPOIs(fullRoute, setinformationPOIs, (c) => poiCounts.current["Information"] = c);
      await fetchAirPollutionSummary(fullRoute, (d) => airQuality.current = d);
      await fetchWeatherForecastSummary(fullRoute, (d) => weatherSummary.current = d);
      await fetchUVandSunTimes(startLocation.latitude, startLocation.longitude, (d) => uvSunData.current = d);
      await fetchWildfireRiskFromCSV(fullRoute, (d) => fireRisk.current = d);
      await analyzeTowerCoverageOnRouteWithCSV(fullRoute, (d) => cellCoverage.current = d, towerDataRef);
    
      console.log("POI COUNTS", poiCounts.current);
      metricsRef.current = {
        "Start Coordinates": startLocation,
        "End Coordinates": destinationLocation,
        "Min Elevation": localElevation.minElevation,
        "Max Elevation": localElevation.maxElevation,
        "Min Slope Angle": localElevation.minSlopeAngle,
        "Max Slope Angle": localElevation.maxSlopeAngle,
        "Total Route Length (m)": totalDistanceMeters.toFixed(2),
        "Total Elevation Gain": localElevation.totalElevationGain,
        "Average Elevation Gain": localElevation.avgElevationGain,
        ...["Water", "Shop", "Natural Feature", "Hazard", "Other POI", "Emergency POI", "Information"].reduce((acc, type) => {
          acc[`POI counts for type ${type}`] = poiCounts.current[type] || {};
          return acc;
        }, {}),        
        "Start AQI": airQuality.current.start || {},
        "End AQI": airQuality.current.end || {},
        "Min AQI": airQuality.current.min || {},
        "Max AQI": airQuality.current.max || {},
        "Min Temperature": weatherSummary.current.minTemp,
        "Max Temperature": weatherSummary.current.maxTemp,
        "Max Wind Speed": weatherSummary.current.maxWind,
        "Max Rain (3h)": weatherSummary.current.maxRain,
        "Max Snow (3h)": weatherSummary.current.maxSnow,
        "Min Visibility": weatherSummary.current.minVisibility,
        "Max Humidity": weatherSummary.current.maxHumidity,
        "UV Index": uvSunData.current.uvi,
        "Sunrise": uvSunData.current.sunrise,
        "Sunset": uvSunData.current.sunset,
        "Fire Zones": fireRisk.current || {},
        "Tower types along route": cellCoverage.current.radioCounts || {},
        "% of route covered (≤3 km)": Number(cellCoverage.current.coverage_percent || 0),
      };
      await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + 'route_metrics.json', JSON.stringify(metricsRef.current, null, 2));
      console.log(JSON.stringify(metricsRef.current, null, 2));
      setMetricsReady(true);
      setPathFinished(true);
    } catch (error) {
      Alert.alert("Route Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const isTowerNearRoute = (lat, lon) => {
    return routeCoordinates.some((pt) => {
      return haversineDistanceMeters(lat, lon, pt.latitude, pt.longitude) <= 3000;
    });
  };
  const getPOIMarkers = () => {
    const pois = [];
    const [minD, maxD] = radiusBounds[poiRadius];
    const routeLine = routeCoordinates;

    const isInRange = (lat, lon) => {
      if (!routeLine.length) return false;
      return routeLine.some((pt) => {
        const dist = haversineDistanceMeters(lat, lon, pt.latitude, pt.longitude);
        return dist >= minD && dist <= maxD;
      });
    };

    const addMarkers = (data, color, label) => {
      data.forEach(p => {
        if (isInRange(p.latitude, p.longitude)) {
          pois.push({ ...p, color, label });
        }
      });
    };

    addMarkers(waterFeatures, "blue", "Water");
    addMarkers(emergencyPOIs, "red", "Emergency");
    addMarkers(hazards, "orange", "Hazard");
    addMarkers(otherPOIs, "white", "Other POI");
    addMarkers(informationPOIs, "black", "Information");
    addMarkers(naturalFeatures, "green", "Natural Feature");
    addMarkers(shops, "yellow", "Shop");
    return pois;
  };
  const handleChangePath = () => {
    setPathFinished(false);
    setIsCreatingPath(true);
    setActiveField('start');
    setStartLocation(null);
    setDestinationLocation(null);
    setSearchQuery('');
    setDestinationQuery('');
    setRouteCoordinates([]);
    setSuggestions([]);
    setDestinationSuggestions([]);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {isLoading && (
          <View style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}>
            <View style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 10,
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1E232C' }}>
                Gathering Metrics...
              </Text>
            </View>
          </View>
        )}
        <View style={styles.mapContainer}>
        <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: 48.6416079,
              longitude: 23.2280052,
              latitudeDelta: 0.2,
              longitudeDelta: 0.2,
            }}
          >
        <UrlTile
          urlTemplate={`https://api.mapy.cz/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=${MAPY_API_KEY}`}
          zIndex={1}
        />
        <Marker coordinate={startLocation} title="Start" />
        <Marker coordinate={destinationLocation} title="Destination" />
        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="blue" />
        )}
        {showPOI && getPOIMarkers().map((p, i) => (
          <Marker
            key={i}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            title={p.label}
            pinColor={p.color}
          />
        ))}
        {showTowers && cellCoverage.current?.towerList?.filter(tower =>
          isTowerNearRoute(tower.lat, tower.lon)
        ).map((tower, i) => (
          <Marker
            key={`tower-${i}`}
            coordinate={{ latitude: tower.lat, longitude: tower.lon }}
            title={`Cell Tower ${i + 1}`}
            pinColor="purple"
          />
        ))}
      </MapView>
     
          {isCreatingPath && !pathFinished && (
            <View style={styles.searchContainer}>
              <TextInput
                style={[styles.searchInput, { height: 40 }]}
                placeholder="Starting Point"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => {
                  setActiveField('start');
                  setJustSelectedStartSuggestion(false);
                  setSearchQuery('');
                  setSuggestions([]);
                }}
                onSubmitEditing={() => handleSearch('start')}
              />
              {activeField === 'start' && suggestions.length > 0 && (
                <ScrollView style={styles.suggestionsList} keyboardShouldPersistTaps="always">
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
              )}
              <TextInput
                ref={destinationInputRef}
                style={[styles.searchInput, { marginTop: 10, height: 40 }]}
                placeholder="Destination"
                value={destinationQuery}
                onChangeText={setDestinationQuery}
                onFocus={() => {
                  setActiveField('destination');
                  setJustSelectedDestinationSuggestion(false);
                  setDestinationQuery('');
                  setDestinationSuggestions([]);
                }}
                onSubmitEditing={() => handleSearch('destination')}
              />
              {activeField === 'destination' && destinationSuggestions.length > 0 && (
                <ScrollView style={styles.suggestionsList} keyboardShouldPersistTaps="always">
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
              )}
              <View style={{ marginTop: 20 }}>
                <ButtonDark
                  text="Finish"
                  width="100%"
                  onPress={async () => {
                    handleFinishPath();
                    await generatePath();
                    setPathFinished(true);
                  }}
                />
              </View>
            </View>
          )}
          {riskPopup && (
  <View style={popupStyles.container}>
    <Text style={popupStyles.title}>📊 Risk Analysis</Text>
    {riskPopup.riskValues.map(({ name, value, level }, i) => (
      <View key={i} style={popupStyles.barRow}>
      <Text style={popupStyles.barLabel}>{name} ({level})</Text>
        <View style={popupStyles.barBackground}>
          <View
            style={[
              popupStyles.barFill,
              {
                width: `${value}%`,               
                backgroundColor: levelColors[level] || '#4caf50',
              }
            ]}
          />
        </View>
        <Text style={popupStyles.barValue}>{value.toFixed(1)}</Text>
      </View>
    ))}

    <Text style={popupStyles.subTitle}>💡 Explanation:</Text>
    {riskPopup.recommendations.map((rec, i) => (
      <Text key={i} style={popupStyles.recommendation}>• {rec.trim()}</Text>
    ))}
    <TouchableOpacity onPress={() => setRiskPopup(null)} style={popupStyles.closeBtn}>
      <Text style={popupStyles.closeText}>Close</Text>
    </TouchableOpacity>
  </View>
)}
          { pathFinished  && (
            <View style={{ marginTop: 20 }}>
              <ButtonDark text="Change Path" width="100%" onPress={handleChangePath} />
              <View style={{ marginTop: 20 }}>
                <View style={styles.row}>
                  <Text>Show POI</Text>
                  <Switch value={showPOI} onValueChange={setShowPOI} />
                </View>
                {showPOI && (
                  <View style={[styles.row, { flexWrap: 'wrap' }]}>
                    {radiusOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={{ marginRight: 10, marginTop: 10 }}
                        onPress={() => setPoiRadius(opt)}
                      >
                        <Text
                          style={{
                            padding: 6,
                            borderRadius: 6,
                            backgroundColor: poiRadius === opt ? '#1E232C' : '#ccc',
                            color: 'white',
                          }}
                        >
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )} 
                <View style={{ marginTop: 20 }}>
                  <Button title="Classify Risk" onPress={handleClassify} color="#c62828" />
                </View>
              </View>
            </View>
          )}
        </View>
        {!isCreatingPath && !pathFinished && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setIsCreatingPath(true);
                setActiveField('start');
                setStartLocation(null);
                setDestinationLocation(null);
                setSearchQuery('');
                setDestinationQuery('');
                setRouteCoordinates([]);
                setSuggestions([]);
                setDestinationSuggestions([]);
              }}
            >
              <Text style={styles.buttonText}>Create Path</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};
const popupStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width:0, height:2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  barLabel: { width: 80, fontSize: 12 },          
  barBackground: {
    flex: 1,
    height: 6,                                     
    backgroundColor: '#eee',
    borderRadius: 3,
    marginHorizontal: 6,
  },
  barFill: { height: 6, borderRadius: 3 },       
  barValue: { width: 30, fontSize: 12, textAlign: 'right' },
  subTitle: { marginTop: 10, fontWeight: 'bold' },
  recommendation: { fontSize: 12, marginVertical: 2 },
  closeBtn: { marginTop: 10 },
  closeText: { color: '#c62828', textAlign: 'right' },
});
export default Home;