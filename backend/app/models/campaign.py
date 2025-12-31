from datetime import datetime
import uuid
from sqlmodel import Field, SQLModel, Relationship
from typing import List, TYPE_CHECKING
from sqlalchemy import Column, DateTime, func

if TYPE_CHECKING:
    from app.models.coupon import Coupon
    from app.models.announcement import Announcement


# Campaign Models
class CampaignBase(SQLModel):
    title: str = Field(max_length=255)
    description: str | None = Field(default=None, max_length=1000)
    start_date: datetime
    end_date: datetime
    is_active: bool = True


class CampaignCreate(CampaignBase):
    pass


class CampaignUpdate(CampaignBase):
    title: str | None = Field(default=None, max_length=255)  # type: ignore


class Campaign(CampaignBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True), server_default=func.now()))
    coupons: List["Coupon"] = Relationship(back_populates="campaign", sa_relationship_kwargs={"lazy": "select"})
    announcements: List["Announcement"] = Relationship(back_populates="campaign", sa_relationship_kwargs={"lazy": "select"})


class CampaignPublic(CampaignBase):
    id: uuid.UUID
    created_at: datetime


class CampaignsPublic(SQLModel):
    data: list[CampaignPublic]
    count: int