// BoxDesign AI — Payment API Service
import { apiClient } from './client';

export interface RazorpayOrderResponse {
  razorpay_order_id: string; amount_paise: number;
  currency: string; key_id: string; is_mock?: boolean;
}

export const paymentApi = {
  createRazorpayOrder: (tier: string, orderId: string, promoCode?: string) =>
    apiClient.post<RazorpayOrderResponse>('/orders/create-payment', {
      tier, order_id: orderId, promo_code: promoCode || null,
    }),

  verifyPayment: (data: {
    razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string;
  }) => apiClient.post('/orders/verify-payment', data),

  getInvoice: (orderId: string) =>
    apiClient.get(`/orders/${orderId}/invoice`),
};
