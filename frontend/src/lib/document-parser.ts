/**
 * Document Parser Utility
 * Handles parsing of patient documents (CSV, JSON, PDF, Images)
 */

import type { PatientData } from "./types";

// Field mappings from common document formats to our PatientData schema
const FIELD_MAPPINGS: Record<string, keyof PatientData> = {
  // Age variations
  age: "age",
  patient_age: "age",
  "patient age": "age",
  years: "age",

  // BMI variations
  bmi: "bmi",
  body_mass_index: "bmi",
  "body mass index": "bmi",

  // Stage variations
  stage: "stage",
  figo_stage: "stage",
  "figo stage": "stage",
  tumor_stage: "stage",

  // Histology variations
  histology: "histology",
  histology_type: "histology",
  "histology type": "histology",
  tumor_type: "histology",

  // Grade variations
  grade: "grade",
  tumor_grade: "grade",
  "tumor grade": "grade",
  differentiation: "grade",

  // Myometrial invasion
  myometrial_invasion: "myometrial_invasion",
  "myometrial invasion": "myometrial_invasion",
  invasion_depth: "myometrial_invasion",
  "invasion depth": "myometrial_invasion",

  // LVSI
  lvsi: "lvsi",
  lvsi_status: "lvsi",
  "lvsi status": "lvsi",
  lymphovascular_invasion: "lvsi",
  "lymphovascular invasion": "lvsi",

  // Lymph nodes
  lymph_nodes: "lymph_nodes",
  "lymph nodes": "lymph_nodes",
  lymph_node_status: "lymph_nodes",
  "lymph node status": "lymph_nodes",
  nodal_status: "lymph_nodes",

  // POLE
  pole: "pole_status",
  pole_status: "pole_status",
  "pole status": "pole_status",
  pole_mutation: "pole_status",
  "pole mutation": "pole_status",

  // MMR
  mmr: "mmr_status",
  mmr_status: "mmr_status",
  "mmr status": "mmr_status",
  mismatch_repair: "mmr_status",
  "mismatch repair": "mmr_status",

  // p53
  p53: "p53_status",
  p53_status: "p53_status",
  "p53 status": "p53_status",
  tp53: "p53_status",

  // L1CAM
  l1cam: "l1cam_status",
  l1cam_status: "l1cam_status",
  "l1cam status": "l1cam_status",

  // CTNNB1
  ctnnb1: "ctnnb1_status",
  ctnnb1_status: "ctnnb1_status",
  "ctnnb1 status": "ctnnb1_status",
  beta_catenin: "ctnnb1_status",
  "beta catenin": "ctnnb1_status",

  // ECOG
  ecog: "ecog_status",
  ecog_status: "ecog_status",
  "ecog status": "ecog_status",
  performance_status: "ecog_status",
  "performance status": "ecog_status",

  // Diabetes
  diabetes: "diabetes",
  diabetic: "diabetes",
  diabetes_status: "diabetes",

  // ER/PR
  er: "er_percent",
  er_percent: "er_percent",
  "er percent": "er_percent",
  estrogen_receptor: "er_percent",
  "estrogen receptor": "er_percent",

  pr: "pr_percent",
  pr_percent: "pr_percent",
  "pr percent": "pr_percent",
  progesterone_receptor: "pr_percent",
  "progesterone receptor": "pr_percent",

  // ===== Soroka NGS Report Fields =====
  // Molecular classification (auto-determined)
  molecular_group: "molecular_group",

  // MSI status from NGS
  msi_status: "msi_status",
  msi: "msi_status",
  "microsatellite instability": "msi_status",

  // TMB from NGS
  tmb_score: "tmb_score",
  tmb: "tmb_score",
  "tumor mutational burden": "tmb_score",
  tmb_status: "tmb_status",

  // Individual MMR protein IHC status (Soroka MMR reports)
  mlh1_status: "mlh1_status",
  mlh1: "mlh1_status",
  pms2_status: "pms2_status",
  pms2: "pms2_status",
  msh2_status: "msh2_status",
  msh2: "msh2_status",
  msh6_status: "msh6_status",
  msh6: "msh6_status",

  // Additional molecular markers from Soroka Oncomine
  fgfr2_status: "fgfr2_status",
  fgfr2: "fgfr2_status",
  pten_status: "pten_status",
  pten: "pten_status",
  pik3ca_status: "pik3ca_status",
  pik3ca: "pik3ca_status",
  fbxw7_status: "fbxw7_status",
  fbxw7: "fbxw7_status",
  kras_status: "kras_status",
  kras: "kras_status",

  // Tumor characteristics
  tumor_purity: "tumor_purity",
  "tumor purity": "tumor_purity",
};

// Value normalization mappings
const VALUE_NORMALIZATIONS: Record<string, Record<string, any>> = {
  stage: {
    ia: "IA",
    ib: "IB",
    ii: "II",
    iiia: "IIIA",
    iiib: "IIIB",
    iiic1: "IIIC1",
    iiic2: "IIIC2",
    iva: "IVA",
    ivb: "IVB",
    "stage ia": "IA",
    "stage ib": "IB",
    "stage ii": "II",
    "1a": "IA",
    "1b": "IB",
    "2": "II",
    "3a": "IIIA",
    "3b": "IIIB",
    "3c1": "IIIC1",
    "3c2": "IIIC2",
    "4a": "IVA",
    "4b": "IVB",
  },
  grade: {
    g1: "G1",
    g2: "G2",
    g3: "G3",
    "grade 1": "G1",
    "grade 2": "G2",
    "grade 3": "G3",
    "1": "G1",
    "2": "G2",
    "3": "G3",
    low: "G1",
    intermediate: "G2",
    high: "G3",
    "well differentiated": "G1",
    "moderately differentiated": "G2",
    "poorly differentiated": "G3",
  },
  histology: {
    endometrioid: "Endometrioid",
    serous: "Serous",
    "clear cell": "Clear Cell",
    clearcell: "Clear Cell",
    carcinosarcoma: "Carcinosarcoma",
    mixed: "Mixed",
    undifferentiated: "Undifferentiated",
  },
  myometrial_invasion: {
    "<50%": "<50%",
    ">=50%": "≥50%",
    "≥50%": "≥50%",
    ">50%": "≥50%",
    "less than 50%": "<50%",
    "more than 50%": "≥50%",
    "less than half": "<50%",
    "more than half": "≥50%",
    superficial: "<50%",
    deep: "≥50%",
  },
  lvsi: {
    present: "Present",
    absent: "Absent",
    positive: "Present",
    negative: "Absent",
    yes: "Present",
    no: "Absent",
    substantial: "Substantial",
    focal: "Focal",
    "not identified": "Absent",
  },
  lymph_nodes: {
    negative: "Negative",
    positive: "Positive",
    "not assessed": "Not Assessed",
    nx: "Not Assessed",
    n0: "Negative",
    n1: "Positive",
    n2: "Positive",
  },
  pole_status: {
    mutated: "Mutated",
    "wild-type": "Wild-type",
    wildtype: "Wild-type",
    wt: "Wild-type",
    mut: "Mutated",
    positive: "Mutated",
    negative: "Wild-type",
    "not tested": "Not Tested",
  },
  mmr_status: {
    proficient: "Proficient",
    deficient: "Deficient",
    pmmr: "Proficient",
    dmmr: "Deficient",
    intact: "Proficient",
    loss: "Deficient",
    "not tested": "Not Tested",
  },
  p53_status: {
    "wild-type": "Wild-type",
    wildtype: "Wild-type",
    normal: "Wild-type",
    abnormal: "Abnormal",
    mutant: "Abnormal",
    overexpression: "Abnormal",
    null: "Abnormal",
    "not tested": "Not Tested",
  },
  l1cam_status: {
    positive: "Positive",
    negative: "Negative",
    ">=10%": "Positive",
    "<10%": "Negative",
    "not tested": "Not Tested",
  },
  ctnnb1_status: {
    mutated: "Mutated",
    "wild-type": "Wild-type",
    wildtype: "Wild-type",
    positive: "Mutated",
    negative: "Wild-type",
    "not tested": "Not Tested",
  },
  diabetes: {
    yes: true,
    no: false,
    true: true,
    false: false,
    diabetic: true,
    "non-diabetic": false,
    "1": true,
    "0": false,
  },
  // ===== Soroka NGS Report Value Normalizations =====
  molecular_group: {
    polemut: "POLEmut",
    mmrd: "MMRd",
    nsmp: "NSMP",
    p53abn: "p53abn",
    "pole mutated": "POLEmut",
    "mmr deficient": "MMRd",
    "p53 abnormal": "p53abn",
    "no specific molecular profile": "NSMP",
  },
  msi_status: {
    stable: "Stable",
    unstable: "Unstable",
    mss: "Stable",
    "msi-s": "Stable",
    "msi-h": "Unstable",
    high: "Unstable",
    low: "Stable",
  },
  tmb_status: {
    low: "Low",
    high: "High",
  },
  mlh1_status: {
    intact: "Intact",
    lost: "Lost",
    loss: "Lost",
    "+": "Intact",
    "-": "Lost",
    positive: "Intact",
    negative: "Lost",
  },
  pms2_status: {
    intact: "Intact",
    lost: "Lost",
    loss: "Lost",
    "+": "Intact",
    "-": "Lost",
    positive: "Intact",
    negative: "Lost",
  },
  msh2_status: {
    intact: "Intact",
    lost: "Lost",
    loss: "Lost",
    "+": "Intact",
    "-": "Lost",
    positive: "Intact",
    negative: "Lost",
  },
  msh6_status: {
    intact: "Intact",
    lost: "Lost",
    loss: "Lost",
    "+": "Intact",
    "-": "Lost",
    positive: "Intact",
    negative: "Lost",
  },
  fgfr2_status: {
    mutated: "Mutated",
    "wild-type": "Wild-type",
    wildtype: "Wild-type",
    detected: "Mutated",
    "not detected": "Wild-type",
  },
  pten_status: {
    mutated: "Mutated",
    "wild-type": "Wild-type",
    wildtype: "Wild-type",
    detected: "Mutated",
    "not detected": "Wild-type",
  },
  pik3ca_status: {
    mutated: "Mutated",
    "wild-type": "Wild-type",
    wildtype: "Wild-type",
    detected: "Mutated",
    "not detected": "Wild-type",
  },
  fbxw7_status: {
    mutated: "Mutated",
    "wild-type": "Wild-type",
    wildtype: "Wild-type",
    detected: "Mutated",
    "not detected": "Wild-type",
  },
  kras_status: {
    mutated: "Mutated",
    "wild-type": "Wild-type",
    wildtype: "Wild-type",
    detected: "Mutated",
    "not detected": "Wild-type",
  },
};

/**
 * Parse CSV file content
 */
export function parseCSV(content: string): Partial<PatientData> {
  const lines = content.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV file must have at least a header row and one data row");
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
  const values = lines[1].split(",").map((v) => v.trim().replace(/['"]/g, ""));

  const result: Partial<PatientData> = {};

  headers.forEach((header, index) => {
    const mappedField = FIELD_MAPPINGS[header];
    if (mappedField && values[index]) {
      const value = normalizeValue(mappedField, values[index]);
      if (value !== undefined) {
        (result as any)[mappedField] = value;
      }
    }
  });

  return result;
}

/**
 * Parse JSON file content
 */
export function parseJSON(content: string): Partial<PatientData> {
  const data = JSON.parse(content);
  const result: Partial<PatientData> = {};

  // Handle both flat objects and nested structures
  const flatData = flattenObject(data);

  Object.entries(flatData).forEach(([key, value]) => {
    const normalizedKey = key.toLowerCase().replace(/[_\s]+/g, "_");
    const mappedField = FIELD_MAPPINGS[normalizedKey] || FIELD_MAPPINGS[key.toLowerCase()];

    if (mappedField && value !== null && value !== undefined) {
      const normalizedValue = normalizeValue(mappedField, String(value));
      if (normalizedValue !== undefined) {
        (result as any)[mappedField] = normalizedValue;
      }
    }
  });

  return result;
}

/**
 * Flatten nested object
 */
function flattenObject(obj: any, prefix = ""): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}_${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

/**
 * Normalize field value based on field type
 */
function normalizeValue(field: keyof PatientData, value: string): any {
  const normalizedInput = value.toLowerCase().trim();

  // Check for field-specific normalizations
  const fieldNormalizations = VALUE_NORMALIZATIONS[field];
  if (fieldNormalizations && fieldNormalizations[normalizedInput] !== undefined) {
    return fieldNormalizations[normalizedInput];
  }

  // Handle numeric fields
  const numericFields = [
    "age",
    "bmi",
    "ecog_status",
    "er_percent",
    "pr_percent",
    "tmb_score",
    "tumor_purity",
  ];

  if (numericFields.includes(field)) {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return field === "ecog_status" ? Math.round(num) : num;
    }
    return undefined;
  }

  // Return original value if no normalization needed
  return value;
}

/**
 * Post-process extracted data to derive core molecular fields from Soroka-specific fields
 * This ensures compatibility with the risk prediction model
 */
function postProcessExtractedData(data: Partial<PatientData>): Partial<PatientData> {
  const result = { ...data };

  // Derive mmr_status from individual MMR protein IHC results
  if (!result.mmr_status) {
    const mmrProteins = [result.mlh1_status, result.pms2_status, result.msh2_status, result.msh6_status];
    if (mmrProteins.some((status) => status === "Lost")) {
      result.mmr_status = "Deficient";
      // Also set which protein is lost
      if (result.mlh1_status === "Lost") result.mmr_protein_lost = "MLH1";
      else if (result.pms2_status === "Lost") result.mmr_protein_lost = "PMS2";
      else if (result.msh2_status === "Lost") result.mmr_protein_lost = "MSH2";
      else if (result.msh6_status === "Lost") result.mmr_protein_lost = "MSH6";
    } else if (mmrProteins.every((status) => status === "Intact")) {
      result.mmr_status = "Proficient";
    }
  }

  // Derive mmr_status from MSI status if not already set
  if (!result.mmr_status && result.msi_status) {
    if (result.msi_status === "Unstable") {
      result.mmr_status = "Deficient";
    } else if (result.msi_status === "Stable") {
      // MSI stable doesn't necessarily mean MMR proficient, but it's a hint
      // Only set if we have no other info
      if (!result.mlh1_status && !result.pms2_status && !result.msh2_status && !result.msh6_status) {
        // Don't auto-set, leave for manual input
      }
    }
  }

  // Derive histology from cancer type if not set
  if (!result.histology && (data as any).cancer_type) {
    const cancerType = ((data as any).cancer_type as string).toLowerCase();
    if (cancerType.includes("endometri")) {
      result.histology = "Endometrioid";
    } else if (cancerType.includes("serous")) {
      result.histology = "Serous";
    } else if (cancerType.includes("clear")) {
      result.histology = "Clear Cell";
    }
  }

  return result;
}

/**
 * Analyze document with AI (backend call)
 */
export async function analyzeDocumentWithAI(
  file: File,
  apiUrl: string
): Promise<Partial<PatientData>> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${apiUrl}/analyze-document`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to analyze document" }));
    throw new Error(error.detail || "Failed to analyze document");
  }

  const result = await response.json();
  // Post-process to derive core fields from Soroka-specific data
  return postProcessExtractedData(result.extracted_data);
}

/**
 * Main document parsing function
 */
export async function parseDocument(
  file: File,
  apiUrl?: string
): Promise<{ data: Partial<PatientData>; method: string }> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  // Handle CSV files
  if (fileType === "text/csv" || fileName.endsWith(".csv")) {
    const content = await file.text();
    const data = parseCSV(content);
    return { data, method: "csv" };
  }

  // Handle JSON files
  if (fileType === "application/json" || fileName.endsWith(".json")) {
    const content = await file.text();
    const data = parseJSON(content);
    return { data, method: "json" };
  }

  // Handle PDF and images - require backend AI analysis
  if (
    fileType === "application/pdf" ||
    fileType.startsWith("image/") ||
    fileName.endsWith(".pdf") ||
    fileName.endsWith(".png") ||
    fileName.endsWith(".jpg") ||
    fileName.endsWith(".jpeg")
  ) {
    if (!apiUrl) {
      throw new Error("AI analysis requires backend API URL. Please configure NEXT_PUBLIC_API_URL.");
    }
    const data = await analyzeDocumentWithAI(file, apiUrl);
    return { data, method: "ai" };
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}

/**
 * Validate extracted data completeness
 */
export function validateExtractedData(data: Partial<PatientData>): {
  isComplete: boolean;
  filledFields: string[];
  missingFields: string[];
} {
  const requiredFields = [
    "age",
    "bmi",
    "stage",
    "histology",
    "grade",
    "myometrial_invasion",
    "lvsi",
    "lymph_nodes",
    "pole_status",
    "mmr_status",
    "p53_status",
    "l1cam_status",
    "ctnnb1_status",
  ];

  const filledFields = requiredFields.filter(
    (field) => data[field as keyof PatientData] !== undefined && data[field as keyof PatientData] !== null
  );
  const missingFields = requiredFields.filter(
    (field) => data[field as keyof PatientData] === undefined || data[field as keyof PatientData] === null
  );

  return {
    isComplete: missingFields.length === 0,
    filledFields,
    missingFields,
  };
}
