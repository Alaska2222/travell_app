export const classifyRisk = (metrics) => {
  const recommendations = [];

  // === Hiking Safety Index (HSI) ===
  const weights = {
    slope: 0.407,        // slope weight
    altitude: 0.262,     // altitude weight
    length: 0.174,       // distance weight
    time: 0.109,         // walking time weight
    water: 0.048         // water access weight
  };

const slope = metrics["Max Slope Angle"] || 0;
const slopeScore = Math.min(slope, 12) / 12;

const maxElevation = metrics["maxElevation"] || 0;
const altitudeScore = 1 - Math.min(maxElevation / 2500, 1);

const distKm = (metrics["Total Route Length (m)"] || 0) / 1000;
let lengthScore = 0.1;
if (distKm >= 12 && distKm <= 16) lengthScore = 1;
else if (distKm < 12) lengthScore = 0.1 + 0.9 * (distKm / 12);
else lengthScore = Math.max(0.1, 1 - (distKm - 16) / (30 - 16));

const timeH = distKm / 5;
let timeScore = 1;
if (timeH < 3) timeScore = 0.1;
else if (timeH < 4) timeScore = 0.1 + 0.9 * ((timeH - 3) / 1);
else if (timeH > 7) timeScore = 0.1;
else if (timeH > 6) timeScore = 0.1 + 0.9 * ((7 - timeH) / 1);
else timeScore = 1;

const waterCount = Object.values(metrics["POI counts for type Water"]?.["5km"] || {}).reduce((a, b) => a + b, 0);
const waterScore = waterCount > 0 ? 1 : 0.1;

const HSI =
  slopeScore * weights.slope +
  altitudeScore * weights.altitude +
  lengthScore * weights.length +
  timeScore * weights.time +
  waterScore * weights.water;

 // === Weather Risk ===
  const weatherFactors = [];

  // Wind Speed
  const wind      = metrics["forecast_wind_max"] || 0;
  const windScore = wind > 15 ? 100 : wind > 10 ? 70 : wind > 5 ? 40 : 10;
  weatherFactors.push(windScore);
  if (windScore >= 70) recommendations.push(`⚡️ Strong wind: ${wind} m/s`);

  // Rain Intensity
  const rain      = metrics["forecast_rain_max"] || 0;
  const rainScore = rain > 20 ? 100 : rain > 10 ? 70 : rain > 5 ? 40 : 10;
  weatherFactors.push(rainScore);
  if (rainScore >= 70) recommendations.push(`🌧️ Heavy rain: ${rain} mm/3h`);

  // Snowfall
  const snow      = metrics["forecast_snow_max"] || 0;
  const snowScore = snow > 5 ? 100 : snow > 2 ? 60 : 10;
  weatherFactors.push(snowScore);
  if (snowScore >= 60) recommendations.push(`❄️ Heavy snowfall: ${snow} mm/3h`);

  // Temperature Extremes
  const minT      = metrics["forecast_temp_extremes"]?.min || 0;
  const maxT      = metrics["forecast_temp_extremes"]?.max || 0;
  const tempScore = (minT < -10 || maxT > 35) ? 100
                   : (minT < 0  || maxT > 30) ? 70
                   : 10;
  weatherFactors.push(tempScore);
  if (tempScore >= 70) recommendations.push(`🌡️ Temperature extremes: ${minT}…${maxT} °C`);

  // Humidity
  const hum        = metrics["forecast_humidity_max"] || 0;
  const humScore   = hum > 90 ? 100 : hum > 80 ? 70 : 10;
  weatherFactors.push(humScore);
  if (humScore >= 70) recommendations.push(`💧 High humidity: ${hum}%`);

  // UV Index
  const uv        = metrics["uv_index"] || 0;
  const uvScore   = uv > 8 ? 100 : uv > 6 ? 70 : uv > 3 ? 40 : 10;
  weatherFactors.push(uvScore);
  if (uvScore >= 70) recommendations.push(`☀️ High UV index: ${uv}`);

  // Air Quality Index (AQI)
  const minAqi   = metrics["min_aqi"] || 0;
  const maxAqi   = metrics["max_aqi"] || 0;
  const avgAqi   = (minAqi + maxAqi) / 2;
  const aqiScore = avgAqi > 150 ? 100
                 : avgAqi > 100 ? 70
                 : avgAqi > 50  ? 40
                 : 10;
  weatherFactors.push(aqiScore);
  if (aqiScore >= 70) recommendations.push(`😷 Poor air quality: AQI≈${avgAqi.toFixed(0)}`);

  const weatherRisk = weatherFactors.reduce((sum, v) => sum + v, 0) / weatherFactors.length;

  // === Terrain Risk ===
  const terrainFactors = [];

  // Elevation Gain
  const gain         = metrics["total_elevation_gain"] || 0;
  const gainScore    = gain > 1200 ? 100 : gain > 800 ? 70 : gain > 400 ? 40 : 10;
  terrainFactors.push(gainScore);
  if (gainScore >= 70) recommendations.push(`⛰️ Significant elevation gain: ${gain} m`);

  // Slope Steepness
  const slopeRiskScore = slope > 35  ? 100
                        : slope > 25 ? 70
                        : slope > 15 ? 40
                        : 10;
  terrainFactors.push(slopeRiskScore);
  if (slopeRiskScore >= 70) recommendations.push(`🪨 Steep slopes: ${slope.toFixed(1)}°`);

  // Distance Length
  const distRiskScore  = distKm > 20  ? 100
                        : distKm > 15 ? 70
                        : distKm > 10 ? 40
                        : 10;
  terrainFactors.push(distRiskScore);
  if (distRiskScore >= 70) recommendations.push(`📏 Long distance: ${distKm.toFixed(1)} km`);

  const terrainRisk = terrainFactors.reduce((sum, v) => sum + v, 0) / terrainFactors.length;

  // === POI & Coverage Risk ===
  const poiFactors = [];

  // Water sources within 5 km
  const w5        = metrics["water_feature_counts"]?.["5km"] || 0;
  const w5Score   = w5 < 2   ? 100
                   : w5 < 5   ? 70
                   : 10;
  poiFactors.push(w5Score);
  if (w5Score >= 70) recommendations.push(`🚰 Limited water sources: ${w5}`);

  // Emergency POIs within 10 km
  const e10        = metrics["emergency_poi_counts"]?.["10km"] || 0;
  const e10Score   = e10 < 1   ? 100
                   : e10 < 3   ? 70
                   : 10;
  poiFactors.push(e10Score);
  if (e10Score >= 70) recommendations.push(`🆘 Few emergency points: ${e10}`);

  // Hazards within 5 km
  const h5        = metrics["hazard_counts"]?.["5km"] || 0;
  const h5Score   = h5 > 3    ? 100
                   : h5 > 1    ? 60
                   : 10;
  poiFactors.push(h5Score);
  if (h5Score >= 60) recommendations.push(`⚠️ Numerous hazards: ${h5}`);

  // Cellular coverage percentage
  const cov       = metrics["tower_coverage_percent"] || 0;
  const covScore  = cov < 30  ? 100
                  : cov < 60  ? 70
                  : cov < 90  ? 40
                  : 10;
  poiFactors.push(covScore);
  if (covScore <= 40) recommendations.push(`📶 Low cellular coverage: ${cov}%`);

  // Info POIs within 5 km
  const info5     = metrics["info_poi_counts"]?.["5km"] || 0;
  const infoScore = info5 < 1  ? 100
                  : info5 < 3  ? 60
                  : 10;
  poiFactors.push(infoScore);
  if (infoScore >= 60) recommendations.push(`ℹ️ Few info points: ${info5}`);

  const poiRisk = poiFactors.reduce((sum, v) => sum + v, 0) / poiFactors.length;

  // === Composite Risk === (uses HSI)
  const compositeRisk = HSI * 100;

  const classifyLevel = (score) => {
    if (score < 25) return 'Very Low';
    if (score < 50) return 'Low';
    if (score < 75) return 'Medium';
    if (score < 90) return 'High';
    return 'Very High';
  };

  return {
    weatherRisk:   { value: +weatherRisk.toFixed(1),   level: classifyLevel(weatherRisk) },
    terrainRisk:   { value: +terrainRisk.toFixed(1),   level: classifyLevel(terrainRisk) },
    poiRisk:       { value: +poiRisk.toFixed(1),       level: classifyLevel(poiRisk) },
    compositeRisk: { value: +compositeRisk.toFixed(1), level: classifyLevel(compositeRisk) },
    recommendations,
    riskValues: [
      { name: 'Weather',       value: +weatherRisk.toFixed(1),   level: classifyLevel(weatherRisk) },
      { name: 'Terrain',       value: +terrainRisk.toFixed(1),   level: classifyLevel(terrainRisk) },
      { name: 'POI & Coverage',value: +poiRisk.toFixed(1),       level: classifyLevel(poiRisk) },
      { name: 'Composite',     value: +compositeRisk.toFixed(1), level: classifyLevel(compositeRisk) },
    ]
  };
}
