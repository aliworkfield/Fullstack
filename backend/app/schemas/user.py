from pydantic import EmailStr
from sqlmodel import Field, SQLModel


class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)
    keycloak_user_id: str | None = Field(default=None, max_length=255)


class UserCreate(UserBase):
    pass


class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255, unique=True)
    is_active: bool | None = None
    is_superuser: bool | None = None
    full_name: str | None = Field(default=None, max_length=255)
    keycloak_user_id: str | None = Field(default=None, max_length=255)



class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str
    full_name: str | None = Field(default=None, max_length=255)


class UserPublic(UserBase):
    id: int


class UserInDB(UserPublic):
    pass


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int