"""
Prediction API Routes

Endpoints for risk prediction.
"""

from fastapi import APIRouter, HTTPException
from app.models.patient import PatientData
from app.models.prediction import PredictionResult
from app.core.risk_engine import get_risk_engine

router = APIRouter()


@router.post("/predict", response_model=PredictionResult)
async def predict_risk(patient: PatientData):
    """
    Predict 5-year recurrence risk for a patient

    Args:
        patient: Complete patient data

    Returns:
        PredictionResult with risk score and molecular classification
    """
    try:
        risk_engine = get_risk_engine()
        result = risk_engine.predict(patient)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
