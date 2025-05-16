const toRad = (value) => (value * Math.PI) / 180;

export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

export const haversineDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; 
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

const calculateTotalDistance = (coordinates) => {
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    total += haversineDistance(coordinates[i - 1], coordinates[i]);
  }
  return total; 
};

export const logDistancesToRoute = (points, route, type, callback) => {
  const distanceBuckets = {
    "1km": {},
    "2km": {},
    "5km": {},
    "10km": {},
    ">10km": {}
  };

  const haversine = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000; 
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  points.forEach((poi) => {
    let minDist = Infinity;
    route.forEach((pt) => {
      const dist = haversine(poi.latitude, poi.longitude, pt.latitude, pt.longitude);
      if (dist < minDist) minDist = dist;
    });

    const category = poi.type || "unknown";

    if (minDist <= 1000) {
      distanceBuckets["1km"][category] = (distanceBuckets["1km"][category] || 0) + 1;
    } else if (minDist <= 2000) {
      distanceBuckets["2km"][category] = (distanceBuckets["2km"][category] || 0) + 1;
    } else if (minDist <= 5000) {
      distanceBuckets["5km"][category] = (distanceBuckets["5km"][category] || 0) + 1;
    } else if (minDist <= 10000) {
      distanceBuckets["10km"][category] = (distanceBuckets["10km"][category] || 0) + 1;
    } else {
      distanceBuckets[">10km"][category] = (distanceBuckets[">10km"][category] || 0) + 1;
    }
  });

  callback(distanceBuckets);
};
