/**
 * Application Constants
 */

import type { FIGOStage, HistologyType, Grade, LVSIStatus, MyometrialInvasion, LymphNodeStatus } from "./types";

export const APP_NAME = "OncoRisk EC";
export const APP_VERSION = "1.0.0";
export const APP_DESCRIPTION = "AI-Driven Molecular Risk Stratification for Endometrial Cancer";

// FIGO Stages
export const FIGO_STAGES = [
  { value: "IA", label: "Stage IA", description: "Tumor confined to uterus, <50% myometrial invasion" },
  { value: "IB", label: "Stage IB", description: "Tumor confined to uterus, ≥50% myometrial invasion" },
  { value: "II", label: "Stage II", description: "Tumor invades cervical stroma" },
  { value: "IIIA", label: "Stage IIIA", description: "Tumor invades serosa or adnexa" },
  { value: "IIIB", label: "Stage IIIB", description: "Vaginal or parametrial involvement" },
  { value: "IIIC1", label: "Stage IIIC1", description: "Pelvic lymph node metastasis" },
  { value: "IIIC2", label: "Stage IIIC2", description: "Para-aortic lymph node metastasis" },
  { value: "IVA", label: "Stage IVA", description: "Tumor invades bladder or bowel mucosa" },
  { value: "IVB", label: "Stage IVB", description: "Distant metastasis" },
] as const;

export const FIGO_STAGE_DESCRIPTIONS: Record<FIGOStage, string> = {
  IA: "Tumor confined to uterus, <50% myometrial invasion",
  IB: "Tumor confined to uterus, ≥50% myometrial invasion",
  II: "Tumor invades cervical stroma",
  IIIA: "Tumor invades serosa or adnexa",
  IIIB: "Vaginal or parametrial involvement",
  IIIC1: "Pelvic lymph node metastasis",
  IIIC2: "Para-aortic lymph node metastasis",
  IVA: "Tumor invades bladder or bowel mucosa",
  IVB: "Distant metastasis",
};

// Histology Types
export const HISTOLOGY_TYPES: HistologyType[] = [
  "Endometrioid",
  "Serous",
  "Clear Cell",
  "Carcinosarcoma",
  "Mixed",
  "Other",
];

// Grades
export const GRADES: Grade[] = ["G1", "G2", "G3"];

export const GRADE_DESCRIPTIONS: Record<Grade, string> = {
  G1: "Well differentiated",
  G2: "Moderately differentiated",
  G3: "Poorly differentiated",
};

// LVSI Status
export const LVSI_STATUSES: LVSIStatus[] = ["None", "Focal", "Substantial"];

// Myometrial Invasion
export const MYOMETRIAL_INVASIONS: MyometrialInvasion[] = ["<50%", "≥50%"];
export const MYOMETRIAL_INVASION_STATUSES = MYOMETRIAL_INVASIONS; // Alias for compatibility

// Lymph Node Status
export const LYMPH_NODE_STATUSES: LymphNodeStatus[] = ["Negative", "Pelvic+", "Para-aortic+"];

// Molecular Statuses
export const POLE_STATUSES = ["Wild-type", "Mutated", "Not Tested"] as const;
export const MMR_STATUSES = ["Proficient", "Deficient", "Not Tested"] as const;
export const P53_STATUSES = ["Wild-type", "Abnormal", "Not Tested"] as const;
export const L1CAM_STATUSES = ["Negative", "Positive", "Not Tested"] as const;
export const CTNNB1_STATUSES = ["Wild-type", "Mutated", "Not Tested"] as const;

// MMR Proteins
export const MMR_PROTEINS = ["MLH1", "MSH2", "MSH6", "PMS2"] as const;

// p53 Patterns
export const P53_PATTERNS = ["Null", "Missense"] as const;

// ECOG Status
export const ECOG_STATUSES = [
  { value: 0, label: "ECOG 0", description: "Fully active" },
  { value: 1, label: "ECOG 1", description: "Restricted in strenuous activity" },
  { value: 2, label: "ECOG 2", description: "Ambulatory, unable to work" },
  { value: 3, label: "ECOG 3", description: "Limited self-care" },
  { value: 4, label: "ECOG 4", description: "Completely disabled" },
];

// Age Range
export const AGE_MIN = 35;
export const AGE_MAX = 90;

// BMI Range
export const BMI_MIN = 15;
export const BMI_MAX = 60;

// Risk Thresholds
export const RISK_THRESHOLDS = {
  LOW: 0.15,
  INTERMEDIATE: 0.40,
  HIGH: 1.0,
};

// Molecular Group Info
export const MOLECULAR_GROUP_INFO = {
  POLEmut: {
    name: "POLE Ultramutated",
    shortName: "POLEmut",
    displayName: "POLEmut",
    frequency: "~7%",
    prognosis: "Excellent prognosis with >95% 5-year recurrence-free survival",
    shortDescription: "Ultramutated phenotype with robust immune response",
    keyFeatures: "High tumor mutational burden, strong anti-tumor immunity, excellent response to standard therapy",
    recurrenceRate: "<5%",
    color: "#10b981",
    colorClass: "text-emerald-600 bg-emerald-100",
    icon: "shield-check",
  },
  MMRd: {
    name: "MMR Deficient",
    shortName: "MMRd",
    displayName: "MMRd",
    frequency: "~28%",
    prognosis: "Intermediate prognosis with 85-90% 5-year recurrence-free survival",
    shortDescription: "Mismatch repair deficiency, immunotherapy candidate",
    keyFeatures: "Lynch syndrome association, high neoantigen load, responsive to immune checkpoint inhibitors",
    recurrenceRate: "10-15%",
    color: "#3b82f6",
    colorClass: "text-blue-600 bg-blue-100",
    icon: "dna",
  },
  NSMP: {
    name: "No Specific Molecular Profile",
    shortName: "NSMP",
    displayName: "NSMP",
    frequency: "~40%",
    prognosis: "Variable prognosis depending on L1CAM and CTNNB1 status",
    shortDescription: "Risk stratified by traditional and emerging biomarkers",
    keyFeatures: "Heterogeneous group, L1CAM positivity indicates higher risk, CTNNB1 mutation associated with late recurrence",
    recurrenceRate: "10-25%",
    color: "#64748b",
    colorClass: "text-slate-600 bg-slate-100",
    icon: "minus-circle",
  },
  p53abn: {
    name: "p53 Abnormal",
    shortName: "p53abn",
    displayName: "p53abn",
    frequency: "~25%",
    prognosis: "Poor prognosis with 50-60% 5-year recurrence-free survival",
    shortDescription: "Aggressive tumor biology with copy-number high phenotype",
    keyFeatures: "Serous-like molecular features, high genomic instability, requires intensive therapy",
    recurrenceRate: "40-50%",
    color: "#ef4444",
    colorClass: "text-rose-600 bg-rose-100",
    icon: "alert-triangle",
  },
};

// Form validation rules
export const VALIDATION_RULES = {
  age: { min: AGE_MIN, max: AGE_MAX },
  bmi: { min: BMI_MIN, max: BMI_MAX },
  er_percent: { min: 0, max: 100 },
  pr_percent: { min: 0, max: 100 },
};

// Navigation
export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Assess", href: "/assess" },
  { label: "Demo", href: "/demo" },
];

// External Links
export const EXTERNAL_LINKS = {
  portec3: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(23)00154-7/fulltext",
  esgoGuidelines: "https://www.esgo.org/media/2021/04/ESGO-ESTRO-ESP-guidelines-EC.pdf",
  rainboTrials: "https://www.rainbostudies.org/",
};
