import { apiClient } from '../../../shared/api/axiosClient';
import type { ProfessionalUpdateDto } from '../types';

export const professionalService = {
  getProfessionals: async (page = 1, limit = 10, search = '') => {
    // Note: Adjusting to the backend endpoint found in SharedPages.tsx
    // It used /admin/professionals and fallback to /professionals
    const response = await apiClient.get('/admin/professionals', {
      params: { page, limit, search }
    }).catch(() => apiClient.get('/professionals', {
      params: { page, limit, search }
    }));
    
    // Normalize response
    const data = response.data;
    if (Array.isArray(data)) {
      return {
        data,
        total: data.length,
        totalPages: 1
      };
    }
    return data; // Standard { data: [], total: 0, ... }
  },

  updateProfessional: async (id: string, data: ProfessionalUpdateDto) => {
    const response = await apiClient.put(`/admin/professionals/${id}`, data);
    return response.data;
  },

  deleteProfessional: async (id: string) => {
    const response = await apiClient.delete(`/admin/professionals/${id}`);
    return response.data;
  }
};
