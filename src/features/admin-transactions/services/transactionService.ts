import { apiClient } from '../../../shared/api/axiosClient';
import type { TransactionResponse, AdminStats } from '../types';

export const transactionService = {
  getTransactions: async (page = 1, limit = 10): Promise<TransactionResponse> => {
    const response = await apiClient.get('/admin/transactions', {
      params: { page, limit }
    });
    
    // With the unwrap interceptor, response.data IS the payload.
    // Ensure we handle pagination gracefully
    const data = response.data;
    
    // In case the backend returns an array directly, or an object with data and meta
    if (Array.isArray(data)) {
        return {
            data: data,
            total: data.length,
            totalPages: 1
        };
    }

    return {
      data: data?.data || [],
      total: data?.meta?.totalItems || data?.total || 0,
      totalPages: data?.meta?.totalPages || data?.totalPages || 1
    };
  },

  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get('/admin/stats');
    const data = response.data;
    return {
      totalRevenue: data?.totalRevenue || 0,
      totalCommissions: data?.commissionsCollected || data?.totalCommissions || 0,
      totalTx: data?.totalBookings || data?.totalTx || 0
    };
  }
};
