import { apiClient } from '../../../shared/api/axiosClient';
import type { AnalyticsStats, DashboardStats, RevenueData, RecentActivity } from '../types';

export const analyticsService = {
  getStats: async (): Promise<AnalyticsStats> => {
    const response = await apiClient.get('/admin/analytics');
    return response.data;
  },

  getDashboardSummary: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  getRevenueChart: async (): Promise<RevenueData[]> => {
    const response = await apiClient.get('/admin/revenue-chart');
    return response.data;
  },

  getRecentActivity: async (page = 1, limit = 10): Promise<{ data: RecentActivity[], total: number }> => {
    const response = await apiClient.get('/admin/activity', {
      params: { page, limit }
    });
    return response.data;
  }
};
