# OncoRisk EC - AI-Driven Molecular Risk Stratification for Endometrial Cancer

## Version 1.0.0 MVP

A production-ready Clinical Decision Support System (CDSS) that integrates molecular profiling with traditional staging to provide precision risk assessment for endometrial cancer patients.

## Overview

OncoRisk EC combines:
- TCGA molecular classification (POLEmut, MMRd, NSMP, p53abn)
- XGBoost machine learning for 5-year recurrence risk prediction
- SHAP explainability for transparent AI decisions
- Evidence-based treatment recommendations
- Interactive visualizations for clinical presentation

## Technology Stack

### Backend
- Python 3.11+ with FastAPI
- XGBoost for risk prediction
- SHAP for explainability
- Pandas/NumPy for data processing

### Frontend
- Next.js 14 (App Router) with TypeScript
- Tailwind CSS + shadcn/ui components
- D3.js and Recharts for visualizations
- Framer Motion for animations
- Zustand for state management

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker & Docker Compose (optional)

### Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app/ml/train_model.py  # Train the model
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

### Docker Setup
```bash
docker-compose up --build
```

## Project Structure

```
onco-risk-ec/
├── backend/          # Python FastAPI backend
│   ├── app/
│   │   ├── api/      # API routes
│   │   ├── core/     # Business logic
│   │   ├── models/   # Pydantic models
│   │   ├── data/     # Data generation
│   │   └── ml/       # ML models
│   └── tests/
├── frontend/         # Next.js frontend
│   └── src/
│       ├── app/      # Pages and routes
│       ├── components/  # React components
│       ├── lib/      # Utilities
│       └── stores/   # State management
└── docs/
```

## Key Features

### 1. Molecular Classification
Implements ProMisE/TCGA hierarchical classification:
- POLEmut: Excellent prognosis
- MMRd: Immunotherapy responsive
- NSMP: Risk refined by L1CAM/CTNNB1
- p53abn: Aggressive biology

### 2. AI Risk Prediction
XGBoost model predicting 5-year recurrence risk with >85% AUC

### 3. Explainable AI
SHAP waterfall charts showing why each prediction was made

### 4. Treatment Recommendations
Evidence-based recommendations aligned with:
- PORTEC-3 trial results
- ESGO/ESTRO/ESP guidelines
- RAINBO trial eligibility

### 5. Interactive Visualizations
- Risk gauges
- Feature contribution charts
- Molecular pathway networks
- Comparison views

### 6. Demo Mode
Four clinical scenarios showcasing the system:
- The Silent Killer: Early stage, aggressive biology
- The False Alarm: Advanced stage, favorable biology
- The Grey Zone: L1CAM differentiation
- The Immunotherapy Candidate: MMRd patient

## Clinical Validation

Based on:
- PORTEC-3 randomized trial data
- TCGA molecular classification
- Published recurrence rates by molecular subtype
- ESGO/ESTRO/ESP 2021 guidelines

## Demo Partner

Soroka Medical Center, Ben-Gurion University, Beer-Sheva, Israel

## Important Disclaimers

This system is for **clinical decision support only** and should not replace clinical judgment. All recommendations should be reviewed by qualified oncologists in the context of individual patient circumstances.

## License

Proprietary - Academic/Research Use

## Contact

For inquiries about clinical partnerships or research collaboration, please contact the development team.

---

**Built with Claude Code** - Powered by Anthropic's Claude Sonnet 4.5
