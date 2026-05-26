import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/axiosClient';

// Entidad: Professional (Reemplazar con la ruta real a futuro)
export interface Professional {
  id: string;
  distanceKm: string;
  averageRating: number;
  reviewCount: number;
  completedServices: number;
  user: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  services: {
    id: string;
    name: string;
    price: number;
  }[];
}

interface SearchProfessionalsParams {
  latitude: number;
  longitude: number;
  radiusKm: number;
  sector?: string;
  searchTerm?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];
    total: number;
  };
}

// Custom Hook Interno para Geolocation
const useGeolocation = () => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('La geolocalización no está soportada por tu navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  return { coords, error };
};

// Custom Hook Interno para Debounce
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook Principal Exportado
export const useProfessionals = (searchTerm: string = '', sector: string = '') => {
  const { coords, error: geoError } = useGeolocation();
  
  // Aplicamos debounce al término de búsqueda para no saturar el servidor
  const debouncedSearch = useDebounce(searchTerm, 500);

  const queryParams: SearchProfessionalsParams | null = coords ? {
    latitude: coords.lat,
    longitude: coords.lng,
    radiusKm: 15, // Por defecto buscamos a 15km a la redonda
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
    ...(sector && { sector }),
  } : null;

  const query = useQuery({
    queryKey: ['professionals', 'search', queryParams],
    queryFn: async () => {
      if (!queryParams) throw new Error("No coordinates available");
      const { data } = await apiClient.get<PaginatedResponse<Professional>>('/professionals/search', {
        params: queryParams,
      });
      // El backend retorna bajo el contrato { success, data: { data, total } }
      return data.data; 
    },
    // Solo se habilita la consulta si tenemos coordenadas y no hubo error de geolocalización
    enabled: !!queryParams && !geoError,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  return {
    professionals: query.data?.data || [],
    total: query.data?.total || 0,
    isLoading: query.isLoading || (!coords && !geoError),
    error: query.error || geoError,
    refetch: query.refetch,
    hasLocationPermission: !!coords,
  };
};
