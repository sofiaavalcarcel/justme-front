import { apiClient } from '../../../shared/api/axiosClient';

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  maxDiscountAmount: number;
  isValid: boolean;
}

export interface CheckoutSession {
  sessionId: string;
  url: string; // URL for Stripe/MercadoPago redirection
}

export const CouponService = {
  /**
   * Valida un cupón en tiempo real contra el backend
   */
  async validateCoupon(code: string): Promise<Coupon> {
    try {
      const { data } = await apiClient.post<{ success: boolean; data: Coupon }>('/coupons/validate', { code });
      return data.data;
    } catch (error: any) {
      // Manejar error 404 o 400 y arrojar un mensaje limpio
      throw new Error(error.response?.data?.message || 'Cupón inválido o expirado');
    }
  },

  /**
   * Calcula el precio final basado en el descuento
   */
  calculateDiscountedPrice(originalPrice: number, coupon: Coupon | null): number {
    if (!coupon || !coupon.isValid) return originalPrice;

    const discountAmount = originalPrice * (coupon.discountPercentage / 100);
    const finalDiscount = Math.min(discountAmount, coupon.maxDiscountAmount);
    
    return Math.max(0, originalPrice - finalDiscount);
  },

  /**
   * Inicia el flujo de pago seguro sin exponer tokens locales
   * @param serviceId ID del servicio a pagar
   * @param professionalId ID del profesional
   * @param couponCode Código de cupón (opcional)
   */
  async createCheckoutSession(serviceId: string, professionalId: string, couponCode?: string): Promise<CheckoutSession> {
    try {
      // El backend creará la sesión en Stripe/MercadoPago y retornará la URL segura
      const { data } = await apiClient.post<{ success: boolean; data: CheckoutSession }>('/payments/create-session', {
        serviceId,
        professionalId,
        couponCode,
      });
      return data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar la sesión de pago');
    }
  }
};
