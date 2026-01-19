from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.api.deps import get_current_user, get_db
from app.models import User, Coupon
from app.schemas import CouponPublic, CouponsPublic
import uuid
from datetime import datetime


router = APIRouter(prefix="/user/coupons", tags=["user/coupons"])


@router.get("/my", response_model=CouponsPublic)
def get_my_coupons(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's coupons"""
    statement = select(Coupon).where(Coupon.assigned_to_user_id == current_user.id)
    coupons = db.exec(statement).all()
    return CouponsPublic(data=coupons, count=len(coupons))


@router.get("/{coupon_id}", response_model=CouponPublic)
def get_coupon(
    coupon_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific coupon"""
    coupon = db.get(Coupon, coupon_id)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    # Only allow user to access their own coupon
    if coupon.assigned_to_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this coupon")
    
    return coupon


@router.post("/redeem/{coupon_id}", response_model=CouponPublic)
def redeem_coupon(
    coupon_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Redeem a coupon"""
    coupon = db.get(Coupon, coupon_id)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    # Only allow user to redeem their own coupon
    if coupon.assigned_to_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to redeem this coupon")
    
    if coupon.redeemed:
        raise HTTPException(status_code=400, detail="Coupon already redeemed")
    
    coupon.redeemed = True
    coupon.redeemed_at = datetime.utcnow()
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    
    return coupon