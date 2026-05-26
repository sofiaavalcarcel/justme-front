import { apiClient } from './api';

export const scheduleService = {
  getAvailableSlots: async (professionalId: number, date: string, serviceDuration?: number) => {
    const response = await apiClient.get(`/schedule/${professionalId}/available-slots`, {
      params: { date, serviceDuration },
    });
    return response.data; // Expects { date: string, slots: string[] }
  },

  addException: async (data: any) => {
    const response = await apiClient.post('/schedule/exceptions', data);
    return response.data;
  },

  getExceptions: async (proId: number) => {
    const response = await apiClient.get(`/schedule/exceptions/${proId}`);
    return response.data;
  },

  deleteException: async (id: number) => {
    const response = await apiClient.delete(`/schedule/exceptions/${id}`);
    return response.data;
  },
};
