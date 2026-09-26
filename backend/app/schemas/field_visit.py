import uuid
from datetime import date

from app.models.field_visit import VisitStatus
from app.schemas.common import ORMModel


class FieldVisitRead(ORMModel):
    id: uuid.UUID
    purpose: str
    status: VisitStatus
    scheduled_for: date | None
    farmer_id: uuid.UUID
    farm_id: uuid.UUID | None
    officer_id: uuid.UUID | None


class FieldVisitCreate(ORMModel):
    purpose: str
    scheduled_for: date | None = None
    farmer_id: uuid.UUID
    farm_id: uuid.UUID | None = None
    officer_id: uuid.UUID | None = None
