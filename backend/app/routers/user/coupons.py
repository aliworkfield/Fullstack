from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.dependencies import get_db, get_current_user
from app.services.coupon_service import CouponService
from app.models import Coupon, User
from app.schemas import CouponRedeem
import uuid

router = APIRouter(prefix="/user/coupons", tags=["user/coupons"])


@router.get("/my", response_model=dict)
def get_my_coupons(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's coupons"""
    try:
        statement = select(Coupon).where(Coupon.assigned_user_id == current_user.id)
        coupons = db.exec(statement).all()
        return {"coupons": coupons, "count": len(coupons)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/redeem/{coupon_id}", response_model=dict)
def redeem_coupon(
    coupon_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Redeem a coupon"""
    try:
        service = CouponService(db)
        coupon = service.redeem_coupon(coupon_id, current_user)
        return {"coupon": coupon, "message": "Coupon redeemed successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{coupon_id}", response_model=dict)
def get_coupon(
    coupon_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific coupon"""
    try:
        coupon = db.get(Coupon, coupon_id)
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        
        # Check if user is authorized to view this coupon
        if coupon.assigned_user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this coupon")
            
        return {"coupon": coupon}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))