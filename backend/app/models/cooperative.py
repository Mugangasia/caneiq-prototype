from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Cooperative(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "cooperatives"

    name: Mapped[str] = mapped_column(String(200), unique=True)

    members = relationship("User", back_populates="cooperative")
    farmers = relationship("Farmer", back_populates="cooperative")
