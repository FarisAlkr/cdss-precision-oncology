"""
Reports API Routes

Endpoints for clinical report generation.
"""

from fastapi import APIRouter, HTTPException
from app.models.patient import PatientData
from app.models.report import ClinicalReport
from app.core.risk_engine import get_risk_engine
from app.core.explainer import get_shap_explainer
from app.core.recommendation_engine import RecommendationEngine
from datetime import datetime
import uuid

router = APIRouter()


@router.post("/report", response_model=ClinicalReport)
async def generate_report(patient: PatientData):
    """
    Generate complete clinical report

    Args:
        patient: Complete patient data

    Returns:
        ClinicalReport with all analysis and recommendations
    """
    try:
        # Get prediction
        risk_engine = get_risk_engine()
        prediction = risk_engine.predict(patient)

        # Get SHAP explanation
        explainer = get_shap_explainer()
        explanation = explainer.explain(patient, prediction)

        # Get treatment recommendation
        recommendation = RecommendationEngine.generate_recommendation(patient, prediction)

        # Build report
        report = ClinicalReport(
            patient_id=patient.patient_id or "Anonymous",
            assessment_date=datetime.utcnow().isoformat() + "Z",
            report_id=f"RPT-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}",
            version="1.0.0",
            risk_score=prediction.recurrence_probability,
            risk_category=prediction.risk_category.value,
            molecular_group=prediction.molecular_classification.group.value,
            one_line_summary=_generate_summary(prediction),
            clinical_summary=_summarize_clinical(patient),
            pathological_summary=_summarize_pathological(patient),
            molecular_summary=_summarize_molecular(patient, prediction),
            shap_summary=explanation.summary,
            top_risk_drivers=[f.display_name for f in explanation.top_risk_factors],
            top_protective_factors=[f.display_name for f in explanation.top_protective_factors],
            molecular_explanation=prediction.molecular_classification.rationale,
            biological_significance=prediction.molecular_classification.clinical_significance,
            therapeutic_implications=recommendation.primary_recommendation,
            treatment_recommendation=recommendation,
        )

        return report

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation error: {str(e)}")


def _generate_summary(prediction) -> str:
    """Generate one-line summary"""
    risk_cat = prediction.risk_category.value
    mol_group = prediction.molecular_classification.group.value
    return f"{risk_cat}-risk patient with {mol_group} molecular classification"


def _summarize_clinical(patient: PatientData) -> str:
    """Summarize clinical characteristics"""
    return (
        f"Age {patient.age} years, BMI {patient.bmi:.1f}, "
        f"Diabetes: {'Yes' if patient.diabetes else 'No'}, ECOG {patient.ecog_status}"
    )


def _summarize_pathological(patient: PatientData) -> str:
    """Summarize pathological findings"""
    return (
        f"Stage {patient.stage.value}, {patient.histology.value} histology, "
        f"Grade {patient.grade.value}, {patient.myometrial_invasion.value} myometrial invasion, "
        f"{patient.lvsi.value} LVSI, lymph nodes {patient.lymph_nodes.value}"
    )


def _summarize_molecular(patient: PatientData, prediction) -> str:
    """Summarize molecular results"""
    mol_group = prediction.molecular_classification.group.value
    return (
        f"{mol_group} molecular group: "
        f"POLE {patient.pole_status}, MMR {patient.mmr_status}, "
        f"p53 {patient.p53_status}, L1CAM {patient.l1cam_status}"
    )
