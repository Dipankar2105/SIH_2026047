import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AarogyaFlow Track B Backend"
    app_version: str = "1.0.0"
    environment: str = "development"

    database_url: str

    api_prefix: str = "/api/v1"

    # Voice / confidence settings
    low_confidence_threshold: float = 0.65

    # Supabase
    supabase_url: str | None = None
    supabase_anon_key: str | None = None
    supabase_service_role_key: str | None = None

    # Gemini
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-3.6-flash"

    # Hugging Face cache settings (D: drive)
    hf_home: str = r"D:\HuggingFace"
    hf_hub_cache: str = r"D:\HuggingFace\hub"
    transformers_cache: str = r"D:\HuggingFace\transformers"

    # External Hosted OCR Microservice URL
    ocr_service_url: str | None = "http://localhost:8001/api/ocr"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()

# Ensure Hugging Face cache environment variables point to D: drive
os.environ.setdefault("HF_HOME", settings.hf_home)
os.environ.setdefault("HF_HUB_CACHE", settings.hf_hub_cache)
os.environ.setdefault("TRANSFORMERS_CACHE", settings.transformers_cache)

