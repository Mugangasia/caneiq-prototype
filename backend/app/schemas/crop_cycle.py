import uuid
from datetime import date

from app.models.crop_cycle import CropStage
from app.schemas.common import ORMModel


class CropCycleRead(ORMModel):
    id: uuid.UUID
    label: str
    ratoon_number: int
    stage: CropStage
    planted_on: date | None
    expected_harvest: date | None
    farm_id: uuid.UUID


class CropCycleCreate(ORMModel):
    label: str
    ratoon_number: int = 0
    stage: CropStage = CropStage.ESTABLISHMENT
    planted_on: date | None = None
    expected_harvest: date | None = None
    farm_id: uuid.UUID
