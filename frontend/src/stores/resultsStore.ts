/**
 * Results Store
 * Manages prediction results and explanations
 */

import { create } from "zustand";
import type { PredictionResult, ShapExplanation, ClinicalReport } from "@/lib/types";

interface ResultsStore {
  prediction: PredictionResult | null;
  explanation: ShapExplanation | null;
  report: ClinicalReport | null;
  loading: boolean;
  error: string | null;

  setPrediction: (prediction: PredictionResult) => void;
  setExplanation: (explanation: ShapExplanation) => void;
  setReport: (report: ClinicalReport) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useResultsStore = create<ResultsStore>((set) => ({
  prediction: null,
  explanation: null,
  report: null,
  loading: false,
  error: null,

  setPrediction: (prediction) => set({ prediction }),
  setExplanation: (explanation) => set({ explanation }),
  setReport: (report) => set({ report }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      prediction: null,
      explanation: null,
      report: null,
      loading: false,
      error: null,
    }),
}));
