from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Medikiosk"
    ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # Database Settings
    DATABASE_URL: str = "sqlite:///./medikiosk.db"

    # Security Settings
    SECRET_KEY: str = "medikiosk-secret-key-change-in-production-super-secret-key-32bytes"
    ENCRYPTION_KEY: str = "gAAAAABlX1234567890abcdefghijklmnopqrstuvwxyz="
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    # ABDM Settings
    ABDM_CLIENT_ID: Optional[str] = "mock_abdm_client_id"
    ABDM_CLIENT_SECRET: Optional[str] = "mock_abdm_client_secret"
    ABDM_BASE_URL: str = "https://dev.abdm.gov.in/gateway"

    # External AI Services
    OPENAI_API_KEY: Optional[str] = None
    OCR_API_KEY: Optional[str] = None
    ASR_SERVICE_URL: str = "http://localhost:8001/asr"
    TTS_SERVICE_URL: str = "http://localhost:8001/tts"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
