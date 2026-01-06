from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.api.deps import SessionDep, CurrentUser
from app.services.coupon_service import CouponService
from app.models import Coupon, User
from app.schemas import CouponPublic, CouponsPublic
import uuid

router = APIRouter(prefix="/user/coupons", tags=["user/coupons"])


@router.get("/my", response_model=CouponsPublic)
def get_my_coupons(
    session: SessionDep,
    current_user: CurrentUser
):
    """Get current user's coupons"""
    try:
        statement = select(Coupon).where(Coupon.assigned_to_user_id == current_user.id)
        coupons = session.exec(statement).all()
        return CouponsPublic(data=coupons, count=len(coupons))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/campaign/{campaign_id}", response_model=dict)
def get_my_coupon_for_campaign(
    campaign_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser
):
    """Get the coupon assigned to current user for a specific campaign"""
    try:
        statement = select(Coupon).where(
            Coupon.assigned_to_user_id == current_user.id,
            Coupon.campaign_id == campaign_id
        )
        coupon = session.exec(statement).first()
        
        if not coupon:
            raise HTTPException(status_code=404, detail="No coupon assigned to you for this campaign")
        
        return {"coupon": coupon}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/redeem/{coupon_id}", response_model=dict)
def redeem_coupon(
    coupon_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser
):
    """Redeem a coupon"""
    try:
        service = CouponService(session)
        coupon = service.redeem_coupon(coupon_id, current_user)
        return {"coupon": coupon, "message": "Coupon redeemed successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{coupon_id}", response_model=CouponPublic)
def get_coupon(
    coupon_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser
):
    """Get a specific coupon"""
    try:
        coupon = session.get(Coupon, coupon_id)
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        
        # Check if user is authorized to view this coupon
        if coupon.assigned_to_user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this coupon")
            
        return coupon
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))