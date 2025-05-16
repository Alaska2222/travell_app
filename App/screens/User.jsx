import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, StyleSheet, Button, Switch, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { fetchElevationData } from '../utils/elevationFunctions';
import { useRoutePlanner } from '../hooks/useRoutePlanner';
import { analyzeTowerCoverageOnRouteWithCSV, downloadCSVFromGithub } from "../utils/otherMetricsFunctions";
import { fetchUVandSunTimes, fetchAirPollutionSummary, fetchWildfireRiskFromCSV, fetchWeatherForecastSummary } from "../utils/weatherFunctions";
import { fetchWaterFeatures, fetchShops, fetchNaturalFeatures, fetchOtherPOIs, fetchEmergencyPOIs, fetchInformationPOIs, fetchHazards } from "../utils/mapFunctions";
import { haversineDistanceMeters } from "../utils/distanceFunctions";
import * as FileSystem from "expo-file-system";
import { classifyRisk } from "../utils/classificationTree";
import {MAPY_API_KEY} from '../config.js';

const SERVER_HOST = 'http://192.168.6.5:8001';

export default function User({ route }) {
  const { routeData, requestParams } = route.params
  const mapRef = useRef()
  const rawCoords = routeData.route_coords || []
  const routeCoordinates = [
    { latitude: routeData.start.lat,  longitude: routeData.start.lon },
    ...rawCoords.map(([lon, lat]) => ({ latitude: lat, longitude: lon })),
    { latitude: routeData.end.lat,    longitude: routeData.end.lon },
  ]
  const startLocation  = routeCoordinates[0]
  const destinationLocation = routeCoordinates[routeCoordinates.length-1]
  const handleClassify = () => {
      const result = classifyRisk(metricsRef.current);
   
      console.log("RISK RESULT:", result);
      setRiskPopup(result);
    };

  const [modalVisible, setModalVisible] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [metrics, setMetrics] = useState({});
  const [riskResult, setRiskResult] = useState(null);
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
  const [metricsReady, setMetricsReady] = useState(false); 
    
    const radiusBounds = {
      "1km": [0, 1000],
      "2km": [1000, 2000],
      "5km": [2000, 5000],
      "10km": [5000, 10000],
      ">10km": [10000, 20000],
    };

  const peakMarkers = routeData.peaks || [];
  const rawRoute = routeData.route_coords || [];
  const coords = rawRoute.map(([lon, lat]) => ({ latitude: lat, longitude: lon }));
  useEffect(() => {
    if (rawRoute.length) {
      mapRef.current?.fitToCoordinates([startLocation, ...coords, destinationLocation], {
        edgePadding: { top:50, right:50, bottom:50, left:50 },
        animated: true
      });
    }
  }, [routeData]);

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

  const fullRoute = routeCoordinates
  const generatePath = async () => {
      setIsLoading(true);
      setMetricsReady(false);
      try {
        
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
      return pois;
    };
    
  return (
    <View style={{flex:1}}>
      <MapView
        ref={mapRef}
        style={{flex:1}}
        initialRegion={{...startLocation, latitudeDelta:0.2, longitudeDelta:0.2}}
      >
        <UrlTile urlTemplate={`https://api.mapy.cz/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=${MAPY_API_KEY}`} />
        <Marker coordinate={startLocation} title={`Start: ${routeData.start.name}`} />
        {peakMarkers.map((p,i) => (
          <Marker key={i} coordinate={{latitude:p.lat,longitude:p.lon}} title={`Peak: ${p.name}`} />
        ))}
        <Marker coordinate={destinationLocation} title={`End: ${routeData.end.name}`} />
        <Polyline coordinates={[startLocation,...coords,destinationLocation]} strokeWidth={4} strokeColor="blue" />
        
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
      <View style={styles.panel} pointerEvents={loadingMetrics ? 'none' : 'auto'}>
        {!metricsReady && !loadingMetrics && <Button title="Generate Metrics" onPress={generatePath} />}
        {isLoading && (
    <View style={styles.panelOverlay}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10 }}></Text>
    </View>
  )}
        {loadingMetrics && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" />
            <Text>Generating Metrics...</Text>
          </View>
        )}
        { metricsReady  && (
            <View style={{ marginTop: 20 }}>
              
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
      {riskPopup && (
        <View style={styles.container}>
          <Text style={styles.title}>📊 Risk Analysis</Text>
      
          {riskPopup.riskValues.map(({ name, value, level }, i) => (
            <View key={i} style={styles.barRow}>
            <Text style={styles.barLabel}>{name} ({level})</Text>
      
              <View style={styles.barBackground}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${value}%`,             
                      backgroundColor: levelColors[level] || '#4caf50',
                    }
                  ]}
                />
              </View>
              <Text style={styles.barValue}>{value.toFixed(1)}</Text>
            </View>
          ))}
      
          <Text style={styles.subTitle}>💡 Explanation:</Text>
          {riskPopup.recommendations.map((rec, i) => (
            <Text key={i} style={styles.recommendation}>• {rec.trim()}</Text>
          ))}
      
          <TouchableOpacity onPress={() => setRiskPopup(null)} style={styles.closeBtn}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>🗺 Route Details</Text>
          <Text style={styles.modalText}>
            {routeData.start.name} ➝ {peakMarkers.map(p=>p.name).join(' ➝ ')} ➝ {routeData.end.name}
          </Text>
          <Text style={styles.modalText}>
            📏 {routeData.distance_km} km • ⏱ {routeData.duration_hr} h
          </Text>
          <Button title="Close" onPress={()=>setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute', bottom: 20, left: 20, right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8, padding: 12, alignItems: 'center'
  },
  loadingOverlay: {
    flexDirection: 'row', alignItems: 'center', padding: 10
  },
  resultText: {
    marginTop: 10, fontSize: 16, fontWeight: 'bold'
  },
  modalView: {
    margin: 20, backgroundColor: 'white', borderRadius: 8,
    padding: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width:0, height:2 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation:5, top:'30%'
  },
  modalTitle: {
    fontSize: 18, fontWeight: 'bold', marginBottom: 12
  },
  modalText: {
    fontSize: 16, marginBottom: 8, textAlign: 'center'
  },
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
});
