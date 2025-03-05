export const fetchSuggestions = async (query, apiKey, signal) => {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodedQuery}&key=${apiKey}`,
      { signal }
    );
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  };
  
  export const fetchPlaceDetails = async (placeId, apiKey) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`
    );
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  };
  
  export const reverseGeocode = async (coords, apiKey) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${apiKey}`
    );
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  };