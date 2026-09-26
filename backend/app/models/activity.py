import enum
import uuid
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ActivityStatus(str, enum.Enum):
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class Activity(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """An agronomic activity on a cycle (planting, fertilizing, scouting...).

    Records created offline by field officers sync in via PowerSync/ElectricSQL.
    Photos and receipts live in S3-compatible storage, referenced by URL."""

    __tablename__ = "activities"

    kind: Mapped[str] = mapped_column(String(64), index=True)  # e.g. "fertilizer_topdress"
    status: Mapped[ActivityStatus] = mapped_column(
        Enum(ActivityStatus, native_enum=False), default=ActivityStatus.PLANNED, index=True
    )
    due_date: Mapped[date | None] = mapped_column(Date, index=True)
    completed_on: Mapped[date | None] = mapped_column(Date)
    notes: Mapped[str | None] = mapped_column(Text)
    attachment_url: Mapped[str | None] = mapped_column(String(512))

    cycle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("crop_cycles.id"), index=True)
    cycle = relationship("CropCycle", back_populates="activities")

    recorded_by_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
