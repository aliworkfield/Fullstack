"""
Login tests for Keycloak-based authentication.

Note: With Keycloak authentication, the actual login is handled by Keycloak.
These tests verify that token validation works correctly.
"""
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings


def test_use_access_token(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    """Test that a valid token can be used to access protected endpoints."""
    response = client.get(
        f"{settings.API_V1_STR}/users/me",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "email" in data
    assert data["role"] == "admin"


def test_invalid_token(client: TestClient) -> None:
    """Test that invalid token returns 401."""
    response = client.get(
        f"{settings.API_V1_STR}/users/me",
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert response.status_code == 401


def test_no_token(client: TestClient) -> None:
    """Test that missing token returns 401."""
    response = client.get(f"{settings.API_V1_STR}/users/me")
    assert response.status_code == 401
