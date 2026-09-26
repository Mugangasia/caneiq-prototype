import uuid

from geoalchemy2 import Geography
from sqlalchemy import Boolean, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Farm(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A single cane parcel. Geometry is stored in PostGIS; the frontend
    receives it as GeoJSON (or vector tiles via Martin/pg_tileserv)."""

    __tablename__ = "farms"

    code: Mapped[str] = mapped_column(String(32), unique=True, index=True)  # e.g. "FRM-1001"
    area_ha: Mapped[float] = mapped_column(Float)
    variety: Mapped[str | None] = mapped_column(String(64))
    at_risk: Mapped[bool] = mapped_column(Boolean, default=False, index=True)

    boundary = mapped_column(Geography(geometry_type="POLYGON", srid=4326), nullable=False)

    farmer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmers.id"), index=True)
    farmer = relationship("Farmer", back_populates="farms")

    zone_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("zones.id"), index=True)
    zone = relationship("Zone", back_populates="farms")

    cycles = relationship("CropCycle", back_populates="farm", cascade="all, delete-orphan")
    visits = relationship("FieldVisit", back_populates="farm")
