"""
SHAP Explainability Module

Provides transparent explanations for risk predictions using SHAP values.
"""

import shap
import numpy as np
from typing import List, Dict
import pandas as pd

from app.config import settings
from app.models.patient import PatientData
from app.models.explanation import (
    ShapExplanation,
    FeatureContribution,
    FeatureInteraction,
)
from app.core.risk_engine import RiskEngine
from app.data.feature_definitions import FEATURE_DISPLAY_NAMES, FEATURE_DESCRIPTIONS


class ShapExplainer:
    """SHAP explainer for XGBoost model"""

    def __init__(self, risk_engine: RiskEngine = None):
        """
        Initialize SHAP explainer

        Args:
            risk_engine: Risk engine with trained model
        """
        self.risk_engine = risk_engine
        self.explainer = None
        self.background_data = None
        self._initialize_explainer()

    def _initialize_explainer(self):
        """Initialize SHAP TreeExplainer"""

        if self.risk_engine is None:
            from app.core.risk_engine import get_risk_engine

            self.risk_engine = get_risk_engine()

        # Create TreeExplainer for XGBoost
        self.explainer = shap.TreeExplainer(self.risk_engine.model)

        print("SHAP explainer initialized")

    def explain(self, patient: PatientData, prediction_result=None) -> ShapExplanation:
        """
        Generate SHAP explanation for patient prediction

        Args:
            patient: Patient data
            prediction_result: Optional pre-computed prediction result

        Returns:
            ShapExplanation with feature contributions
        """

        # Get prediction if not provided
        if prediction_result is None:
            prediction_result = self.risk_engine.predict(patient)

        # Prepare feature vector
        molecular_group = prediction_result.molecular_classification.group.value
        X = self.risk_engine._prepare_features(patient, molecular_group)

        # Calculate SHAP values
        shap_values = self.explainer.shap_values(X)

        # Get base value (expected value)
        base_value = float(self.explainer.expected_value)

        # Get feature contributions
        feature_contributions = self._parse_feature_contributions(
            X, shap_values, self.risk_engine.feature_names, patient, molecular_group
        )

        # Get top risk and protective factors
        risk_factors = [f for f in feature_contributions if f.direction == "risk"]
        protective_factors = [f for f in feature_contributions if f.direction == "protective"]

        top_risk_factors = sorted(risk_factors, key=lambda x: abs(x.shap_value), reverse=True)[:3]
        top_protective_factors = sorted(
            protective_factors, key=lambda x: abs(x.shap_value), reverse=True
        )[:3]

        # Generate interactions
        interactions = self._calculate_interactions(X, feature_contributions)

        # Generate summary
        summary = self._generate_summary(
            top_risk_factors, top_protective_factors, prediction_result
        )

        return ShapExplanation(
            base_value=base_value,
            prediction=float(prediction_result.recurrence_probability),
            features=feature_contributions,
            top_risk_factors=top_risk_factors,
            top_protective_factors=top_protective_factors,
            interactions=interactions,
            summary=summary,
        )

    def _parse_feature_contributions(
        self,
        X: np.ndarray,
        shap_values: np.ndarray,
        feature_names: List[str],
        patient: PatientData,
        molecular_group: str,
    ) -> List[FeatureContribution]:
        """
        Parse SHAP values into feature contributions

        Args:
            X: Feature vector
            shap_values: SHAP values
            feature_names: Feature names
            patient: Patient data (for display values)
            molecular_group: Molecular group

        Returns:
            List of FeatureContribution objects
        """

        contributions = []

        # Map to get display values
        display_value_map = self._get_display_value_map(patient, molecular_group)

        for i, feature_name in enumerate(feature_names):
            shap_val = float(shap_values[0][i])

            # Skip features with negligible contribution
            if abs(shap_val) < 0.001:
                continue

            # Get display name
            display_name = self._get_display_name(feature_name)

            # Get display value
            display_value = display_value_map.get(feature_name, str(X[0, i]))

            # Determine direction and color
            if shap_val > 0:
                direction = "risk"
                color = "#ef4444"  # Red
            else:
                direction = "protective"
                color = "#22c55e"  # Green

            contributions.append(
                FeatureContribution(
                    name=feature_name,
                    display_name=display_name,
                    value=display_value,
                    shap_value=shap_val,
                    direction=direction,
                    color=color,
                    importance_rank=0,  # Will be set after sorting
                )
            )

        # Sort by absolute SHAP value and assign ranks
        contributions.sort(key=lambda x: abs(x.shap_value), reverse=True)
        for rank, contrib in enumerate(contributions, 1):
            contrib.importance_rank = rank

        return contributions

    def _get_display_name(self, feature_name: str) -> str:
        """Get human-readable feature name"""

        # Remove _encoded suffix
        clean_name = feature_name.replace("_encoded", "").replace("_int", "")

        # Special case for molecular_group
        if "molecular_group" in feature_name:
            return "Molecular Classification"

        return FEATURE_DISPLAY_NAMES.get(clean_name, clean_name.replace("_", " ").title())

    def _get_display_value_map(self, patient: PatientData, molecular_group: str) -> Dict[str, str]:
        """Get display values for features"""

        return {
            "molecular_group_encoded": molecular_group,
            "p53_encoded": patient.p53_status,
            "pole_encoded": patient.pole_status,
            "lvsi_encoded": patient.lvsi.value,
            "l1cam_encoded": patient.l1cam_status,
            "myometrial_encoded": patient.myometrial_invasion.value,
            "grade_encoded": patient.grade.value,
            "stage_encoded": patient.stage.value,
            "age": f"{patient.age} years",
            "mmr_encoded": patient.mmr_status,
            "ctnnb1_encoded": patient.ctnnb1_status,
            "histology_encoded": patient.histology.value,
            "lymph_nodes_encoded": patient.lymph_nodes.value,
            "bmi": f"{patient.bmi:.1f}",
            "ecog_status": f"ECOG {patient.ecog_status}",
            "diabetes_int": "Yes" if patient.diabetes else "No",
        }

    def _calculate_interactions(
        self, X: np.ndarray, contributions: List[FeatureContribution]
    ) -> List[FeatureInteraction]:
        """
        Calculate feature interactions

        For simplicity, we'll identify key interactions based on domain knowledge
        rather than computing full interaction matrix.
        """

        interactions = []

        # Get feature name to contribution map
        contrib_map = {c.name: c for c in contributions}

        # Key interactions to highlight:

        # 1. p53 x stage: p53abn overrides favorable stage
        if "p53_encoded" in contrib_map and "stage_encoded" in contrib_map:
            p53_contrib = contrib_map["p53_encoded"]
            stage_contrib = contrib_map["stage_encoded"]

            if p53_contrib.value == "Abnormal" and stage_contrib.value in ["IA", "IB"]:
                interactions.append(
                    FeatureInteraction(
                        feature1_name="p53_encoded",
                        feature1_display="p53 Status",
                        feature2_name="stage_encoded",
                        feature2_display="FIGO Stage",
                        interaction_value=0.08,
                        interpretation="p53 abnormality overrides favorable early stage, indicating aggressive biology that transcends anatomical staging.",
                    )
                )

        # 2. L1CAM x NSMP: L1CAM elevates NSMP risk
        if "l1cam_encoded" in contrib_map and "molecular_group_encoded" in contrib_map:
            l1cam_contrib = contrib_map["l1cam_encoded"]
            mol_contrib = contrib_map["molecular_group_encoded"]

            if l1cam_contrib.value == "Positive" and mol_contrib.value == "NSMP":
                interactions.append(
                    FeatureInteraction(
                        feature1_name="l1cam_encoded",
                        feature1_display="L1CAM Status",
                        feature2_name="molecular_group_encoded",
                        feature2_display="Molecular Group",
                        interaction_value=0.12,
                        interpretation="L1CAM positivity in NSMP tumors dramatically increases risk, shifting behavior toward p53abn-like biology.",
                    )
                )

        # 3. LVSI x Grade: Synergistic effect
        if "lvsi_encoded" in contrib_map and "grade_encoded" in contrib_map:
            lvsi_contrib = contrib_map["lvsi_encoded"]
            grade_contrib = contrib_map["grade_encoded"]

            if lvsi_contrib.value == "Substantial" and grade_contrib.value == "G3":
                interactions.append(
                    FeatureInteraction(
                        feature1_name="lvsi_encoded",
                        feature1_display="LVSI",
                        feature2_name="grade_encoded",
                        feature2_display="Grade",
                        interaction_value=0.05,
                        interpretation="Substantial LVSI combined with high grade indicates aggressive local invasion and high metastatic potential.",
                    )
                )

        return interactions

    def _generate_summary(
        self,
        top_risk_factors: List[FeatureContribution],
        top_protective_factors: List[FeatureContribution],
        prediction_result,
    ) -> str:
        """Generate one-sentence summary of prediction"""

        risk_cat = prediction_result.risk_category.value
        risk_pct = int(prediction_result.recurrence_probability * 100)

        if len(top_risk_factors) > 0:
            top_risk_name = top_risk_factors[0].display_name
            top_risk_value = top_risk_factors[0].value

            if len(top_risk_factors) > 1:
                second_risk_name = top_risk_factors[1].display_name
                summary = f"{risk_cat} risk ({risk_pct}% recurrence) driven primarily by {top_risk_name} ({top_risk_value}) and {second_risk_name}"
            else:
                summary = f"{risk_cat} risk ({risk_pct}% recurrence) driven primarily by {top_risk_name} ({top_risk_value})"
        else:
            summary = f"{risk_cat} risk ({risk_pct}% recurrence) based on overall clinical profile"

        return summary


# Singleton instance
_explainer_instance = None


def get_shap_explainer() -> ShapExplainer:
    """
    Get singleton SHAP explainer instance

    Returns:
        ShapExplainer instance
    """
    global _explainer_instance
    if _explainer_instance is None:
        _explainer_instance = ShapExplainer()
    return _explainer_instance
