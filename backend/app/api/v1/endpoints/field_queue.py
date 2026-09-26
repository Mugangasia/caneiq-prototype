from fastapi import APIRouter, Query
from sqlalchemy import select

from app.api.deps import DBSession
from app.models import FieldVisit
from app.models.field_visit import VisitStatus
from app.schemas import FieldVisitRead

router = APIRouter(prefix="/field-queue", tags=["field queue"])


@router.get("", response_model=list[FieldVisitRead])
async def list_queue(
    db: DBSession,
    limit: int = Query(50, le=200),
    offset: int = 0,
    status: VisitStatus | None = None,
) -> list[FieldVisit]:
    stmt = (
        select(FieldVisit)
        .order_by(FieldVisit.scheduled_for.nulls_last())
        .limit(limit)
        .offset(offset)
    )
    if status:
        stmt = stmt.where(FieldVisit.status == status)
    return list((await db.scalars(stmt)).all())
