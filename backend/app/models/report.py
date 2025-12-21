"""
Clinical Report Models

Models for clinical report generation.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class EvidenceItem(BaseModel):
    """Evidence citation for recommendation"""

    source: str = Field(..., description="Study or guideline name")
    finding: str = Field(..., description="Key finding")
    hr: Optional[float] = Field(None, description="Hazard ratio (if applicable)")
    p_value: Optional[float] = Field(None, description="P-value (if applicable)")
    url: Optional[str] = Field(None, description="Reference URL")

    class Config:
        json_schema_extra = {
            "example": {
                "source": "PORTEC-3 (10-year follow-up)",
                "finding": "OS 52.7% vs 36.6% with CTRT vs RT alone in p53abn",
                "hr": 0.52,
                "p_value": 0.021,
                "url": "https://pubmed.ncbi.nlm.nih.gov/...",
            }
        }


class ClinicalTrial(BaseModel):
    """Clinical trial eligibility"""

    trial_name: str = Field(..., description="Trial identifier")
    intervention: str = Field(..., description="Intervention being studied")
    status: str = Field(..., description="Recruitment status")
    eligibility_note: Optional[str] = Field(None, description="Specific eligibility notes")

    class Config:
        json_schema_extra = {
            "example": {
                "trial_name": "RAINBO p53abn-RED",
                "intervention": "Chemoradiation + Olaparib (PARP inhibitor)",
                "status": "Recruiting",
                "eligibility_note": "Check ECOG status and cardiac function",
            }
        }


class Alert(BaseModel):
    """Clinical alert or warning"""

    type: str = Field(..., description="Alert type (warning, info, critical)")
    message: str = Field(..., description="Alert message")

    class Config:
        json_schema_extra = {
            "example": {"type": "warning", "message": "Anatomical stage underestimates biological risk"}
        }


class TreatmentRecommendation(BaseModel):
    """Treatment recommendation with evidence"""

    primary_recommendation: str = Field(..., description="Primary treatment recommendation")
    rationale: str = Field(..., description="Rationale for recommendation")
    evidence: List[EvidenceItem] = Field(..., description="Supporting evidence")
    trial_eligibility: List[ClinicalTrial] = Field(..., description="Eligible clinical trials")
    alerts: List[Alert] = Field(..., description="Important alerts")
    contraindications: List[str] = Field(..., description="Contraindications to consider")

    class Config:
        json_schema_extra = {
            "example": {
                "primary_recommendation": "Adjuvant Chemoradiotherapy",
                "rationale": "p53-abnormal molecular classification with 78% predicted recurrence risk",
                "evidence": [],
                "trial_eligibility": [],
                "alerts": [],
                "contraindications": ["ECOG status", "Cardiac function for chemotherapy"],
            }
        }


class ClinicalReport(BaseModel):
    """Complete clinical report"""

    # Header
    patient_id: Optional[str] = Field(None, description="Patient identifier")
    assessment_date: str = Field(..., description="Date of assessment")
    report_id: str = Field(..., description="Unique report identifier")
    version: str = Field(..., description="System version")

    # Executive Summary
    risk_score: float = Field(..., description="5-year recurrence probability")
    risk_category: str = Field(..., description="Risk category")
    molecular_group: str = Field(..., description="Molecular classification")
    one_line_summary: str = Field(..., description="One-sentence summary")

    # Patient Profile (will be embedded from patient data)
    clinical_summary: str = Field(..., description="Clinical characteristics summary")
    pathological_summary: str = Field(..., description="Pathological findings summary")
    molecular_summary: str = Field(..., description="Molecular results summary")

    # AI Analysis
    shap_summary: str = Field(..., description="SHAP explanation summary")
    top_risk_drivers: List[str] = Field(..., description="Top risk-increasing factors")
    top_protective_factors: List[str] = Field(..., description="Top risk-decreasing factors")

    # Molecular Details
    molecular_explanation: str = Field(..., description="Detailed molecular classification explanation")
    biological_significance: str = Field(..., description="Biological implications")
    therapeutic_implications: str = Field(..., description="Treatment implications")

    # Recommendations
    treatment_recommendation: TreatmentRecommendation = Field(
        ..., description="Treatment recommendations"
    )

    # Disclaimer
    disclaimer: str = Field(
        default="This report is for clinical decision support only and should not replace clinical judgment. "
        "All recommendations should be reviewed by qualified oncologists in the context of individual patient circumstances.",
        description="Legal disclaimer",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "patient_id": "EC-0001",
                "assessment_date": "2025-12-19T10:30:00Z",
                "report_id": "RPT-20251219-0001",
                "version": "1.0.0",
                "risk_score": 0.78,
                "risk_category": "HIGH",
                "molecular_group": "p53abn",
                "one_line_summary": "High-risk patient requiring aggressive multimodal therapy",
                "clinical_summary": "64-year-old patient with BMI 32.5, ECOG 1",
                "pathological_summary": "Stage IA, Grade 3 endometrioid, focal LVSI",
                "molecular_summary": "p53 abnormal, L1CAM positive",
                "shap_summary": "Risk driven by p53 abnormality and L1CAM positivity",
                "top_risk_drivers": ["p53 abnormality", "L1CAM positivity"],
                "top_protective_factors": ["Early stage"],
                "molecular_explanation": "p53-abnormal subtype identified",
                "biological_significance": "Aggressive tumor biology",
                "therapeutic_implications": "Benefits from systemic therapy",
                "treatment_recommendation": {
                    "primary_recommendation": "Chemoradiotherapy",
                    "rationale": "High biological risk",
                    "evidence": [],
                    "trial_eligibility": [],
                    "alerts": [],
                    "contraindications": [],
                },
                "disclaimer": "This report is for clinical decision support only...",
            }
        }
