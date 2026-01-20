import random
import string
from datetime import datetime, timedelta, timezone

import jwt
from fastapi.testclient import TestClient

from app.core.config import settings


def random_lower_string() -> str:
    return "".join(random.choices(string.ascii_lowercase, k=32))


def random_email() -> str:
    return f"{random_lower_string()}@{random_lower_string()}.com"


def get_superuser_token_headers(client: TestClient) -> dict[str, str]:
    """Generate mock JWT token for admin user testing."""
    payload = {
        "sub": "superuser-id",  # Mock Keycloak user ID
        "email": settings.FIRST_SUPERUSER,
        "full_name": "Test Admin",
        "role": "admin",  # New role-based system
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    headers = {"Authorization": f"Bearer {token}"}
    return headers


def get_manager_token_headers(client: TestClient, email: str = "manager@test.com") -> dict[str, str]:
    """Generate mock JWT token for manager user testing."""
    payload = {
        "sub": "manager-id",
        "email": email,
        "full_name": "Test Manager",
        "role": "manager",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    headers = {"Authorization": f"Bearer {token}"}
    return headers


def get_user_token_headers(client: TestClient, email: str = "user@test.com") -> dict[str, str]:
    """Generate mock JWT token for regular user testing."""
    payload = {
        "sub": "user-id",
        "email": email,
        "full_name": "Test User",
        "role": "user",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    headers = {"Authorization": f"Bearer {token}"}
    return headers
