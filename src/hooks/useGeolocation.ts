import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

// Default to Duitama, Boyacá (User Preference)
const DEFAULT_LAT = 5.8268;
const DEFAULT_LNG = -73.0331;

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        latitude: DEFAULT_LAT,
        longitude: DEFAULT_LNG,
        loading: false,
        error: 'Geolocation not supported',
      });
      return;
    }

    const timeout = setTimeout(() => {
      // Fallback if user takes too long to accept or connection drops
      setState(prev => {
        if (prev.loading) {
          return { latitude: DEFAULT_LAT, longitude: DEFAULT_LNG, loading: false, error: 'Location request timed out — using default' };
        }
        return prev;
      });
    }, 15000); // Give user 15 seconds to accept browser prompt

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeout);
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          loading: false,
          error: null,
        });
      },
      (err) => {
        clearTimeout(timeout);
        setState({
          latitude: DEFAULT_LAT,
          longitude: DEFAULT_LNG,
          loading: false,
          error: err.message,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Require fresh, highly accurate location
    );

    return () => clearTimeout(timeout);
  }, []);

  return state;
}
