import enum
import uuid

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Role(str, enum.Enum):
    FARMER = "farmer"
    FIELD_OFFICER = "field_officer"
    AGRONOMIST = "agronomist"
    COOP_MANAGER = "coop_manager"
    MILL = "mill"
    FINANCIER = "financier"
    ADMIN = "admin"


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(200))
    phone: Mapped[str | None] = mapped_column(String(32))
    role: Mapped[Role] = mapped_column(Enum(Role, native_enum=False), index=True)
    # Keycloak subject id, once IAM is wired up
    external_auth_id: Mapped[str | None] = mapped_column(String(128), unique=True)

    cooperative_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cooperatives.id")
    )
    cooperative = relationship("Cooperative", back_populates="members")
