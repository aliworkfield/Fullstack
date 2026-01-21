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
    # For testing with Keycloak-only authentication, create a mock JWT token
    payload = {
        "sub": "superuser-id",  # Mock Keycloak user ID
        "email": settings.FIRST_SUPERUSER,
        "full_name": "Test Superuser",
        "is_superuser": True,
        "roles": ["admin"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    headers = {"Authorization": f"Bearer {token}"}
    return headers
