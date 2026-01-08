from datetime import datetime
import uuid
from sqlmodel import Field, SQLModel
from typing import Optional


class CouponBase(SQLModel):
    code: str = Field(max_length=50)
    discount_type: str = Field(max_length=20)  # "percentage" or "fixed"
    discount_value: float
    campaign_id: uuid.UUID | None = None
    assigned_to_user_id: uuid.UUID | None = None
    redeemed: bool = False
    redeemed_at: datetime | None = None
    expires_at: datetime | None = None


class CouponCreate(CouponBase):
    pass


class CouponUpdate(CouponBase):
    code: str | None = Field(default=None, max_length=50)
    discount_type: str | None = Field(default=None, max_length=20)
    discount_value: float | None = None
    campaign_id: uuid.UUID | None = None
    assigned_to_user_id: uuid.UUID | None = None
    redeemed: bool | None = None
    redeemed_at: datetime | None = None
    expires_at: datetime | None = None


class CouponPublic(CouponBase):
    id: uuid.UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class CouponRedeem(SQLModel):
    coupon_id: uuid.UUID


class CouponsPublic(SQLModel):
    data: list[CouponPublic]
    count: int