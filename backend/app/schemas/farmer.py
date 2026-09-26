import uuid

from app.schemas.common import ORMModel


class CooperativeRead(ORMModel):
    id: uuid.UUID
    name: str


class FarmerRead(ORMModel):
    id: uuid.UUID
    full_name: str
    phone: str | None
    cooperative_id: uuid.UUID | None


class FarmerCreate(ORMModel):
    full_name: str
    phone: str | None = None
    national_id: str | None = None
    cooperative_id: uuid.UUID | None = None
