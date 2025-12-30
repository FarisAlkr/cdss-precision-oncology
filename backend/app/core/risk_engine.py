"""
Risk Prediction Engine

Loads trained XGBoost model and predicts 5-year recurrence risk.
"""

import xgboost as xgb
import numpy as np
import json
import os
from typing import Dict, Tuple
from datetime import datetime

from app.config import settings
from app.models.patient import PatientData
from app.models.prediction import PredictionResult, RiskCategory, FIGO2023Staging
from app.core.molecular_classifier import MolecularClassifier
from app.core.figo_staging import determine_figo_2023_stage, get_figo_2023_summary
from app.data.feature_definitions import (
    STAGE_ENCODING,
    HISTOLOGY_ENCODING,
    GRADE_ENCODING,
    LVSI_ENCODING,
    MYOMETRIAL_ENCODING,
    LYMPH_NODE_ENCODING,
    POLE_ENCODING,
    MMR_ENCODING,
    P53_ENCODING,
    L1CAM_ENCODING,
    CTNNB1_ENCODING,
    STAGE_BASED_RISK,
    get_risk_category,
)


class RiskEngine:
    """Risk prediction engine"""

    def __init__(self, model_path: str = None):
        """
        Initialize risk engine

        Args:
            model_path: Path to trained XGBoost model
        """
        self.model_path = model_path or settings.MODEL_PATH
        self.model = None
        self.feature_names = None
        self.metadata = None
        self._load_model()

    def _load_model(self):
        """Load trained model and metadata"""

        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"Model not found at {self.model_path}. "
                f"Please run 'python app/ml/train_model.py' first."
            )

        # Load XGBoost model
        self.model = xgb.XGBClassifier()
        self.model.load_model(self.model_path)

        # Load metadata
        metadata_path = self.model_path.replace(".json", "_metadata.json")
        if os.path.exists(metadata_path):
            with open(metadata_path, "r") as f:
                self.metadata = json.load(f)
                self.feature_names = self.metadata.get("feature_names", [])
        else:
            # Fallback feature names if metadata doesn't exist
            self.feature_names = [
                "molecular_group_encoded",
                "p53_encoded",
                "pole_encoded",
                "lvsi_encoded",
                "l1cam_encoded",
                "myometrial_encoded",
                "grade_encoded",
                "stage_encoded",
                "age",
                "mmr_encoded",
                "ctnnb1_encoded",
                "histology_encoded",
                "lymph_nodes_encoded",
                "bmi",
                "ecog_status",
                "diabetes_int",
            ]

        print(f"Model loaded from {self.model_path}")

    def _prepare_features(self, patient: PatientData, molecular_group: str) -> np.ndarray:
        """
        Convert patient data to feature vector

        Args:
            patient: Patient data
            molecular_group: Molecular classification group

        Returns:
            Feature vector as numpy array
        """

        # Encode molecular group
        molecular_group_encoding = {"POLEmut": 0, "MMRd": 1, "NSMP": 2, "p53abn": 3}
        molecular_encoded = molecular_group_encoding.get(molecular_group, 2)

        # Encode all features
        features = {
            "molecular_group_encoded": molecular_encoded,
            "p53_encoded": P53_ENCODING.get(patient.p53_status, 0),
            "pole_encoded": POLE_ENCODING.get(patient.pole_status, 0),
            "lvsi_encoded": LVSI_ENCODING.get(patient.lvsi.value, 0),
            "l1cam_encoded": L1CAM_ENCODING.get(patient.l1cam_status, 0),
            "myometrial_encoded": MYOMETRIAL_ENCODING.get(patient.myometrial_invasion.value, 0),
            "grade_encoded": GRADE_ENCODING.get(patient.grade.value, 0),
            "stage_encoded": STAGE_ENCODING.get(patient.stage.value, 0),
            "age": patient.age,
            "mmr_encoded": MMR_ENCODING.get(patient.mmr_status, 0),
            "ctnnb1_encoded": CTNNB1_ENCODING.get(patient.ctnnb1_status, 0),
            "histology_encoded": HISTOLOGY_ENCODING.get(patient.histology.value, 0),
            "lymph_nodes_encoded": LYMPH_NODE_ENCODING.get(patient.lymph_nodes.value, 0),
            "bmi": patient.bmi,
            "ecog_status": patient.ecog_status,
            "diabetes_int": int(patient.diabetes),
        }

        # Create feature vector in correct order
        feature_vector = np.array([features[name] for name in self.feature_names])

        return feature_vector.reshape(1, -1)

    def predict(self, patient: PatientData) -> PredictionResult:
        """
        Predict 5-year recurrence risk

        Args:
            patient: Patient data

        Returns:
            PredictionResult with risk score and classification
        """

        # Step 1: Molecular classification
        molecular_classification = MolecularClassifier.classify(patient)

        # Step 2: Prepare features for ML model
        X = self._prepare_features(patient, molecular_classification.group.value)

        # Step 3: Predict probability
        recurrence_probability = float(self.model.predict_proba(X)[0, 1])

        # Step 4: Categorize risk
        risk_category = get_risk_category(recurrence_probability)

        # Step 5: Get stage-based risk estimate for comparison
        stage_based_risk = STAGE_BASED_RISK.get(patient.stage.value, 0.15)

        # Step 6: Check if reclassified
        stage_risk_category = get_risk_category(stage_based_risk)
        reclassified = stage_risk_category != risk_category

        # Step 7: Calculate risk difference
        risk_difference = recurrence_probability - stage_based_risk

        # Step 8: Calculate percentile (mock - in production would use population data)
        risk_percentile = int(recurrence_probability * 100)

        # Step 9: FIGO 2023 staging with molecular integration
        figo_stage = determine_figo_2023_stage(
            anatomical_stage=patient.stage.value,
            histology=patient.histology.value,
            grade=patient.grade.value,
            lvsi=patient.lvsi.value,
            molecular_group=molecular_classification.group.value,
            pole_status=patient.pole_status or "Not Tested",
            mmr_status=patient.mmr_status or "Not Tested",
            p53_status=patient.p53_status or "Not Tested",
            myometrial_invasion=patient.myometrial_invasion.value,
            lymph_nodes=patient.lymph_nodes.value,
        )

        figo_2023_staging = FIGO2023Staging(
            anatomical_stage=figo_stage.anatomical_stage,
            figo_2023_stage=figo_stage.molecular_integrated_stage,
            stage_group=figo_stage.stage_group,
            molecular_modifier=figo_stage.molecular_modifier,
            rationale=figo_stage.rationale,
            prognosis_impact=figo_stage.prognosis_impact,
            clinical_implications=figo_stage.clinical_implications,
        )

        # Create result
        result = PredictionResult(
            recurrence_probability=recurrence_probability,
            risk_category=RiskCategory(risk_category),
            risk_percentile=risk_percentile,
            molecular_classification=molecular_classification,
            figo_2023_staging=figo_2023_staging,
            stage_based_risk=stage_based_risk,
            risk_difference=risk_difference,
            reclassified=reclassified,
            model_version=settings.VERSION,
            assessment_date=datetime.utcnow().isoformat() + "Z",
        )

        return result

    def batch_predict(self, patients: list[PatientData]) -> list[PredictionResult]:
        """
        Predict for multiple patients

        Args:
            patients: List of patient data

        Returns:
            List of prediction results
        """
        return [self.predict(patient) for patient in patients]


# Singleton instance for API use
_engine_instance = None


def get_risk_engine() -> RiskEngine:
    """
    Get singleton risk engine instance

    Returns:
        RiskEngine instance
    """
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = RiskEngine()
    return _engine_instance
