"""
Synthetic Patient Data Generator

Generates realistic synthetic endometrial cancer patient data based on:
- PORTEC-3 trial distributions
- TCGA molecular classification cohort
- Published recurrence rates by molecular subtype

This generates 2000 synthetic patients with complete clinical, pathological,
and molecular profiles along with realistic outcome data.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
import os

from app.config import settings


class SyntheticDataGenerator:
    """Generate synthetic endometrial cancer patient data"""

    def __init__(self, n_patients: int = 2000, random_seed: int = 42):
        """
        Initialize generator

        Args:
            n_patients: Number of synthetic patients to generate
            random_seed: Random seed for reproducibility
        """
        self.n_patients = n_patients
        self.random_seed = random_seed
        np.random.seed(random_seed)

    def generate_molecular_groups(self) -> np.ndarray:
        """
        Generate molecular group distribution based on PORTEC-3/TCGA

        Distribution:
        - POLEmut: 7%
        - MMRd: 28%
        - NSMP: 40%
        - p53abn: 25%
        """
        molecular_groups = np.random.choice(
            ["POLEmut", "MMRd", "NSMP", "p53abn"],
            size=self.n_patients,
            p=[0.07, 0.28, 0.40, 0.25],
        )
        return molecular_groups

    def generate_clinical_features(self) -> Dict[str, np.ndarray]:
        """Generate clinical features with realistic distributions"""

        # Age: Normal distribution, mean=63, std=10, range 35-85
        age = np.clip(np.random.normal(63, 10, self.n_patients), 35, 85).astype(int)

        # BMI: Normal distribution, mean=32, std=8, range 18-55
        bmi = np.clip(np.random.normal(32, 8, self.n_patients), 18, 55)

        # Diabetes: ~30% prevalence (correlated with BMI)
        diabetes_prob = 0.15 + 0.3 * (bmi - 18) / (55 - 18)
        diabetes = np.random.random(self.n_patients) < diabetes_prob

        # ECOG: Mostly 0-1, some 2-3
        ecog = np.random.choice([0, 1, 2, 3], size=self.n_patients, p=[0.50, 0.35, 0.10, 0.05])

        return {"age": age, "bmi": bmi, "diabetes": diabetes, "ecog_status": ecog}

    def generate_pathological_features(
        self, molecular_groups: np.ndarray
    ) -> Dict[str, np.ndarray]:
        """
        Generate pathological features with correlations to molecular groups

        p53abn correlates with higher grade and advanced stage
        POLEmut often appears with high grade but early stage
        """

        n = len(molecular_groups)

        # Stage distribution with molecular correlation
        stage_options = ["IA", "IB", "II", "IIIA", "IIIB", "IIIC1", "IIIC2", "IVA", "IVB"]
        stage = []
        for mol_group in molecular_groups:
            if mol_group == "p53abn":
                # p53abn tends toward more advanced stages
                stage.append(
                    np.random.choice(
                        stage_options, p=[0.20, 0.20, 0.15, 0.10, 0.10, 0.10, 0.08, 0.05, 0.02]
                    )
                )
            elif mol_group == "POLEmut":
                # POLEmut mostly early stage
                stage.append(
                    np.random.choice(
                        stage_options, p=[0.55, 0.25, 0.10, 0.05, 0.03, 0.01, 0.01, 0.0, 0.0]
                    )
                )
            else:
                # Standard distribution for MMRd and NSMP
                stage.append(
                    np.random.choice(
                        stage_options, p=[0.45, 0.25, 0.10, 0.05, 0.05, 0.07, 0.03, 0.0, 0.0]
                    )
                )
        stage = np.array(stage)

        # Grade with molecular correlation
        grade = []
        for mol_group in molecular_groups:
            if mol_group == "POLEmut" or mol_group == "p53abn":
                # Both tend toward high grade
                grade.append(np.random.choice(["G1", "G2", "G3"], p=[0.05, 0.20, 0.75]))
            else:
                # Standard distribution
                grade.append(np.random.choice(["G1", "G2", "G3"], p=[0.30, 0.40, 0.30]))
        grade = np.array(grade)

        # Histology - mostly endometrioid except for p53abn
        histology = []
        for mol_group in molecular_groups:
            if mol_group == "p53abn":
                # p53abn often serous or high-grade endometrioid
                histology.append(
                    np.random.choice(
                        ["Endometrioid", "Serous", "Clear Cell", "Carcinosarcoma", "Mixed"],
                        p=[0.30, 0.40, 0.15, 0.10, 0.05],
                    )
                )
            else:
                # Mostly endometrioid for other groups
                histology.append(
                    np.random.choice(
                        ["Endometrioid", "Serous", "Clear Cell", "Carcinosarcoma", "Mixed"],
                        p=[0.85, 0.05, 0.05, 0.03, 0.02],
                    )
                )
        histology = np.array(histology)

        # LVSI - correlated with stage and grade
        lvsi = np.random.choice(["None", "Focal", "Substantial"], size=n, p=[0.50, 0.30, 0.20])

        # Myometrial invasion
        myometrial = np.random.choice(["<50%", "≥50%"], size=n, p=[0.55, 0.45])

        # Lymph nodes - correlated with stage
        lymph_nodes = []
        for s in stage:
            if s in ["IA", "IB", "II"]:
                lymph_nodes.append(
                    np.random.choice(["Negative", "Pelvic+", "Para-aortic+"], p=[0.95, 0.04, 0.01])
                )
            elif s in ["IIIA", "IIIB"]:
                lymph_nodes.append(
                    np.random.choice(["Negative", "Pelvic+", "Para-aortic+"], p=[0.70, 0.25, 0.05])
                )
            else:  # IIIC+
                lymph_nodes.append(
                    np.random.choice(["Negative", "Pelvic+", "Para-aortic+"], p=[0.10, 0.70, 0.20])
                )
        lymph_nodes = np.array(lymph_nodes)

        return {
            "stage": stage,
            "histology": histology,
            "grade": grade,
            "myometrial_invasion": myometrial,
            "lvsi": lvsi,
            "lymph_nodes": lymph_nodes,
        }

    def generate_molecular_features(
        self, molecular_groups: np.ndarray
    ) -> Dict[str, np.ndarray]:
        """
        Generate molecular features based on assigned molecular group

        Hierarchical classification:
        1. POLEmut: POLE mutated
        2. MMRd: MMR deficient
        3. p53abn: p53 abnormal
        4. NSMP: None of the above
        """

        n = len(molecular_groups)

        pole_status = []
        mmr_status = []
        p53_status = []
        l1cam_status = []
        ctnnb1_status = []

        for mol_group in molecular_groups:
            if mol_group == "POLEmut":
                pole_status.append("Mutated")
                mmr_status.append("Proficient")  # Usually proficient
                p53_status.append("Wild-type")
                l1cam_status.append("Negative")
                ctnnb1_status.append("Wild-type")

            elif mol_group == "MMRd":
                pole_status.append("Wild-type")
                mmr_status.append("Deficient")
                p53_status.append("Wild-type")
                # Random L1CAM/CTNNB1
                l1cam_status.append(np.random.choice(["Negative", "Positive"], p=[0.80, 0.20]))
                ctnnb1_status.append(np.random.choice(["Wild-type", "Mutated"], p=[0.70, 0.30]))

            elif mol_group == "p53abn":
                pole_status.append("Wild-type")
                mmr_status.append("Proficient")
                p53_status.append("Abnormal")
                # Often L1CAM positive
                l1cam_status.append(np.random.choice(["Negative", "Positive"], p=[0.40, 0.60]))
                ctnnb1_status.append("Wild-type")

            else:  # NSMP
                pole_status.append("Wild-type")
                mmr_status.append("Proficient")
                p53_status.append("Wild-type")
                # L1CAM and CTNNB1 differentiate risk in NSMP
                # 30% L1CAM+ (high risk), 40% CTNNB1+ (intermediate), 30% neither
                marker_profile = np.random.choice(["L1CAM+", "CTNNB1+", "Neither"], p=[0.30, 0.40, 0.30])
                if marker_profile == "L1CAM+":
                    l1cam_status.append("Positive")
                    ctnnb1_status.append("Wild-type")
                elif marker_profile == "CTNNB1+":
                    l1cam_status.append("Negative")
                    ctnnb1_status.append("Mutated")
                else:
                    l1cam_status.append("Negative")
                    ctnnb1_status.append("Wild-type")

        # ER/PR mostly high in endometrioid
        er_percent = np.clip(np.random.normal(70, 25, n), 0, 100)
        pr_percent = np.clip(np.random.normal(65, 30, n), 0, 100)

        return {
            "pole_status": np.array(pole_status),
            "mmr_status": np.array(mmr_status),
            "p53_status": np.array(p53_status),
            "l1cam_status": np.array(l1cam_status),
            "ctnnb1_status": np.array(ctnnb1_status),
            "er_percent": er_percent,
            "pr_percent": pr_percent,
        }

    def generate_outcomes(
        self,
        molecular_groups: np.ndarray,
        l1cam_status: np.ndarray,
        stage: np.ndarray,
        grade: np.ndarray,
        lvsi: np.ndarray,
    ) -> Dict[str, np.ndarray]:
        """
        Generate outcome data (recurrence) based on molecular group and other features

        Recurrence rates by molecular subtype (5-year):
        - POLEmut: 3-5% (regardless of stage/grade)
        - MMRd: 10-15%
        - NSMP: 12-20% (higher if L1CAM+)
        - p53abn: 40-50%
        """

        n = len(molecular_groups)
        recurrence = np.zeros(n, dtype=bool)
        time_to_recurrence = np.zeros(n)  # Months

        for i in range(n):
            mol_group = molecular_groups[i]

            # Base recurrence probability by molecular group
            if mol_group == "POLEmut":
                base_prob = 0.04
            elif mol_group == "MMRd":
                base_prob = 0.12
            elif mol_group == "NSMP":
                # Higher if L1CAM+
                if l1cam_status[i] == "Positive":
                    base_prob = 0.35  # NSMP-high-risk behaves like p53abn
                else:
                    base_prob = 0.15
            else:  # p53abn
                base_prob = 0.45

            # Adjust for stage (small effect for POLEmut, larger for others)
            stage_factor = {"IA": 0.8, "IB": 1.0, "II": 1.2, "IIIA": 1.5, "IIIB": 1.5, "IIIC1": 1.8, "IIIC2": 2.0, "IVA": 2.5, "IVB": 3.0}
            if mol_group != "POLEmut":  # Stage matters less for POLEmut
                base_prob *= stage_factor.get(stage[i], 1.0)

            # Adjust for grade
            grade_factor = {"G1": 0.8, "G2": 1.0, "G3": 1.3}
            if mol_group != "POLEmut":
                base_prob *= grade_factor.get(grade[i], 1.0)

            # Adjust for LVSI
            lvsi_factor = {"None": 0.9, "Focal": 1.0, "Substantial": 1.4}
            base_prob *= lvsi_factor.get(lvsi[i], 1.0)

            # Cap probability
            final_prob = min(base_prob, 0.85)

            # Determine recurrence
            recurrence[i] = np.random.random() < final_prob

            # Time to recurrence (exponential distribution)
            if recurrence[i]:
                time_to_recurrence[i] = np.random.exponential(scale=18)  # Mean 18 months
            else:
                time_to_recurrence[i] = 60  # Censored at 5 years

        return {
            "recurrence": recurrence,
            "time_to_recurrence": time_to_recurrence,
        }

    def generate(self) -> pd.DataFrame:
        """
        Generate complete synthetic dataset

        Returns:
            DataFrame with all patient features and outcomes
        """
        print(f"Generating {self.n_patients} synthetic patients...")

        # Generate molecular groups first (primary determinant)
        molecular_groups = self.generate_molecular_groups()

        # Generate features
        clinical = self.generate_clinical_features()
        pathological = self.generate_pathological_features(molecular_groups)
        molecular = self.generate_molecular_features(molecular_groups)

        # Generate outcomes
        outcomes = self.generate_outcomes(
            molecular_groups,
            molecular["l1cam_status"],
            pathological["stage"],
            pathological["grade"],
            pathological["lvsi"],
        )

        # Combine all features
        data = {
            "patient_id": [f"EC-{i:04d}" for i in range(self.n_patients)],
            "molecular_group": molecular_groups,
            **clinical,
            **pathological,
            **molecular,
            **outcomes,
        }

        df = pd.DataFrame(data)

        # Print distribution summary
        print("\n=== Molecular Group Distribution ===")
        print(df["molecular_group"].value_counts(normalize=True))
        print("\n=== Recurrence Rate by Molecular Group ===")
        print(df.groupby("molecular_group")["recurrence"].mean())
        print(f"\n=== Overall Recurrence Rate ===")
        print(f"{df['recurrence'].mean():.2%}")

        return df

    def save(self, df: pd.DataFrame, path: str = None):
        """Save dataset to CSV"""
        if path is None:
            path = settings.SYNTHETIC_DATA_PATH

        os.makedirs(os.path.dirname(path), exist_ok=True)
        df.to_csv(path, index=False)
        print(f"\nDataset saved to: {path}")


def generate_synthetic_data(n_patients: int = 2000, save: bool = True) -> pd.DataFrame:
    """
    Main function to generate synthetic data

    Args:
        n_patients: Number of patients to generate
        save: Whether to save to CSV

    Returns:
        DataFrame with synthetic patient data
    """
    generator = SyntheticDataGenerator(n_patients=n_patients, random_seed=settings.RANDOM_SEED)
    df = generator.generate()

    if save:
        generator.save(df)

    return df


if __name__ == "__main__":
    # Generate data when run directly
    df = generate_synthetic_data(n_patients=settings.N_SYNTHETIC_PATIENTS)
    print("\nSynthetic data generation complete!")
