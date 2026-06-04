import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/api';
import { useNotification } from '../context/NotificationContext';

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
  const { notify } = useNotification();
  const bookingsRef = useRef<Booking[]>([]);

  const fetchBookings = useCallback(async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    try {
      const response = await apiClient.get('/bookings');
      
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
      
      // Change Detection for Polling
      if (isPolling && bookingsRef.current.length > 0) {
        const oldList = bookingsRef.current;
        mapped.forEach(nb => {
          const old = oldList.find(ob => ob.id === nb.id);
          if (old && old.status !== nb.status) {
            notify('info', 'Estado de Cita', `Tu cita para ${nb.service} ha cambiado a: ${nb.status}`);
          }
        });
      }

      bookingsRef.current = mapped;
      setBookings(mapped);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener tus citas.');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchBookings();
    // Poll every 45 seconds for users (lower frequency than pros)
    const interval = setInterval(() => fetchBookings(true), 45000);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  return { bookings, loading, error, refetch: fetchBookings };
}
