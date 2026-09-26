from geoalchemy2 import Geography
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Zone(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A named zone of the cane belt (e.g. 'Zone 1 — Mumias North')."""

    __tablename__ = "zones"

    code: Mapped[str] = mapped_column(String(16), unique=True, index=True)  # e.g. "Z1"
    label: Mapped[str] = mapped_column(String(200))
    boundary = mapped_column(Geography(geometry_type="POLYGON", srid=4326), nullable=True)

    farms = relationship("Farm", back_populates="zone")
