from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_JWT_SECRET: str  # Project Settings → API → JWT Settings → JWT Secret

    class Config:
        env_file = ".env"

settings = Settings()