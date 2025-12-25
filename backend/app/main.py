"""
OncoRisk EC - Main FastAPI Application

AI-Driven Molecular Risk Stratification for Endometrial Cancer
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import settings
from app.api.routes import prediction, explanation, reports, scenarios, document

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="""
    OncoRisk EC: AI-Driven Molecular Risk Stratification for Endometrial Cancer

    This Clinical Decision Support System integrates molecular profiling with traditional staging
    to provide precision risk assessment for endometrial cancer patients.

    Key Features:
    - TCGA molecular classification (POLEmut, MMRd, NSMP, p53abn)
    - XGBoost-based 5-year recurrence risk prediction
    - SHAP explainability for transparent AI decisions
    - Evidence-based treatment recommendations
    - Clinical trial matching

    Based on PORTEC-3 trial data and ESGO/ESTRO/ESP guidelines.
    """,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info("Loading ML model and initializing SHAP explainer...")
    # Model loading will happen in the routes/dependencies


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "OncoRisk EC API",
        "version": settings.VERSION,
        "status": "operational",
        "docs": "/api/docs",
    }


@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


# Include routers
app.include_router(prediction.router, prefix="/api/v1", tags=["Prediction"])
app.include_router(explanation.router, prefix="/api/v1", tags=["Explanation"])
app.include_router(reports.router, prefix="/api/v1", tags=["Reports"])
app.include_router(scenarios.router, prefix="/api/v1", tags=["Demo Scenarios"])
app.include_router(document.router, prefix="/api/v1", tags=["Document Analysis"])


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Global exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.ENVIRONMENT == "development" else "An error occurred",
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=settings.ENVIRONMENT == "development",
    )
