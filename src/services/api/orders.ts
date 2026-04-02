// BoxDesign AI — Orders API Service
import { apiClient } from './client';

export interface CreateOrderPayload {
  designRequestId: string;
  selectedDesignId: string;
  pricingTier: string;
  promoCode?: string;
  approvedByName?: string;
}

export interface ConfirmPaymentPayload {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export const ordersApi = {
  create: (payload: CreateOrderPayload) =>
    apiClient.post('/orders/', {
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

  list: (page = 1, limit = 20, status?: string) =>
    apiClient.get('/orders/', { params: { page, page_size: limit, ...(status ? { status } : {}) } }),

  get: (orderId: string) =>
    apiClient.get(`/orders/${orderId}`),

  stats: () =>
    apiClient.get('/orders/stats'),

  getLinks: (orderId: string) =>
    apiClient.get(`/files/${orderId}/links`),

  shareWhatsApp: (orderId: string) =>
    apiClient.get(`/files/${orderId}/share-whatsapp`),

  shareEmail: (orderId: string) =>
    apiClient.get(`/files/${orderId}/share-email`),
};
