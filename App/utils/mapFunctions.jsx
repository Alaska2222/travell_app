  import { logDistancesToRoute } from "./distanceFunctions";
  import { Alert } from 'react-native';
  const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";

  export const fetchWaterFeatures = async (route, setWaterFeatures, setPoiCounts ) => {
    try {
      const bbox = getBoundingBox(route, 10);
      const query = `[out:json];(
        node["waterway"~"river|stream|riverbank|canal|drain|ditch|waterfall|water_point"](${bbox});
        node["natural"="spring"](${bbox});
        node["water"~"river|oxbow|ditch|lake|reservoir|pond|basin|wastewater"](${bbox});
        node["amenity"~"drinking_water|water_point|watering_place"](${bbox});
      ); out body;`;

      const response = await fetch(`${OVERPASS_API_URL}?data=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Overpass API error");
      const data = await response.json();

      if (!data.elements) throw new Error("Invalid Overpass response structure");
      const waterPoints = data.elements.map((el) => ({
        id: el.id,
        latitude: el.lat,
        longitude: el.lon,
        type: el.tags.waterway || el.tags.natural || el.tags.water || el.tags.amenity || "unknown water feature",
      }));
      
      setWaterFeatures(waterPoints);
      logDistancesToRoute(waterPoints, route, "Water", setPoiCounts);
    } catch (error) {
      console.error("Overpass error:", error);
      Alert.alert("Water Features Error", `Failed to fetch water features: ${error.message}`);
    }
  };

  export const fetchShops = async (route, setShops, setPoiCounts) => {
    try {
      const bbox = getBoundingBox(route, 10);
      const query = `[out:json];(
        node["shop"~"supermarket|kiosk"](${bbox});
        way["shop"~"supermarket|kiosk"](${bbox});
        relation["shop"~"supermarket|kiosk"](${bbox});
      ); out body;`;

      const response = await fetch(`${OVERPASS_API_URL}?data=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Overpass API error");
      const data = await response.json();

      if (!data.elements) throw new Error("Invalid Overpass response structure");
      const shopPoints = data.elements.map((el) => ({
        id: el.id,
        latitude: el.lat || el.center?.lat,
        longitude: el.lon || el.center?.lon,
        type: el.tags.shop || "unknown shop",
      }));

      setShops(shopPoints);
      logDistancesToRoute(shopPoints, route, "Shop", setPoiCounts);
    } catch (error) {
      console.error("Overpass error:", error);
      Alert.alert("Shops Error", `Failed to fetch shops: ${error.message}`);
    }
  };

  export const fetchNaturalFeatures = async (route, setNaturalFeatures, setPoiCounts ) => {
    try {
      const bbox = getBoundingBox(route, 10);
      const query = `[out:json];(
        node["natural"~"cave_entrance|cliff|hill|peak|ridge"](${bbox});
        way["natural"~"cave_entrance|cliff|hill|peak|ridge"](${bbox});
        relation["natural"~"cave_entrance|cliff|hill|peak|ridge"](${bbox});
      ); out body;`;

      const response = await fetch(`${OVERPASS_API_URL}?data=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Overpass API error");
      const data = await response.json();

      if (!data.elements) throw new Error("Invalid Overpass response structure");
      const naturalPoints = data.elements.map((el) => ({
        id: el.id,
        latitude: el.lat || el.center?.lat,
        longitude: el.lon || el.center?.lon,
        type: el.tags.natural || "unknown natural feature",
      }));

      setNaturalFeatures(naturalPoints);
      logDistancesToRoute(naturalPoints, route, "Natural Feature", setPoiCounts);
    } catch (error) {
      console.error("Overpass error:", error);
      Alert.alert("Natural Features Error", `Failed to fetch natural features: ${error.message}`);
    }
  };

  export const fetchHazards = async (route, setHazards, setPoiCounts) => {
    try {
      const bbox = getBoundingBox(route, 10);
      const query = `[out:json];(
        node["boundary"~"hazard|local_authority"](${bbox});
        way["boundary"~"hazard|local_authority"](${bbox});
        relation["boundary"~"hazard|local_authority"](${bbox});
      ); out body;`;

      const response = await fetch(`${OVERPASS_API_URL}?data=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Overpass API error");
      const data = await response.json();

      if (!data.elements) throw new Error("Invalid Overpass response structure");
      const hazardPoints = data.elements.map((el) => ({
        id: el.id,
        latitude: el.lat || el.center?.lat,
        longitude: el.lon || el.center?.lon,
        type: el.tags.boundary || "unknown hazard",
      }));

      setHazards(hazardPoints);
      logDistancesToRoute(hazardPoints, route, "Hazard", setPoiCounts);
    } catch (error) {
      console.error("Overpass error:", error);
      Alert.alert("Hazards Error", `Failed to fetch hazards: ${error.message}`);
    }
  };

  export const fetchInformationPOIs = async (route,setinformationPOIs, setPoiCounts ) => {
    try {
      const bbox = getBoundingBox(route, 10);
      const query = `[out:json];(
        node["tourism"="information"](${bbox});
        node["information"="map"](${bbox});
        node["amenity"="information"](${bbox});
      ); out body;`;
  
      const response = await fetch(`${OVERPASS_API_URL}?data=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Overpass API error");
      const data = await response.json();
  
      if (!data.elements) throw new Error("Invalid Overpass response structure");
      const infoPoints = data.elements.map((el) => ({
        id: el.id,
        latitude: el.lat,
        longitude: el.lon,
        type: el.tags.tourism || el.tags.information || el.tags.amenity || "unknown information point",
      }));
  
      setinformationPOIs(infoPoints);
      logDistancesToRoute(infoPoints, route, "Information", setPoiCounts);
  
    } catch (error) {
      console.error("Overpass error:", error);
      Alert.alert("Information POIs Error", `Failed to fetch information POIs: ${error.message}`);
    }
  };
  

  export const fetchOtherPOIs = async (route,setOtherPOIs, setPoiCounts ) => {
    try {
      const bbox = getBoundingBox(route, 10);
      const query = `[out:json];(
        node["tourism"~"viewpoint|wilderness_hut|alpine_hut|yes"](${bbox});
        node["amenity"~"shelter|ranger_station|hunting_stand|monastery"](${bbox});
        node["building"~"shrine|temple"](${bbox});
        node["leisure"="picnic_table"](${bbox});
        node["amenity"="bench"](${bbox});
      ); out body;`;

      const response = await fetch(`${OVERPASS_API_URL}?data=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Overpass API error");
      const data = await response.json();

      if (!data.elements) throw new Error("Invalid Overpass response structure");
      const otherPOIPoints = data.elements.map((el) => ({
        id: el.id,
        latitude: el.lat,
        longitude: el.lon,
        type: el.tags.tourism || el.tags.amenity || el.tags.building || el.tags.leisure || "unknown POI",
      }));

      setOtherPOIs(otherPOIPoints);
      logDistancesToRoute(otherPOIPoints, route, "Other POI", setPoiCounts);
    } catch (error) {
      console.error("Overpass error:", error);
      Alert.alert("Other POIs Error", `Failed to fetch other POIs: ${error.message}`);
    }
  };

  export const fetchEmergencyPOIs = async (route, setEmergencyPOIs, setPoiCounts) => {
    try {
      const bbox = getBoundingBox(route, 10);
      const query = `[out:json];(
        node["amenity"~"hospital|social_facility|fire_station|police|first_aid"](${bbox});
        node["railway"="station"](${bbox});
      ); out body;`;

      const response = await fetch(`${OVERPASS_API_URL}?data=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Overpass API error");
      const data = await response.json();

      if (!data.elements) throw new Error("Invalid Overpass response structure");
      const emergencyPOIPoints = data.elements.map((el) => ({
        id: el.id,
        latitude: el.lat,
        longitude: el.lon,
        type: el.tags.amenity || el.tags.railway || "unknown emergency POI",
      }));

      setEmergencyPOIs(emergencyPOIPoints);
      logDistancesToRoute(emergencyPOIPoints, route, "Emergency POI", setPoiCounts);
    } catch (error) {
      console.error("Overpass error:", error);
      Alert.alert("Emergency POIs Error", `Failed to fetch emergency POIs: ${error.message}`);
    }
  };


  export const getBoundingBox = (route, bufferKm) => {
    const latitudes = route.map((p) => p.latitude);
    const longitudes = route.map((p) => p.longitude);
    const latMin = Math.min(...latitudes) - bufferKm / 111;
    const latMax = Math.max(...latitudes) + bufferKm / 111;
    const lonMin = Math.min(...longitudes) - bufferKm / (111 * Math.cos((latMin + latMax) / 2 * Math.PI / 180));
    const lonMax = Math.max(...longitudes) + bufferKm / (111 * Math.cos((latMin + latMax) / 2 * Math.PI / 180));
    return `${latMin},${lonMin},${latMax},${lonMax}`;
  };