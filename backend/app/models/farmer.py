import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Farmer(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "farmers"

    full_name: Mapped[str] = mapped_column(String(200), index=True)
    phone: Mapped[str | None] = mapped_column(String(32))
    national_id: Mapped[str | None] = mapped_column(String(32), unique=True)

    cooperative_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cooperatives.id"), index=True
    )
    cooperative = relationship("Cooperative", back_populates="farmers")

    farms = relationship("Farm", back_populates="farmer", cascade="all, delete-orphan")
    visits = relationship("FieldVisit", back_populates="farmer")
    financing_applications = relationship("FinancingApplication", back_populates="farmer")
