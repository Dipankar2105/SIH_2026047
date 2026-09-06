from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_JWT_SECRET: str

    # Environment
    ENVIRONMENT: str = "development"

    # ABDM
    ABDM_MOCK_MODE: bool = True
    ABDM_ENV: str = "sandbox"
    ABDM_BASE_URL: str = "https://dev.abdm.gov.in"
    ABDM_ABHA_BASE_URL: str = "https://abhasbx.abdm.gov.in/abha/api"
    ABDM_CLIENT_ID: str
    ABDM_CLIENT_SECRET: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()  # type: ignore[call-arg]