"""
Explanation API Routes

Endpoints for SHAP explanations.
"""

from fastapi import APIRouter, HTTPException
from app.models.patient import PatientData
from app.models.explanation import ShapExplanation
from app.core.explainer import get_shap_explainer
from app.core.risk_engine import get_risk_engine

router = APIRouter()


@router.post("/explain", response_model=ShapExplanation)
async def explain_prediction(patient: PatientData):
    """
    Generate SHAP explanation for prediction

    Args:
        patient: Complete patient data

    Returns:
        ShapExplanation with feature contributions and interactions
    """
    try:
        # Get prediction first
        risk_engine = get_risk_engine()
        prediction = risk_engine.predict(patient)

        # Generate SHAP explanation
        explainer = get_shap_explainer()
        explanation = explainer.explain(patient, prediction)

        return explanation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation error: {str(e)}")
