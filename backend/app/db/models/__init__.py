from app.db.base import Base

# Import all models here so Alembic autogenerate picks them up
from app.db.models.user import User  # noqa: F401
from app.db.models.department import Department  # noqa: F401
from app.db.models.document import Document, document_tags  # noqa: F401
from app.db.models.tag import Tag  # noqa: F401
from app.db.models.ocr_result import OcrResult, AiClassification, AiSummary, Embedding  # noqa: F401
from app.db.models.approval import (  # noqa: F401
    Approval, Comment, Notification, AuditLog,
    SearchHistory, Favorite, DocumentVersion
)

__all__ = [
    "Base",
    "User",
    "Department",
    "Document",
    "document_tags",
    "Tag",
    "OcrResult",
    "AiClassification",
    "AiSummary",
    "Embedding",
    "Approval",
    "Comment",
    "Notification",
    "AuditLog",
    "SearchHistory",
    "Favorite",
    "DocumentVersion",
]
