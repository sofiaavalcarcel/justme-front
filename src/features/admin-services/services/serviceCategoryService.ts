import { apiClient } from '../../../shared/api/axiosClient';
import type { ServiceCategoryDto } from '../types';

export const serviceCategoryService = {
  getCategories: async () => {
    // Backend: GET /admin/services (returns all including inactive)
    const response = await apiClient.get('/admin/services');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || []);
  },

  createCategory: async (data: ServiceCategoryDto) => {
    // Backend has no POST for services - using PATCH on existing or noting limitation
    // Fallback: try /services if available
    const response = await apiClient.post('/services/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: ServiceCategoryDto) => {
    // Backend: PATCH /admin/services/:id
    const response = await apiClient.patch(`/admin/services/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await apiClient.delete(`/admin/services/${id}`);
    return response.data;
  }
};
