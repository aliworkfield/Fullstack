from pydantic import EmailStr
from sqlmodel import Field, SQLModel
import uuid


class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    role: str = Field(default="user", max_length=20)  # "admin", "manager", "user"
    full_name: str | None = Field(default=None, max_length=255)
    keycloak_user_id: str | None = Field(default=None, max_length=255)


class UserCreate(UserBase):
    pass


class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255, unique=True)
    is_active: bool | None = None
    role: str | None = Field(default=None, max_length=20)
    full_name: str | None = Field(default=None, max_length=255)
    keycloak_user_id: str | None = Field(default=None, max_length=255)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    full_name: str | None = Field(default=None, max_length=255)
    keycloak_user_id: str | None = Field(default=None, max_length=255)


class UserPublic(UserBase):
    id: uuid.UUID


class UserInDB(UserPublic):
    pass


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int