"""
Treatment Recommendation Engine

Generates evidence-based treatment recommendations based on molecular classification
and risk score, following PORTEC-3, ESGO/ESTRO/ESP guidelines, and RAINBO trials.
"""

from typing import List
from app.models.patient import PatientData
from app.models.prediction import PredictionResult, MolecularGroup
from app.models.report import (
    TreatmentRecommendation,
    EvidenceItem,
    ClinicalTrial,
    Alert,
)


class RecommendationEngine:
    """Generate treatment recommendations"""

    @staticmethod
    def generate_recommendation(
        patient: PatientData, prediction_result: PredictionResult
    ) -> TreatmentRecommendation:
        """
        Generate treatment recommendation

        Args:
            patient: Patient data
            prediction_result: Risk prediction result

        Returns:
            TreatmentRecommendation with evidence
        """

        molecular_group = prediction_result.molecular_classification.group
        risk_score = prediction_result.recurrence_probability
        risk_category = prediction_result.risk_category.value

        # Route to specific recommendation based on molecular group
        if molecular_group == MolecularGroup.POLEMUT:
            return RecommendationEngine._recommend_polemut(patient, prediction_result)
        elif molecular_group == MolecularGroup.MMRD:
            return RecommendationEngine._recommend_mmrd(patient, prediction_result)
        elif molecular_group == MolecularGroup.P53ABN:
            return RecommendationEngine._recommend_p53abn(patient, prediction_result)
        else:  # NSMP
            return RecommendationEngine._recommend_nsmp(patient, prediction_result)

    @staticmethod
    def _recommend_polemut(
        patient: PatientData, prediction_result: PredictionResult
    ) -> TreatmentRecommendation:
        """Recommendations for POLEmut group"""

        stage = patient.stage.value

        return TreatmentRecommendation(
            primary_recommendation="Consider Treatment De-escalation / Observation",
            rationale=(
                f"POLEmut molecular classification with predicted 5-year recurrence risk of "
                f"{prediction_result.recurrence_probability:.1%}. "
                f"This molecular group has excellent prognosis regardless of stage ({stage}) or grade."
            ),
            evidence=[
                EvidenceItem(
                    source="PORTEC-3 POLEmut subgroup analysis",
                    finding="100% 5-year recurrence-free survival in POLEmut patients regardless of adjuvant treatment",
                    hr=None,
                    p_value=None,
                ),
                EvidenceItem(
                    source="Leon-Castillo et al., Lancet Oncol 2020",
                    finding="POLEmut tumors have favorable outcomes even with high-grade histology",
                    hr=None,
                    p_value=None,
                ),
            ],
            trial_eligibility=[
                ClinicalTrial(
                    trial_name="RAINBO POLEmut-BLUE",
                    intervention="Observation vs Vaginal Brachytherapy",
                    status="Recruiting",
                    eligibility_note="Evaluating de-escalation in POLEmut patients",
                )
            ],
            alerts=[
                Alert(
                    type="info",
                    message="Excellent prognosis: POLEmut biology overrides adverse pathological features",
                )
            ],
            contraindications=["None specific - consider observation"],
        )

    @staticmethod
    def _recommend_mmrd(
        patient: PatientData, prediction_result: PredictionResult
    ) -> TreatmentRecommendation:
        """Recommendations for MMRd group"""

        risk_pct = prediction_result.recurrence_probability * 100

        return TreatmentRecommendation(
            primary_recommendation="Standard Adjuvant Therapy + Consider Immunotherapy",
            rationale=(
                f"MMR-deficient molecular classification with predicted 5-year recurrence risk of {risk_pct:.0f}%. "
                f"High tumor mutational burden makes these tumors exceptionally responsive to immune checkpoint inhibitors."
            ),
            evidence=[
                EvidenceItem(
                    source="KEYNOTE-158 (Pembrolizumab in MSI-H/dMMR)",
                    finding="ORR 57.1% in MSI-H/dMMR endometrial cancer",
                    hr=None,
                    p_value=None,
                ),
                EvidenceItem(
                    source="GARNET trial (Dostarlimab)",
                    finding="ORR 42.3% in dMMR endometrial cancer",
                    hr=None,
                    p_value=None,
                ),
                EvidenceItem(
                    source="FDA approval 2021",
                    finding="Pembrolizumab and dostarlimab approved for dMMR solid tumors",
                    hr=None,
                    p_value=None,
                ),
            ],
            trial_eligibility=[
                ClinicalTrial(
                    trial_name="RAINBO MMRd-GREEN",
                    intervention="Radiotherapy ± Durvalumab (PD-L1 inhibitor)",
                    status="Recruiting",
                    eligibility_note="Evaluating immunotherapy benefit in MMRd patients",
                )
            ],
            alerts=[
                Alert(
                    type="warning",
                    message="Lynch syndrome screening recommended: Perform germline genetic testing for hereditary MMR mutations",
                ),
                Alert(
                    type="info",
                    message="High immunogenicity: Consider checkpoint inhibitors for advanced/recurrent disease",
                ),
            ],
            contraindications=[
                "Check autoimmune history before immunotherapy",
                "Monitor for immune-related adverse events",
            ],
        )

    @staticmethod
    def _recommend_p53abn(
        patient: PatientData, prediction_result: PredictionResult
    ) -> TreatmentRecommendation:
        """Recommendations for p53abn group"""

        risk_pct = prediction_result.recurrence_probability * 100
        stage = patient.stage.value

        return TreatmentRecommendation(
            primary_recommendation="Aggressive Multimodal Therapy: Chemoradiotherapy",
            rationale=(
                f"p53-abnormal molecular classification with predicted 5-year recurrence risk of {risk_pct:.0f}%. "
                f"This is the highest-risk molecular group with aggressive biology that transcends anatomical staging. "
                f"Anatomical stage ({stage}) significantly underestimates biological risk."
            ),
            evidence=[
                EvidenceItem(
                    source="PORTEC-3 10-year follow-up (de Boer et al., 2023)",
                    finding="p53abn patients: OS 52.7% with CTRT vs 36.6% with RT alone",
                    hr=0.52,
                    p_value=0.021,
                ),
                EvidenceItem(
                    source="PORTEC-3 molecular analysis",
                    finding="p53abn has worst outcomes regardless of stage; benefits most from chemotherapy",
                    hr=None,
                    p_value=None,
                ),
                EvidenceItem(
                    source="ESGO/ESTRO/ESP 2021 guidelines",
                    finding="p53abn endometrioid cancers should be treated similar to serous carcinomas",
                    hr=None,
                    p_value=None,
                ),
            ],
            trial_eligibility=[
                ClinicalTrial(
                    trial_name="RAINBO p53abn-RED",
                    intervention="Chemoradiotherapy + Olaparib (PARP inhibitor)",
                    status="Recruiting",
                    eligibility_note="Evaluating PARP inhibitor benefit in p53abn patients",
                )
            ],
            alerts=[
                Alert(
                    type="critical",
                    message="Aggressive biology: Systemic therapy is critical regardless of early anatomical stage",
                ),
                Alert(
                    type="warning",
                    message="Stage-based risk estimate significantly underestimates actual biological risk",
                ),
            ],
            contraindications=[
                "Assess ECOG performance status for chemotherapy tolerance",
                "Check cardiac function (anthracyclines)",
                "Renal function (cisplatin/carboplatin)",
            ],
        )

    @staticmethod
    def _recommend_nsmp(
        patient: PatientData, prediction_result: PredictionResult
    ) -> TreatmentRecommendation:
        """Recommendations for NSMP group"""

        risk_pct = prediction_result.recurrence_probability * 100
        risk_category = prediction_result.risk_category.value
        l1cam_positive = patient.l1cam_status == "Positive"
        ctnnb1_mutated = patient.ctnnb1_status == "Mutated"

        # NSMP is heterogeneous - refine recommendation based on L1CAM/CTNNB1
        if l1cam_positive:
            # High-risk NSMP (L1CAM+)
            primary_rec = "Treat as High-Risk: Consider Chemoradiotherapy"
            rationale = (
                f"NSMP with L1CAM positivity (predicted risk {risk_pct:.0f}%). "
                f"L1CAM-positive NSMP has aggressive behavior similar to p53abn group and requires intensive treatment."
            )
            alerts = [
                Alert(
                    type="warning",
                    message="L1CAM positivity elevates NSMP from intermediate to high-risk biology",
                )
            ]
        elif risk_category == "HIGH":
            primary_rec = "Standard Adjuvant Therapy: Consider Chemotherapy + Radiotherapy"
            rationale = (
                f"NSMP classified as high-risk based on clinicopathological features (predicted risk {risk_pct:.0f}%). "
                f"Risk-adapted approach indicated."
            )
            alerts = [
                Alert(
                    type="info",
                    message="High-risk NSMP: Conventional features drive treatment intensification",
                )
            ]
        elif risk_category == "LOW":
            primary_rec = "Consider De-escalation: Observation or Vaginal Brachytherapy"
            rationale = (
                f"Low-risk NSMP (predicted risk {risk_pct:.0f}%). "
                f"Favorable molecular profile combined with early-stage disease may allow treatment de-escalation."
            )
            alerts = [
                Alert(
                    type="info",
                    message="Low-risk NSMP: Consider individualized de-escalation approach",
                )
            ]
        else:
            # Intermediate risk
            primary_rec = "Risk-Adapted Therapy: Radiotherapy ± Chemotherapy"
            rationale = (
                f"NSMP with intermediate risk (predicted {risk_pct:.0f}%). "
                f"Treatment should be individualized based on conventional clinicopathological features."
            )
            alerts = [
                Alert(
                    type="info",
                    message="Heterogeneous group: Integrate molecular and conventional risk factors",
                )
            ]

        return TreatmentRecommendation(
            primary_recommendation=primary_rec,
            rationale=rationale,
            evidence=[
                EvidenceItem(
                    source="Bosse et al., J Clin Oncol 2018",
                    finding="L1CAM expression is independent adverse prognostic factor in endometrioid EC",
                    hr=2.5,
                    p_value=0.002,
                ),
                EvidenceItem(
                    source="CTNNB1 prognostic analysis",
                    finding="CTNNB1-mutated NSMP associated with favorable outcomes",
                    hr=None,
                    p_value=None,
                ),
            ],
            trial_eligibility=[
                ClinicalTrial(
                    trial_name="RAINBO NSMP-ORANGE",
                    intervention="Risk-adapted approach (Observation vs RT vs CTRT)",
                    status="Recruiting",
                    eligibility_note="Evaluating treatment stratification in NSMP patients",
                )
            ],
            alerts=alerts,
            contraindications=["Individualize based on age, comorbidities, and risk factors"],
        )
