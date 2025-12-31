from sqlmodel import Session

from app import crud
from app.models import User
from app.schemas import UserCreate, UserUpdate
from tests.utils.user import create_random_user
from tests.utils.utils import random_email


def test_create_user(db: Session) -> None:
    email = random_email()
    password = "random-password"
    user_in = UserCreate(email=email, password=password)
    user = crud.create_user(session=db, user_create=user_in)
    assert user.email == email


def test_authenticate_user(db: Session) -> None:
    email = random_email()
    password = "random-password"
    user_in = UserCreate(email=email, password=password)
    user = crud.create_user(session=db, user_create=user_in)
    authenticated_user = crud.authenticate(session=db, email=email, password=password)
    assert authenticated_user
    assert user.email == authenticated_user.email


def test_not_authenticate_user(db: Session) -> None:
    email = random_email()
    password = "random-password"
    user_in = UserCreate(email=email, password=password)
    crud.create_user(session=db, user_create=user_in)
    authenticated_user = crud.authenticate(session=db, email=email, password="incorrect-password")
    assert authenticated_user is None


def test_check_if_user_is_superuser(db: Session) -> None:
    email = random_email()
    password = "random-password"
    user_in = UserCreate(email=email, password=password, is_superuser=True)
    user = crud.create_user(session=db, user_create=user_in)
    assert user.is_superuser is True


def test_check_if_user_is_superuser_normal_user(db: Session) -> None:
    email = random_email()
    password = "random-password"
    user_in = UserCreate(email=email, password=password)
    user = crud.create_user(session=db, user_create=user_in)
    assert user.is_superuser is False


def test_check_if_user_is_active(db: Session) -> None:
    email = random_email()
    password = "random-password"
    user_in = UserCreate(email=email, password=password)
    user = crud.create_user(session=db, user_create=user_in)
    assert user.is_active is True


def test_get_user_by_email(db: Session) -> None:
    email = random_email()
    password = "random-password"
    user_in = UserCreate(email=email, password=password)
    user = crud.create_user(session=db, user_create=user_in)
    user_by_email = crud.get_user_by_email(session=db, email=email)
    assert user.email == user_by_email.email


def test_update_user(db: Session) -> None:
    password = "random-password"
    user = create_random_user(db)
    new_email = random_email()
    user_in = UserUpdate(email=new_email, password=password)
    user = crud.update_user(session=db, db_user=user, user_in=user_in)
    assert user.email == new_email