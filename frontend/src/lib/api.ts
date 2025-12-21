/**
 * API Client for OncoRisk EC Backend
 */

import type {
  PatientData,
  PredictionResult,
  ShapExplanation,
  ClinicalReport,
  DemoScenario,
  ScenariosListResponse,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new ApiError(response.status, error.detail || "An error occurred");
  }

  return response.json();
}

export const api = {
  /**
   * Predict 5-year recurrence risk
   */
  predict: async (patientData: PatientData): Promise<PredictionResult> => {
    return fetchAPI<PredictionResult>("/predict", {
      method: "POST",
      body: JSON.stringify(patientData),
    });
  },

  /**
   * Get SHAP explanation for prediction
   */
  explain: async (patientData: PatientData): Promise<ShapExplanation> => {
    return fetchAPI<ShapExplanation>("/explain", {
      method: "POST",
      body: JSON.stringify(patientData),
    });
  },

  /**
   * Generate clinical report
   */
  generateReport: async (patientData: PatientData): Promise<ClinicalReport> => {
    return fetchAPI<ClinicalReport>("/report", {
      method: "POST",
      body: JSON.stringify(patientData),
    });
  },

  /**
   * Get all demo scenarios
   */
  getScenarios: async (): Promise<ScenariosListResponse> => {
    return fetchAPI<ScenariosListResponse>("/scenarios");
  },

  /**
   * Get specific scenario details
   */
  getScenario: async (scenarioId: string): Promise<DemoScenario> => {
    return fetchAPI<DemoScenario>(`/scenarios/${scenarioId}`);
  },

  /**
   * Get patient data for a scenario
   */
  getScenarioPatient: async (scenarioId: string): Promise<PatientData | { patient_a: PatientData; patient_b: PatientData }> => {
    return fetchAPI<PatientData | { patient_a: PatientData; patient_b: PatientData }>(`/scenarios/${scenarioId}/patient`);
  },

  /**
   * Health check
   */
  healthCheck: async (): Promise<{ status: string; version: string; environment: string }> => {
    return fetchAPI("/health");
  },
};

export { ApiError };
