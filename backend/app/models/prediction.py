"""
Prediction Response Models

Models for risk prediction API responses.
"""

from pydantic import BaseModel, Field
from typing import Literal, Optional, Dict, Any
from enum import Enum


class MolecularGroup(str, Enum):
    """TCGA molecular classification groups"""

    POLEMUT = "POLEmut"
    MMRD = "MMRd"
    NSMP = "NSMP"
    P53ABN = "p53abn"


class RiskCategory(str, Enum):
    """Risk categories based on recurrence probability"""

    LOW = "LOW"
    INTERMEDIATE = "INTERMEDIATE"
    HIGH = "HIGH"


class MolecularClassification(BaseModel):
    """Molecular classification result"""

    group: MolecularGroup = Field(..., description="Primary molecular group")
    subtype: Optional[str] = Field(None, description="Subtype within group (e.g., NSMP-high-risk)")
    confidence: float = Field(..., ge=0, le=1, description="Classification confidence")
    rationale: str = Field(..., description="Explanation of classification")
    clinical_significance: str = Field(..., description="Clinical implications")

    class Config:
        json_schema_extra = {
            "example": {
                "group": "p53abn",
                "subtype": None,
                "confidence": 1.0,
                "rationale": "p53 immunohistochemistry shows abnormal pattern (missense)",
                "clinical_significance": "Highest risk group with aggressive biology. Benefits from systemic therapy.",
            }
        }


class FIGO2023Staging(BaseModel):
    """FIGO 2023 molecular-integrated staging"""

    anatomical_stage: str = Field(..., description="Original anatomical FIGO stage")
    figo_2023_stage: str = Field(..., description="FIGO 2023 molecular-integrated stage")
    stage_group: str = Field(..., description="Stage group (I, II, III, IV)")
    molecular_modifier: Optional[str] = Field(None, description="Molecular modifier (m1 for favorable, 2 for aggressive)")
    rationale: str = Field(..., description="Explanation of staging decision")
    prognosis_impact: str = Field(..., description="How molecular profile affects prognosis")
    clinical_implications: str = Field(..., description="Treatment implications based on staging")
    staging_system: str = Field(default="FIGO 2023 (Molecular-Integrated)", description="Staging system used")

    class Config:
        json_schema_extra = {
            "example": {
                "anatomical_stage": "IA",
                "figo_2023_stage": "IC",
                "stage_group": "I",
                "molecular_modifier": "2",
                "rationale": "Tumor confined to uterus with <50% invasion. p53 abnormal - upstaged to IC per FIGO 2023",
                "prognosis_impact": "AGGRESSIVE: p53 abnormal indicates high-risk biology",
                "clinical_implications": "Recommend combined chemoradiotherapy per PORTEC-3",
                "staging_system": "FIGO 2023 (Molecular-Integrated)"
            }
        }


class PredictionResult(BaseModel):
    """Complete risk prediction result"""

    # Risk Assessment
    recurrence_probability: float = Field(
        ..., ge=0, le=1, description="5-year recurrence probability"
    )
    risk_category: RiskCategory = Field(..., description="Risk category")
    risk_percentile: Optional[int] = Field(
        None, ge=0, le=100, description="Percentile compared to all patients"
    )

    # Molecular Classification
    molecular_classification: MolecularClassification = Field(
        ..., description="Molecular classification result"
    )

    # FIGO 2023 Staging
    figo_2023_staging: Optional[FIGO2023Staging] = Field(
        None, description="FIGO 2023 molecular-integrated staging"
    )

    # Comparison
    stage_based_risk: float = Field(
        ..., ge=0, le=1, description="Traditional stage-based risk estimate"
    )
    risk_difference: float = Field(
        ..., description="Difference between AI and stage-based risk (AI - stage)"
    )
    reclassified: bool = Field(
        ..., description="Whether risk category changed from stage-based assessment"
    )

    # Metadata
    model_version: str = Field(..., description="Model version used")
    assessment_date: str = Field(..., description="Date of assessment (ISO format)")

    class Config:
        json_schema_extra = {
            "example": {
                "recurrence_probability": 0.78,
                "risk_category": "HIGH",
                "risk_percentile": 95,
                "molecular_classification": {
                    "group": "p53abn",
                    "subtype": None,
                    "confidence": 1.0,
                    "rationale": "p53 abnormal pattern detected",
                    "clinical_significance": "Aggressive biology requiring systemic therapy",
                },
                "stage_based_risk": 0.08,
                "risk_difference": 0.70,
                "reclassified": True,
                "model_version": "1.0.0",
                "assessment_date": "2025-12-19T10:30:00Z",
            }
        }
