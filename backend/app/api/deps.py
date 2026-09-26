from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

DBSession = Annotated[AsyncSession, Depends(get_db)]

# TODO(auth): add a `CurrentUser` dependency here once Keycloak/Supabase Auth
# is wired up — validate the bearer token, resolve the local User row, and
# expose role-based guards (e.g. require_role(Role.FIELD_OFFICER)).
