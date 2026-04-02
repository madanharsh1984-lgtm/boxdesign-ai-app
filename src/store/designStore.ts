// ─── BoxDesign AI — Design Request Store (Zustand) ───────────────────────────
import { create } from 'zustand';
import type { DesignRequest, GeneratedDesigns, DesignThemeResult } from '@/types/design';

interface DesignStore {
  // Active request being built (multi-step form)
  request:          Partial<DesignRequest>;
  currentStep:      number;            // 1–4
  generationJobId:  string | null;
  generatedDesigns: GeneratedDesigns | null;
  selectedDesign:   DesignThemeResult | null;
  regenerationsLeft: number;

  // Actions
  updateRequest:    (patch: Partial<DesignRequest>) => void;
  setStep:          (step: number)                  => void;
  setJobId:         (id: string | null)             => void;
  setGeneratedDesigns: (d: GeneratedDesigns)        => void;
  selectDesign:     (d: DesignThemeResult)          => void;
  toggleFavourite:  (designId: string)              => void;
  decrementRegens:  ()                              => void;
  resetRequest:     ()                              => void;
}

const INITIAL_REQUEST: Partial<DesignRequest> = {};

export const useDesignStore = create<DesignStore>((set) => ({
  request:           INITIAL_REQUEST,
  currentStep:       1,
  generationJobId:   null,
  generatedDesigns:  null,
  selectedDesign:    null,
  regenerationsLeft: 3,

  updateRequest: (patch) =>
    set((state) => ({ request: { ...state.request, ...patch } })),

  setStep: (currentStep) => set({ currentStep }),

  setJobId: (generationJobId) => set({ generationJobId }),

  setGeneratedDesigns: (generatedDesigns) =>
    set({ generatedDesigns }),

  selectDesign: (selectedDesign) => set({ selectedDesign }),

  toggleFavourite: (designId) =>
    set((state) => {
      if (!state.generatedDesigns) return state;
      const designs = state.generatedDesigns.designs.map((d) =>
        d.id === designId ? { ...d, isFavourite: !d.isFavourite } : d
      );
      return {
        generatedDesigns: { ...state.generatedDesigns, designs },
      };
    }),

  decrementRegens: () =>
    set((state) => ({
      regenerationsLeft: Math.max(0, state.regenerationsLeft - 1),
    })),

  resetRequest: () =>
    set({
      request:          INITIAL_REQUEST,
      currentStep:      1,
      generationJobId:  null,
      generatedDesigns: null,
      selectedDesign:   null,
      regenerationsLeft: 3,
    }),
}));
