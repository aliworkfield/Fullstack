from datetime import datetime
import uuid
from sqlmodel import Field, SQLModel, Relationship
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Column, DateTime, func

if TYPE_CHECKING:
    from app.models.user import User
    from app.models import Campaign


# Coupon Models
class CouponBase(SQLModel):
    code: str = Field(unique=True, index=True, max_length=50)
    discount_type: str = Field(max_length=20)  # percentage or fixed
    discount_value: float
    redeemed: bool = False
    redeemed_at: datetime | None = None
    expires_at: datetime | None = None
    campaign_id: uuid.UUID | None = None
    assigned_to_user_id: uuid.UUID | None = None


class CouponCreate(CouponBase):
    campaign_id: uuid.UUID | None = None
    assigned_to_user_id: uuid.UUID | None = None


class CouponUpdate(CouponBase):
    code: str | None = Field(default=None, max_length=50)  # type: ignore
    discount_type: str | None = Field(default=None, max_length=20)  # type: ignore
    discount_value: float | None = None  # type: ignore


class Coupon(CouponBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True), server_default=func.now()))
    campaign_id: uuid.UUID | None = Field(default=None, foreign_key="campaign.id")
    assigned_to_user_id: uuid.UUID | None = Field(default=None, foreign_key="user.id")
    campaign: Optional["Campaign"] = Relationship(back_populates="coupons")
    owner: Optional["User"] = Relationship()


class CouponPublic(CouponBase):
    id: uuid.UUID
    created_at: datetime
    campaign_id: uuid.UUID | None = None
    assigned_to_user_id: uuid.UUID | None = None

    class Config:
        from_attributes = True


class CouponsPublic(SQLModel):
    data: list[CouponPublic]
    count: int
