// ─── BoxDesign AI — Order Store (Zustand) ────────────────────────────────────
import { create } from 'zustand';
import type { Order, PricingTier } from '@/types/order';

interface OrderStore {
  orders:         Order[];
  activeOrder:    Order | null;
  selectedTier:   PricingTier | null;
  isPaymentLoading: boolean;

  // Actions
  setOrders:       (orders: Order[])           => void;
  addOrder:        (order: Order)              => void;
  updateOrder:     (id: string, patch: Partial<Order>) => void;
  setActiveOrder:  (order: Order | null)       => void;
  setSelectedTier: (tier: PricingTier | null)  => void;
  setPaymentLoading: (v: boolean)              => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders:           [],
  activeOrder:      null,
  selectedTier:     null,
  isPaymentLoading: false,

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
}));
