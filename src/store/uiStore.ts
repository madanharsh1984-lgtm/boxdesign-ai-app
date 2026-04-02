// ─── BoxDesign AI — UI State Store (Zustand) ─────────────────────────────────
import { create } from 'zustand';

interface Toast {
  id:      string;
  message: string;
  type:    'success' | 'error' | 'info' | 'warning';
}

interface UIStore {
  isLoading:    boolean;
  toasts:       Toast[];
  activeModal:  string | null;

  // Actions
  setLoading:   (v: boolean)         => void;
  showToast:    (msg: string, type?: Toast['type']) => void;
  dismissToast: (id: string)         => void;
  openModal:    (name: string)       => void;
  closeModal:   ()                   => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isLoading:   false,
  toasts:      [],
  activeModal: null,

  setLoading: (isLoading) => set({ isLoading }),

  showToast: (message, type = 'info') =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: Date.now().toString(), message, type },
      ],
    })),

  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  openModal:  (activeModal) => set({ activeModal }),
  closeModal: ()            => set({ activeModal: null }),
}));
