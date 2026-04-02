// BoxDesign AI — Orders API Service
import { apiClient } from './client';

export interface CreateOrderPayload {
  designRequestId: string; selectedDesignId: string;
  pricingTier: string; promoCode?: string;
  approvedByName?: string;
}
export interface ConfirmPaymentPayload {
  orderId: string; razorpayOrderId: string;
  razorpayPaymentId: string; razorpaySignature: string;
}

export const ordersApi = {
  create: (payload: CreateOrderPayload) =>
    apiClient.post('/orders/create', {
      design_request_id: payload.designRequestId,
      selected_design_id: payload.selectedDesignId,
      pricing_tier: payload.pricingTier,
      promo_code: payload.promoCode,
      approved_by_name: payload.approvedByName,
    }),

  confirmPayment: (payload: ConfirmPaymentPayload) =>
    apiClient.post('/orders/confirm-payment', {
      order_id: payload.orderId,
      razorpay_order_id: payload.razorpayOrderId,
      razorpay_payment_id: payload.razorpayPaymentId,
      razorpay_signature: payload.razorpaySignature,
    }),

  list: (page = 1, limit = 20) =>
    apiClient.get('/orders', { params: { page, limit } }),

  get: (orderId: string) =>
    apiClient.get(`/orders/${orderId}`),

  reorder: (orderId: string) =>
    apiClient.post(`/orders/${orderId}/reorder`),
};
