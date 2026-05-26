import { apiClient } from './api';

export interface CreateBookingDto {
  professionalId: number;
  professionalServiceId: number;
  date: string;
  startTime: string;
  location?: string;
  locationType?: string;
  latitude?: number;
  longitude?: number;
}

export interface RescheduleBookingDto {
  date: string;
  startTime: string;
}

export const bookingService = {
  // Backend: POST /bookings (uses @CurrentUser for userId)
  createBooking: async (data: CreateBookingDto) => {
    const response = await apiClient.post('/bookings', data);
    return response.data;
  },

  // Backend: GET /bookings (gets current user's bookings via @CurrentUser)
  getUserBookings: async () => {
    const response = await apiClient.get('/bookings');
    return response.data;
  },

  // Backend: GET /bookings/professional/:professionalId
  getProfessionalBookings: async (professionalId?: string) => {
    if (!professionalId) return [];
    const response = await apiClient.get(`/bookings/professional/${professionalId}`);
    return response.data;
  },

  // Backend: PATCH /bookings/:id/status  body: { status }
  updateBookingStatus: async (id: string | number, status: string) => {
    const response = await apiClient.patch(`/bookings/${id}/status`, { status });
    return response.data;
  },

  // Backend: PATCH /bookings/:id/reschedule  body: { date, startTime }
  rescheduleBooking: async (id: string | number, data: RescheduleBookingDto) => {
    const response = await apiClient.patch(`/bookings/${id}/reschedule`, data);
    return response.data;
  },
};
