import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Text, DateTime, ForeignKey, UUID as SA_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.models.user import User
    from app.db.models.document import Document


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[uuid.UUID] = mapped_column(SA_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    head_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(SA_UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    color: Mapped[str] = mapped_column(String(7), default="#6366f1")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    members: Mapped[List["User"]] = relationship("User", back_populates="department", foreign_keys="User.department_id")
    documents: Mapped[List["Document"]] = relationship("Document", back_populates="department")

    def __repr__(self) -> str:
        return f"<Department {self.name} ({self.code})>"
