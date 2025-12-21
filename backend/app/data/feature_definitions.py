"""
Feature Definitions and Metadata

Defines all clinical, pathological, and molecular features with valid ranges,
encoding schemes, and clinical descriptions.
"""

from typing import Dict, List, Any

# Feature display names for UI
FEATURE_DISPLAY_NAMES = {
    "age": "Age",
    "bmi": "BMI",
    "diabetes": "Diabetes",
    "ecog_status": "ECOG Status",
    "stage": "FIGO Stage",
    "histology": "Histology",
    "grade": "Grade",
    "myometrial_invasion": "Myometrial Invasion",
    "lvsi": "LVSI",
    "lymph_nodes": "Lymph Node Status",
    "pole_status": "POLE Status",
    "mmr_status": "MMR Status",
    "p53_status": "p53 Status",
    "l1cam_status": "L1CAM Status",
    "ctnnb1_status": "CTNNB1 Status",
    "er_percent": "ER %",
    "pr_percent": "PR %",
}

# Categorical feature encoding
STAGE_ENCODING = {
    "IA": 0,
    "IB": 1,
    "II": 2,
    "IIIA": 3,
    "IIIB": 4,
    "IIIC1": 5,
    "IIIC2": 6,
    "IVA": 7,
    "IVB": 8,
}

HISTOLOGY_ENCODING = {
    "Endometrioid": 0,
    "Serous": 1,
    "Clear Cell": 2,
    "Carcinosarcoma": 3,
    "Mixed": 4,
    "Other": 5,
}

GRADE_ENCODING = {"G1": 0, "G2": 1, "G3": 2}

LVSI_ENCODING = {"None": 0, "Focal": 1, "Substantial": 2}

MYOMETRIAL_ENCODING = {"<50%": 0, "≥50%": 1}

LYMPH_NODE_ENCODING = {"Negative": 0, "Pelvic+": 1, "Para-aortic+": 2}

# Binary/categorical molecular markers
POLE_ENCODING = {"Wild-type": 0, "Mutated": 1, "Not Tested": -1}

MMR_ENCODING = {"Proficient": 0, "Deficient": 1, "Not Tested": -1}

P53_ENCODING = {"Wild-type": 0, "Abnormal": 1, "Not Tested": -1}

L1CAM_ENCODING = {"Negative": 0, "Positive": 1, "Not Tested": -1}

CTNNB1_ENCODING = {"Wild-type": 0, "Mutated": 1, "Not Tested": -1}

# Stage-based risk estimates (from literature)
STAGE_BASED_RISK = {
    "IA": 0.05,
    "IB": 0.10,
    "II": 0.15,
    "IIIA": 0.25,
    "IIIB": 0.30,
    "IIIC1": 0.40,
    "IIIC2": 0.50,
    "IVA": 0.65,
    "IVB": 0.75,
}

# Molecular group base risks (from PORTEC-3)
MOLECULAR_GROUP_BASE_RISK = {
    "POLEmut": 0.04,  # Excellent prognosis
    "MMRd": 0.12,  # Intermediate
    "NSMP": 0.15,  # Intermediate-high (depends on L1CAM)
    "p53abn": 0.45,  # Worst prognosis
}

# Feature importance order (based on literature)
FEATURE_IMPORTANCE_ORDER = [
    "molecular_group",
    "p53_status",
    "pole_status",
    "lvsi",
    "l1cam_status",
    "myometrial_invasion",
    "grade",
    "stage",
    "age",
    "mmr_status",
    "ctnnb1_status",
    "histology",
    "lymph_nodes",
    "bmi",
    "ecog_status",
]

# Molecular group colors for visualization
MOLECULAR_GROUP_COLORS = {
    "POLEmut": "#10b981",  # Emerald green
    "MMRd": "#3b82f6",  # Blue
    "NSMP": "#64748b",  # Slate gray
    "NSMP_high_risk": "#f59e0b",  # Amber (L1CAM+)
    "p53abn": "#ef4444",  # Red
}

# Risk category thresholds
RISK_THRESHOLDS = {"LOW": 0.15, "INTERMEDIATE": 0.40, "HIGH": 1.0}


def get_risk_category(probability: float) -> str:
    """Convert probability to risk category"""
    if probability < RISK_THRESHOLDS["LOW"]:
        return "LOW"
    elif probability < RISK_THRESHOLDS["INTERMEDIATE"]:
        return "INTERMEDIATE"
    else:
        return "HIGH"


def get_risk_color(category: str) -> str:
    """Get color for risk category"""
    colors = {
        "LOW": "#22c55e",  # Green
        "INTERMEDIATE": "#f59e0b",  # Amber
        "HIGH": "#ef4444",  # Red
    }
    return colors.get(category, "#64748b")


def encode_categorical_features(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Encode categorical features for ML model input

    Args:
        patient_data: Dictionary with raw patient data

    Returns:
        Dictionary with encoded features
    """
    encoded = patient_data.copy()

    # Encode categorical features
    if "stage" in encoded:
        encoded["stage_encoded"] = STAGE_ENCODING.get(encoded["stage"], 0)

    if "histology" in encoded:
        encoded["histology_encoded"] = HISTOLOGY_ENCODING.get(encoded["histology"], 0)

    if "grade" in encoded:
        encoded["grade_encoded"] = GRADE_ENCODING.get(encoded["grade"], 0)

    if "lvsi" in encoded:
        encoded["lvsi_encoded"] = LVSI_ENCODING.get(encoded["lvsi"], 0)

    if "myometrial_invasion" in encoded:
        encoded["myometrial_encoded"] = MYOMETRIAL_ENCODING.get(encoded["myometrial_invasion"], 0)

    if "lymph_nodes" in encoded:
        encoded["lymph_nodes_encoded"] = LYMPH_NODE_ENCODING.get(encoded["lymph_nodes"], 0)

    if "pole_status" in encoded:
        encoded["pole_encoded"] = POLE_ENCODING.get(encoded["pole_status"], 0)

    if "mmr_status" in encoded:
        encoded["mmr_encoded"] = MMR_ENCODING.get(encoded["mmr_status"], 0)

    if "p53_status" in encoded:
        encoded["p53_encoded"] = P53_ENCODING.get(encoded["p53_status"], 0)

    if "l1cam_status" in encoded:
        encoded["l1cam_encoded"] = L1CAM_ENCODING.get(encoded["l1cam_status"], 0)

    if "ctnnb1_status" in encoded:
        encoded["ctnnb1_encoded"] = CTNNB1_ENCODING.get(encoded["ctnnb1_status"], 0)

    # Convert boolean to int
    if "diabetes" in encoded:
        encoded["diabetes_int"] = int(encoded["diabetes"])

    return encoded


# Clinical descriptions for each feature
FEATURE_DESCRIPTIONS = {
    "age": "Patient age at diagnosis. Older age is associated with higher risk.",
    "bmi": "Body Mass Index. Obesity is a known risk factor for endometrial cancer.",
    "diabetes": "Diabetes mellitus status. Associated with metabolic syndrome.",
    "ecog_status": "ECOG Performance Status (0-4). Higher values indicate worse functional status.",
    "stage": "FIGO staging. Higher stages indicate more advanced disease.",
    "histology": "Histological type. Serous and clear cell have worse prognosis.",
    "grade": "Tumor differentiation. Higher grade indicates more aggressive tumors.",
    "myometrial_invasion": "Depth of invasion into uterine muscle. ≥50% is high-risk.",
    "lvsi": "Lymphovascular space invasion. Substantial LVSI indicates higher metastatic potential.",
    "lymph_nodes": "Lymph node involvement. Positive nodes indicate stage III disease.",
    "pole_status": "POLE mutation status. Mutated POLE has excellent prognosis (ultramutated).",
    "mmr_status": "Mismatch repair protein status. Deficiency indicates high mutation burden.",
    "p53_status": "p53 immunohistochemistry. Abnormal p53 indicates worst prognosis group.",
    "l1cam_status": "L1CAM expression (>10%). Positive status in NSMP indicates high risk.",
    "ctnnb1_status": "CTNNB1 mutation status. Associated with favorable prognosis in NSMP.",
    "er_percent": "Estrogen receptor positivity. Higher values may indicate hormone responsiveness.",
    "pr_percent": "Progesterone receptor positivity. Higher values may indicate hormone responsiveness.",
}
