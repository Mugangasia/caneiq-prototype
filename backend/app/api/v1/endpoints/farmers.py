import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select

from app.api.deps import DBSession
from app.models import Farmer
from app.schemas import FarmerCreate, FarmerRead

router = APIRouter(prefix="/farmers", tags=["farmers"])


@router.get("", response_model=list[FarmerRead])
async def list_farmers(
    db: DBSession,
    limit: int = Query(50, le=200),
    offset: int = 0,
    search: str | None = None,
) -> list[Farmer]:
    stmt = select(Farmer).order_by(Farmer.full_name).limit(limit).offset(offset)
    if search:
        stmt = stmt.where(Farmer.full_name.ilike(f"%{search}%"))
    return list((await db.scalars(stmt)).all())


@router.get("/{farmer_id}", response_model=FarmerRead)
async def get_farmer(farmer_id: uuid.UUID, db: DBSession) -> Farmer:
    farmer = await db.get(Farmer, farmer_id)
    if farmer is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Farmer not found")
    return farmer


@router.post("", response_model=FarmerRead, status_code=status.HTTP_201_CREATED)
async def create_farmer(payload: FarmerCreate, db: DBSession) -> Farmer:
    farmer = Farmer(**payload.model_dump())
    db.add(farmer)
    await db.commit()
    await db.refresh(farmer)
    return farmer
