from datetime import timedelta
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse

from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.core import security
from app.core.config import settings
from app.models import Token, UserPublic
from app.schemas import Message

router = APIRouter(tags=["login"])


# Note: With Keycloak-only authentication, this endpoint is no longer used
# The actual authentication happens through Keycloak, and JWT tokens are validated by the deps module


@router.post("/login/test-token", response_model=UserPublic)
def test_token(current_user: CurrentUser) -> Any:
    """
    Test access token
    """
    return current_user









