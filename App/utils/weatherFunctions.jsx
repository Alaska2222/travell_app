import { haversineDistanceMeters } from "./distanceFunctions";
import { Alert } from 'react-native';
import {WEATHER_API_KEY} from '../config.js';
export const fetchUVandSunTimes = async (lat, lon, setUvSunData) => {
    try {
      const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely,current,alerts&units=metric&appid=${WEATHER_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch UV/sun data. Status: ${response.status}`);

      const data = await response.json();
      const today = data.daily?.[0];

      const uvi = today?.uvi;
      const sunrise = new Date(today?.sunrise * 1000).toLocaleTimeString();
      const sunset = new Date(today?.sunset * 1000).toLocaleTimeString();
      setUvSunData({ uvi, sunrise, sunset });
    } catch (err) {
      console.error("UV/Sun API Error:", err.message);
    }
  };
  
  export const fetchAirPollutionSummary = async (routeCoords,setAirQuality ) => {
    try {
      const pointsToCheck = [
        routeCoords[0], 
        routeCoords[Math.floor(routeCoords.length / 2)], 
        routeCoords[routeCoords.length - 1], 
      ];
  
      const pollutionData = [];
  
      for (const point of pointsToCheck) {
        const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${point.latitude}&lon=${point.longitude}&appid=${WEATHER_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Air API error ${response.status}`);
  
        const data = await response.json();
        const info = data?.list?.[0];
  
        const entry = {
          lat: point.latitude,
          lon: point.longitude,
          aqi: info?.main?.aqi,
          components: info?.components,
        };
  
        pollutionData.push(entry);
      }

      const sampled = routeCoords.filter((_, i) => i % 15 === 0);
      let minAQI = Infinity, maxAQI = -Infinity;
      let minPoint = null, maxPoint = null;
  
      for (const point of sampled) {
        const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${point.latitude}&lon=${point.longitude}&appid=${WEATHER_API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const d = await res.json();
        const aqi = d?.list?.[0]?.main?.aqi;
  
        if (aqi !== undefined) {
          if (aqi < minAQI) {
            minAQI = aqi;
            minPoint = { lat: point.latitude, lon: point.longitude };
          }
          if (aqi > maxAQI) {
            maxAQI = aqi;
            maxPoint = { lat: point.latitude, lon: point.longitude };
          }
        }
  
        await new Promise((res) => setTimeout(res, 1100)); 
      }
      setAirQuality({ start: pollutionData[0], end: pollutionData[1], min: { aqi: minAQI, location: minPoint }, max: { aqi: maxAQI, location: maxPoint } });
      return {
        start: pollutionData[0],
        end: pollutionData[1],
        min: { aqi: minAQI, location: minPoint },
        max: { aqi: maxAQI, location: maxPoint },
      };
  
    } catch (err) {
      console.error("Air Pollution Summary Error:", err.message);
      Alert.alert("Air Pollution Summary Error", err.message);
    }
  };
  
  export const fetchWeatherForecastSummary = async (routeCoords,setWeatherSummary ) => {
    try {
      const sampled = routeCoords.filter((_, i) => i % 15 === 0);
      let minTemp = Infinity, maxTemp = -Infinity;
      let maxWind = -Infinity;
      let maxRain = 0, maxSnow = 0;
      let minVisibility = Infinity;
      let maxHumidity = -Infinity;
  
      let worstPoints = {
        temp: null,
        wind: null,
        rain: null,
        snow: null,
        visibility: null,
        humidity: null
      };
  
      for (const point of sampled) {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${point.latitude}&lon=${point.longitude}&appid=${WEATHER_API_KEY}&units=metric`;
        const res = await fetch(url);
        if (!res.ok) continue;
  
        const forecast = await res.json();
        const list = forecast?.list || [];
  
        for (const entry of list) {
          const temp = entry.main?.temp;
          const wind = entry.wind?.speed;
          const rain = entry.rain?.['3h'] ?? 0;
          const snow = entry.snow?.['3h'] ?? 0;
          const visibility = entry.visibility ?? 10000;
          const humidity = entry.main?.humidity;
  
          if (temp < minTemp) {
            minTemp = temp;
            worstPoints.temp = { ...point, time: entry.dt_txt, temp };
          }
  
          if (temp > maxTemp) maxTemp = temp;
  
          if (wind > maxWind) {
            maxWind = wind;
            worstPoints.wind = { ...point, time: entry.dt_txt, wind };
          }
  
          if (rain > maxRain) {
            maxRain = rain;
            worstPoints.rain = { ...point, time: entry.dt_txt, rain };
          }
  
          if (snow > maxSnow) {
            maxSnow = snow;
            worstPoints.snow = { ...point, time: entry.dt_txt, snow };
          }
  
          if (visibility < minVisibility) {
            minVisibility = visibility;
            worstPoints.visibility = { ...point, time: entry.dt_txt, visibility };
          }
  
          if (humidity > maxHumidity) {
            maxHumidity = humidity;
            worstPoints.humidity = { ...point, time: entry.dt_txt, humidity };
          }
        }
  
        await new Promise((res) => setTimeout(res, 1100));
      }
  
      setWeatherSummary({
        minTemp, maxTemp,
        maxWind, maxRain, maxSnow,
        minVisibility, maxHumidity,
        worstPoints 
      });
      return {
        minTemp, maxTemp,
        maxWind, maxRain, maxSnow,
        minVisibility, maxHumidity,
        worstPoints,
      };
    } catch (err) {
      console.error("Forecast Summary Error:", err.message);
      Alert.alert("Forecast Summary Error", err.message);
    }
  };
  
  export const fetchWildfireRiskFromCSV = async (route, setFireRisk) => {
    try {
      const proxyURL = "https://api.allorigins.win/raw?url=";
      const sourceURL = "https://firms.modaps.eosdis.nasa.gov/data/active_fire/c6/csv/MODIS_C6_Global_24h.csv";
      const fullURL = `${proxyURL}${encodeURIComponent(sourceURL)}`;
  
      const response = await fetch(fullURL);  
      const text = await response.text();
      const lines = text.split("\n").slice(1); 
  
      const firePoints = lines
        .map((line) => line.split(","))
        .filter((cols) => cols.length > 10)
        .map((cols) => ({
          lat: parseFloat(cols[0]),
          lon: parseFloat(cols[1]),
          brightness: parseFloat(cols[2]),
          confidence: cols[8],
          date: cols[5],
        }));
  
      const nearFires = firePoints.filter((fire) =>
        route.some((coord) => {
          const dist = haversineDistanceMeters(coord.latitude, coord.longitude, fire.lat, fire.lon);
          return dist < 5000;
        })
      );
  
      if (nearFires.length > 0) {
        setFireRisk(nearFires);
      } else {
        setFireRisk([]);
      }
  
      return nearFires;
    } catch (err) { 
    }
  };