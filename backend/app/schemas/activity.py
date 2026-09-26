import uuid
from datetime import date

from app.models.activity import ActivityStatus
from app.schemas.common import ORMModel


class ActivityRead(ORMModel):
    id: uuid.UUID
    kind: str
    status: ActivityStatus
    due_date: date | None
    completed_on: date | None
    notes: str | None
    attachment_url: str | None
    cycle_id: uuid.UUID


class ActivityCreate(ORMModel):
    """Payload for the field officer's 'Record Activity' screen. Written to
    local SQLite offline and replayed by PowerSync, or posted directly."""

    kind: str
    status: ActivityStatus = ActivityStatus.PLANNED
    due_date: date | None = None
    completed_on: date | None = None
    notes: str | None = None
    attachment_url: str | None = None
    cycle_id: uuid.UUID
