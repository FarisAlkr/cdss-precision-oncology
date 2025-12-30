"""
Configuration Module for OncoRisk EC Backend
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    """Application settings"""

    # Application
    APP_NAME: str = "OncoRisk EC API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    # Server
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    # CORS - Allow Vercel domains and localhost
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://frontend-seven-henna-16.vercel.app",
        "https://*.vercel.app",
    ]

    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MODEL_PATH: str = os.path.join(BASE_DIR, "app", "ml", "model.json")
    SYNTHETIC_DATA_PATH: str = os.path.join(BASE_DIR, "app", "data", "synthetic_patients.csv")

    # Data Generation
    N_SYNTHETIC_PATIENTS: int = 2000
    RANDOM_SEED: int = 42

    # Model
    SHAP_SAMPLE_SIZE: int = 100  # Number of background samples for SHAP

    # Logging
    LOG_LEVEL: str = "INFO"

    # AI Agent Configuration
    ANTHROPIC_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    AI_MODEL: str = "claude-sonnet-4-20250514"  # Default to Claude Sonnet
    AI_MAX_TOKENS: int = 4096

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
