import datetime
import uuid

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import Column, DateTime, func


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


# Campaign Models
class CampaignBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=1000)
    start_date: datetime.datetime
    end_date: datetime.datetime
    active: bool = True


class CampaignCreate(CampaignBase):
    pass


class CampaignUpdate(CampaignBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


class Campaign(CampaignBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime.datetime = Field(
        default_factory=datetime.datetime.utcnow,
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    coupons: list["Coupon"] = Relationship(back_populates="campaign")
    announcements: list["Announcement"] = Relationship(back_populates="campaign")


class CampaignPublic(CampaignBase):
    id: uuid.UUID
    created_at: datetime.datetime


class CampaignsPublic(SQLModel):
    data: list[CampaignPublic]
    count: int


# Coupon Models
class CouponBase(SQLModel):
    code: str = Field(unique=True, index=True, max_length=50)
    discount_type: str = Field(max_length=20)  # percentage or fixed
    discount_value: float
    expires_at: datetime.datetime | None = None
    redeemed: bool = False


class CouponCreate(CouponBase):
    campaign_id: uuid.UUID | None = None
    assigned_to_user_id: uuid.UUID | None = None


class CouponUpdate(CouponBase):
    code: str | None = Field(default=None, max_length=50)  # type: ignore
    discount_type: str | None = Field(default=None, max_length=20)  # type: ignore
    discount_value: float | None = None  # type: ignore


class Coupon(CouponBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    campaign_id: uuid.UUID | None = Field(default=None, foreign_key="campaign.id")
    assigned_to_user_id: uuid.UUID | None = Field(default=None, foreign_key="user.id")
    campaign: Campaign | None = Relationship(back_populates="coupons")
    owner: "User" | None = Relationship()


class CouponPublic(CouponBase):
    id: uuid.UUID
    campaign_id: uuid.UUID | None = None
    assigned_to_user_id: uuid.UUID | None = None


class CouponsPublic(SQLModel):
    data: list[CouponPublic]
    count: int


# Announcement Models
class AnnouncementBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=5000)  # Description field
    category: str = Field(min_length=1, max_length=100)  # Made mandatory
    requires_coupon: bool = Field(default=False)
    campaign_id: uuid.UUID | None = None
    is_published: bool = Field(default=False)
    publish_date: datetime.datetime | None = None
    expires_at: datetime.datetime | None = None  # End date field


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementUpdate(AnnouncementBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=5000)
    category: str | None = Field(default=None, max_length=100)
    requires_coupon: bool | None = None
    campaign_id: uuid.UUID | None = None
    is_published: bool | None = None
    publish_date: datetime.datetime | None = None
    expires_at: datetime.datetime | None = None


class Announcement(AnnouncementBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime.datetime = Field(
        default_factory=datetime.datetime.utcnow,
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    campaign_id: uuid.UUID | None = Field(default=None, foreign_key="campaign.id")
    deleted_at: datetime.datetime | None = Field(default=None)  # Soft delete field
    campaign: Campaign | None = Relationship(back_populates="announcements")


class AnnouncementPublic(AnnouncementBase):
    id: uuid.UUID
    created_at: datetime.datetime
    campaign_id: uuid.UUID | None = None
    deleted_at: datetime.datetime | None = None  # Include in public schema


class AnnouncementsPublic(SQLModel):
    data: list[AnnouncementPublic]
    count: int


# User Models
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)
    keycloak_user_id: str | None = Field(default=None, max_length=255)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


class UserUpdate(SQLModel):
    email: EmailStr | None = Field(default=None, max_length=255)
    is_active: bool | None = None
    is_superuser: bool | None = None
    full_name: str | None = Field(default=None, max_length=255)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    coupons: list["Coupon"] = Relationship(back_populates="owner")
    announcements: list["Announcement"] = Relationship(back_populates="campaign")


class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Item Models
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=5000)


class ItemCreate(ItemBase):
    title: str = Field(min_length=1, max_length=255)


class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    owner: User = Relationship()


class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int