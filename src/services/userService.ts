import { apiClient } from './api';

export interface UpdateUserProfileDto {
  name?: string;
  lastName?: string;
  phone?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  department?: string;
  addresses?: any[];
}

export const userService = {
  updateProfile: async (id: string, data: UpdateUserProfileDto) => {
    // Backend uses PUT /users/:userId
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  updateProfileImage: async (id: string, formData: FormData) => {
    const response = await apiClient.patch(`/users/${id}/profile`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  adminUpdateUser: async (id: string | number, data: any) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  getProfile: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  getFavorites: async () => {
    try {
      // Favorites has its own controller at /favorites
      const response = await apiClient.get('/favorites');
      return response.data;
    } catch {
      return [];
    }
  },

  getPaymentHistory: async () => {
    try {
      // Payments controller only has POST endpoints (intent, confirm, refund)
      // There's no GET history endpoint in the backend, so we return empty
      // TODO: Add GET /payments/history endpoint in backend
      return [];
    } catch {
      return [];
    }
  },

  getCoupons: async () => {
    try {
      // Coupons has its own controller at /coupons
      const response = await apiClient.get('/coupons');
      return response.data;
    } catch {
      return [];
    }
  },

  toggleFavorite: async (professionalId: number) => {
    const response = await apiClient.post(`/favorites/${professionalId}`);
    return response.data;
  },

  isFavorite: async (professionalId: number) => {
    try {
      const response = await apiClient.get(`/favorites/check/${professionalId}`);
      return response.data;
    } catch {
      return false;
    }
  },

  uploadAvatar: async (userId: string | number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post(`/users/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
};
