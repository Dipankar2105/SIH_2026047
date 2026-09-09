from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


# Always resolve .env relative to the backend directory.
# This makes configuration work whether commands are run from
# the project root or from the backend directory.
BACKEND_DIR = Path(__file__).resolve().parents[1]
ENV_FILE = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    app_name: str = "AarogyaFlow Track B Backend"
    app_version: str = "1.0.0"
    environment: str = "development"

    database_url: str

    api_prefix: str = "/api/v1"

    low_confidence_threshold: float = 0.65

    supabase_url: str | None = None
    supabase_anon_key: str | None = None
    supabase_service_role_key: str | None = None

    gemini_api_key: str | None = None
    gemini_model: str = "gemini-3.6-flash"

    ocr_service_url: str | None = None

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
