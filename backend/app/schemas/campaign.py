from datetime import datetime
import uuid
from sqlmodel import Field, SQLModel
from typing import Optional


class CampaignBase(SQLModel):
    title: str = Field(max_length=255)
    description: str | None = Field(default=None, max_length=1000)
    start_date: datetime
    end_date: datetime
    active: bool = True


class CampaignCreate(CampaignBase):
    pass


class CampaignUpdate(CampaignBase):
    title: str | None = Field(default=None, max_length=255)


class CampaignPublic(CampaignBase):
    id: uuid.UUID
    created_at: datetime


class CampaignWithStats(CampaignPublic):
    stats: dict


class CampaignsPublic(SQLModel):
    data: list[CampaignPublic]
    count: int