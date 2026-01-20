"""
Private API tests.

The private API is for internal service-to-service communication.
"""
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.core.config import settings
from app.models import User
from tests.utils.utils import random_email


def test_create_user_private(client: TestClient, db: Session) -> None:
    """Test creating user via private API."""
    email = random_email()
    r = client.post(
        f"{settings.API_V1_STR}/private/users/",
        json={
            "email": email,
            "full_name": "Test Private User",
        },
    )

    assert r.status_code == 200

    data = r.json()

    user = db.exec(select(User).where(User.id == data["id"])).first()

    assert user
    assert user.email == email
    assert user.full_name == "Test Private User"
    assert user.role == "user"  # Default role


def test_create_user_private_with_role(client: TestClient, db: Session) -> None:
    """Test creating user with specific role via private API."""
    email = random_email()
    r = client.post(
        f"{settings.API_V1_STR}/private/users/",
        json={
            "email": email,
            "full_name": "Test Manager",
            "role": "manager",
        },
    )

    assert r.status_code == 200

    data = r.json()
    assert data["role"] == "manager"
