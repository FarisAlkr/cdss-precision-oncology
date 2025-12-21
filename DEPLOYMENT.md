# OncoRisk EC - Deployment and Setup Guide

## Quick Start Guide

This guide will help you set up and run the complete OncoRisk EC system locally for development and demo purposes.

## Prerequisites

### Required Software
- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Node.js 20+** ([Download](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **Git** (for version control)

### Optional (for Docker deployment)
- **Docker** and **Docker Compose** ([Download](https://www.docker.com/products/docker-desktop/))

---

## Option 1: Local Development Setup (Recommended for Development)

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Generate synthetic data and train model
python app/ml/train_model.py

# This will:
# - Generate 2000 synthetic patients with realistic data
# - Train XGBoost model (takes ~2-5 minutes)
# - Save model to app/ml/model.json
# - Print training metrics (AUC, Brier score, etc.)

# Start FastAPI server
uvicorn app.main:app --reload --port 8000

# Server will start at http://localhost:8000
# API docs available at http://localhost:8000/api/docs
```

**Expected Output:**
```
Generating 2000 synthetic patients...
=== Molecular Group Distribution ===
NSMP        0.40
MMRd        0.28
p53abn      0.25
POLEmut     0.07

=== Training XGBoost Model ===
Training AUC: 0.9234
Test AUC: 0.8876
Test Brier Score: 0.1123

Model saved to: /path/to/app/ml/model.json
```

### Step 2: Frontend Setup

Open a **NEW terminal window** and keep the backend running:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will start at http://localhost:3000
```

### Step 3: Access the Application

Open your browser and navigate to:
- **Frontend UI:** http://localhost:3000
- **Backend API Docs:** http://localhost:8000/api/docs
- **Health Check:** http://localhost:8000/api/v1/health

---

## Option 2: Docker Deployment (Simplified)

### Step 1: Build and Run with Docker Compose

```bash
# From project root directory
docker-compose up --build

# This will:
# - Build backend image and install dependencies
# - Build frontend image and install dependencies
# - Train ML model on first run
# - Start both services

# Access:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
```

### Stop Docker Containers

```bash
docker-compose down
```

---

## Troubleshooting

### Backend Issues

#### Issue: "Model not found" error
**Solution:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app/ml/train_model.py
```

#### Issue: Import errors or missing packages
**Solution:**
```bash
cd backend
pip install -r requirements.txt --upgrade
```

#### Issue: Port 8000 already in use
**Solution:**
```bash
# Find and kill process using port 8000
# On macOS/Linux:
lsof -ti:8000 | xargs kill -9
# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or change port:
uvicorn app.main:app --reload --port 8001
# Update NEXT_PUBLIC_API_URL in frontend/.env to http://localhost:8001/api/v1
```

### Frontend Issues

#### Issue: "Cannot connect to backend" error
**Solution:**
1. Ensure backend is running at http://localhost:8000
2. Check `frontend/.env` or `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
3. Restart frontend server

#### Issue: Port 3000 already in use
**Solution:**
```bash
# Frontend will automatically suggest alternative port
# Or manually specify:
PORT=3001 npm run dev
```

#### Issue: Module not found errors
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## Testing the System

### 1. Health Check

```bash
# Test backend
curl http://localhost:8000/api/v1/health

# Expected response:
# {"status":"healthy","version":"1.0.0","environment":"development"}
```

### 2. Test Prediction API

```bash
# Test prediction endpoint
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 64,
    "bmi": 32.5,
    "diabetes": false,
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
    "ctnnb1_status": "Wild-type"
  }'
```

### 3. Access Demo Scenarios

Navigate to http://localhost:3000/demo to see 4 pre-built clinical scenarios:
1. **The Silent Killer** - Early stage with aggressive biology
2. **The False Alarm** - Advanced stage with favorable biology
3. **The Grey Zone** - L1CAM differentiation in NSMP
4. **The Immunotherapy Candidate** - MMRd patient

---

## Project Structure Overview

```
onco-risk-ec/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/routes/     # API endpoints
│   │   ├── core/           # Business logic (classifier, risk engine, explainer)
│   │   ├── models/         # Pydantic models
│   │   ├── data/           # Data generation and scenarios
│   │   └── ml/             # ML model training
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities, API client, types
│   │   └── stores/        # Zustand state management
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Health check |
| `/api/v1/predict` | POST | Predict 5-year recurrence risk |
| `/api/v1/explain` | POST | Get SHAP explanation |
| `/api/v1/report` | POST | Generate clinical report |
| `/api/v1/scenarios` | GET | List demo scenarios |
| `/api/v1/scenarios/{id}` | GET | Get specific scenario |
| `/api/docs` | GET | Interactive API documentation |

---

## Performance Expectations

### Model Training (First Run)
- **Time:** 2-5 minutes
- **Dataset:** 2000 synthetic patients
- **Expected AUC:** >0.85
- **Output:** `app/ml/model.json` (~500KB)

### API Response Times
- **Prediction:** <200ms
- **SHAP Explanation:** <500ms
- **Full Report:** <1s

### System Requirements
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 500MB for dependencies + data
- **CPU:** Any modern CPU (model is lightweight)

---

## For Soroka Medical Center Presentation

### Pre-Presentation Checklist

1. ✅ Train model: `python app/ml/train_model.py`
2. ✅ Start backend: `uvicorn app.main:app --reload`
3. ✅ Start frontend: `npm run dev`
4. ✅ Test health: http://localhost:8000/api/v1/health
5. ✅ Load demo page: http://localhost:3000/demo
6. ✅ Test all 4 scenarios

### Demo Flow Recommendation

1. **Introduction** (2 min)
   - Show landing page
   - Explain problem statement

2. **Scenario 1: Silent Killer** (5 min)
   - Demonstrate early stage + aggressive biology
   - Show how p53abn overrides favorable staging
   - Highlight SHAP explanation
   - Show treatment recommendation change

3. **Scenario 2: False Alarm** (5 min)
   - Demonstrate advanced stage + favorable biology
   - Show POLEmut de-escalation opportunity
   - Emphasize avoiding unnecessary toxicity

4. **Scenario 3: Grey Zone** (3 min)
   - Show L1CAM differentiation within NSMP
   - Demonstrate biomarker-driven refinement

5. **Scenario 4: Immunotherapy Candidate** (3 min)
   - Show MMRd identification
   - Highlight checkpoint inhibitor eligibility

6. **Q&A and Discussion** (12 min)

---

## Next Steps / Roadmap

### For Production Deployment

1. **Database Integration**
   - Replace synthetic data with PostgreSQL
   - Add patient data persistence
   - Implement audit logging

2. **Security Enhancements**
   - Add authentication (OAuth2/JWT)
   - Implement RBAC (Role-Based Access Control)
   - HIPAA compliance measures
   - Data encryption at rest and in transit

3. **Clinical Integration**
   - HL7 FHIR API integration
   - EHR system connectors
   - PACS/LIS integration for imaging and lab data

4. **Advanced Features**
   - Batch processing for multiple patients
   - Historical trend analysis
   - Survival curve predictions
   - Prospective validation tracking

5. **Deployment Infrastructure**
   - Kubernetes orchestration
   - Load balancing
   - Monitoring (Prometheus/Grafana)
   - CI/CD pipeline

---

## Support and Contact

For issues, questions, or clinical partnership inquiries:
- **GitHub Issues:** [Repository URL]
- **Email:** [Contact Email]
- **Demo Partner:** Soroka Medical Center, Ben-Gurion University, Israel

---

## License and Disclaimer

**License:** Proprietary - Academic/Research Use

**Important Disclaimer:**
This system is for **clinical decision support only** and should not replace clinical judgment. All recommendations should be reviewed by qualified oncologists in the context of individual patient circumstances. This is a research prototype and not FDA-approved for clinical use.

---

## Acknowledgments

- **PORTEC-3 Trial Team** - For molecular profiling data
- **TCGA Research Network** - For molecular classification
- **ESGO/ESTRO/ESP** - For clinical guidelines
- **RAINBO Trial Consortium** - For ongoing research
- **Soroka Medical Center** - For clinical partnership

---

Built with **Claude Code** | Powered by **Claude Sonnet 4.5**
