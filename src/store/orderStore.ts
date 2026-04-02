// ─── BoxDesign AI — Order Store (Zustand) ────────────────────────────────────
import { create } from 'zustand';
import type { Order, PricingTier } from '@/types/order';
import { ordersApi } from '@/services/api/orders';

interface OrderStore {
  orders:         Order[];
  activeOrder:    Order | null;
  selectedTier:   PricingTier | null;
  isPaymentLoading: boolean;
  isLoading: boolean;

  // Actions
  setOrders:       (orders: Order[])           => void;
  addOrder:        (order: Order)              => void;
  updateOrder:     (id: string, patch: Partial<Order>) => void;
  setActiveOrder:  (order: Order | null)       => void;
  setSelectedTier: (tier: PricingTier | null)  => void;
  setPaymentLoading: (v: boolean)              => void;
  fetchOrders:     () => Promise<void>;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders:           [],
  activeOrder:      null,
  selectedTier:     null,
  isPaymentLoading: false,
  isLoading: false,

  setOrders:  (orders)  => set({ orders }),

  addOrder:   (order)   =>
    set((state) => ({ orders: [order, ...state.orders] })),

  updateOrder: (id, patch) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
      activeOrder:
        state.activeOrder?.id === id
          ? { ...state.activeOrder, ...patch }
          : state.activeOrder,
    })),

  setActiveOrder:    (activeOrder)    => set({ activeOrder }),
  setSelectedTier:   (selectedTier)   => set({ selectedTier }),
  setPaymentLoading: (isPaymentLoading) => set({ isPaymentLoading }),

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const res = await ordersApi.list();
      const items = res.data?.items || res.data || [];
      // Map backend snake_case to frontend camelCase
      const mappedOrders: Order[] = items.map((item: any) => ({
        id: item.order_id || item.id,
        userId: item.user_id,
        designRequestId: item.design_request_id,
        selectedDesignId: item.selected_design_id,
        pricingTier: item.pricing_tier,
        status: item.status,
        totalAmountInr: item.total_amount_inr,
        gstAmountInr: item.gst_amount_inr,
        promoCode: item.promo_code,
        discountInr: item.discount_inr,
        paymentId: item.payment_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
      set({ orders: mappedOrders });
    } catch (error) {
      console.warn('fetchOrders failed', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
