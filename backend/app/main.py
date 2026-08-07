from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("🚇 KMRL IntelliDocs starting up...")

    # Ensure MinIO bucket exists
    try:
        from app.services.storage_service import StorageService
        storage = StorageService()
        storage.ensure_bucket_exists()
        logger.info("✅ MinIO bucket ready")
    except Exception as e:
        logger.warning(f"⚠️  MinIO not available: {e}")

    # Test ChromaDB connection
    try:
        from app.services.search_service import SearchService
        search = SearchService()
        search.get_or_create_collection()
        logger.info("✅ ChromaDB connected")
    except Exception as e:
        logger.warning(f"⚠️  ChromaDB not available: {e}")

    yield

    logger.info("🛑 KMRL IntelliDocs shutting down...")


def create_application() -> FastAPI:
    app = FastAPI(
        title="KMRL IntelliDocs API",
        description="AI-Powered Document Management System for Kochi Metro Rail Limited",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Global exception handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "message": str(exc)},
        )

    # Health check
    @app.get("/health", tags=["Health"])
    async def health_check():
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": "1.0.0",
            "environment": settings.ENVIRONMENT,
        }

    # Register routers
    from app.api.v1 import auth, documents, upload, ocr, classification, summarization, search, chat, approvals, analytics, notifications, users, departments, settings as settings_router

    prefix = f"/api/{settings.API_VERSION}"
    app.include_router(auth.router, prefix=prefix, tags=["Authentication"])
    app.include_router(documents.router, prefix=prefix, tags=["Documents"])
    app.include_router(upload.router, prefix=prefix, tags=["Upload"])
    app.include_router(ocr.router, prefix=prefix, tags=["OCR"])
    app.include_router(classification.router, prefix=prefix, tags=["Classification"])
    app.include_router(summarization.router, prefix=prefix, tags=["Summarization"])
    app.include_router(search.router, prefix=prefix, tags=["Search"])
    app.include_router(chat.router, prefix=prefix, tags=["AI Chat"])
    app.include_router(approvals.router, prefix=prefix, tags=["Approvals"])
    app.include_router(analytics.router, prefix=prefix, tags=["Analytics"])
    app.include_router(notifications.router, prefix=prefix, tags=["Notifications"])
    app.include_router(users.router, prefix=prefix, tags=["Users"])
    app.include_router(departments.router, prefix=prefix, tags=["Departments"])
    app.include_router(settings_router.router, prefix=prefix, tags=["Settings"])

    return app


app = create_application()
