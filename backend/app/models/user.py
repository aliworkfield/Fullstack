from datetime import datetime
import uuid
from pydantic import EmailStr
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column, DateTime, func
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.item import Item


class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)
    keycloak_user_id: str | None = Field(default=None, max_length=255)  # Add Keycloak user ID


class UserCreate(UserBase):
    pass


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    full_name: str | None = Field(default=None, max_length=255)
    keycloak_user_id: str = Field(max_length=255)  # Add Keycloak user ID


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int