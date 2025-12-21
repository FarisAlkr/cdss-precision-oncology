"""
Molecular Classifier

Implements the ProMisE/TCGA hierarchical molecular classification for endometrial cancer.

Classification algorithm:
1. IF POLE pathogenic mutation detected → POLEmut (best prognosis)
2. ELSE IF MMR deficient → MMRd (immunotherapy responsive)
3. ELSE IF p53 abnormal → p53abn (worst prognosis)
4. ELSE → NSMP (No Specific Molecular Profile)

Additional risk stratification for NSMP:
- L1CAM positive (>10% expression) → High-risk NSMP
- CTNNB1 mutated → Intermediate-risk NSMP
- Both negative → Low-risk NSMP
"""

from typing import Dict, Tuple
from app.models.patient import PatientData
from app.models.prediction import MolecularGroup, MolecularClassification


class MolecularClassifier:
    """Molecular classification engine"""

    @staticmethod
    def classify(patient: PatientData) -> MolecularClassification:
        """
        Classify patient into TCGA molecular group

        Args:
            patient: Patient data with molecular markers

        Returns:
            MolecularClassification with group, subtype, and rationale
        """

        # Step 1: Check POLE
        if patient.pole_status == "Mutated":
            return MolecularClassification(
                group=MolecularGroup.POLEMUT,
                subtype=None,
                confidence=1.0,
                rationale="POLE pathogenic mutation detected. This is the ProMisE POLEmut group.",
                clinical_significance=(
                    "Excellent prognosis regardless of stage or grade. "
                    "Ultramutated tumors with very low recurrence risk. "
                    "PORTEC-3 data shows 100% 5-year RFS regardless of adjuvant treatment. "
                    "Consider treatment de-escalation. "
                    "Eligible for RAINBO POLEmut-BLUE trial (observation vs RT)."
                ),
            )

        # Step 2: Check MMR
        if patient.mmr_status == "Deficient":
            mmr_protein = patient.mmr_protein_lost or "unspecified protein"
            return MolecularClassification(
                group=MolecularGroup.MMRD,
                subtype=f"MMRd-{mmr_protein}",
                confidence=1.0,
                rationale=f"Mismatch repair deficiency detected (loss of {mmr_protein}). "
                f"This is the ProMisE MMRd group.",
                clinical_significance=(
                    "Intermediate prognosis with high tumor mutational burden. "
                    "High neoantigen load makes these tumors exceptionally responsive to "
                    "immune checkpoint inhibitors (pembrolizumab, dostarlimab, durvalumab). "
                    "Should screen for Lynch syndrome (germline MMR mutation). "
                    "Eligible for RAINBO MMRd-GREEN trial (durvalumab + RT). "
                    "FDA-approved indications for checkpoint inhibitors in MMRd tumors."
                ),
            )

        # Step 3: Check p53
        if patient.p53_status == "Abnormal":
            pattern = patient.p53_pattern or "unspecified"
            return MolecularClassification(
                group=MolecularGroup.P53ABN,
                subtype=f"p53abn-{pattern}",
                confidence=1.0,
                rationale=f"p53 abnormal pattern detected ({pattern} on IHC). "
                f"This is the ProMisE p53abn group.",
                clinical_significance=(
                    "Worst prognosis group with aggressive tumor biology. "
                    "High recurrence risk regardless of anatomical stage. "
                    "PORTEC-3 10-year data shows significant benefit from chemoradiotherapy "
                    "(OS HR 0.52, p=0.021). "
                    "Systemic therapy is critical - requires multimodal treatment. "
                    "Eligible for RAINBO p53abn-RED trial (CTRT + olaparib PARP inhibitor). "
                    "Anatomical staging alone underestimates biological risk."
                ),
            )

        # Step 4: NSMP (no specific molecular profile)
        # Further stratify by L1CAM and CTNNB1
        subtype, rationale, significance = MolecularClassifier._classify_nsmp(patient)

        return MolecularClassification(
            group=MolecularGroup.NSMP,
            subtype=subtype,
            confidence=1.0,
            rationale=rationale,
            clinical_significance=significance,
        )

    @staticmethod
    def _classify_nsmp(patient: PatientData) -> Tuple[str, str, str]:
        """
        Classify NSMP subtype based on L1CAM and CTNNB1

        Returns:
            Tuple of (subtype, rationale, clinical_significance)
        """

        l1cam_positive = patient.l1cam_status == "Positive"
        ctnnb1_mutated = patient.ctnnb1_status == "Mutated"

        if l1cam_positive:
            return (
                "NSMP-high-risk",
                "No POLE/MMR/p53 alterations, but L1CAM expression >10% detected. "
                "This indicates high-risk NSMP.",
                "L1CAM-positive NSMP has aggressive behavior similar to p53abn group. "
                "Significantly worse outcomes than L1CAM-negative NSMP. "
                "L1CAM is an independent adverse prognostic factor. "
                "Should be treated as high-risk disease with aggressive therapy. "
                "Eligible for RAINBO NSMP-ORANGE trial (risk-adapted approach).",
            )
        elif ctnnb1_mutated:
            return (
                "NSMP-intermediate",
                "No POLE/MMR/p53 alterations. CTNNB1 mutation detected. "
                "This indicates intermediate-risk NSMP.",
                "CTNNB1-mutated NSMP has intermediate prognosis. "
                "Associated with younger age and favorable outcomes compared to p53abn. "
                "Risk-adapted treatment based on conventional clinicopathological features. "
                "Eligible for RAINBO NSMP-ORANGE trial.",
            )
        else:
            return (
                "NSMP-low-risk",
                "No POLE/MMR/p53 alterations. L1CAM negative and CTNNB1 wild-type. "
                "This indicates low-risk NSMP.",
                "Heterogeneous group with variable outcomes. "
                "Risk depends on conventional clinicopathological features (stage, grade, LVSI). "
                "Generally favorable prognosis in early-stage disease. "
                "May benefit from treatment de-escalation in selected cases. "
                "Eligible for RAINBO NSMP-ORANGE trial (observation vs RT in early-stage).",
            )

    @staticmethod
    def get_molecular_group_description(group: MolecularGroup) -> Dict[str, str]:
        """
        Get detailed description of molecular group

        Args:
            group: Molecular group enum

        Returns:
            Dictionary with description fields
        """

        descriptions = {
            MolecularGroup.POLEMUT: {
                "name": "POLE Ultramutated",
                "short_name": "POLEmut",
                "frequency": "~7% of endometrial cancers",
                "prognosis": "Excellent (5-year RFS >95%)",
                "key_feature": "POLE exonuclease domain mutation",
                "biology": "Ultramutated tumors with high neoantigen load but excellent outcomes",
                "treatment_implication": "Consider de-escalation regardless of stage/grade",
                "color": "#10b981",
            },
            MolecularGroup.MMRD: {
                "name": "Mismatch Repair Deficient",
                "short_name": "MMRd",
                "frequency": "~28% of endometrial cancers",
                "prognosis": "Intermediate (5-year RFS ~85-90%)",
                "key_feature": "Loss of MMR proteins (MLH1, MSH2, MSH6, PMS2)",
                "biology": "High tumor mutational burden, immunogenic",
                "treatment_implication": "Exceptional response to checkpoint inhibitors; screen for Lynch",
                "color": "#3b82f6",
            },
            MolecularGroup.NSMP: {
                "name": "No Specific Molecular Profile",
                "short_name": "NSMP",
                "frequency": "~40% of endometrial cancers",
                "prognosis": "Variable (depends on L1CAM/CTNNB1)",
                "key_feature": "Wild-type POLE, proficient MMR, wild-type p53",
                "biology": "Heterogeneous group; L1CAM/CTNNB1 refine risk",
                "treatment_implication": "Risk-adapted approach based on biomarkers",
                "color": "#64748b",
            },
            MolecularGroup.P53ABN: {
                "name": "p53 Abnormal",
                "short_name": "p53abn",
                "frequency": "~25% of endometrial cancers",
                "prognosis": "Poor (5-year RFS ~50-60%)",
                "key_feature": "Abnormal p53 IHC (null or missense pattern)",
                "biology": "Copy number high, serous-like biology, aggressive",
                "treatment_implication": "Requires aggressive multimodal therapy (CTRT)",
                "color": "#ef4444",
            },
        }

        return descriptions.get(group, {})
