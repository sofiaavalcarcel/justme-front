import { apiClient } from './api';

export const walletService = {

  /** Obtener saldo operativo + historial de transacciones */
  getBalance: async (professionalId: string | number) => {
    try {
      const response = await apiClient.get(`/wallet/${professionalId}`);
      return response.data;
    } catch {
      return { balance: 0, transactions: [], currency: 'COP' };
    }
  },

  /** Obtener historial de transacciones directamente */
  getTransactions: async (professionalId: string | number): Promise<any[]> => {
    try {
      const data = await walletService.getBalance(professionalId);
      return data?.transactions || [];
    } catch {
      return [];
    }
  },

  /** Verificar si el profesional puede aceptar nuevas reservas */
  canBook: async (professionalId: string | number): Promise<{ canBook: boolean; balance: number }> => {
    try {
      const response = await apiClient.get(`/wallet/${professionalId}/can-book`);
      const data = response.data;
      return data?.data ?? data;
    } catch {
      return { canBook: false, balance: 0 };
    }
  },

  // ── Stripe Top-Up ──────────────────────────────────────────────────────────

  /** Crear PaymentIntent en Stripe para recargar el saldo operativo */
  createPaymentIntent: async (professionalId: string | number, amount: number) => {
    const response = await apiClient.post('/payments/intent', {
      amount,
      currency: 'COP',
      metadata: { professionalId: String(professionalId) },
    });
    const data = response.data;
    return data?.data || data; // { id, clientSecret, amount, currency, status }
  },

  /** Confirmar pago Stripe y acreditar saldo operativo */
  confirmPayment: async (paymentIntentId: string) => {
    const response = await apiClient.post('/payments/confirm', { paymentIntentId });
    const data = response.data;
    return data?.data || data; // { id, status, balance }
  },
};
