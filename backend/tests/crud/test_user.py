"""
CRUD tests for User model.
"""
from sqlmodel import Session

from app import crud
from app.models import User, UserCreate, UserUpdate
from tests.utils.user import create_random_user
from tests.utils.utils import random_email


def test_create_user(db: Session) -> None:
    """Test creating a new user."""
    email = random_email()
    user_in = UserCreate(email=email)
    user = crud.create_user(session=db, user_create=user_in)
    assert user.email == email
    assert user.role == "user"  # Default role


def test_create_user_with_role(db: Session) -> None:
    """Test creating a user with specific role."""
    email = random_email()
    user_in = UserCreate(email=email, role="admin")
    user = crud.create_user(session=db, user_create=user_in)
    assert user.email == email
    assert user.role == "admin"


def test_check_user_role_admin(db: Session) -> None:
    """Test admin role check."""
    email = random_email()
    user_in = UserCreate(email=email, role="admin")
    user = crud.create_user(session=db, user_create=user_in)
    assert user.role == "admin"
    assert user.is_admin() is True
    assert user.is_manager() is False


def test_check_user_role_manager(db: Session) -> None:
    """Test manager role check."""
    email = random_email()
    user_in = UserCreate(email=email, role="manager")
    user = crud.create_user(session=db, user_create=user_in)
    assert user.role == "manager"
    assert user.is_admin() is False
    assert user.is_manager() is True


def test_check_user_role_default(db: Session) -> None:
    """Test default user role."""
    email = random_email()
    user_in = UserCreate(email=email)
    user = crud.create_user(session=db, user_create=user_in)
    assert user.role == "user"
    assert user.is_admin() is False
    assert user.is_manager() is False


def test_check_if_user_is_active(db: Session) -> None:
    """Test user is active by default."""
    email = random_email()
    user_in = UserCreate(email=email)
    user = crud.create_user(session=db, user_create=user_in)
    assert user.is_active is True


def test_get_user_by_email(db: Session) -> None:
    """Test getting user by email."""
    email = random_email()
    user_in = UserCreate(email=email)
    user = crud.create_user(session=db, user_create=user_in)
    user_by_email = crud.get_user_by_email(session=db, email=email)
    assert user.email == user_by_email.email


def test_update_user(db: Session) -> None:
    """Test updating user."""
    user = create_random_user(db)
    new_email = random_email()
    user_in = UserUpdate(email=new_email)
    user = crud.update_user(session=db, db_user=user, user_in=user_in)
    assert user.email == new_email


def test_update_user_role(db: Session) -> None:
    """Test updating user role."""
    user = create_random_user(db, role="user")
    user_in = UserUpdate(role="manager")
    user = crud.update_user(session=db, db_user=user, user_in=user_in)
    assert user.role == "manager"