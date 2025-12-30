"""
Document Analysis API Routes
Handles parsing and AI extraction from patient documents
"""

import json
import csv
import io
import re
import base64
from typing import Dict, Any, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import logging

from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/document", tags=["document"])


class ExtractedData(BaseModel):
    """Extracted patient data from document"""
    extracted_data: Dict[str, Any]
    confidence: float
    method: str
    warnings: list[str] = []


# Field mappings for normalization
FIELD_MAPPINGS = {
    "age": "age",
    "patient_age": "age",
    "patient age": "age",
    "bmi": "bmi",
    "body_mass_index": "bmi",
    "stage": "stage",
    "figo_stage": "stage",
    "figo stage": "stage",
    "histology": "histology",
    "histology_type": "histology",
    "grade": "grade",
    "tumor_grade": "grade",
    "myometrial_invasion": "myometrial_invasion",
    "myometrial invasion": "myometrial_invasion",
    "invasion_depth": "myometrial_invasion",
    "lvsi": "lvsi",
    "lvsi_status": "lvsi",
    "lymphovascular_invasion": "lvsi",
    "lymph_nodes": "lymph_nodes",
    "lymph nodes": "lymph_nodes",
    "nodal_status": "lymph_nodes",
    "pole": "pole_status",
    "pole_status": "pole_status",
    "pole_mutation": "pole_status",
    "mmr": "mmr_status",
    "mmr_status": "mmr_status",
    "mismatch_repair": "mmr_status",
    "p53": "p53_status",
    "p53_status": "p53_status",
    "tp53": "p53_status",
    "l1cam": "l1cam_status",
    "l1cam_status": "l1cam_status",
    "ctnnb1": "ctnnb1_status",
    "ctnnb1_status": "ctnnb1_status",
    "beta_catenin": "ctnnb1_status",
    "ecog": "ecog_status",
    "ecog_status": "ecog_status",
    "performance_status": "ecog_status",
    "diabetes": "diabetes",
    "diabetic": "diabetes",
    "er": "er_percent",
    "er_percent": "er_percent",
    "estrogen_receptor": "er_percent",
    "pr": "pr_percent",
    "pr_percent": "pr_percent",
    "progesterone_receptor": "pr_percent",
}

# Value normalizations
VALUE_NORMALIZATIONS = {
    "stage": {
        "ia": "IA", "ib": "IB", "ii": "II",
        "iiia": "IIIA", "iiib": "IIIB", "iiic1": "IIIC1", "iiic2": "IIIC2",
        "iva": "IVA", "ivb": "IVB",
        "1a": "IA", "1b": "IB", "2": "II",
        "3a": "IIIA", "3b": "IIIB", "3c1": "IIIC1", "3c2": "IIIC2",
        "4a": "IVA", "4b": "IVB",
    },
    "grade": {
        "g1": "G1", "g2": "G2", "g3": "G3",
        "grade 1": "G1", "grade 2": "G2", "grade 3": "G3",
        "1": "G1", "2": "G2", "3": "G3",
        "low": "G1", "intermediate": "G2", "high": "G3",
        "well differentiated": "G1", "moderately differentiated": "G2", "poorly differentiated": "G3",
    },
    "histology": {
        "endometrioid": "Endometrioid",
        "serous": "Serous",
        "clear cell": "Clear Cell",
        "clearcell": "Clear Cell",
        "carcinosarcoma": "Carcinosarcoma",
        "mixed": "Mixed",
        "undifferentiated": "Undifferentiated",
    },
    "myometrial_invasion": {
        "<50%": "<50%", ">=50%": "≥50%", "≥50%": "≥50%", ">50%": "≥50%",
        "less than 50%": "<50%", "more than 50%": "≥50%",
        "superficial": "<50%", "deep": "≥50%",
    },
    "lvsi": {
        "present": "Present", "absent": "Absent",
        "positive": "Present", "negative": "Absent",
        "yes": "Present", "no": "Absent",
        "substantial": "Substantial", "focal": "Focal",
    },
    "lymph_nodes": {
        "negative": "Negative", "positive": "Positive",
        "not assessed": "Not Assessed",
        "n0": "Negative", "n1": "Positive", "nx": "Not Assessed",
    },
    "pole_status": {
        "mutated": "Mutated", "wild-type": "Wild-type", "wildtype": "Wild-type",
        "positive": "Mutated", "negative": "Wild-type",
        "not tested": "Not Tested",
    },
    "mmr_status": {
        "proficient": "Proficient", "deficient": "Deficient",
        "pmmr": "Proficient", "dmmr": "Deficient",
        "intact": "Proficient", "loss": "Deficient",
        "not tested": "Not Tested",
    },
    "p53_status": {
        "wild-type": "Wild-type", "wildtype": "Wild-type", "normal": "Wild-type",
        "abnormal": "Abnormal", "mutant": "Abnormal",
        "overexpression": "Abnormal", "null": "Abnormal",
        "not tested": "Not Tested",
    },
    "l1cam_status": {
        "positive": "Positive", "negative": "Negative",
        "not tested": "Not Tested",
    },
    "ctnnb1_status": {
        "mutated": "Mutated", "wild-type": "Wild-type", "wildtype": "Wild-type",
        "positive": "Mutated", "negative": "Wild-type",
        "not tested": "Not Tested",
    },
    "diabetes": {
        "yes": True, "no": False, "true": True, "false": False,
        "diabetic": True, "non-diabetic": False,
    },
}


def normalize_value(field: str, value: str) -> Any:
    """Normalize a field value based on field type"""
    normalized_input = value.lower().strip()

    # Check for field-specific normalizations
    if field in VALUE_NORMALIZATIONS:
        if normalized_input in VALUE_NORMALIZATIONS[field]:
            return VALUE_NORMALIZATIONS[field][normalized_input]

    # Handle numeric fields
    if field in ["age", "bmi", "ecog_status", "er_percent", "pr_percent"]:
        try:
            num = float(value)
            return int(num) if field == "ecog_status" else num
        except ValueError:
            return None

    return value


def parse_csv_content(content: str) -> Dict[str, Any]:
    """Parse CSV content and extract patient data"""
    reader = csv.DictReader(io.StringIO(content))
    rows = list(reader)

    if not rows:
        raise ValueError("CSV file is empty")

    # Take first row
    row = rows[0]
    result = {}

    for key, value in row.items():
        if not value:
            continue
        normalized_key = key.lower().strip().replace(" ", "_")
        mapped_field = FIELD_MAPPINGS.get(normalized_key)

        if mapped_field:
            normalized_value = normalize_value(mapped_field, value)
            if normalized_value is not None:
                result[mapped_field] = normalized_value

    return result


def parse_json_content(content: str) -> Dict[str, Any]:
    """Parse JSON content and extract patient data"""
    data = json.loads(content)
    result = {}

    # Flatten nested objects
    def flatten(obj, prefix=""):
        items = {}
        for key, value in obj.items() if isinstance(obj, dict) else []:
            new_key = f"{prefix}_{key}" if prefix else key
            if isinstance(value, dict):
                items.update(flatten(value, new_key))
            else:
                items[new_key] = value
        return items

    flat_data = flatten(data) if isinstance(data, dict) else {}

    for key, value in (data.items() if isinstance(data, dict) else []):
        if value is None:
            continue
        normalized_key = key.lower().strip().replace(" ", "_")
        mapped_field = FIELD_MAPPINGS.get(normalized_key)

        if mapped_field:
            normalized_value = normalize_value(mapped_field, str(value))
            if normalized_value is not None:
                result[mapped_field] = normalized_value

    return result


def extract_from_text(text: str) -> Dict[str, Any]:
    """
    Extract patient data from unstructured text using pattern matching.
    Optimized for Soroka Medical Center NGS/Oncomine and MMR IHC reports.
    """
    result = {}
    text_lower = text.lower()

    # ========================================
    # AGE EXTRACTION (including Hebrew format)
    # ========================================
    age_patterns = [
        r'age[:\s]+(\d+)',
        r'(\d+)\s*(?:year|yr)s?\s*old',
        r'patient.*?(\d+)\s*(?:year|yr)',
        r'גיל[:\s]*[yY]?(\d+)',  # Hebrew: גיל: Y58 or גיל: 58
        r'[yY](\d+)\s*(?:כתובת|גיל)',  # Y58 format
    ]
    for pattern in age_patterns:
        match = re.search(pattern, text_lower if 'גיל' not in pattern else text)
        if match:
            age = int(match.group(1))
            if 18 <= age <= 100:
                result["age"] = age
                break

    # ========================================
    # TMB (Tumor Mutational Burden) - Soroka NGS Reports
    # ========================================
    tmb_patterns = [
        r'tmb\s*(?:score)?[:\s]*(\d+\.?\d*)\s*(?:\||\s)*(?:muts?/mb)?',
        r'tmb[:\s]*\(?(\d+\.?\d*)\s*muts?/mb',
        r'(\d+\.?\d*)\s*muts?/mb.*?tmb',
        r'low\s*\((\d+\.?\d*)\s*muts?/mb\).*?tmb',
        r'high\s*\((\d+\.?\d*)\s*muts?/mb\).*?tmb',
    ]
    for pattern in tmb_patterns:
        match = re.search(pattern, text_lower)
        if match:
            tmb_value = float(match.group(1))
            result["tmb_score"] = tmb_value
            # Classify TMB: Low (<10) or High (>=10)
            result["tmb_status"] = "High" if tmb_value >= 10 else "Low"
            break

    # ========================================
    # MSI (Microsatellite Instability) - Soroka NGS Reports
    # ========================================
    msi_patterns = [
        r'msi[:\s]*stable',
        r'msi[:\s]*unstable',
        r'msi[:\s]*high',
        r'msi[:\s]*low',
        r'msi-?h',
        r'msi-?s',
        r'stable\s*\([\d.]+\).*?msi',
    ]
    if re.search(r'msi[:\s]*(?:stable|mss)', text_lower) or re.search(r'stable.*msi', text_lower):
        result["msi_status"] = "Stable"
    elif re.search(r'msi[:\s]*(?:unstable|high|msi-?h)', text_lower):
        result["msi_status"] = "Unstable"

    # ========================================
    # POLE MUTATION STATUS - Soroka NGS Reports
    # ========================================
    # Check POLE mutation status - look for explicit patterns first
    pole_wildtype = re.search(r'pole[:\s]+(?:status[:\s]+)?wild[-\s]?type', text_lower)
    pole_mutated = re.search(r'pole[:\s]+(?:status[:\s]+)?mutated', text_lower)
    pole_detected = re.search(r'pole\s+detected(?!\s+not)', text_lower)
    pole_not_detected = re.search(r'pole\s+not\s+detected', text_lower)

    if pole_wildtype or pole_not_detected:
        result["pole_status"] = "Wild-type"
    elif pole_mutated or pole_detected:
        result["pole_status"] = "Mutated"
    elif "pole" in text_lower:
        if any(word in text_lower for word in ["mutated", "mutation"]):
            result["pole_status"] = "Mutated"
        elif "wild" in text_lower:
            result["pole_status"] = "Wild-type"

    # ========================================
    # TP53 MUTATION STATUS - Soroka NGS Reports
    # ========================================
    tp53_detected = re.search(r'tp53\s*\(?detected\)?[:\s]*c\.', text_lower)
    tp53_pathogenic = re.search(r'tp53.*pathogenic', text_lower)
    tp53_not_detected = re.search(r'tp53\s*\(?not\s*detected\)?', text_lower)

    if (tp53_detected or tp53_pathogenic) and not tp53_not_detected:
        result["p53_status"] = "Abnormal"
    elif tp53_not_detected:
        result["p53_status"] = "Wild-type"
    elif "p53" in text_lower or "tp53" in text_lower:
        if any(word in text_lower for word in ["abnormal", "mutant", "overexpression", "null", "detected", "pathogenic"]):
            result["p53_status"] = "Abnormal"
        elif any(word in text_lower for word in ["wild", "normal", "not detected"]):
            result["p53_status"] = "Wild-type"

    # ========================================
    # MMR IHC STATUS - Soroka MMR Reports
    # ========================================
    # Parse MMR immunohistochemistry results
    mlh1_lost = re.search(r'mlh1\s*(?:lost|loss|\(?\-\)?)', text_lower)
    pms2_lost = re.search(r'pms2\s*(?:lost|loss|\(?\-\)?)', text_lower)
    msh2_lost = re.search(r'msh2\s*(?:lost|loss|\(?\-\)?)', text_lower)
    msh6_lost = re.search(r'msh6\s*(?:lost|loss|\(?\-\)?)', text_lower)

    mlh1_intact = re.search(r'mlh1\s*(?:intact|\(?\+\)?)', text_lower)
    pms2_intact = re.search(r'pms2\s*(?:intact|\(?\+\)?)', text_lower)
    msh2_intact = re.search(r'msh2\s*(?:intact|\(?\+\)?)', text_lower)
    msh6_intact = re.search(r'msh6\s*(?:intact|\(?\+\)?)', text_lower)

    # Store individual MMR protein status
    if mlh1_lost:
        result["mlh1_status"] = "Lost"
    elif mlh1_intact:
        result["mlh1_status"] = "Intact"

    if pms2_lost:
        result["pms2_status"] = "Lost"
    elif pms2_intact:
        result["pms2_status"] = "Intact"

    if msh2_lost:
        result["msh2_status"] = "Lost"
    elif msh2_intact:
        result["msh2_status"] = "Intact"

    if msh6_lost:
        result["msh6_status"] = "Lost"
    elif msh6_intact:
        result["msh6_status"] = "Intact"

    # Determine overall MMR status
    if mlh1_lost or pms2_lost or msh2_lost or msh6_lost:
        result["mmr_status"] = "Deficient"
    elif mlh1_intact and pms2_intact and msh2_intact and msh6_intact:
        result["mmr_status"] = "Proficient"
    elif "mmr" in text_lower or "mismatch repair" in text_lower:
        if any(word in text_lower for word in ["deficient", "loss", "dmmr"]):
            result["mmr_status"] = "Deficient"
        elif any(word in text_lower for word in ["proficient", "intact", "pmmr"]):
            result["mmr_status"] = "Proficient"

    # ========================================
    # HISTOLOGY / CANCER TYPE
    # ========================================
    histology_keywords = {
        "endometrioid": "Endometrioid",
        "endometrial carcinoma": "Endometrioid",
        "serous": "Serous",
        "clear cell": "Clear Cell",
        "clearcell": "Clear Cell",
        "carcinosarcoma": "Carcinosarcoma",
        "mixed": "Mixed",
        "undifferentiated": "Undifferentiated",
        "dedifferentiated": "Undifferentiated",
    }
    for keyword, value in histology_keywords.items():
        if keyword in text_lower:
            result["histology"] = value
            break

    # ========================================
    # TUMOR PURITY (Soroka NGS Reports)
    # ========================================
    tumor_purity_match = re.search(r'tumor\s*(?:purity|comprising)[:\s]*(\d+\.?\d*)%?', text_lower)
    if tumor_purity_match:
        result["tumor_purity"] = float(tumor_purity_match.group(1))

    # ========================================
    # ADDITIONAL MOLECULAR MARKERS FROM NGS
    # ========================================
    # FGFR2
    if re.search(r'fgfr2\s*\(?detected\)?', text_lower):
        result["fgfr2_status"] = "Mutated"
    elif re.search(r'fgfr2\s*\(?not\s*detected\)?', text_lower):
        result["fgfr2_status"] = "Wild-type"

    # PTEN
    if re.search(r'pten\s*\(?detected\)?', text_lower):
        result["pten_status"] = "Mutated"
    elif re.search(r'pten\s*\(?not\s*detected\)?', text_lower):
        result["pten_status"] = "Wild-type"

    # PIK3CA
    if re.search(r'pik3ca\s*\(?detected\)?', text_lower):
        result["pik3ca_status"] = "Mutated"
    elif re.search(r'pik3ca\s*\(?not\s*detected\)?', text_lower):
        result["pik3ca_status"] = "Wild-type"

    # FBXW7
    if re.search(r'fbxw7\s*\(?detected\)?', text_lower):
        result["fbxw7_status"] = "Mutated"
    elif re.search(r'fbxw7\s*\(?not\s*detected\)?', text_lower):
        result["fbxw7_status"] = "Wild-type"

    # KRAS
    if re.search(r'kras\s*\(?detected\)?', text_lower):
        result["kras_status"] = "Mutated"
    elif re.search(r'kras\s*\(?not\s*detected\)?', text_lower):
        result["kras_status"] = "Wild-type"

    # ========================================
    # DETERMINE MOLECULAR CLASSIFICATION (TCGA)
    # ========================================
    # Based on the data extracted, determine molecular subtype
    molecular_group = None

    # Priority 1: POLEmut (POLE mutated)
    if result.get("pole_status") == "Mutated":
        molecular_group = "POLEmut"
    # Priority 2: MMRd (MMR deficient or MSI unstable/high)
    elif result.get("mmr_status") == "Deficient" or result.get("msi_status") == "Unstable":
        molecular_group = "MMRd"
    # Priority 3: p53abn (TP53 abnormal with stable MSI and wild-type POLE)
    elif result.get("p53_status") == "Abnormal":
        if result.get("msi_status") != "Unstable" and result.get("pole_status") != "Mutated":
            molecular_group = "p53abn"
    # Priority 4: NSMP (No Specific Molecular Profile)
    elif result.get("pole_status") == "Wild-type" and result.get("mmr_status") == "Proficient" and result.get("p53_status") == "Wild-type":
        molecular_group = "NSMP"

    if molecular_group:
        result["molecular_group"] = molecular_group

    # ========================================
    # BMI extraction
    # ========================================
    bmi_patterns = [
        r'bmi[:\s]+(\d+\.?\d*)',
        r'body mass index[:\s]+(\d+\.?\d*)',
    ]
    for pattern in bmi_patterns:
        match = re.search(pattern, text_lower)
        if match:
            bmi = float(match.group(1))
            if 15 <= bmi <= 60:
                result["bmi"] = bmi
                break

    # ========================================
    # Stage extraction
    # ========================================
    stage_patterns = [
        r'stage\s*(i{1,3}[abc]?\d?|iv[ab]?)',
        r'figo\s*(i{1,3}[abc]?\d?|iv[ab]?)',
    ]
    for pattern in stage_patterns:
        match = re.search(pattern, text_lower)
        if match:
            stage_raw = match.group(1).upper()
            stage_map = {
                "IA": "IA", "IB": "IB", "II": "II",
                "IIIA": "IIIA", "IIIB": "IIIB", "IIIC1": "IIIC1", "IIIC2": "IIIC2",
                "IVA": "IVA", "IVB": "IVB",
            }
            for key, val in stage_map.items():
                if key in stage_raw:
                    result["stage"] = val
                    break
            break

    # ========================================
    # Grade extraction
    # ========================================
    grade_patterns = [
        r'grade\s*(\d|[123])',
        r'g(\d)',
        r'(well|moderately|poorly)\s*differentiated',
    ]
    for pattern in grade_patterns:
        match = re.search(pattern, text_lower)
        if match:
            grade_raw = match.group(1)
            if grade_raw in ["1", "well"]:
                result["grade"] = "G1"
            elif grade_raw in ["2", "moderately"]:
                result["grade"] = "G2"
            elif grade_raw in ["3", "poorly"]:
                result["grade"] = "G3"
            break

    # ========================================
    # LVSI extraction
    # ========================================
    lvsi_focal = re.search(r'lvsi[:\s]+(?:status[:\s]+)?focal', text_lower)
    lvsi_substantial = re.search(r'lvsi[:\s]+(?:status[:\s]+)?substantial', text_lower)
    lvsi_present = re.search(r'lvsi[:\s]+(?:status[:\s]+)?present', text_lower)
    lvsi_absent = re.search(r'lvsi[:\s]+(?:status[:\s]+)?(?:absent|negative)', text_lower)

    if lvsi_focal:
        result["lvsi"] = "Focal"
    elif lvsi_substantial:
        result["lvsi"] = "Substantial"
    elif lvsi_present:
        result["lvsi"] = "Present"
    elif lvsi_absent:
        result["lvsi"] = "Absent"
    elif "lvsi" in text_lower or "lymphovascular" in text_lower:
        if "focal" in text_lower:
            result["lvsi"] = "Focal"
        elif "substantial" in text_lower:
            result["lvsi"] = "Substantial"
        elif any(word in text_lower for word in ["present", "positive", "identified", "seen"]):
            result["lvsi"] = "Present"
        elif any(word in text_lower for word in ["absent", "negative", "not identified", "not seen"]):
            result["lvsi"] = "Absent"

    # ========================================
    # Myometrial invasion
    # ========================================
    if "myometrial" in text_lower or "invasion" in text_lower:
        if any(phrase in text_lower for phrase in ["<50%", "less than 50", "superficial", "< 50%", "inner half"]):
            result["myometrial_invasion"] = "<50%"
        elif any(phrase in text_lower for phrase in [">=50%", ">50%", "≥50%", "more than 50", "deep", "outer half"]):
            result["myometrial_invasion"] = "≥50%"

    # ========================================
    # L1CAM
    # ========================================
    if "l1cam" in text_lower:
        if any(word in text_lower for word in ["positive", ">10%", "≥10%"]):
            result["l1cam_status"] = "Positive"
        elif any(word in text_lower for word in ["negative", "<10%"]):
            result["l1cam_status"] = "Negative"

    # ========================================
    # CTNNB1
    # ========================================
    ctnnb1_wildtype = re.search(r'ctnnb1[:\s]+(?:status[:\s]+)?wild[-\s]?type', text_lower)
    ctnnb1_mutated = re.search(r'ctnnb1[:\s]+(?:status[:\s]+)?mutated', text_lower)

    if ctnnb1_wildtype:
        result["ctnnb1_status"] = "Wild-type"
    elif ctnnb1_mutated:
        result["ctnnb1_status"] = "Mutated"
    elif "ctnnb1" in text_lower or "beta-catenin" in text_lower or "β-catenin" in text_lower:
        if any(word in text_lower for word in ["mutated", "mutation", "positive", "nuclear"]):
            result["ctnnb1_status"] = "Mutated"
        elif any(word in text_lower for word in ["wild", "negative"]):
            result["ctnnb1_status"] = "Wild-type"

    # ========================================
    # Lymph nodes
    # ========================================
    lymph_negative = re.search(r'lymph\s*node[:\s]+(?:status[:\s]+)?negative', text_lower)
    lymph_positive = re.search(r'lymph\s*node[:\s]+(?:status[:\s]+)?positive', text_lower)

    if lymph_negative:
        result["lymph_nodes"] = "Negative"
    elif lymph_positive:
        result["lymph_nodes"] = "Positive"
    elif "lymph node" in text_lower or "nodal" in text_lower:
        if any(word in text_lower for word in ["positive", "metastasis", "involved"]):
            result["lymph_nodes"] = "Positive"
        elif any(word in text_lower for word in ["negative", "no metastasis", "not involved"]):
            result["lymph_nodes"] = "Negative"

    return result


@router.post("/analyze", response_model=ExtractedData)
async def analyze_document(file: UploadFile = File(...)):
    """
    Analyze uploaded document and extract patient data.

    Supports:
    - CSV files: Direct parsing
    - JSON files: Direct parsing
    - PDF files: Text extraction + pattern matching
    - Images: OCR + pattern matching (requires additional setup)
    """
    filename = file.filename.lower() if file.filename else ""
    content_type = file.content_type or ""
    warnings = []

    try:
        content = await file.read()

        # Handle CSV
        if filename.endswith(".csv") or "csv" in content_type:
            text_content = content.decode("utf-8")
            extracted = parse_csv_content(text_content)
            return ExtractedData(
                extracted_data=extracted,
                confidence=0.95,
                method="csv_parsing",
                warnings=warnings
            )

        # Handle JSON
        if filename.endswith(".json") or "json" in content_type:
            text_content = content.decode("utf-8")
            extracted = parse_json_content(text_content)
            return ExtractedData(
                extracted_data=extracted,
                confidence=0.95,
                method="json_parsing",
                warnings=warnings
            )

        # Handle PDF
        if filename.endswith(".pdf") or "pdf" in content_type:
            try:
                # Try to extract text from PDF using PyPDF2 or pdfplumber
                import pypdf

                pdf_reader = pypdf.PdfReader(io.BytesIO(content))
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() or ""

                if not text.strip():
                    warnings.append("Could not extract text from PDF. The document may be scanned/image-based.")
                    return ExtractedData(
                        extracted_data={},
                        confidence=0.0,
                        method="pdf_extraction_failed",
                        warnings=warnings
                    )

                extracted = extract_from_text(text)
                confidence = min(0.7, 0.2 + len(extracted) * 0.05)

                if len(extracted) < 3:
                    warnings.append("Only partial data could be extracted. Please verify and complete missing fields.")

                return ExtractedData(
                    extracted_data=extracted,
                    confidence=confidence,
                    method="pdf_text_extraction",
                    warnings=warnings
                )

            except ImportError:
                warnings.append("PDF parsing library not available. Please install pypdf.")
                return ExtractedData(
                    extracted_data={},
                    confidence=0.0,
                    method="pdf_library_missing",
                    warnings=warnings
                )

        # Handle Images
        if any(filename.endswith(ext) for ext in [".png", ".jpg", ".jpeg"]) or "image" in content_type:
            warnings.append("Image OCR requires additional setup. Please use PDF or structured data formats.")
            return ExtractedData(
                extracted_data={},
                confidence=0.0,
                method="image_ocr_not_available",
                warnings=warnings
            )

        raise HTTPException(status_code=400, detail=f"Unsupported file type: {content_type}")

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    except csv.Error as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")
    except Exception as e:
        logger.error(f"Document analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze document: {str(e)}")


# ============================================
# AI-POWERED INTELLIGENT DOCUMENT ANALYSIS
# ============================================

@router.post("/ai-analyze")
async def ai_analyze_document(file: UploadFile = File(...)):
    """
    AI-Powered Intelligent Document Analysis

    Uses an LLM (Claude/GPT) to:
    1. Read and understand ANY medical document format
    2. Extract all relevant clinical and molecular data
    3. Determine TCGA molecular classification
    4. Generate comprehensive risk assessment
    5. Provide detailed medical explanations

    Returns a complete MedicalAssessment with:
    - Extracted patient data
    - Molecular classification with confidence
    - Risk score and category
    - Clinical summary and key findings
    - Treatment implications
    - Detailed medical explanation
    """
    # Check if AI is configured
    if not settings.ANTHROPIC_API_KEY and not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="AI analysis not configured. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY in .env"
        )

    filename = file.filename.lower() if file.filename else ""
    content_type = file.content_type or ""

    try:
        content = await file.read()
        document_text = ""
        document_type = "unknown"
        image_data = None

        # Extract text based on file type
        if filename.endswith(".pdf") or "pdf" in content_type:
            document_type = "Medical Report (PDF)"
            try:
                import pypdf
                pdf_reader = pypdf.PdfReader(io.BytesIO(content))
                for page in pdf_reader.pages:
                    document_text += (page.extract_text() or "") + "\n"
            except ImportError:
                raise HTTPException(status_code=500, detail="pypdf not installed. Run: pip install pypdf")

        elif filename.endswith(".csv") or "csv" in content_type:
            document_type = "Structured Data (CSV)"
            document_text = content.decode("utf-8")

        elif filename.endswith(".json") or "json" in content_type:
            document_type = "Structured Data (JSON)"
            document_text = content.decode("utf-8")

        elif any(filename.endswith(ext) for ext in [".png", ".jpg", ".jpeg"]) or "image" in content_type:
            document_type = "Medical Document (Image)"
            # For images, we'll send the image data to the AI for visual analysis
            image_data = base64.b64encode(content).decode("utf-8")
            document_text = "[Image document - visual analysis required]"

        elif filename.endswith(".txt") or "text" in content_type:
            document_type = "Text Document"
            document_text = content.decode("utf-8")

        else:
            # Try to decode as text
            try:
                document_text = content.decode("utf-8")
                document_type = "Unknown Text Document"
            except:
                raise HTTPException(status_code=400, detail=f"Unsupported file type: {content_type}")

        if not document_text.strip() and not image_data:
            raise HTTPException(status_code=400, detail="Could not extract content from document")

        # Import and use the AI agent
        from app.services.ai_agent import ai_agent

        assessment = await ai_agent.analyze_document(
            document_text=document_text,
            document_type=document_type,
            image_data=image_data
        )

        return assessment.model_dump()

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI document analysis error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")
