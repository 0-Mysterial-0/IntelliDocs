import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, Boolean, DateTime, Float, ForeignKey, BigInteger, Table, Column, UUID as SA_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.models.user import User
    from app.db.models.department import Department
    from app.db.models.tag import Tag
    from app.db.models.approval import Approval
    from app.db.models.comment import Comment
    from app.db.models.ocr_result import OcrResult
    from app.db.models.ai_classification import AiClassification
    from app.db.models.ai_summary import AiSummary
    from app.db.models.embedding import Embedding
    from app.db.models.document_version import DocumentVersion
    from app.db.models.favorite import Favorite


# Association table for document <-> tag many-to-many
document_tags = Table(
    "document_tags",
    Base.metadata,
    Column("document_id", SA_UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", SA_UUID(as_uuid=True), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(SA_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    filename: Mapped[str] = mapped_column(String(500), nullable=False)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    file_size: Mapped[int] = mapped_column(BigInteger, default=0)
    mime_type: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(SA_UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    uploader_id: Mapped[uuid.UUID] = mapped_column(SA_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="draft")
    priority: Mapped[str] = mapped_column(String(50), default="medium")
    version: Mapped[int] = mapped_column(Integer, default=1)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ocr_status: Mapped[str] = mapped_column(String(50), default="pending")
    ai_status: Mapped[str] = mapped_column(String(50), default="pending")
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    uploader: Mapped["User"] = relationship("User", back_populates="documents", foreign_keys=[uploader_id])
    department: Mapped[Optional["Department"]] = relationship("Department", back_populates="documents")
    tags: Mapped[List["Tag"]] = relationship("Tag", secondary=document_tags, back_populates="documents")
    approvals: Mapped[List["Approval"]] = relationship("Approval", back_populates="document", cascade="all, delete-orphan")
    comments: Mapped[List["Comment"]] = relationship("Comment", back_populates="document", cascade="all, delete-orphan")
    ocr_result: Mapped[Optional["OcrResult"]] = relationship("OcrResult", back_populates="document", uselist=False, cascade="all, delete-orphan")
    ai_classification: Mapped[Optional["AiClassification"]] = relationship("AiClassification", back_populates="document", uselist=False, cascade="all, delete-orphan")
    ai_summary: Mapped[Optional["AiSummary"]] = relationship("AiSummary", back_populates="document", uselist=False, cascade="all, delete-orphan")
    embeddings: Mapped[List["Embedding"]] = relationship("Embedding", back_populates="document", cascade="all, delete-orphan")
    versions: Mapped[List["DocumentVersion"]] = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")
    favorites: Mapped[List["Favorite"]] = relationship("Favorite", back_populates="document", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Document {self.title} ({self.status})>"
