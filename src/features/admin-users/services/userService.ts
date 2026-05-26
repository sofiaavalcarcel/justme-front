import { apiClient } from '../../../shared/api/axiosClient';
import type { UserUpdateDto } from '../types';

export const userService = {
  getUsers: async (page = 1, limit = 10, search = '') => {
    const response = await apiClient.get(`/admin/users?page=${page}&limit=${limit}&search=${search}`);
    // Map roles array to a single role string to match frontend types
    if (response.data && Array.isArray(response.data.data)) {
      response.data.data = response.data.data.map((user: any) => ({
        ...user,
        role: user.roles && user.roles.length > 0 ? user.roles[0].name : 'user'
      }));
    }
    return response.data;
  },

  updateUser: async (id: string, data: UserUpdateDto) => {
    const response = await apiClient.put(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  }
};
