"""
FIGO 2023 Staging for Endometrial Cancer
Incorporates molecular classification into anatomical staging

Reference: FIGO staging of endometrial cancer 2023
Int J Gynaecol Obstet. 2023 Aug;162(2):383-394
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel


class FIGO2023Stage(BaseModel):
    """FIGO 2023 staging result with molecular integration"""
    anatomical_stage: str  # Original anatomical stage (e.g., "IA", "IB")
    molecular_integrated_stage: str  # FIGO 2023 with molecular suffix (e.g., "IAm1", "IC2")
    stage_group: str  # I, II, III, or IV
    substage: str  # Full substage designation
    molecular_modifier: Optional[str]  # "m" for favorable, "2" for aggressive
    rationale: str  # Explanation of staging
    prognosis_impact: str  # How molecular profile affects prognosis
    clinical_implications: str  # Treatment implications


def determine_figo_2023_stage(
    anatomical_stage: str,
    histology: str,
    grade: str,
    lvsi: str,
    molecular_group: str,
    pole_status: str,
    mmr_status: str,
    p53_status: str,
    myometrial_invasion: str,
    lymph_nodes: str,
) -> FIGO2023Stage:
    """
    Determine FIGO 2023 stage integrating molecular classification.

    FIGO 2023 Key Changes:
    - Molecular markers directly modify staging
    - POLEmut/MMRd can indicate favorable biology (suffix 'm')
    - p53abn indicates aggressive biology (can upstage)
    - Aggressive histotypes (serous, clear cell) incorporated

    Args:
        anatomical_stage: Traditional FIGO stage (IA, IB, II, IIIA, etc.)
        histology: Tumor histology type
        grade: Tumor grade (G1, G2, G3)
        lvsi: Lymphovascular space invasion status
        molecular_group: ProMisE/TCGA group (POLEmut, MMRd, NSMP, p53abn)
        pole_status: POLE mutation status
        mmr_status: MMR status
        p53_status: p53 status
        myometrial_invasion: Depth of invasion
        lymph_nodes: Lymph node status

    Returns:
        FIGO2023Stage with integrated molecular staging
    """

    # Normalize inputs
    stage_upper = anatomical_stage.upper()
    histology_lower = histology.lower() if histology else ""
    grade_upper = grade.upper() if grade else ""
    lvsi_lower = lvsi.lower() if lvsi else ""

    # Determine if aggressive histotype
    aggressive_histotypes = ["serous", "clear cell", "carcinosarcoma", "undifferentiated", "dedifferentiated"]
    is_aggressive_histotype = any(h in histology_lower for h in aggressive_histotypes)

    # Determine molecular modifier
    is_favorable_molecular = molecular_group in ["POLEmut", "MMRd"]
    is_aggressive_molecular = molecular_group == "p53abn" or p53_status == "Abnormal"

    # Determine LVSI status
    substantial_lvsi = lvsi_lower in ["substantial", "present", "extensive"]

    # Base stage group
    if stage_upper.startswith("I") and not stage_upper.startswith("IV"):
        stage_group = "I"
    elif stage_upper.startswith("II"):
        stage_group = "II"
    elif stage_upper.startswith("III"):
        stage_group = "III"
    elif stage_upper.startswith("IV"):
        stage_group = "IV"
    else:
        stage_group = "I"  # Default

    # Initialize
    molecular_integrated_stage = stage_upper
    molecular_modifier = None
    rationale_parts = []

    # ========================================
    # FIGO 2023 STAGE I
    # ========================================
    if stage_group == "I":
        if stage_upper in ["IA", "1A"]:
            base_stage = "IA"
            rationale_parts.append("Tumor confined to uterus with <50% myometrial invasion")

            if is_favorable_molecular:
                # IA with favorable molecular → IAm1 (excellent prognosis)
                molecular_integrated_stage = "IAm1"
                molecular_modifier = "m1"
                rationale_parts.append(f"Favorable molecular profile ({molecular_group}) - indicates excellent prognosis")
            elif is_aggressive_molecular and not is_aggressive_histotype:
                # IA with p53abn but endometrioid → Stage IC (upstaged)
                molecular_integrated_stage = "IC"
                molecular_modifier = "2"
                rationale_parts.append("p53 abnormal molecular profile - upstaged to IC per FIGO 2023")
            elif is_aggressive_histotype:
                # IA with aggressive histotype → IC
                molecular_integrated_stage = "IC"
                rationale_parts.append(f"Aggressive histotype ({histology}) - staged as IC")
            else:
                molecular_integrated_stage = "IA"
                rationale_parts.append("NSMP with favorable features - standard Stage IA")

        elif stage_upper in ["IB", "1B"]:
            base_stage = "IB"
            rationale_parts.append("Tumor confined to uterus with ≥50% myometrial invasion")

            if is_favorable_molecular:
                molecular_integrated_stage = "IBm1"
                molecular_modifier = "m1"
                rationale_parts.append(f"Favorable molecular profile ({molecular_group}) - better prognosis than expected")
            elif is_aggressive_molecular:
                molecular_integrated_stage = "IC"
                molecular_modifier = "2"
                rationale_parts.append("p53 abnormal - upstaged to IC per FIGO 2023")
            elif is_aggressive_histotype:
                molecular_integrated_stage = "IC"
                rationale_parts.append(f"Aggressive histotype ({histology}) - staged as IC")
            else:
                molecular_integrated_stage = "IB"

        elif stage_upper in ["IC", "1C"]:
            base_stage = "IC"
            molecular_integrated_stage = "IC"
            rationale_parts.append("Stage IC - aggressive features (p53abn or aggressive histotype)")

    # ========================================
    # FIGO 2023 STAGE II
    # ========================================
    elif stage_group == "II":
        rationale_parts.append("Tumor invades cervical stroma")

        if substantial_lvsi:
            # Substantial LVSI → IIB
            molecular_integrated_stage = "IIB"
            rationale_parts.append("Substantial LVSI present - staged as IIB")
        elif is_favorable_molecular:
            molecular_integrated_stage = "IIAm1"
            molecular_modifier = "m1"
            rationale_parts.append(f"Favorable molecular profile ({molecular_group})")
        elif is_aggressive_molecular:
            molecular_integrated_stage = "IIC"
            molecular_modifier = "2"
            rationale_parts.append("p53 abnormal - upstaged to IIC")
        else:
            molecular_integrated_stage = "IIA"

    # ========================================
    # FIGO 2023 STAGE III
    # ========================================
    elif stage_group == "III":
        if "C" in stage_upper:
            # Lymph node involvement
            if "C2" in stage_upper or "C1I" in stage_upper:
                molecular_integrated_stage = "IIIC2"
                rationale_parts.append("Para-aortic lymph node involvement")
            else:
                molecular_integrated_stage = "IIIC1"
                rationale_parts.append("Pelvic lymph node involvement")

            if is_aggressive_molecular:
                molecular_integrated_stage += "2"
                molecular_modifier = "2"
                rationale_parts.append("p53 abnormal - worst prognostic subgroup")
            elif is_favorable_molecular:
                molecular_integrated_stage += "1"
                molecular_modifier = "1"
                rationale_parts.append(f"Favorable molecular ({molecular_group}) - better prognosis within stage")

        elif "B" in stage_upper:
            molecular_integrated_stage = "IIIB"
            rationale_parts.append("Vaginal and/or parametrial involvement")
            if is_aggressive_molecular:
                molecular_integrated_stage += "2"
                molecular_modifier = "2"
        elif "A" in stage_upper:
            molecular_integrated_stage = "IIIA"
            rationale_parts.append("Tumor invades serosa and/or adnexa")
            if is_aggressive_molecular:
                molecular_integrated_stage += "2"
                molecular_modifier = "2"
            elif is_favorable_molecular:
                molecular_integrated_stage += "1"
                molecular_modifier = "1"
        else:
            molecular_integrated_stage = "III"
            rationale_parts.append("Stage III - tumor extends beyond uterus")

    # ========================================
    # FIGO 2023 STAGE IV
    # ========================================
    elif stage_group == "IV":
        if "B" in stage_upper:
            molecular_integrated_stage = "IVB"
            rationale_parts.append("Distant metastases including abdominal/inguinal nodes")
        else:
            molecular_integrated_stage = "IVA"
            rationale_parts.append("Tumor invades bladder and/or bowel mucosa")

    # ========================================
    # DETERMINE PROGNOSIS IMPACT
    # ========================================
    if is_favorable_molecular:
        prognosis_impact = (
            f"FAVORABLE: {molecular_group} molecular profile significantly improves prognosis. "
            f"5-year survival rates are excellent (>90%) even with adverse pathological features. "
            f"May allow de-escalation of adjuvant therapy in appropriate cases."
        )
    elif is_aggressive_molecular:
        prognosis_impact = (
            f"AGGRESSIVE: p53 abnormal molecular profile indicates high-risk biology. "
            f"Higher recurrence rates and poorer survival compared to other molecular groups. "
            f"Warrants intensified treatment regardless of anatomical stage."
        )
    else:
        prognosis_impact = (
            "INTERMEDIATE: NSMP (No Specific Molecular Profile). "
            "Prognosis determined primarily by traditional clinicopathological features. "
            "Further risk stratification by L1CAM and CTNNB1 may be helpful."
        )

    # ========================================
    # CLINICAL IMPLICATIONS
    # ========================================
    clinical_implications_parts = []

    if molecular_group == "POLEmut":
        clinical_implications_parts.append(
            "POLEmut: Consider observation alone for Stage I-II. "
            "PORTEC-4a trial suggests adjuvant therapy may be omitted."
        )
    elif molecular_group == "MMRd":
        clinical_implications_parts.append(
            "MMRd: Screen for Lynch syndrome. Consider immunotherapy for advanced/recurrent disease. "
            "Pembrolizumab/dostarlimab are FDA-approved options."
        )
    elif molecular_group == "p53abn":
        clinical_implications_parts.append(
            "p53abn: Recommend combined chemoradiotherapy per PORTEC-3. "
            "Consider clinical trials (RAINBO p53abn-RED: CTRT + olaparib). "
            "Close surveillance warranted."
        )
    else:  # NSMP
        clinical_implications_parts.append(
            "NSMP: Treatment based on clinicopathological risk factors. "
            "Consider adjuvant therapy per ESGO/ESTRO/ESP guidelines based on stage and grade."
        )

    if substantial_lvsi:
        clinical_implications_parts.append(
            "Substantial LVSI: Associated with increased risk of nodal involvement and recurrence."
        )

    if is_aggressive_histotype:
        clinical_implications_parts.append(
            f"Aggressive histotype ({histology}): Recommend adjuvant chemotherapy ± radiation."
        )

    return FIGO2023Stage(
        anatomical_stage=stage_upper,
        molecular_integrated_stage=molecular_integrated_stage,
        stage_group=stage_group,
        substage=molecular_integrated_stage,
        molecular_modifier=molecular_modifier,
        rationale=" ".join(rationale_parts),
        prognosis_impact=prognosis_impact,
        clinical_implications=" ".join(clinical_implications_parts)
    )


def get_figo_2023_summary(stage: FIGO2023Stage) -> Dict[str, Any]:
    """Get a summary dictionary of the FIGO 2023 staging for API response"""
    return {
        "anatomical_stage": stage.anatomical_stage,
        "figo_2023_stage": stage.molecular_integrated_stage,
        "stage_group": stage.stage_group,
        "molecular_modifier": stage.molecular_modifier,
        "rationale": stage.rationale,
        "prognosis_impact": stage.prognosis_impact,
        "clinical_implications": stage.clinical_implications,
        "staging_system": "FIGO 2023 (Molecular-Integrated)"
    }
