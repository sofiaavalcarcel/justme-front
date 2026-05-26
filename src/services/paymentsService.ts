import { apiClient } from './api';

export interface CreatePaymentDto {
  amount: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export const paymentsService = {
  // Backend: POST /payments/intent  body: { amount, currency, metadata }
  createPayment: async (data: CreatePaymentDto) => {
    const response = await apiClient.post('/payments/intent', data);
    return response.data;
  },

  // Backend: POST /payments/confirm  body: { paymentIntentId }
  confirmPayment: async (paymentIntentId: string) => {
    const response = await apiClient.post('/payments/confirm', { paymentIntentId });
    return response.data;
  },

  // Backend: POST /payments/refund  body: { paymentIntentId, amount? }
  processRefund: async (paymentIntentId: string, amount?: number) => {
    const response = await apiClient.post('/payments/refund', { paymentIntentId, amount });
    return response.data;
  },
};
