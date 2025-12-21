"""
Clinical Evidence and Demo Scenarios

Pre-defined clinical scenarios for demo mode, based on actual clinical patterns
observed in PORTEC-3 and other trials.
"""

DEMO_SCENARIOS = {
    "silent-killer": {
        "id": "silent-killer",
        "title": "The Silent Killer",
        "subtitle": "When Early Stage Hides Aggressive Biology",
        "description": (
            "A 64-year-old patient with Stage IA endometrial cancer. Traditional staging "
            "suggests low risk and observation. But molecular testing reveals a different story..."
        ),
        "patient_data": {
            "patient_id": "DEMO-001",
            "age": 64,
            "bmi": 32.5,
            "diabetes": False,
            "ecog_status": 1,
            "stage": "IA",
            "histology": "Endometrioid",
            "grade": "G3",
            "myometrial_invasion": "<50%",
            "lvsi": "Focal",
            "lymph_nodes": "Negative",
            "pole_status": "Wild-type",
            "mmr_status": "Proficient",
            "p53_status": "Abnormal",
            "p53_pattern": "Missense",
            "l1cam_status": "Positive",
            "ctnnb1_status": "Wild-type",
            "er_percent": 20.0,
            "pr_percent": 10.0,
        },
        "expected_molecular_group": "p53abn",
        "expected_risk_category": "HIGH",
        "key_insight": (
            "p53 abnormality and L1CAM positivity override favorable stage, "
            "revealing high recurrence risk vs low risk expected from staging alone."
        ),
        "narrative_points": [
            "Traditional FIGO IA staging would classify this as low-risk",
            "Standard care: Observation or vaginal brachytherapy only",
            "Molecular testing reveals p53 abnormality - the highest risk group",
            "L1CAM positivity further confirms aggressive biology",
            "True recurrence risk: ~78% - comparable to Stage III disease",
            "PORTEC-3 evidence: These patients benefit from chemoradiotherapy (HR 0.52)",
            "AI system correctly identifies this 'silent killer' scenario",
        ],
    },
    "false-alarm": {
        "id": "false-alarm",
        "title": "The False Alarm",
        "subtitle": "When Advanced Stage Masks Indolent Biology",
        "description": (
            "A 58-year-old patient with Stage IIIC1 disease and positive lymph nodes. "
            "Standard treatment would be aggressive chemoradiotherapy. But is it necessary?"
        ),
        "patient_data": {
            "patient_id": "DEMO-002",
            "age": 58,
            "bmi": 28.0,
            "diabetes": False,
            "ecog_status": 0,
            "stage": "IIIC1",
            "histology": "Endometrioid",
            "grade": "G3",
            "myometrial_invasion": "≥50%",
            "lvsi": "Substantial",
            "lymph_nodes": "Pelvic+",
            "pole_status": "Mutated",
            "mmr_status": "Proficient",
            "p53_status": "Wild-type",
            "l1cam_status": "Negative",
            "ctnnb1_status": "Wild-type",
            "er_percent": 80.0,
            "pr_percent": 70.0,
        },
        "expected_molecular_group": "POLEmut",
        "expected_risk_category": "LOW",
        "key_insight": (
            "POLE mutation confers excellent prognosis regardless of advanced stage. "
            "De-escalation should be considered."
        ),
        "narrative_points": [
            "Stage IIIC1 with positive lymph nodes - traditionally high-risk",
            "Standard care: Aggressive chemoradiotherapy with significant toxicity",
            "POLE mutation detected - the most favorable molecular subtype",
            "PORTEC-3: POLEmut patients had 100% 5-year RFS regardless of treatment",
            "True recurrence risk: Only ~5% - comparable to Stage IA",
            "POLE mutation 'vetoes' all adverse histological features",
            "Patient could be spared chemo-related neuropathy, nausea, bone marrow suppression",
            "Eligible for RAINBO POLEmut-BLUE trial (de-escalation arm)",
        ],
    },
    "grey-zone": {
        "id": "grey-zone",
        "title": "The Grey Zone Differentiator",
        "subtitle": "Differentiating Risk Within NSMP",
        "description": (
            "Two patients with identical staging but different L1CAM status. "
            "See how a single biomarker changes the entire risk assessment."
        ),
        "patient_data_a": {
            "patient_id": "DEMO-003A",
            "age": 62,
            "bmi": 30.0,
            "diabetes": False,
            "ecog_status": 0,
            "stage": "IB",
            "histology": "Endometrioid",
            "grade": "G2",
            "myometrial_invasion": "≥50%",
            "lvsi": "Focal",
            "lymph_nodes": "Negative",
            "pole_status": "Wild-type",
            "mmr_status": "Proficient",
            "p53_status": "Wild-type",
            "l1cam_status": "Negative",
            "ctnnb1_status": "Wild-type",
            "er_percent": 70.0,
            "pr_percent": 65.0,
        },
        "patient_data_b": {
            "patient_id": "DEMO-003B",
            "age": 62,
            "bmi": 30.0,
            "diabetes": False,
            "ecog_status": 0,
            "stage": "IB",
            "histology": "Endometrioid",
            "grade": "G2",
            "myometrial_invasion": "≥50%",
            "lvsi": "Focal",
            "lymph_nodes": "Negative",
            "pole_status": "Wild-type",
            "mmr_status": "Proficient",
            "p53_status": "Wild-type",
            "l1cam_status": "Positive",
            "ctnnb1_status": "Wild-type",
            "er_percent": 70.0,
            "pr_percent": 65.0,
        },
        "expected_molecular_group": "NSMP",
        "expected_risk_category_a": "INTERMEDIATE",
        "expected_risk_category_b": "HIGH",
        "key_insight": (
            "L1CAM status differentiates NSMP into distinct risk groups. "
            "L1CAM+ NSMP behaves like p53abn with significantly worse outcomes."
        ),
        "narrative_points": [
            "Identical clinical and pathological features",
            "Both classified as NSMP molecular group",
            "L1CAM negative (Patient A): Intermediate risk (~18% recurrence)",
            "L1CAM positive (Patient B): High risk (~42% recurrence)",
            "Single biomarker changes risk category and treatment approach",
            "L1CAM is independent adverse prognostic factor (HR 2.5)",
            "Demonstrates value of refining NSMP classification",
        ],
    },
    "immunotherapy-candidate": {
        "id": "immunotherapy-candidate",
        "title": "The Immunotherapy Candidate",
        "subtitle": "Matching Molecular Profile to Targeted Therapy",
        "description": (
            "A patient with MMR deficiency - identifying candidates for "
            "immune checkpoint inhibitors."
        ),
        "patient_data": {
            "patient_id": "DEMO-004",
            "age": 55,
            "bmi": 34.0,
            "diabetes": True,
            "ecog_status": 1,
            "stage": "II",
            "histology": "Endometrioid",
            "grade": "G3",
            "myometrial_invasion": "≥50%",
            "lvsi": "Substantial",
            "lymph_nodes": "Negative",
            "pole_status": "Wild-type",
            "mmr_status": "Deficient",
            "mmr_protein_lost": "MLH1",
            "p53_status": "Wild-type",
            "l1cam_status": "Negative",
            "ctnnb1_status": "Wild-type",
            "er_percent": 60.0,
            "pr_percent": 50.0,
        },
        "expected_molecular_group": "MMRd",
        "expected_risk_category": "INTERMEDIATE",
        "key_insight": (
            "MMR deficiency indicates high tumor immunogenicity and exceptional "
            "response to checkpoint inhibitors."
        ),
        "narrative_points": [
            "MMR deficiency detected - high mutational burden",
            "Creates neoantigens that immune system can recognize",
            "Exceptional response rates to pembrolizumab, dostarlimab, durvalumab",
            "FDA-approved indications for MMRd solid tumors",
            "Should screen for Lynch syndrome (germline testing)",
            "Eligible for RAINBO MMRd-GREEN trial (durvalumab + radiation)",
            "Personalized immunotherapy option unavailable with staging alone",
        ],
    },
}


def get_scenario(scenario_id: str) -> dict:
    """Get scenario by ID"""
    return DEMO_SCENARIOS.get(scenario_id)


def get_all_scenarios() -> dict:
    """Get all scenarios"""
    return DEMO_SCENARIOS
