from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "KMRL IntelliDocs"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    API_VERSION: str = "v1"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/kmrl_intellidocs"

    # JWT
    SECRET_KEY: str = "kmrl-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin123"
    MINIO_BUCKET: str = "kmrl-documents"
    MINIO_SECURE: bool = False
    MINIO_REGION: str = "ap-south-1"

    # ChromaDB
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8001
    CHROMA_COLLECTION_NAME: str = "kmrl_documents"

    # Ollama
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"
    OLLAMA_EMBED_MODEL: str = "nomic-embed-text"
    OLLAMA_TIMEOUT: int = 120

    # Google Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # AI Config
    USE_OLLAMA: bool = True
    USE_GEMINI_FALLBACK: bool = True
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    MAX_CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    MAX_CONTEXT_DOCS: int = 5

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = 50

    # OCR
    OCR_LANGUAGES: str = "en,ml"
    OCR_USE_GPU: bool = False

    # Seed
    SEED_DATABASE: bool = True
    DEMO_ADMIN_EMAIL: str = "admin@kmrl.in"
    DEMO_ADMIN_PASSWORD: str = "Admin@123456"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
