import uuid
from typing import Any

from pydantic import Field

from app.schemas.common import ORMModel


class FarmRead(ORMModel):
    """Farm as served to the frontend map. `boundary` is a GeoJSON polygon
    produced with ST_AsGeoJSON. For the full belt (4,000+ polygons), serve
    vector tiles via Martin/pg_tileserv instead of this endpoint."""

    id: uuid.UUID
    code: str
    area_ha: float
    variety: str | None
    at_risk: bool
    farmer_id: uuid.UUID
    zone_id: uuid.UUID | None
    boundary: dict[str, Any] | None = Field(default=None)


class FarmCreate(ORMModel):
    code: str
    area_ha: float
    variety: str | None = None
    farmer_id: uuid.UUID
    zone_id: uuid.UUID | None = None
    boundary: dict[str, Any]  # GeoJSON polygon
