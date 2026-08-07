from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, DateTime, Text, Float, Integer, ForeignKey, JSON, UUID as SA_UUID
from sqlalchemy.sql import func
import uuid
from typing import Optional, List, TYPE_CHECKING

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.models.document import Document
    from app.db.models.approval import Approval
    from app.db.models.notification import Notification
    from app.db.models.comment import Comment
    from app.db.models.audit_log import AuditLog
    from app.db.models.search_history import SearchHistory
    from app.db.models.favorite import Favorite
    from app.db.models.department import Department


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(SA_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="employee", nullable=False)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(SA_UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    department: Mapped[Optional["Department"]] = relationship("Department", back_populates="members", foreign_keys=[department_id])
    documents: Mapped[List["Document"]] = relationship("Document", back_populates="uploader", foreign_keys="Document.uploader_id")
    approvals_given: Mapped[List["Approval"]] = relationship("Approval", back_populates="approver", foreign_keys="Approval.approver_id")
    approvals_requested: Mapped[List["Approval"]] = relationship("Approval", back_populates="requester", foreign_keys="Approval.requester_id")
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user")
    comments: Mapped[List["Comment"]] = relationship("Comment", back_populates="user")
    audit_logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="user")
    search_history: Mapped[List["SearchHistory"]] = relationship("SearchHistory", back_populates="user")
    favorites: Mapped[List["Favorite"]] = relationship("Favorite", back_populates="user")

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role})>"
