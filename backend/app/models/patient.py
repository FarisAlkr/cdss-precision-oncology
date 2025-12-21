"""
Patient Data Models

Pydantic models for patient clinical, pathological, and molecular data.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from enum import Enum


class FIGOStage(str, Enum):
    """FIGO staging for endometrial cancer"""

    IA = "IA"
    IB = "IB"
    II = "II"
    IIIA = "IIIA"
    IIIB = "IIIB"
    IIIC1 = "IIIC1"
    IIIC2 = "IIIC2"
    IVA = "IVA"
    IVB = "IVB"


class HistologyType(str, Enum):
    """Histological types"""

    ENDOMETRIOID = "Endometrioid"
    SEROUS = "Serous"
    CLEAR_CELL = "Clear Cell"
    CARCINOSARCOMA = "Carcinosarcoma"
    MIXED = "Mixed"
    OTHER = "Other"


class Grade(str, Enum):
    """Tumor grade"""

    G1 = "G1"
    G2 = "G2"
    G3 = "G3"


class LVSIStatus(str, Enum):
    """Lymphovascular space invasion status"""

    NONE = "None"
    FOCAL = "Focal"
    SUBSTANTIAL = "Substantial"


class MyometrialInvasion(str, Enum):
    """Myometrial invasion depth"""

    LESS_THAN_50 = "<50%"
    GREATER_EQUAL_50 = "≥50%"


class LymphNodeStatus(str, Enum):
    """Lymph node involvement"""

    NEGATIVE = "Negative"
    PELVIC_POSITIVE = "Pelvic+"
    PARA_AORTIC_POSITIVE = "Para-aortic+"


class MolecularStatus(str, Enum):
    """Molecular marker status"""

    POSITIVE = "Positive"
    NEGATIVE = "Negative"
    MUTATED = "Mutated"
    WILD_TYPE = "Wild-type"
    ABNORMAL = "Abnormal"
    PROFICIENT = "Proficient"
    DEFICIENT = "Deficient"
    NOT_TESTED = "Not Tested"


class PatientData(BaseModel):
    """Complete patient data model for risk assessment"""

    # Patient Identification (optional)
    patient_id: Optional[str] = Field(None, description="Patient identifier (anonymized)")

    # Clinical Features
    age: int = Field(..., ge=35, le=90, description="Patient age in years")
    bmi: float = Field(..., ge=15.0, le=60.0, description="Body Mass Index")
    diabetes: bool = Field(False, description="Diabetes mellitus status")
    ecog_status: int = Field(0, ge=0, le=4, description="ECOG Performance Status")

    # Pathological Features
    stage: FIGOStage = Field(..., description="FIGO stage")
    histology: HistologyType = Field(..., description="Histological type")
    grade: Grade = Field(..., description="Tumor grade")
    myometrial_invasion: MyometrialInvasion = Field(..., description="Depth of myometrial invasion")
    lvsi: LVSIStatus = Field(..., description="Lymphovascular space invasion")
    lymph_nodes: LymphNodeStatus = Field(..., description="Lymph node status")

    # Molecular Features
    pole_status: Literal["Mutated", "Wild-type", "Not Tested"] = Field(
        ..., description="POLE mutation status"
    )
    mmr_status: Literal["Proficient", "Deficient", "Not Tested"] = Field(
        ..., description="Mismatch repair protein status"
    )
    mmr_protein_lost: Optional[Literal["MLH1", "MSH2", "MSH6", "PMS2"]] = Field(
        None, description="Which MMR protein is lost (if deficient)"
    )
    p53_status: Literal["Wild-type", "Abnormal", "Not Tested"] = Field(
        ..., description="p53 immunohistochemistry status"
    )
    p53_pattern: Optional[Literal["Null", "Missense"]] = Field(
        None, description="Pattern of p53 abnormality (if abnormal)"
    )
    l1cam_status: Literal["Positive", "Negative", "Not Tested"] = Field(
        ..., description="L1CAM expression (>10% cutoff)"
    )
    ctnnb1_status: Literal["Mutated", "Wild-type", "Not Tested"] = Field(
        ..., description="CTNNB1 mutation status"
    )
    er_percent: Optional[float] = Field(
        None, ge=0, le=100, description="Estrogen receptor positivity (%)"
    )
    pr_percent: Optional[float] = Field(
        None, ge=0, le=100, description="Progesterone receptor positivity (%)"
    )

    @field_validator("mmr_protein_lost")
    @classmethod
    def validate_mmr_protein(cls, v, info):
        """Ensure MMR protein is specified if MMR is deficient"""
        if info.data.get("mmr_status") == "Deficient" and v is None:
            raise ValueError("mmr_protein_lost is required when mmr_status is Deficient")
        return v

    @field_validator("p53_pattern")
    @classmethod
    def validate_p53_pattern(cls, v, info):
        """Ensure p53 pattern is specified if p53 is abnormal"""
        if info.data.get("p53_status") == "Abnormal" and v is None:
            raise ValueError("p53_pattern is required when p53_status is Abnormal")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "patient_id": "EC-0001",
                "age": 64,
                "bmi": 32.5,
                "diabetes": False,
                "ecog_status": 1,
                "stage": "IA",
                "histology": "Endometrioid",
                "grade": "G3",
                "myometrial_invasion": "<50%",
                "lvsi": "Focal",
                "lymph_nodes": "Negative",
                "pole_status": "Wild-type",
                "mmr_status": "Proficient",
                "p53_status": "Abnormal",
                "p53_pattern": "Missense",
                "l1cam_status": "Positive",
                "ctnnb1_status": "Wild-type",
                "er_percent": 20.0,
                "pr_percent": 10.0,
            }
        }
