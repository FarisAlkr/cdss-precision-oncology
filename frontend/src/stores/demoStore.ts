/**
 * Demo Mode Store
 * Manages demo scenarios and guided tour state
 */

import { create } from "zustand";
import type { DemoScenario } from "@/lib/types";

interface DemoStore {
  scenarios: DemoScenario[];
  currentScenario: DemoScenario | null;
  isGuidedMode: boolean;
  currentStep: number;
  loading: boolean;

  setScenarios: (scenarios: DemoScenario[]) => void;
  setCurrentScenario: (scenario: DemoScenario | null) => void;
  setGuidedMode: (enabled: boolean) => void;
  nextStep: () => void;
  previousStep: () => void;
  setStep: (step: number) => void;
  resetDemo: () => void;
  setLoading: (loading: boolean) => void;
}

export const useDemoStore = create<DemoStore>((set, get) => ({
  scenarios: [],
  currentScenario: null,
  isGuidedMode: false,
  currentStep: 0,
  loading: false,

  setScenarios: (scenarios) => set({ scenarios }),

  setCurrentScenario: (scenario) =>
    set({
      currentScenario: scenario,
      currentStep: 0,
    }),

  setGuidedMode: (enabled) => set({ isGuidedMode: enabled }),

  nextStep: () =>
    set((state) => {
      const maxSteps = state.currentScenario?.narrative_points?.length || 0;
      return {
        currentStep: Math.min(state.currentStep + 1, maxSteps - 1),
      };
    }),

  previousStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    })),

  setStep: (step) => set({ currentStep: step }),

  resetDemo: () =>
    set({
      currentScenario: null,
      isGuidedMode: false,
      currentStep: 0,
    }),

  setLoading: (loading) => set({ loading }),
}));
