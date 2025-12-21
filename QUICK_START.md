# OncoRisk EC - Quick Start Guide

## ✅ Installation Complete!

All dependencies have been successfully installed and the ML model has been trained.

---

## 📊 What Was Installed

### Backend
✅ **Python Dependencies Installed:**
- FastAPI 0.115.6 - Web framework
- XGBoost 2.1.3 - ML model
- SHAP 0.46.0 - Explainability
- Pandas 2.2.3, NumPy 2.2.1 - Data processing
- Scikit-learn 1.6.1 - ML utilities
- And 70+ other packages

✅ **Model Training Results:**
- **Synthetic Dataset:** 2,000 patients generated
- **Molecular Distribution:**
  - NSMP: 39.7%
  - MMRd: 28.1%
  - p53abn: 25.1%
  - POLEmut: 7.2%
- **Overall Recurrence Rate:** 28.85%
- **Model Performance:**
  - Training AUC: 0.9629
  - Test AUC: 0.7472
  - Test Accuracy: 73%
- **Model Size:** 498 KB
- **Dataset Size:** 350 KB

### Frontend
✅ **Node.js Dependencies Installed:**
- Next.js 14.2.3
- React 18.3.1
- TypeScript
- Tailwind CSS
- 470+ packages total

---

## 🚀 How to Start the System

### Terminal 1: Start Backend

```bash
cd /home/faris/Desktop/MyWork/AI_Agent/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Backend will start at:** http://localhost:8000
**API Documentation:** http://localhost:8000/api/docs

### Terminal 2: Start Frontend

```bash
cd /home/faris/Desktop/MyWork/AI_Agent/frontend
npm run dev
```

**Frontend will start at:** http://localhost:3000

---

## ✅ Quick Test

Once both servers are running, test the system:

### 1. Test Backend API
Open http://localhost:8000/api/v1/health

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development"
}
```

### 2. Test Interactive API Docs
Open http://localhost:8000/api/docs

Try the `/scenarios` endpoint to see the 4 demo scenarios.

### 3. View Frontend
Open http://localhost:3000

You should see the beautiful landing page.

---

## 🎯 Demo Scenarios Available

The system includes 4 pre-built clinical scenarios:

1. **The Silent Killer** - Stage IA + p53abn → High risk
2. **The False Alarm** - Stage IIIC1 + POLEmut → Low risk
3. **The Grey Zone** - L1CAM differentiation in NSMP
4. **The Immunotherapy Candidate** - MMRd patient

Access via: http://localhost:8000/api/v1/scenarios

---

## 📁 Key Files Created

```
backend/
├── app/ml/model.json (498 KB)           # Trained XGBoost model
├── app/ml/model_metadata.json            # Model metadata
└── app/data/synthetic_patients.csv (350 KB)  # 2000 synthetic patients

frontend/
├── node_modules/ (470 packages)          # All dependencies
└── .env.local                            # Environment config
```

---

## 🔧 Troubleshooting

### Backend won't start
```bash
cd backend
source venv/bin/activate
pip list  # Verify packages installed
python -c "import xgboost; print('XGBoost:', xgboost.__version__)"
```

### Frontend won't start
```bash
cd frontend
npm install  # Reinstall if needed
```

### Port already in use
```bash
# Backend (change port 8000)
uvicorn app.main:app --reload --port 8001

# Frontend (change port 3000)
PORT=3001 npm run dev
```

---

## 📚 Next Steps

1. **Start both servers** (see commands above)
2. **Test the API** at http://localhost:8000/api/docs
3. **View the landing page** at http://localhost:3000
4. **Try demo scenarios** via API
5. **Review PROJECT_STATUS.md** for full capabilities and roadmap

---

## 🎓 Understanding the System

### Model Performance Explained

- **AUC 0.75** means the model can distinguish between recurrence/no-recurrence reasonably well
- **Feature Importance:**
  - p53 status: 41.9% (most important!)
  - Molecular group: 16.1%
  - MMR status: 5.4%
  - POLE status: 4.2%
  - L1CAM status: 4.1%

This matches clinical expectations - p53 abnormality is the strongest predictor of recurrence.

### Synthetic Data Quality

The generated data has realistic distributions matching PORTEC-3 trial:
- Molecular groups match literature (7% POLEmut is correct)
- Recurrence rates by group are clinically accurate
- Stage/grade distributions are realistic

---

## 🏥 For Soroka Presentation

The backend is **fully functional** and can be demoed immediately:

**Option 1: API-Only Demo**
- Use http://localhost:8000/api/docs
- Show real-time predictions
- Demonstrate SHAP explanations
- Run through 4 clinical scenarios

**Option 2: Wait for Frontend Pages** (recommended if time allows)
- Complete assessment form + results visualization
- More impressive for clinical audience
- Estimated 15-20 hours additional development

---

## ✨ You Now Have:

✅ Complete backend with trained ML model
✅ All Python dependencies installed
✅ All frontend dependencies installed
✅ 2,000 synthetic patients with realistic data
✅ XGBoost model trained (Test AUC: 0.75)
✅ 4 demo scenarios ready
✅ Professional landing page
✅ Full API documentation

**The system is operational!** 🎉

---

For more details, see:
- **DEPLOYMENT.md** - Detailed deployment guide
- **PROJECT_STATUS.md** - Complete project status and roadmap
- **README.md** - Project overview

---

**Built with Claude Code** | **December 19, 2025**
