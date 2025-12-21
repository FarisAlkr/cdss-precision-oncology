/**
 * Application Constants
 */

import type { FIGOStage, HistologyType, Grade, LVSIStatus, MyometrialInvasion, LymphNodeStatus } from "./types";

export const APP_NAME = "OncoRisk EC";
export const APP_VERSION = "1.0.0";
export const APP_DESCRIPTION = "AI-Driven Molecular Risk Stratification for Endometrial Cancer";

// FIGO Stages
export const FIGO_STAGES: FIGOStage[] = ["IA", "IB", "II", "IIIA", "IIIB", "IIIC1", "IIIC2", "IVA", "IVB"];

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
  { value: 0, label: "ECOG 0: Fully active" },
  { value: 1, label: "ECOG 1: Restricted in strenuous activity" },
  { value: 2, label: "ECOG 2: Ambulatory, unable to work" },
  { value: 3, label: "ECOG 3: Limited self-care" },
  { value: 4, label: "ECOG 4: Completely disabled" },
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
    frequency: "~7%",
    prognosis: "Excellent (5-year RFS >95%)",
    color: "#10b981",
    icon: "shield-check",
  },
  MMRd: {
    name: "MMR Deficient",
    shortName: "MMRd",
    frequency: "~28%",
    prognosis: "Intermediate (5-year RFS ~85-90%)",
    color: "#3b82f6",
    icon: "dna",
  },
  NSMP: {
    name: "No Specific Molecular Profile",
    shortName: "NSMP",
    frequency: "~40%",
    prognosis: "Variable (depends on L1CAM/CTNNB1)",
    color: "#64748b",
    icon: "minus-circle",
  },
  p53abn: {
    name: "p53 Abnormal",
    shortName: "p53abn",
    frequency: "~25%",
    prognosis: "Poor (5-year RFS ~50-60%)",
    color: "#ef4444",
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
