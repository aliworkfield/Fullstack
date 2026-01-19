from datetime import datetime
import uuid
from sqlmodel import Field, SQLModel


class AnnouncementBase(SQLModel):
    title: str = Field(max_length=255)
    description: str | None = Field(default=None, max_length=5000)  # Description field
    category: str = Field(max_length=100)
    requires_coupon: bool = Field(default=False)
    campaign_id: uuid.UUID | None = None
    is_published: bool = Field(default=False)
    publish_date: datetime | None = None
    expires_at: datetime | None = None  # End date field


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
    expires_at: datetime | None = None


class AnnouncementPublic(SQLModel):
    title: str
    description: str | None
    category: str
    requires_coupon: bool
    campaign_id: uuid.UUID | None
    is_published: bool
    publish_date: datetime | None
    expires_at: datetime | None
    id: uuid.UUID


class AnnouncementsPublic(SQLModel):
    data: list[AnnouncementPublic]
    count: int