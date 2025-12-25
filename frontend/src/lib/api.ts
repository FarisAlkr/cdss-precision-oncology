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

  /**
   * Analyze uploaded document and extract patient data (pattern-based)
   */
  analyzeDocument: async (file: File): Promise<{
    extracted_data: Partial<PatientData>;
    confidence: number;
    method: string;
    warnings: string[];
  }> => {
    const formData = new FormData();
    formData.append("file", file);

    const url = `${API_BASE_URL}/document/analyze`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new ApiError(response.status, error.detail || "Failed to analyze document");
    }

    return response.json();
  },

  /**
   * AI-Powered Intelligent Document Analysis
   * Uses LLM to read any medical document and provide comprehensive assessment
   */
  aiAnalyzeDocument: async (file: File): Promise<MedicalAssessment> => {
    const formData = new FormData();
    formData.append("file", file);

    const url = `${API_BASE_URL}/document/ai-analyze`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new ApiError(response.status, error.detail || "AI analysis failed");
    }

    return response.json();
  },
};

// Medical Assessment type for AI analysis response
export interface MedicalAssessment {
  patient_data: Partial<PatientData> & {
    gender?: string;
    tumor_size?: number;
    msi_status?: string;
    tmb_score?: number;
    tmb_status?: string;
    mlh1_status?: string;
    pms2_status?: string;
    msh2_status?: string;
    msh6_status?: string;
    fgfr2_status?: string;
    pten_status?: string;
    pik3ca_status?: string;
    kras_status?: string;
    arid1a_status?: string;
  };
  molecular_group: "POLEmut" | "MMRd" | "NSMP" | "p53abn" | "Unknown";
  molecular_group_confidence: number;
  molecular_rationale: string;
  risk_category: "LOW" | "INTERMEDIATE" | "HIGH";
  risk_score: number;
  five_year_recurrence_risk: number;
  clinical_summary: string;
  key_findings: string[];
  risk_factors: string[];
  protective_factors: string[];
  treatment_implications: string;
  recommended_surveillance: string;
  clinical_trial_eligibility: string[];
  detailed_explanation: string;
  extraction_confidence: number;
  missing_critical_data: string[];
  warnings: string[];
}

export { ApiError };
