from fastapi.testclient import TestClient
from sqlmodel import Session

from app import crud
from app.core.config import settings
from app.models import User, UserCreate, UserUpdate
from tests.utils.utils import random_email, random_lower_string, get_user_token_headers


def user_authentication_headers(
    *, client: TestClient, email: str, role: str = "user"
) -> dict[str, str]:
    """Generate mock JWT token for user with given email and role."""
    import jwt
    from datetime import datetime, timedelta, timezone
    
    payload = {
        "sub": f"test-user-{email}",  # Mock Keycloak user ID
        "email": email,
        "full_name": "Test User",
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    headers = {"Authorization": f"Bearer {token}"}
    return headers


def create_random_user(db: Session, role: str = "user") -> User:
    """Create a random user with specified role."""
    email = random_email()
    user_in = UserCreate(email=email, role=role)
    user = crud.create_user(session=db, user_create=user_in)
    return user


def authentication_token_from_email(
    *, client: TestClient, email: str, db: Session, role: str = "user"
) -> dict[str, str]:
    """
    Return a valid token for the user with given email.
    If the user doesn't exist it is created first.
    """
    user = crud.get_user_by_email(session=db, email=email)
    if not user:
        user_in_create = UserCreate(email=email, role=role)
        user = crud.create_user(session=db, user_create=user_in_create)

    return user_authentication_headers(client=client, email=email, role=user.role)
