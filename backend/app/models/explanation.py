"""
Explanation Models

Models for SHAP explainability API responses.
"""

from pydantic import BaseModel, Field
from typing import List, Literal


class FeatureContribution(BaseModel):
    """Individual feature contribution to prediction"""

    name: str = Field(..., description="Feature name (programmatic)")
    display_name: str = Field(..., description="Human-readable feature name")
    value: str = Field(..., description="Feature value for this patient")
    shap_value: float = Field(..., description="SHAP value (contribution to prediction)")
    direction: Literal["risk", "protective"] = Field(..., description="Direction of contribution")
    color: str = Field(..., description="Hex color for visualization")
    importance_rank: int = Field(..., description="Rank by absolute SHAP value (1 = most important)")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "p53_status",
                "display_name": "p53 Status",
                "value": "Abnormal",
                "shap_value": 0.45,
                "direction": "risk",
                "color": "#ef4444",
                "importance_rank": 1,
            }
        }


class FeatureInteraction(BaseModel):
    """Interaction between two features"""

    feature1_name: str = Field(..., description="First feature name")
    feature1_display: str = Field(..., description="First feature display name")
    feature2_name: str = Field(..., description="Second feature name")
    feature2_display: str = Field(..., description="Second feature display name")
    interaction_value: float = Field(..., description="Interaction effect value")
    interpretation: str = Field(..., description="Human-readable interpretation")

    class Config:
        json_schema_extra = {
            "example": {
                "feature1_name": "p53_status",
                "feature1_display": "p53 Status",
                "feature2_name": "stage",
                "feature2_display": "FIGO Stage",
                "interaction_value": 0.08,
                "interpretation": "p53 abnormality overrides favorable early stage, indicating aggressive biology",
            }
        }


class ShapExplanation(BaseModel):
    """Complete SHAP explanation for a prediction"""

    base_value: float = Field(..., description="Base value (average population risk)")
    prediction: float = Field(..., description="Final prediction value")

    # Feature contributions
    features: List[FeatureContribution] = Field(
        ..., description="All feature contributions sorted by absolute importance"
    )

    # Top drivers
    top_risk_factors: List[FeatureContribution] = Field(
        ..., max_length=3, description="Top 3 risk-increasing factors"
    )
    top_protective_factors: List[FeatureContribution] = Field(
        ..., max_length=3, description="Top 3 risk-decreasing factors"
    )

    # Interactions
    interactions: List[FeatureInteraction] = Field(
        ..., description="Significant feature interactions"
    )

    # Summary
    summary: str = Field(..., description="One-sentence explanation of the prediction")

    class Config:
        json_schema_extra = {
            "example": {
                "base_value": 0.15,
                "prediction": 0.78,
                "features": [
                    {
                        "name": "p53_status",
                        "display_name": "p53 Status",
                        "value": "Abnormal",
                        "shap_value": 0.45,
                        "direction": "risk",
                        "color": "#ef4444",
                        "importance_rank": 1,
                    }
                ],
                "top_risk_factors": [],
                "top_protective_factors": [],
                "interactions": [],
                "summary": "High risk driven primarily by p53 abnormality and L1CAM positivity",
            }
        }
