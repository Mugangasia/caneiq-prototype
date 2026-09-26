import enum
import uuid
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class CropStage(str, enum.Enum):
    ESTABLISHMENT = "establishment"
    TILLERING = "tillering"
    GRAND_GROWTH = "grandgrowth"
    MATURATION = "maturation"
    HARVEST = "harvest"


class CropCycle(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """One growing cycle of a farm (plant cane or a ratoon)."""

    __tablename__ = "crop_cycles"

    label: Mapped[str] = mapped_column(String(32))  # e.g. "Plant cane", "Ratoon 2"
    ratoon_number: Mapped[int] = mapped_column(Integer, default=0)
    stage: Mapped[CropStage] = mapped_column(Enum(CropStage, native_enum=False), index=True)
    planted_on: Mapped[date | None] = mapped_column(Date)
    expected_harvest: Mapped[date | None] = mapped_column(Date, index=True)

    farm_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farms.id"), index=True)
    farm = relationship("Farm", back_populates="cycles")

    activities = relationship("Activity", back_populates="cycle", cascade="all, delete-orphan")
