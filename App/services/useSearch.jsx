import { useState, useEffect, useRef } from 'react';
import { fetchSuggestions, fetchPlaceDetails } from '../services/apiService';

export const useSearch = (apiKey, field) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (query.length <= 2) {
      setSuggestions([]);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      fetchSuggestions(query, apiKey, abortControllerRef.current.signal)
        .then((data) => {
          if (data.predictions) {
            const formatted = data.predictions.map((prediction) => ({
              title: prediction.description,
              placeId: prediction.place_id,
            }));
            setSuggestions(formatted);
          }
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Failed to fetch suggestions:', error);
          }
        })
        .finally(() => setIsLoading(false));
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [query, apiKey]);

  const handleSuggestionPress = async (suggestion) => {
    setQuery(suggestion.title);
    setSuggestions([]);
    const data = await fetchPlaceDetails(suggestion.placeId, apiKey);
    if (data.result?.geometry?.location) {
      return data.result.geometry.location;
    }
    throw new Error('Place details not found');
  };

  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    handleSuggestionPress,
  };
};