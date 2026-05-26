import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';

export interface Booking {
  id: string | number;
  status: string;
  professionalName: string;
  professionalAvatar?: string;
  professionalId?: number;
  service: string;
  date: string;
  time: string;
  startTime?: string;
  price: number;
  locationType: string;
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/bookings');
      
      // El endpoint devuelve arreglo o objeto con data.
      const rawData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      
      const mapped: Booking[] = rawData.map((item: any) => {
        const dateObj = new Date(item.scheduledAt || item.date || new Date());
        return {
          id: item.id,
          status: item.status || 'pending',
          professionalName: item.professional?.user?.name 
              ? `${item.professional.user.name} ${item.professional.user.lastName || ''}`.trim() 
              : 'Profesional',
          professionalAvatar: item.professional?.user?.avatar,
          professionalId: item.professionalId || item.professional?.id,
          service: item.professionalService?.service?.name || item.service?.name || 'Servicio',
          date: item.date || dateObj.toISOString().split('T')[0],
          time: item.startTime || dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          startTime: item.startTime,
          price: item.price ? parseFloat(item.price) : 0,
          locationType: item.locationType || 'professional',
        };
      });
      
      setBookings(mapped);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener tus citas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, error, refetch: fetchBookings };
}
