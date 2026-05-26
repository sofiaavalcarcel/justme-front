import { apiClient } from './api';

export interface LocationParams {
  latitude: number;
  longitude: number;
  radius?: number; // km
}

export interface SearchParams extends LocationParams {
  category?: string;
  date?: string;
  time?: string;
}

export interface WorkingHour {
  dayOfWeek: number; // 0-6
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  isActive: boolean;
}

export interface ProfessionalServiceDto {
  serviceId?: number;
  name?: string;
  description: string;
  price: number;
  duration: number; // minutes
}

export const professionalsService = {
  // Search and discovery
  getNearbyProfessionals: async (params: SearchParams) => {
    const response = await apiClient.get('/professionals/nearby', { params });
    return response.data;
  },

  getProfessionalById: async (id: string) => {
    const response = await apiClient.get(`/professionals/${id}`);
    return response.data;
  },

  // Get professional profile by user ID
  getProfessionalByUserId: async (userId: string) => {
    try {
      const response = await apiClient.get(`/professionals/user/${userId}`);
      return response.data;
    } catch {
      return null;
    }
  },

  // Profile management for professionals
  // Backend: PATCH /professionals/:id
  updateProfile: async (id: string, data: any) => {
    const response = await apiClient.patch(`/professionals/${id}`, data);
    return response.data;
  },

  updateSchedule: async (id: string, schedule: WorkingHour[]) => {
    const response = await apiClient.patch(`/professionals/${id}`, { schedule });
    return response.data;
  },

  // Services — Backend: /services/professional/:professionalId
  getServices: async (professionalId: string) => {
    try {
      const response = await apiClient.get(`/services/professional/${professionalId}`);
      return response.data;
    } catch {
      return [];
    }
  },

  addService: async (professionalId: string, service: ProfessionalServiceDto) => {
    const response = await apiClient.post(`/services/professional/${professionalId}`, service);
    return response.data;
  },

  deleteService: async (_professionalId: string, serviceId: string) => {
    // Backend: DELETE /services/professional-service/:id
    const response = await apiClient.delete(`/services/professional-service/${serviceId}`);
    return response.data;
  },

  updateService: async (_professionalId: string, serviceId: string, data: Partial<ProfessionalServiceDto>) => {
    // Backend: PATCH /services/professional-service/:id
    const response = await apiClient.patch(`/services/professional-service/${serviceId}`, data);
    return response.data;
  },

  // Reviews — Backend: GET /reviews/professional/:professionalId
  getReviews: async (professionalId: string) => {
    try {
      const response = await apiClient.get(`/reviews/professional/${professionalId}`);
      return response.data;
    } catch {
      return [];
    }
  },

  uploadPortfolioImages: async (professionalId: string, files: File[]) => {
    const promises = files.map(file => {
      const formData = new FormData();
      formData.append('image', file);
      return apiClient.post(`/professionals/${professionalId}/portfolio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    });
    const responses = await Promise.all(promises);
    return responses.map(r => r.data);
  },

  deletePortfolioImage: async (_professionalId: string, imageId: string | number) => {
    const response = await apiClient.delete(`/professionals/portfolio/${imageId}`);
    return response.data;
  },

  getDashboardStats: async (professionalId: string) => {
    try {
      const response = await apiClient.get(`/professionals/${professionalId}/stats`);
      return response.data;
    } catch {
      return null;
    }
  },

  async getTransactions(professionalId: string) {
    try {
      const response = await apiClient.get(`/admin/transactions/user/${professionalId}`);
      return response.data;
    } catch {
      return [];
    }
  },

  deleteProfessional: async (id: string) => {
    const response = await apiClient.delete(`/professionals/${id}`);
    return response.data;
  },

  createProfile: async (data: any) => {
    const response = await apiClient.post('/professionals', data);
    return response.data;
  },

  getServiceCategories: async () => {
    try {
      const response = await apiClient.get('/services/categories');
      return response.data;
    } catch {
      return [];
    }
  },

  // Schedule Exceptions
  getExceptions: async (professionalId: string) => {
    try {
      const response = await apiClient.get(`/schedule/${professionalId}/exceptions`);
      return response.data;
    } catch {
      return [];
    }
  },

  addException: async (professionalId: string, data: { date: string; startTime?: string; endTime?: string; isFullDay: boolean; reason?: string }) => {
    const response = await apiClient.post(`/schedule/${professionalId}/exceptions`, data);
    return response.data;
  },

  deleteException: async (id: string | number) => {
    const response = await apiClient.delete(`/schedule/exceptions/${id}`);
    return response.data;
  }
};
