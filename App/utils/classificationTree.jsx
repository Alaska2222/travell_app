export const classifyRisk = (metrics) => {
  const recommendations = [];

  // === Hiking Safety Index (HSI) ===
 const weights = {
    slope: 0.3970,
    altitude: 0.2555,
    length: 0.1697,
    time: 0.1063,
    water: 0.0468,
    aspect: 0.0245
  };

  // === Slope Score ===
  const slope = metrics["Max Slope Angle"] || 0;
  const slopeScore = Math.max(0, 1 - slope / 12);

  // === Water Score ===
  const water0 = Object.values(metrics["POI counts for type Water"]?.["2km"] || {}).reduce((a, b) => a + b, 0);
  const water5 = Object.values(metrics["POI counts for type Water"]?.["5km"] || {}).reduce((a, b) => a + b, 0);
  const waterCount = water0 + water5;
  let waterScore = 0.1;
  if (waterCount >= 3) waterScore = 1.0;
  else if (waterCount >= 1) waterScore = 0.5;
  if (waterScore <= 0.5) recommendations.push(`🚰 Water POIs: ${waterCount} within 5km — plan hydration.`);

  // === Other HSI factors ===
  const maxElevation = metrics["Max Elevation"] || 0;
  const altitudeScore = 1 - Math.min(maxElevation / 2500, 1);
  
  const start = metrics["Start Coordinates"] || {};
  const end = metrics["End Coordinates"] || {};
  let aspect = 0;
  if (start.lat !== undefined && end.lat !== undefined && start.lon !== undefined && end.lon !== undefined) {
    const dLat = end.lat - start.lat;
    const dLon = end.lon - start.lon;
    aspect = (Math.atan2(dLon, dLat) * 180 / Math.PI + 360) % 360;
  }

  const distKm = parseFloat(metrics["Total Route Length (m)"] || 0) / 1000;
  let lengthScore = 0.1;
  if (distKm >= 12 && distKm <= 16) lengthScore = 1;
  else if (distKm < 12) lengthScore = 0.1 + 0.9 * (distKm / 12);
  else lengthScore = Math.max(0.1, 1 - (distKm - 16) / (30 - 16));
  if (lengthScore < 1) recommendations.push(`📏 Route length: ${distKm.toFixed(1)} km — match to your endurance.`);

  const timeH = distKm / 5;
  let timeScore = 1;
  if (timeH < 3) timeScore = 0.1;
  else if (timeH < 4) timeScore = 0.1 + 0.9 * ((timeH - 3) / 1);
  else if (timeH > 7) timeScore = 0.1;
  else if (timeH > 6) timeScore = 0.1 + 0.9 * ((7 - timeH) / 1);
  if (timeScore < 1) recommendations.push(`⏱️ Estimated time: ${timeH.toFixed(1)} h — plan your pace.`);

  const HSI =
    slopeScore * weights.slope +
    altitudeScore * weights.altitude +
    lengthScore * weights.length +
    timeScore * weights.time +
    waterScore * weights.water +
    aspectScore * weights.aspect;

  // === Weather Risk ===
  const weatherFactors = [];

  const wind      = metrics["Max Wind Speed"] || 0;
  const windScore = wind > 15 ? 100 : wind > 10 ? 70 : wind > 5 ? 40 : 10;
  weatherFactors.push(windScore);
  if (windScore >= 40) recommendations.push(`💨 Wind: ${wind} m/s — consider wind exposure.`);

  const rain      = metrics["Max Rain (3h)"] || 0;
  const rainScore = rain > 20 ? 100 : rain > 10 ? 70 : rain > 5 ? 40 : 10;
  weatherFactors.push(rainScore);
  if (rainScore >= 40) recommendations.push(`🌧️ Rain: ${rain} mm/3h — bring rain gear.`);

  const snow      = metrics["Max Snow (3h)"] || 0;
  const snowScore = snow > 5 ? 100 : snow > 2 ? 60 : 10;
  weatherFactors.push(snowScore);
  if (snowScore >= 40) recommendations.push(`❄️ Snow: ${snow} mm/3h — slippery trails possible.`);

  const minT      = metrics["Min Temperature"] || 0;
  const maxT      = metrics["Max Temperature"] || 0;
  const tempScore = (minT < -10 || maxT > 35) ? 100
                   : (minT < 0  || maxT > 30) ? 70
                   : 10;
  weatherFactors.push(tempScore);
  if (tempScore >= 40) recommendations.push(`🌡️ Temperature: ${minT}…${maxT}°C — dress in layers.`);

  const hum      = metrics["Max Humidity"] || 0;
  const humScore = hum > 90 ? 100 : hum > 80 ? 70 : 10;
  weatherFactors.push(humScore);
  if (humScore >= 40) recommendations.push(`💧 Humidity: ${hum}% — may affect comfort.`);

  const uv      = metrics["UV Index"] || 0;
  const uvScore = uv > 8 ? 100 : uv > 6 ? 70 : uv > 3 ? 40 : 10;
  weatherFactors.push(uvScore);
  if (uvScore >= 40) recommendations.push(`☀️ UV Index: ${uv} — apply sun protection.`);

  const minAqi   = metrics["Min AQI"]?.aqi || 0;
  const maxAqi   = metrics["Max AQI"]?.aqi || 0;
  const avgAqi   = (minAqi + maxAqi) / 2;
  const aqiScore = avgAqi > 150 ? 100 : avgAqi > 100 ? 70 : avgAqi > 50 ? 40 : 10;
  weatherFactors.push(aqiScore);
  if (aqiScore >= 40) recommendations.push(`😷 Air Quality (AQI): ~${avgAqi.toFixed(0)} — mind breathing conditions.`);

  const weatherRisk = weatherFactors.reduce((sum, v) => sum + v, 0) / weatherFactors.length;

  // === Terrain Risk ===
  const terrainFactors = [];

  // 1) Slope Risk: invert HSI slopeScore → 0–100
  const slopeRisk = Math.min(slope, 12) >= 12
    ? 100
    : ((12 - slope) / 12) < 0
      ? 0
      : (1 - slopeScore) * 100;  // slopeScore = 1 - slope/12
  terrainFactors.push(slopeRisk);
  if (slopeRisk >= 40) recommendations.push(`🪨 Steep slopes: ${slope.toFixed(1)}° — technical footing needed.`);

  // 2) Altitude Risk: invert HSI altitudeScore → 0–100
  const altRisk = Math.min(maxElevation / 2500, 1) * 100; 
  terrainFactors.push(altRisk);
  if (altRisk >= 40) recommendations.push(`⛰️ High max elevation: ${maxElevation} m — altitude risk.`);

  // 3) Elevation Gain Risk: as before
  const gain = metrics["Total Elevation Gain"] || 0;
  const gainRisk = gain > 1200 ? 100 : gain > 800 ? 70 : gain > 400 ? 40 : 10;
  terrainFactors.push(gainRisk);
  if (gainRisk >= 40) recommendations.push(`📈 Elevation gain: ${gain} m — expect sustained climbs.`);

  const terrainRisk = terrainFactors.reduce((sum, v) => sum + v, 0) / terrainFactors.length;

  // === POI & Coverage Risk ===
  const poiFactors = [];

  // Water
  const wScore = waterCount < 2 ? 100 : waterCount < 4 ? 70 : 10;
  poiFactors.push(wScore);
  if (wScore >= 40) recommendations.push(`🚰 Water POIs: ${waterCount} within 5km — plan hydration.`);

  // Emergency POIs
  const e2 = Object.values(metrics["POI counts for type Emergency POI"]?.["5km"] || {}).reduce((a, b) => a + b, 0);
  const e5 = Object.values(metrics["POI counts for type Emergency POI"]?.["10km"] || {}).reduce((a, b) => a + b, 0);
  const totalEmergency = e2 + e5;
  const eScore = totalEmergency < 1 ? 100 : totalEmergency < 3 ? 70 : 10;
  poiFactors.push(eScore);
  if (eScore >= 40) recommendations.push(`🆘 Emergency POIs: ${totalEmergency} within 10km — evaluate rescue options.`);

  // Hazards
  const h0 = Object.values(metrics["POI counts for type Hazard"]?.["2km"] || {}).reduce((a, b) => a + b, 0);
  const h2 = Object.values(metrics["POI counts for type Hazard"]?.["5km"] || {}).reduce((a, b) => a + b, 0);
  const totalHazards = h0 + h2;
  const hScore = totalHazards > 3 ? 100 : totalHazards > 1 ? 60 : 10;
  poiFactors.push(hScore);
  if (hScore >= 40) recommendations.push(`⚠️ Hazards: ${totalHazards} within 5km — proceed with caution.`);

  // Coverage
  const cov = metrics["% of route covered (≤3 km)"] || 0;
  const covScore = cov < 30 ? 100 : cov < 60 ? 70 : cov < 90 ? 40 : 10;
  poiFactors.push(covScore);
  if (covScore >= 40) recommendations.push(`📶 Coverage: ${cov}% — may affect connectivity.`);

  // Info POIs
  const i0 = Object.values(metrics["POI counts for type Information"]?.["2km"] || {}).reduce((a, b) => a + b, 0);
  const i2 = Object.values(metrics["POI counts for type Information"]?.["5km"] || {}).reduce((a, b) => a + b, 0);
  const totalInfo = i0 + i2;
  const infoScore = totalInfo < 1 ? 100 : totalInfo < 3 ? 60 : 10;
  poiFactors.push(infoScore * 0.5);
  if (infoScore * 0.5 >= 40) recommendations.push(`ℹ️ Info POIs: ${totalInfo} within 5km — useful for navigation.`);

  const poiRisk = poiFactors.reduce((sum, v) => sum + v, 0) / poiFactors.length;
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
};
