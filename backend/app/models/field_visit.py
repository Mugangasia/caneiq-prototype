import enum
import uuid
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class VisitStatus(str, enum.Enum):
    QUEUED = "queued"
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class FieldVisit(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """An item on a field officer's queue."""

    __tablename__ = "field_visits"

    purpose: Mapped[str] = mapped_column(Text)
    status: Mapped[VisitStatus] = mapped_column(
        Enum(VisitStatus, native_enum=False), default=VisitStatus.QUEUED, index=True
    )
    scheduled_for: Mapped[date | None] = mapped_column(Date, index=True)

    farmer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmers.id"), index=True)
    farmer = relationship("Farmer", back_populates="visits")

    farm_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("farms.id"))
    farm = relationship("Farm", back_populates="visits")

    officer_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
