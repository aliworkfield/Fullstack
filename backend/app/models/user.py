from datetime import datetime
import uuid
from pydantic import EmailStr
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column, DateTime, func
from typing import TYPE_CHECKING, Literal


# Role type for validation
RoleType = Literal["admin", "manager", "user"]


class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    role: str = Field(default="user", max_length=20)  # "admin", "manager", "user"
    full_name: str | None = Field(default=None, max_length=255)
    keycloak_user_id: str | None = Field(default=None, max_length=255)


class UserCreate(UserBase):
    pass


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    full_name: str | None = Field(default=None, max_length=255)
    keycloak_user_id: str = Field(max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    role: str | None = Field(default=None, max_length=20)  # type: ignore


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    def is_admin(self) -> bool:
        return self.role == "admin"
    
    def is_manager(self) -> bool:
        return self.role in ["admin", "manager"]


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int