import uuid

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Page(BaseModel):
    total: int
    limit: int = 50
    offset: int = 0


class IdResponse(ORMModel):
    id: uuid.UUID
