import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CodeTwin AI"
    API_V1_STR: str = "/api/v1"
    
    # Secret Key for JWT Signing
    SECRET_KEY: str = "codetwin_super_secret_jwt_key_2026_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database Configuration (PostgreSQL Async)
    POSTGRES_USER: str = "codetwin"
    POSTGRES_PASSWORD: str = "codetwin_secret"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "codetwin_db"
    
    # Fallback to SQLite async if Postgres is not yet reachable in dev mode
    USE_SQLITE_FALLBACK: bool = True
    SQLITE_DB_FILE: str = "codetwin.db"
    
    @property
    def ASYNC_DATABASE_URI(self) -> str:
        # Check if environment override exists
        env_db_url = os.getenv("DATABASE_URL")
        if env_db_url:
            if env_db_url.startswith("postgresql://"):
                return env_db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
            return env_db_url
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def SQLITE_ASYNC_URI(self) -> str:
        return f"sqlite+aiosqlite:///{self.SQLITE_DB_FILE}"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
