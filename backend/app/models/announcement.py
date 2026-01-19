from datetime import datetime
import uuid
from sqlmodel import Field, SQLModel, Relationship
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Column, DateTime, func

if TYPE_CHECKING:
    from app.models import Campaign


# Announcement Models
class AnnouncementBase(SQLModel):
    title: str = Field(max_length=255)
    description: str | None = Field(default=None, max_length=5000)  # Description field
    category: str = Field(max_length=100)
    requires_coupon: bool = Field(default=False)
    campaign_id: uuid.UUID | None = None
    is_published: bool = Field(default=False)
    publish_date: datetime | None = None
    created_date: datetime | None = Field(default_factory=datetime.utcnow)
    expiry_date: datetime | None = Field(default=None)


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementUpdate(SQLModel):
    title: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=5000)
    category: str | None = Field(default=None, max_length=100)
    requires_coupon: bool | None = None
    campaign_id: uuid.UUID | None = None
    is_published: bool | None = None
    publish_date: datetime | None = None
    created_date: datetime | None = Field(default=None)
    expiry_date: datetime | None = Field(default=None)


class Announcement(AnnouncementBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    campaign_id: uuid.UUID | None = Field(default=None, foreign_key="campaign.id")
    deleted_at: datetime | None = Field(default=None)  # Soft delete field
    campaign: Optional["Campaign"] = Relationship(back_populates="announcements")


class AnnouncementPublic(AnnouncementBase):
    id: uuid.UUID
    created_date: datetime | None
    expiry_date: datetime | None
    campaign_id: uuid.UUID | None = None
    deleted_at: datetime | None = None  # Include in public schema


class AnnouncementsPublic(SQLModel):
    data: list[AnnouncementPublic]
    count: int