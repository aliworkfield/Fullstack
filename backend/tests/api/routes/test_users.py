import uuid
from fastapi.testclient import TestClient
from sqlmodel import Session

from app import crud
from app.core.config import settings
from app.models import User, UserCreate
from tests.utils.user import user_authentication_headers, create_random_user
from tests.utils.utils import random_email


def test_get_users_admin_me(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    """Test admin user can get their own info."""
    r = client.get(f"{settings.API_V1_STR}/users/me", headers=superuser_token_headers)
    current_user = r.json()
    assert current_user
    assert current_user["is_active"] is True
    assert current_user["role"] == "admin"
    assert current_user["email"] == settings.FIRST_SUPERUSER


def test_get_users_normal_user_me(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    """Test normal user can get their own info."""
    r = client.get(f"{settings.API_V1_STR}/users/me", headers=normal_user_token_headers)
    current_user = r.json()
    assert current_user
    assert current_user["is_active"] is True
    assert current_user["role"] == "user"


def test_create_user_new_email(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    """Test admin can create new user."""
    email = random_email()
    data = {"email": email}
    r = client.post(
        f"{settings.API_V1_STR}/users/",
        headers=superuser_token_headers,
        json=data,
    )
    assert 200 <= r.status_code < 300
    created_user = r.json()
    user = crud.get_user_by_email(session=db, email=email)
    assert user
    assert user.email == created_user["email"]
    assert created_user["role"] == "user"  # Default role


def test_create_user_with_role(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    """Test admin can create user with specific role."""
    email = random_email()
    data = {"email": email, "role": "manager"}
    r = client.post(
        f"{settings.API_V1_STR}/users/",
        headers=superuser_token_headers,
        json=data,
    )
    assert 200 <= r.status_code < 300
    created_user = r.json()
    assert created_user["role"] == "manager"


def test_get_existing_user(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    """Test admin can get any user by ID."""
    user = create_random_user(db)
    user_id = user.id
    r = client.get(
        f"{settings.API_V1_STR}/users/{user_id}",
        headers=superuser_token_headers,
    )
    existing_user = r.json()
    assert existing_user
    assert existing_user["email"] == user.email


def test_get_existing_user_normal_user_forbidden(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    """Test normal user cannot get other users."""
    user = create_random_user(db)
    user_id = user.id
    r = client.get(
        f"{settings.API_V1_STR}/users/{user_id}",
        headers=normal_user_token_headers,
    )
    # Normal users shouldn't have access to read other users
    assert r.status_code == 403


def test_create_user_existing_email(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    """Test cannot create user with existing email."""
    user = create_random_user(db)
    data = {"email": user.email}
    r = client.post(
        f"{settings.API_V1_STR}/users/",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 400
    assert r.json() == {"detail": "The user with this email already exists in the system."}


def test_retrieve_users(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    """Test admin can list all users."""
    create_random_user(db)
    create_random_user(db)

    r = client.get(f"{settings.API_V1_STR}/users/", headers=superuser_token_headers)
    all_users = r.json()

    assert len(all_users["data"]) > 1
    assert all_users["count"] > 1


def test_retrieve_users_normal_user_forbidden(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    """Test normal user cannot list all users."""
    r = client.get(f"{settings.API_V1_STR}/users/", headers=normal_user_token_headers)
    assert r.status_code == 403


def test_update_user_me(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    """Test user can update their own info."""
    full_name = "Updated Name"
    data = {"full_name": full_name}
    r = client.patch(
        f"{settings.API_V1_STR}/users/me",
        headers=normal_user_token_headers,
        json=data,
    )
    assert r.status_code == 200
    updated_user = r.json()
    assert updated_user["full_name"] == full_name


def test_update_user_admin(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    """Test admin can update any user."""
    user = create_random_user(db)
    data = {"full_name": "Admin Updated", "role": "manager"}
    r = client.patch(
        f"{settings.API_V1_STR}/users/{user.id}",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 200
    updated_user = r.json()
    assert updated_user["full_name"] == "Admin Updated"
    assert updated_user["role"] == "manager"


def test_delete_user_admin(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    """Test admin can delete a user."""
    user = create_random_user(db)
    user_id = user.id
    r = client.delete(
        f"{settings.API_V1_STR}/users/{user_id}",
        headers=superuser_token_headers,
    )
    assert r.status_code == 200
    response = r.json()
    assert response["message"] == "User deleted successfully"


def test_delete_user_admin_self_forbidden(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    """Test admin cannot delete themselves."""
    r = client.delete(
        f"{settings.API_V1_STR}/users/me",
        headers=superuser_token_headers,
    )
    assert r.status_code == 403
    response = r.json()
    assert response["detail"] == "Admin users are not allowed to delete themselves"


def test_delete_user_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    """Test deleting non-existent user returns 404."""
    r = client.delete(
        f"{settings.API_V1_STR}/users/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert r.status_code == 404
    response = r.json()
    assert response["detail"] == "User not found"


def test_delete_user_normal_user_forbidden(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    """Test normal user cannot delete other users."""
    user = create_random_user(db)
    user_id = user.id
    r = client.delete(
        f"{settings.API_V1_STR}/users/{user_id}",
        headers=normal_user_token_headers,
    )
    assert r.status_code == 403
