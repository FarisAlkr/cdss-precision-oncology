/**
 * TypeScript type definitions matching backend Pydantic models
 */

// Patient Data Types
export type FIGOStage = "IA" | "IB" | "II" | "IIIA" | "IIIB" | "IIIC1" | "IIIC2" | "IVA" | "IVB";

export type HistologyType = "Endometrioid" | "Serous" | "Clear Cell" | "Carcinosarcoma" | "Mixed" | "Other";

export type Grade = "G1" | "G2" | "G3";

export type LVSIStatus = "None" | "Focal" | "Substantial";

export type MyometrialInvasion = "<50%" | "≥50%";

export type LymphNodeStatus = "Negative" | "Pelvic+" | "Para-aortic+";

export type MolecularStatus = "Positive" | "Negative" | "Mutated" | "Wild-type" | "Abnormal" | "Proficient" | "Deficient" | "Not Tested";

export interface PatientData {
  patient_id?: string;
  // Clinical
  age: number;
  bmi: number;
  diabetes: boolean;
  ecog_status: number;
  // Pathological
  stage: FIGOStage;
  histology: HistologyType;
  grade: Grade;
  myometrial_invasion: MyometrialInvasion;
  lvsi: LVSIStatus;
  lymph_nodes: LymphNodeStatus;
  // Molecular - Core TCGA markers
  pole_status: "Mutated" | "Wild-type" | "Not Tested";
  mmr_status: "Proficient" | "Deficient" | "Not Tested";
  mmr_protein_lost?: "MLH1" | "MSH2" | "MSH6" | "PMS2";
  p53_status: "Wild-type" | "Abnormal" | "Not Tested";
  p53_pattern?: "Null" | "Missense";
  l1cam_status: "Positive" | "Negative" | "Not Tested";
  ctnnb1_status: "Mutated" | "Wild-type" | "Not Tested";
  er_percent?: number;
  pr_percent?: number;
  // Auto-determined molecular classification (from NGS reports)
  molecular_group?: MolecularGroup;
  // MSI status from NGS (Soroka reports)
  msi_status?: "Stable" | "Unstable";
  // TMB from NGS (Soroka reports)
  tmb_score?: number;
  tmb_status?: "Low" | "High";
  // Individual MMR protein IHC status (Soroka MMR reports)
  mlh1_status?: "Intact" | "Lost";
  pms2_status?: "Intact" | "Lost";
  msh2_status?: "Intact" | "Lost";
  msh6_status?: "Intact" | "Lost";
  // Additional molecular markers from NGS (Soroka Oncomine)
  fgfr2_status?: "Mutated" | "Wild-type";
  pten_status?: "Mutated" | "Wild-type";
  pik3ca_status?: "Mutated" | "Wild-type";
  fbxw7_status?: "Mutated" | "Wild-type";
  kras_status?: "Mutated" | "Wild-type";
  // Tumor characteristics from NGS
  tumor_purity?: number;
}

// Molecular Classification Types
export type MolecularGroup = "POLEmut" | "MMRd" | "NSMP" | "p53abn";

export interface MolecularClassification {
  group: MolecularGroup;
  subtype: string | null;
  confidence: number;
  rationale: string;
  clinical_significance: string;
}

// Risk Prediction Types
export type RiskCategory = "LOW" | "INTERMEDIATE" | "HIGH";

// FIGO 2023 Staging (Molecular-Integrated)
export interface FIGO2023Staging {
  anatomical_stage: string;
  figo_2023_stage: string;
  stage_group: string;
  molecular_modifier: string | null;
  rationale: string;
  prognosis_impact: string;
  clinical_implications: string;
  staging_system: string;
}

export interface PredictionResult {
  recurrence_probability: number;
  risk_category: RiskCategory;
  risk_percentile: number | null;
  molecular_classification: MolecularClassification;
  figo_2023_staging?: FIGO2023Staging;
  stage_based_risk: number;
  risk_difference: number;
  reclassified: boolean;
  model_version: string;
  assessment_date: string;
}

// SHAP Explanation Types
export interface FeatureContribution {
  name: string;
  display_name: string;
  value: string;
  shap_value: number;
  direction: "risk" | "protective";
  color: string;
  importance_rank: number;
}

export interface FeatureInteraction {
  feature1_name: string;
  feature1_display: string;
  feature2_name: string;
  feature2_display: string;
  interaction_value: number;
  interpretation: string;
}

export interface ShapExplanation {
  base_value: number;
  prediction: number;
  features: FeatureContribution[];
  top_risk_factors: FeatureContribution[];
  top_protective_factors: FeatureContribution[];
  interactions: FeatureInteraction[];
  summary: string;
}

// Treatment Recommendation Types
export interface EvidenceItem {
  source: string;
  finding: string;
  hr: number | null;
  p_value: number | null;
  url?: string;
}

export interface ClinicalTrial {
  trial_name: string;
  intervention: string;
  status: string;
  eligibility_note?: string;
}

export interface Alert {
  type: string;
  message: string;
}

export interface TreatmentRecommendation {
  primary_recommendation: string;
  rationale: string;
  evidence: EvidenceItem[];
  trial_eligibility: ClinicalTrial[];
  alerts: Alert[];
  contraindications: string[];
}

// Clinical Report Types
export interface ClinicalReport {
  patient_id: string | null;
  assessment_date: string;
  report_id: string;
  version: string;
  risk_score: number;
  risk_category: string;
  molecular_group: string;
  one_line_summary: string;
  clinical_summary: string;
  pathological_summary: string;
  molecular_summary: string;
  shap_summary: string;
  top_risk_drivers: string[];
  top_protective_factors: string[];
  molecular_explanation: string;
  biological_significance: string;
  therapeutic_implications: string;
  treatment_recommendation: TreatmentRecommendation;
  disclaimer?: string;
}

// Demo Scenario Types
export interface DemoScenario {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  patient_data?: PatientData;
  patient_data_a?: PatientData;
  patient_data_b?: PatientData;
  expected_molecular_group?: MolecularGroup;
  expected_risk_category?: RiskCategory;
  expected_risk_category_a?: RiskCategory;
  expected_risk_category_b?: RiskCategory;
  key_insight: string;
  narrative_points?: string[];
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface ScenariosListResponse {
  scenarios: Array<{
    id: string;
    title: string;
    subtitle: string;
    description: string;
    expected_molecular_group?: string;
    expected_risk_category?: string;
    key_insight: string;
  }>;
  total: number;
}
