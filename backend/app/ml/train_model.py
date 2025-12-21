"""
XGBoost Model Training Script

Trains the risk prediction model on synthetic data and saves it for inference.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import (
    roc_auc_score,
    brier_score_loss,
    classification_report,
    confusion_matrix,
)
import xgboost as xgb
import pickle
import os
import json

from app.config import settings
from app.data.synthetic_generator import generate_synthetic_data
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
)


class RiskModelTrainer:
    """Train XGBoost risk prediction model"""

    def __init__(self, data_path: str = None):
        """
        Initialize trainer

        Args:
            data_path: Path to training data CSV (if None, generates synthetic data)
        """
        self.data_path = data_path or settings.SYNTHETIC_DATA_PATH
        self.model = None
        self.feature_names = None
        self.best_params = None

    def load_data(self) -> pd.DataFrame:
        """Load or generate training data"""
        if os.path.exists(self.data_path):
            print(f"Loading data from {self.data_path}")
            df = pd.read_csv(self.data_path)
        else:
            print("Generating synthetic data...")
            df = generate_synthetic_data(n_patients=settings.N_SYNTHETIC_PATIENTS, save=True)

        print(f"Loaded {len(df)} patients")
        return df

    def prepare_features(self, df: pd.DataFrame) -> tuple:
        """
        Prepare features for training

        Args:
            df: Raw dataframe

        Returns:
            Tuple of (X, y, feature_names)
        """

        # Encode categorical features
        df_encoded = df.copy()

        df_encoded["stage_encoded"] = df["stage"].map(STAGE_ENCODING)
        df_encoded["histology_encoded"] = df["histology"].map(HISTOLOGY_ENCODING)
        df_encoded["grade_encoded"] = df["grade"].map(GRADE_ENCODING)
        df_encoded["lvsi_encoded"] = df["lvsi"].map(LVSI_ENCODING)
        df_encoded["myometrial_encoded"] = df["myometrial_invasion"].map(MYOMETRIAL_ENCODING)
        df_encoded["lymph_nodes_encoded"] = df["lymph_nodes"].map(LYMPH_NODE_ENCODING)

        df_encoded["pole_encoded"] = df["pole_status"].map(POLE_ENCODING)
        df_encoded["mmr_encoded"] = df["mmr_status"].map(MMR_ENCODING)
        df_encoded["p53_encoded"] = df["p53_status"].map(P53_ENCODING)
        df_encoded["l1cam_encoded"] = df["l1cam_status"].map(L1CAM_ENCODING)
        df_encoded["ctnnb1_encoded"] = df["ctnnb1_status"].map(CTNNB1_ENCODING)

        df_encoded["diabetes_int"] = df["diabetes"].astype(int)

        # Also encode molecular_group as it's a strong predictor
        molecular_group_encoding = {"POLEmut": 0, "MMRd": 1, "NSMP": 2, "p53abn": 3}
        df_encoded["molecular_group_encoded"] = df["molecular_group"].map(molecular_group_encoding)

        # Select features for training (in order of importance)
        feature_cols = [
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

        # Handle missing values (fill ER/PR with median if needed)
        for col in feature_cols:
            if df_encoded[col].isnull().any():
                df_encoded[col].fillna(df_encoded[col].median(), inplace=True)

        X = df_encoded[feature_cols].values
        y = df_encoded["recurrence"].astype(int).values

        self.feature_names = feature_cols

        print(f"\nFeatures: {len(feature_cols)}")
        print(f"Samples: {len(X)}")
        print(f"Recurrence rate: {y.mean():.2%}")

        return X, y, feature_cols

    def train(self, X, y):
        """
        Train XGBoost model with optimized hyperparameters

        Args:
            X: Feature matrix
            y: Target labels
        """

        print("\n=== Training XGBoost Model ===")

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=settings.RANDOM_SEED, stratify=y
        )

        # Calculate scale_pos_weight for imbalanced classes
        scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()

        # XGBoost parameters (optimized for this task)
        params = {
            "objective": "binary:logistic",
            "eval_metric": "auc",
            "max_depth": 5,
            "learning_rate": 0.05,
            "n_estimators": 200,
            "subsample": 0.8,
            "colsample_bytree": 0.8,
            "min_child_weight": 3,
            "gamma": 0.1,
            "reg_alpha": 0.1,
            "reg_lambda": 1.0,
            "scale_pos_weight": scale_pos_weight,
            "random_state": settings.RANDOM_SEED,
        }

        self.best_params = params

        # Train model
        self.model = xgb.XGBClassifier(**params)
        self.model.fit(
            X_train,
            y_train,
            eval_set=[(X_test, y_test)],
            verbose=False,
        )

        # Evaluate
        self._evaluate(X_train, y_train, X_test, y_test)

        # Cross-validation (skip for now due to sklearn compatibility)
        # self._cross_validate(X, y)
        print("\nSkipping cross-validation due to sklearn/xgboost compatibility")

        return self.model

    def _evaluate(self, X_train, y_train, X_test, y_test):
        """Evaluate model performance"""

        print("\n=== Model Evaluation ===")

        # Training performance
        y_train_pred_proba = self.model.predict_proba(X_train)[:, 1]
        train_auc = roc_auc_score(y_train, y_train_pred_proba)
        train_brier = brier_score_loss(y_train, y_train_pred_proba)

        print(f"Training AUC: {train_auc:.4f}")
        print(f"Training Brier Score: {train_brier:.4f}")

        # Test performance
        y_test_pred_proba = self.model.predict_proba(X_test)[:, 1]
        test_auc = roc_auc_score(y_test, y_test_pred_proba)
        test_brier = brier_score_loss(y_test, y_test_pred_proba)

        print(f"\nTest AUC: {test_auc:.4f}")
        print(f"Test Brier Score: {test_brier:.4f}")

        # Classification report (using 0.5 threshold)
        y_test_pred = (y_test_pred_proba >= 0.5).astype(int)
        print("\nClassification Report (Test Set):")
        print(classification_report(y_test, y_test_pred, target_names=["No Recurrence", "Recurrence"]))

        # Feature importance
        print("\n=== Feature Importance ===")
        importance_df = pd.DataFrame(
            {"feature": self.feature_names, "importance": self.model.feature_importances_}
        ).sort_values("importance", ascending=False)

        print(importance_df.head(10))

    def _cross_validate(self, X, y):
        """Perform stratified k-fold cross-validation"""

        print("\n=== 10-Fold Cross-Validation ===")

        cv = StratifiedKFold(n_splits=10, shuffle=True, random_state=settings.RANDOM_SEED)
        cv_scores = cross_val_score(self.model, X, y, cv=cv, scoring="roc_auc")

        print(f"CV AUC Scores: {cv_scores}")
        print(f"Mean CV AUC: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

    def save_model(self, model_path: str = None):
        """Save trained model"""

        if model_path is None:
            model_path = settings.MODEL_PATH

        os.makedirs(os.path.dirname(model_path), exist_ok=True)

        # Save as JSON for XGBoost
        self.model.save_model(model_path)
        print(f"\nModel saved to: {model_path}")

        # Also save feature names and metadata
        metadata = {
            "feature_names": self.feature_names,
            "best_params": self.best_params,
            "version": settings.VERSION,
        }

        metadata_path = model_path.replace(".json", "_metadata.json")
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)

        print(f"Metadata saved to: {metadata_path}")


def main():
    """Main training pipeline"""

    print("=" * 80)
    print("OncoRisk EC - XGBoost Model Training")
    print("=" * 80)

    # Initialize trainer
    trainer = RiskModelTrainer()

    # Load data
    df = trainer.load_data()

    # Prepare features
    X, y, feature_names = trainer.prepare_features(df)

    # Train model
    model = trainer.train(X, y)

    # Save model
    trainer.save_model()

    print("\n" + "=" * 80)
    print("Training Complete!")
    print("=" * 80)


if __name__ == "__main__":
    main()
