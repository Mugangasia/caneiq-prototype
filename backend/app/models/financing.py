import enum
import uuid
from datetime import date

from sqlalchemy import Date, Enum, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class FinanceStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    DISBURSED = "disbursed"
    REJECTED = "rejected"


class FinancingApplication(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Input-credit / loan application scored against farm + cycle data."""

    __tablename__ = "financing_applications"

    product: Mapped[str] = mapped_column(String(128))  # e.g. "Input credit — NPK topdress"
    amount_kes: Mapped[float] = mapped_column(Float)
    status: Mapped[FinanceStatus] = mapped_column(
        Enum(FinanceStatus, native_enum=False), default=FinanceStatus.DRAFT, index=True
    )
    submitted_on: Mapped[date | None] = mapped_column(Date)

    farmer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmers.id"), index=True)
    farmer = relationship("Farmer", back_populates="financing_applications")
