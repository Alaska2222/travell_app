import { haversineDistanceMeters } from "./distanceFunctions";
import { Alert } from 'react-native';
import {MAPY_API_KEY} from '../config.js';

export const fetchElevationData = async (coordinates, setElevationMetrics) => {
    try {
      let totalElevationGain = 0;
      let previousElevation = null;
      let allElevations = [];
      let slopeAngles = [];

      const chunkSize = 256;
      for (let i = 0; i < coordinates.length; i += chunkSize) {
        const chunk = coordinates.slice(i, i + chunkSize);
        const positions = chunk.map(coord => `${coord.longitude},${coord.latitude}`).join(";");

        const url = `https://api.mapy.cz/v1/elevation?lang=cs&positions=${positions}&apikey=${MAPY_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Elevation API error! Status: ${response.status}`);

        const data = await response.json();
        if (!data?.items || !Array.isArray(data.items)) throw new Error("Invalid elevation data response.");

        data.items.forEach((item, index) => {
          if (item.elevation === -100000) return;
          if (!chunk[index] || !chunk[index - 1]) return;

          const elevation = item.elevation;
          allElevations.push(elevation);

          if (previousElevation !== null) {
            const gain = elevation - previousElevation;
            if (gain > 0) totalElevationGain += gain;

            const distance = haversineDistanceMeters(
              chunk[index - 1].latitude,
              chunk[index - 1].longitude,
              chunk[index].latitude,
              chunk[index].longitude
            );

            if (distance > 0) {
              const slopeAngle = Math.atan(gain / distance) * (180 / Math.PI);
              slopeAngles.push(slopeAngle);
            }
          }

          previousElevation = elevation;
        });

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const minElevation = Math.min(...allElevations);
      const maxElevation = Math.max(...allElevations);
      const minSlopeAngle = slopeAngles.length > 0 ? Math.min(...slopeAngles) : 0;
      const maxSlopeAngle = slopeAngles.length > 0 ? Math.max(...slopeAngles) : 0;

      setElevationMetrics({
        minElevation,
        maxElevation,
        minSlopeAngle,
        maxSlopeAngle,
        totalElevationGain
      });
    } catch (error) {
      console.error("Elevation error:", error);
      Alert.alert("Elevation Error", `Failed to fetch elevation data: ${error.message}`);
    }
  };