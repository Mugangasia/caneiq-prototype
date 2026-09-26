import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select

from app.api.deps import DBSession
from app.models import Activity, CropCycle
from app.schemas import ActivityCreate, ActivityRead, CropCycleCreate, CropCycleRead

router = APIRouter(prefix="/cycles", tags=["crop cycles"])


@router.get("/{cycle_id}", response_model=CropCycleRead)
async def get_cycle(cycle_id: uuid.UUID, db: DBSession) -> CropCycle:
    cycle = await db.get(CropCycle, cycle_id)
    if cycle is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Crop cycle not found")
    return cycle


@router.post("", response_model=CropCycleRead, status_code=status.HTTP_201_CREATED)
async def create_cycle(payload: CropCycleCreate, db: DBSession) -> CropCycle:
    cycle = CropCycle(**payload.model_dump())
    db.add(cycle)
    await db.commit()
    await db.refresh(cycle)
    return cycle


@router.get("/{cycle_id}/activities", response_model=list[ActivityRead])
async def list_cycle_activities(
    cycle_id: uuid.UUID,
    db: DBSession,
    limit: int = Query(50, le=200),
    offset: int = 0,
) -> list[Activity]:
    stmt = (
        select(Activity)
        .where(Activity.cycle_id == cycle_id)
        .order_by(Activity.due_date.nulls_last())
        .limit(limit)
        .offset(offset)
    )
    return list((await db.scalars(stmt)).all())


@router.post(
    "/{cycle_id}/activities", response_model=ActivityRead, status_code=status.HTTP_201_CREATED
)
async def record_activity(cycle_id: uuid.UUID, payload: ActivityCreate, db: DBSession) -> Activity:
    """Backs the field officer's 'Record Activity' screen (offline-synced)."""
    if await db.get(CropCycle, cycle_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Crop cycle not found")
    activity = Activity(**payload.model_dump(exclude={"cycle_id"}), cycle_id=cycle_id)
    db.add(activity)
    await db.commit()
    await db.refresh(activity)
    return activity
