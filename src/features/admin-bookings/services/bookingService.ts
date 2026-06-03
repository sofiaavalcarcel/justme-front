import { apiClient } from '../../../shared/api/axiosClient';
import type { BookingStats } from '../types';

export const bookingService = {
  getBookings: async (page = 1, limit = 10, filters: Record<string, any> = {}) => {
    const params: Record<string, any> = { page, limit };
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;

    const response = await apiClient.get('/admin/bookings', { params });
    return response.data;
  },

  getStats: async (): Promise<BookingStats> => {
    // Stats are embedded in the list response; fetch page 1 with limit 1 to get stats cheaply
    const response = await apiClient.get('/admin/bookings', { params: { page: 1, limit: 1 } });
    return response.data.stats as BookingStats;
  },

  updateStatus: async (id: number, status: string) => {
    const response = await apiClient.patch(`/admin/bookings/${id}/status`, { status });
    return response.data;
  },
};
