from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_JWT_SECRET: str
    ABDM_ENV: str
    ABDM_BASE_URL: str
    ABDM_ABHA_BASE_URL: str
    ABDM_CLIENT_ID: str
    ABDM_CLIENT_SECRET: str
    ABDM_MOCK_MODE: str
    OCR_SERVICE_URL: str
    GEMINI_API_KEY: str
    GROQ_API_KEY: str
    NTFY_BASE_URL: str
    SUPABASE_STORAGE_BUCKET: str

settings = Settings()
