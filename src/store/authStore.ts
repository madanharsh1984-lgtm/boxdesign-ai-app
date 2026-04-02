// ─── BoxDesign AI — Auth Store (Zustand) ─────────────────────────────────────
import { create } from 'zustand';
import type { User, UserProfile } from '@/types/user';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser:    (user: User, token: string) => void;
  updateProfile: (profile: UserProfile)  => void;
  logout:     () => void;
  setLoading: (v: boolean)               => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user:            null,
  token:           null,
  isAuthenticated: false,
  isLoading:       false,

  setUser: (user, token) =>
    set({ user, token, isAuthenticated: true, isLoading: false }),

  updateProfile: (profile) =>
    set((state) => ({
      user: state.user ? { ...state.user, profile } : null,
    })),

  logout: () =>
    set({ user: null, token: null, isAuthenticated: false }),

  setLoading: (isLoading) => set({ isLoading }),
}));
