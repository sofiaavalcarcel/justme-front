import { useState, useEffect, useRef, useCallback } from 'react';
import { bookingService } from '../services/bookingService';
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';

export interface Appointment {
  id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  clientName: string;
  clientAvatar?: string;
  serviceName: string;
  date: string;
  startTime: string;
  price: number;
  locationType: 'home' | 'professional';
  raw?: any; // For any extra data
}

export function useAppointments(professionalId: string | number | null) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const appointmentsRef = useRef<Appointment[]>([]);

  const mapBookingToAppointment = useCallback((b: any): Appointment => {
    const clientName = b.user?.name
      ? `${b.user.name} ${b.user.lastName || ''}`.trim()
      : (b.client?.name || t('proDash.client', 'Cliente'));
    
    return {
      id: String(b.id),
      status: b.status,
      clientName,
      clientAvatar: b.user?.avatar || b.client?.avatar,
      serviceName: b.professionalService?.service?.name || b.service?.name || b.serviceName || t('proDash.service', 'Servicio'),
      date: b.date || (b.scheduledAt ? new Date(b.scheduledAt).toISOString().split('T')[0] : ''),
      startTime: b.startTime || (b.scheduledAt ? new Date(b.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
      price: b.price ? parseFloat(b.price) : 0,
      locationType: b.locationType || 'professional',
      raw: b
    };
  }, [t]);

  const fetchAppointments = useCallback(async (isPolling = false) => {
    if (!professionalId) {
      setLoading(false);
      return;
    }
    if (!isPolling) setLoading(true);

    try {
      const data = await bookingService.getProfessionalBookings(String(professionalId));
      const bList = Array.isArray(data) ? data : (data?.data || []);
      const mappedList = bList.map(mapBookingToAppointment);

      // Change Detection for Polling
      if (isPolling && appointmentsRef.current.length > 0) {
        const oldList = appointmentsRef.current;
        
        // New Bookings
        const newOnes = mappedList.filter((na: Appointment) => !oldList.find((oa: Appointment) => oa.id === na.id));
        if (newOnes.length > 0) {
          if (newOnes.length === 1) {
            notify('success', t('booking.newAlertTitle', '¡Nueva Reserva!'), `${newOnes[0].clientName} ha agendado: ${newOnes[0].serviceName}`);
          } else {
            notify('success', t('booking.newAlertTitlePlural', '¡Nuevas Reservas!'), `Has recibido ${newOnes.length} nuevas solicitudes.`);
          }
        }

        // Cancellations
        const cancelled = mappedList.filter((na: Appointment) => {
          const old = oldList.find((oa: Appointment) => oa.id === na.id);
          return old && old.status !== 'cancelled' && na.status === 'cancelled';
        });
        if (cancelled.length > 0) {
          if (cancelled.length === 1) {
            notify('warning', t('booking.cancelAlertTitle', 'Cita Cancelada'), `${cancelled[0].clientName} ha cancelado su cita.`);
          } else {
            notify('warning', t('booking.cancelAlertTitlePlural', 'Citas Canceladas'), `${cancelled.length} clientes han cancelado sus citas.`);
          }
        }
      }

      appointmentsRef.current = mappedList;
      setAppointments(mappedList);
    } catch (err) {
      console.error('Error fetching professional appointments:', err);
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [professionalId, mapBookingToAppointment, notify, t]);

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(() => fetchAppointments(true), 30000);
    return () => clearInterval(interval);
  }, [fetchAppointments]);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await bookingService.updateBookingStatus(id, newStatus);
      // Optimistic update
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus as any } : a));
      notify('success', t('sharedPages.pro.success', '¡Éxito!'), t('proDash.statusUpdated', 'Estado de cita actualizado'));
      return true;
    } catch (err: any) {
      notify('error', 'Error', err?.response?.data?.message || t('proDash.statusError', 'Error al actualizar estado'));
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  return { 
    appointments, 
    loading, 
    updatingId, 
    updateStatus, 
    refetch: fetchAppointments 
  };
}
