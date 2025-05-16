import { useState, useRef, useEffect } from 'react';
import { Alert, Keyboard } from 'react-native';

const GOOGLE_API_KEY = 'AIzaSyAHby6PMEKN1H4k9QUbTRlBqtzpGiBLsUA';

export const useRoutePlanner = (mapRef) => {
  const [showMarkers, setShowMarkers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [justSelectedStartSuggestion, setJustSelectedStartSuggestion] = useState(false);
  const [justSelectedDestinationSuggestion, setJustSelectedDestinationSuggestion] = useState(false);
  const [isCreatingPath, setIsCreatingPath] = useState(false);
  const [activeField, setActiveField] = useState('start'); 
  const [startLocation, setStartLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const debounceTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  const destinationDebounceTimeoutRef = useRef(null);
  const destinationAbortControllerRef = useRef(null);
  const destinationInputRef = useRef(null);

  useEffect(() => {
    if (activeField !== 'start' || justSelectedStartSuggestion) {
      setJustSelectedStartSuggestion(false);
      return;
    }
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(searchQuery)}&key=${GOOGLE_API_KEY}`, {
        signal: abortControllerRef.current.signal,
      })
        .then(res => res.json())
        .then(data => {
          const formatted = data.predictions?.map(prediction => ({
            title: prediction.description,
            placeId: prediction.place_id,
          })) ?? [];
          setSuggestions(formatted);
        })
        .catch(err => {
          if (err.name !== 'AbortError') console.error(err);
        })
        .finally(() => setIsLoading(false));
    }, 300);
  }, [searchQuery, activeField]);

  useEffect(() => {
    if (activeField !== 'destination' || justSelectedDestinationSuggestion) {
      setJustSelectedDestinationSuggestion(false);
      return;
    }
    if (destinationQuery.length < 3) {
      setDestinationSuggestions([]);
      return;
    }
    if (destinationDebounceTimeoutRef.current) clearTimeout(destinationDebounceTimeoutRef.current);
    destinationDebounceTimeoutRef.current = setTimeout(() => {
      if (destinationAbortControllerRef.current) destinationAbortControllerRef.current.abort();
      destinationAbortControllerRef.current = new AbortController();
      setIsLoading(true);
      fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(destinationQuery)}&key=${GOOGLE_API_KEY}`, {
        signal: destinationAbortControllerRef.current.signal,
      })
        .then(res => res.json())
        .then(data => {
          const formatted = data.predictions?.map(prediction => ({
            title: prediction.description,
            placeId: prediction.place_id,
          })) ?? [];
          setDestinationSuggestions(formatted);
        })
        .catch(err => {
          if (err.name !== 'AbortError') console.error(err);
        })
        .finally(() => setIsLoading(false));
    }, 300);
  }, [destinationQuery, activeField]);

  const handleSuggestionPress = async (suggestion, field = 'start') => {
    if (field === 'start') {
      setJustSelectedStartSuggestion(true);
      setSearchQuery(suggestion.title);
      setSuggestions([]);
    } else {
      setJustSelectedDestinationSuggestion(true);
      setDestinationQuery(suggestion.title);
      setDestinationSuggestions([]);
    }
  
    Keyboard.dismiss();
  
    try {
      const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.placeId}&key=${GOOGLE_API_KEY}`);
      const data = await res.json();
      const location = {
        latitude: data.result.geometry.location.lat,
        longitude: data.result.geometry.location.lng
      };
  
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...location,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 800);
      }
  
      if (field === 'start') {
        setStartLocation(location);
      } else {
        setDestinationLocation(location);
      }
  
    } catch (err) {
      console.error('Failed to fetch place details', err);
    }
  };
  
  const handleSearch = (field = 'start') => {
    const query = field === 'start' ? searchQuery : destinationQuery;
    const suggestionList = field === 'start' ? suggestions : destinationSuggestions;
    if (!query.trim()) {
      Alert.alert('Enter search query', 'Please type a location to search for.');
      return;
    }
    if (suggestionList.length > 0) {
      handleSuggestionPress(suggestionList[0], field);
      return;
    }
    fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`)
      .then(res => res.json())
      .then(data => {
        const first = data.predictions?.[0];
        if (first) {
          handleSuggestionPress({ title: first.description, placeId: first.place_id }, field);
        } else {
          Alert.alert('No results found', 'Please try a different search term.');
        }
      })
      .catch(err => {
        Alert.alert('Error', 'Failed to search for location.');
        console.error(err);
      });
  };

  const handleFinishPath = () => {
    if (!startLocation || !destinationLocation) {
      Alert.alert('Incomplete', 'Please set both starting point and destination.');
      return;
    }
    setIsCreatingPath(false);
    setShowMarkers(true);
    console.log('Start location:', startLocation);
    console.log('Destination location:', destinationLocation);
  };

  return {
    showMarkers,
    setShowMarkers,
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
    isLoading,
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
    setJustSelectedDestinationSuggestion
  };
  
};