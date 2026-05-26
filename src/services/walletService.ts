import { apiClient } from './api';

export interface RechargeDto {
  amount: number;
  currency: 'COP';
}

export const walletService = {
  // Backend: GET /wallet/:professionalId (returns balance + transactions)
  getBalance: async (professionalId: string | number) => {
    try {
      const response = await apiClient.get(`/wallet/${professionalId}`);
      return response.data; // { balance, transactions, currency }
    } catch {
      return { balance: 0, transactions: [], currency: 'COP' };
    }
  },

  getTransactions: async (professionalId: string | number) => {
    try {
      const response = await apiClient.get(`/wallet/${professionalId}`);
      return response.data?.transactions || [];
    } catch {
      return [];
    }
  },

  // Backend: POST /wallet/:professionalId/recharge  body: { amount }
  recharge: async (professionalId: string | number, data: RechargeDto) => {
    // Only COP supported as requested
    const response = await apiClient.post(`/wallet/${professionalId}/recharge`, {
      amount: data.amount,
    });
    return response.data;
  },
};
