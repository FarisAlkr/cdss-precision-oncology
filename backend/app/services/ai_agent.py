"""
AI Agent Service for Intelligent Medical Document Analysis

This agent uses LLM to:
1. Read and understand any medical document format
2. Extract relevant clinical and molecular data
3. Determine TCGA molecular classification
4. Generate comprehensive risk assessment with medical explanations
"""

import json
import base64
import httpx
import logging
from typing import Dict, Any, Optional, Tuple
from pydantic import BaseModel, Field
from enum import Enum

from app.config import settings

logger = logging.getLogger(__name__)


class MolecularGroup(str, Enum):
    POLEmut = "POLEmut"
    MMRd = "MMRd"
    NSMP = "NSMP"
    p53abn = "p53abn"
    UNKNOWN = "Unknown"


class RiskCategory(str, Enum):
    LOW = "LOW"
    INTERMEDIATE = "INTERMEDIATE"
    HIGH = "HIGH"


class ExtractedPatientData(BaseModel):
    """Structured patient data extracted from document"""
    # Demographics
    age: Optional[int] = None
    gender: Optional[str] = None

    # Clinical
    bmi: Optional[float] = None
    diabetes: Optional[bool] = None
    ecog_status: Optional[int] = None

    # Pathological
    stage: Optional[str] = None
    histology: Optional[str] = None
    grade: Optional[str] = None
    myometrial_invasion: Optional[str] = None
    lvsi: Optional[str] = None
    lymph_nodes: Optional[str] = None
    tumor_size: Optional[float] = None

    # Molecular - Core TCGA markers
    pole_status: Optional[str] = None
    mmr_status: Optional[str] = None
    p53_status: Optional[str] = None
    l1cam_status: Optional[str] = None
    ctnnb1_status: Optional[str] = None

    # NGS Data
    msi_status: Optional[str] = None
    tmb_score: Optional[float] = None
    tmb_status: Optional[str] = None

    # Individual MMR proteins
    mlh1_status: Optional[str] = None
    pms2_status: Optional[str] = None
    msh2_status: Optional[str] = None
    msh6_status: Optional[str] = None

    # Additional molecular markers
    fgfr2_status: Optional[str] = None
    pten_status: Optional[str] = None
    pik3ca_status: Optional[str] = None
    kras_status: Optional[str] = None
    arid1a_status: Optional[str] = None

    # Hormone receptors
    er_percent: Optional[float] = None
    pr_percent: Optional[float] = None

    # Auto-determined
    molecular_group: Optional[str] = None


class MedicalAssessment(BaseModel):
    """Comprehensive medical assessment"""
    # Extracted Data
    patient_data: ExtractedPatientData

    # Molecular Classification
    molecular_group: MolecularGroup
    molecular_group_confidence: float = Field(ge=0, le=1)
    molecular_rationale: str

    # Risk Assessment
    risk_category: RiskCategory
    risk_score: float = Field(ge=0, le=100)
    five_year_recurrence_risk: float = Field(ge=0, le=100)

    # Clinical Interpretation
    clinical_summary: str
    key_findings: list[str]
    risk_factors: list[str]
    protective_factors: list[str]

    # Treatment Implications
    treatment_implications: str
    recommended_surveillance: str
    clinical_trial_eligibility: list[str]

    # Detailed Explanation
    detailed_explanation: str

    # Data Quality
    extraction_confidence: float = Field(ge=0, le=1)
    missing_critical_data: list[str]
    warnings: list[str]


# System prompt for the AI agent
MEDICAL_AGENT_SYSTEM_PROMPT = """You are an expert gynecologic oncologist and molecular pathologist specializing in endometrial cancer risk stratification.

Your role is to analyze medical documents (pathology reports, NGS/molecular testing results, clinical notes) and provide:
1. Accurate extraction of all relevant clinical and molecular data
2. TCGA molecular classification (POLEmut, MMRd, NSMP, p53abn)
3. Comprehensive risk assessment based on PORTEC-3 and ESGO/ESTRO/ESP guidelines
4. Detailed medical explanations for clinical decision support

TCGA Molecular Classification Guidelines:
- POLEmut: POLE exonuclease domain mutation detected → BEST prognosis (5-year recurrence <5%)
- MMRd: Mismatch repair deficient (MLH1/PMS2 or MSH2/MSH6 loss) OR MSI-High → GOOD prognosis (5-year recurrence ~10-15%)
- p53abn: TP53 mutation/abnormal IHC with intact MMR and wild-type POLE → WORST prognosis (5-year recurrence 30-50%)
- NSMP: No specific molecular profile (no POLE mutation, MMR proficient, p53 wild-type) → INTERMEDIATE prognosis (5-year recurrence ~15-20%)

Classification Priority: POLEmut > MMRd > p53abn > NSMP

Risk Factors to Consider:
- High-risk histology (serous, clear cell, carcinosarcoma)
- Deep myometrial invasion (≥50%)
- LVSI (lymphovascular space invasion)
- High tumor grade (G3)
- Advanced FIGO stage
- Lymph node involvement
- L1CAM positivity
- p53 abnormality

Protective Factors:
- POLE mutation
- Low-grade endometrioid histology
- Superficial invasion (<50%)
- No LVSI
- Early stage (IA)

Always provide evidence-based assessments with clear rationale. When data is missing, note it and explain how it affects the assessment."""


def get_document_analysis_prompt(document_text: str, document_type: str = "unknown") -> str:
    """Generate the prompt for document analysis"""
    return f"""Analyze this medical document and extract all relevant patient data for endometrial cancer risk stratification.

Document Type: {document_type}

DOCUMENT CONTENT:
---
{document_text}
---

Please provide a comprehensive analysis in the following JSON format:
{{
    "patient_data": {{
        "age": <number or null>,
        "gender": "<string or null>",
        "bmi": <number or null>,
        "diabetes": <boolean or null>,
        "ecog_status": <0-4 or null>,
        "stage": "<FIGO stage: IA, IB, II, IIIA, IIIB, IIIC1, IIIC2, IVA, IVB or null>",
        "histology": "<Endometrioid, Serous, Clear Cell, Carcinosarcoma, Mixed, or null>",
        "grade": "<G1, G2, G3 or null>",
        "myometrial_invasion": "<<50% or ≥50% or null>",
        "lvsi": "<Present, Absent, Focal, Substantial or null>",
        "lymph_nodes": "<Negative, Positive, Not Assessed or null>",
        "pole_status": "<Mutated, Wild-type, Not Tested or null>",
        "mmr_status": "<Proficient, Deficient, Not Tested or null>",
        "p53_status": "<Wild-type, Abnormal, Not Tested or null>",
        "l1cam_status": "<Positive, Negative, Not Tested or null>",
        "ctnnb1_status": "<Mutated, Wild-type, Not Tested or null>",
        "msi_status": "<Stable, Unstable or null>",
        "tmb_score": <number (mutations/Mb) or null>,
        "tmb_status": "<Low, High or null>",
        "mlh1_status": "<Intact, Lost or null>",
        "pms2_status": "<Intact, Lost or null>",
        "msh2_status": "<Intact, Lost or null>",
        "msh6_status": "<Intact, Lost or null>",
        "fgfr2_status": "<Mutated, Wild-type or null>",
        "pten_status": "<Mutated, Wild-type or null>",
        "pik3ca_status": "<Mutated, Wild-type or null>",
        "kras_status": "<Mutated, Wild-type or null>",
        "er_percent": <0-100 or null>,
        "pr_percent": <0-100 or null>
    }},
    "molecular_group": "<POLEmut, MMRd, NSMP, p53abn, or Unknown>",
    "molecular_group_confidence": <0.0-1.0>,
    "molecular_rationale": "<detailed explanation of molecular classification>",
    "risk_category": "<LOW, INTERMEDIATE, or HIGH>",
    "risk_score": <0-100>,
    "five_year_recurrence_risk": <0-100>,
    "clinical_summary": "<2-3 sentence summary of the case>",
    "key_findings": ["<finding 1>", "<finding 2>", ...],
    "risk_factors": ["<risk factor 1>", "<risk factor 2>", ...],
    "protective_factors": ["<protective factor 1>", ...],
    "treatment_implications": "<treatment recommendations based on findings>",
    "recommended_surveillance": "<follow-up recommendations>",
    "clinical_trial_eligibility": ["<eligible trial category 1>", ...],
    "detailed_explanation": "<comprehensive medical explanation of the assessment, including rationale for risk score and clinical implications>",
    "extraction_confidence": <0.0-1.0>,
    "missing_critical_data": ["<missing data 1>", ...],
    "warnings": ["<any concerns or caveats>", ...]
}}

Be thorough and precise. Extract ALL available data from the document. If a field is not mentioned, set it to null.
For molecular classification, strictly follow the TCGA hierarchy: POLEmut > MMRd > p53abn > NSMP."""


class AIAgent:
    """AI Agent for medical document analysis"""

    def __init__(self):
        self.anthropic_key = settings.ANTHROPIC_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        self.model = settings.AI_MODEL
        self.max_tokens = settings.AI_MAX_TOKENS

    def _get_provider(self) -> str:
        """Determine which AI provider to use"""
        if self.anthropic_key:
            return "anthropic"
        elif self.openai_key:
            return "openai"
        else:
            raise ValueError("No AI API key configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY in .env")

    async def _call_anthropic(self, system_prompt: str, user_prompt: str, image_data: Optional[str] = None) -> str:
        """Call Anthropic Claude API"""
        headers = {
            "x-api-key": self.anthropic_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }

        # Build message content
        content = []
        if image_data:
            content.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",  # Adjust based on actual type
                    "data": image_data
                }
            })
        content.append({"type": "text", "text": user_prompt})

        payload = {
            "model": self.model,
            "max_tokens": self.max_tokens,
            "system": system_prompt,
            "messages": [{"role": "user", "content": content}]
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            return result["content"][0]["text"]

    async def _call_openai(self, system_prompt: str, user_prompt: str, image_data: Optional[str] = None) -> str:
        """Call OpenAI API"""
        headers = {
            "Authorization": f"Bearer {self.openai_key}",
            "Content-Type": "application/json"
        }

        messages = [
            {"role": "system", "content": system_prompt}
        ]

        if image_data:
            messages.append({
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_data}"}},
                    {"type": "text", "text": user_prompt}
                ]
            })
        else:
            messages.append({"role": "user", "content": user_prompt})

        payload = {
            "model": "gpt-4o",
            "messages": messages,
            "max_tokens": self.max_tokens,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]

    async def analyze_document(
        self,
        document_text: str,
        document_type: str = "unknown",
        image_data: Optional[str] = None
    ) -> MedicalAssessment:
        """
        Analyze a medical document and return comprehensive assessment

        Args:
            document_text: Extracted text from the document
            document_type: Type of document (e.g., "NGS Report", "Pathology Report")
            image_data: Optional base64-encoded image for visual analysis

        Returns:
            MedicalAssessment with extracted data and risk assessment
        """
        provider = self._get_provider()

        user_prompt = get_document_analysis_prompt(document_text, document_type)

        try:
            if provider == "anthropic":
                response = await self._call_anthropic(
                    MEDICAL_AGENT_SYSTEM_PROMPT,
                    user_prompt,
                    image_data
                )
            else:
                response = await self._call_openai(
                    MEDICAL_AGENT_SYSTEM_PROMPT,
                    user_prompt,
                    image_data
                )

            # Parse JSON response
            # Find JSON in the response (it might be wrapped in markdown code blocks)
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                json_str = response[json_start:json_end]
                data = json.loads(json_str)
            else:
                raise ValueError("No JSON found in response")

            # Construct the assessment
            patient_data = ExtractedPatientData(**data.get("patient_data", {}))

            assessment = MedicalAssessment(
                patient_data=patient_data,
                molecular_group=MolecularGroup(data.get("molecular_group", "Unknown")),
                molecular_group_confidence=data.get("molecular_group_confidence", 0.5),
                molecular_rationale=data.get("molecular_rationale", ""),
                risk_category=RiskCategory(data.get("risk_category", "INTERMEDIATE")),
                risk_score=data.get("risk_score", 50),
                five_year_recurrence_risk=data.get("five_year_recurrence_risk", 20),
                clinical_summary=data.get("clinical_summary", ""),
                key_findings=data.get("key_findings", []),
                risk_factors=data.get("risk_factors", []),
                protective_factors=data.get("protective_factors", []),
                treatment_implications=data.get("treatment_implications", ""),
                recommended_surveillance=data.get("recommended_surveillance", ""),
                clinical_trial_eligibility=data.get("clinical_trial_eligibility", []),
                detailed_explanation=data.get("detailed_explanation", ""),
                extraction_confidence=data.get("extraction_confidence", 0.5),
                missing_critical_data=data.get("missing_critical_data", []),
                warnings=data.get("warnings", [])
            )

            return assessment

        except Exception as e:
            logger.error(f"AI analysis failed: {str(e)}")
            raise


# Singleton instance
ai_agent = AIAgent()
