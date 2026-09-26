import json
import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.api.deps import DBSession
from app.models import Farm, Zone
from app.schemas import FarmCreate, FarmRead

router = APIRouter(prefix="/farms", tags=["farms"])


def _with_geojson(stmt):
    """Select Farm rows with the boundary serialized as GeoJSON."""
    return stmt.add_columns(func.ST_AsGeoJSON(Farm.boundary))


def _to_read(row) -> FarmRead:
    farm, geojson = row
    data = {c.name: getattr(farm, c.name) for c in Farm.__table__.columns if c.name != "boundary"}
    data["boundary"] = json.loads(geojson) if geojson else None
    return FarmRead.model_validate(data)


@router.get("", response_model=list[FarmRead])
async def list_farms(
    db: DBSession,
    limit: int = Query(50, le=500),
    offset: int = 0,
    zone_code: str | None = None,
    at_risk: bool | None = None,
) -> list[FarmRead]:
    """List farms with GeoJSON boundaries. For the belt map at scale, prefer
    vector tiles (Martin/pg_tileserv) — this endpoint is for detail views."""
    stmt = select(Farm).order_by(Farm.code).limit(limit).offset(offset)
    if zone_code:
        stmt = stmt.join(Zone, Farm.zone_id == Zone.id).where(Zone.code == zone_code)
    if at_risk is not None:
        stmt = stmt.where(Farm.at_risk.is_(at_risk))
    rows = (await db.execute(_with_geojson(stmt))).all()
    return [_to_read(r) for r in rows]


@router.get("/{farm_id}", response_model=FarmRead)
async def get_farm(farm_id: uuid.UUID, db: DBSession) -> FarmRead:
    stmt = select(Farm).where(Farm.id == farm_id)
    row = (await db.execute(_with_geojson(stmt))).first()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Farm not found")
    return _to_read(row)


@router.post("", response_model=FarmRead, status_code=status.HTTP_201_CREATED)
async def create_farm(payload: FarmCreate, db: DBSession) -> FarmRead:
    data = payload.model_dump()
    boundary = data.pop("boundary")
    farm = Farm(**data, boundary=func.ST_GeogFromGeoJSON(json.dumps(boundary)))
    db.add(farm)
    await db.commit()
    return await get_farm(farm.id, db)
