# backend/app/core/config.py
from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Application Settings
    APP_NAME: str = "Smart Academic Portal"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smart_portal.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "mystic-coders-secret-key-2024")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000"
    ]
    
    # Model Settings
    MODEL_PATH: str = "./ml_models/saved_models"
    USE_GPU: bool = False
    BATCH_SIZE: int = 32
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "./data/uploads"
    
    class Config:
        env_file = ".env"

settings = Settings()