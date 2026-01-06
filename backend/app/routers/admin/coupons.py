from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session, select
from app.dependencies import get_db
from app.api.deps import require_role
from app.services.coupon_service import CouponService
from app.models import Coupon, User
from app.schemas import CouponCreate, CouponUpdate, CouponPublic, CouponsPublic
import uuid
from datetime import datetime


router = APIRouter(prefix="/admin/coupons", tags=["admin/coupons"])


@router.get("/user/{user_id}/campaign/{campaign_id}", response_model=dict)
def get_user_coupon_for_campaign(
    user_id: uuid.UUID,
    campaign_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = require_role(["admin", "manager"])
):
    """Get the coupon assigned to a specific user for a specific campaign"""
    try:
        statement = select(Coupon).where(
            Coupon.assigned_to_user_id == user_id,
            Coupon.campaign_id == campaign_id
        )
        coupon = db.exec(statement).first()
        
        if not coupon:
            raise HTTPException(status_code=404, detail="No coupon assigned to user for this campaign")
        
        return {"coupon": coupon}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=dict)
def get_all_coupons(
    response: Response,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: str | None = None,
    category: str | None = None,  # Adding category filter
    campaign_id: uuid.UUID | None = None,
    assigned_user_id: uuid.UUID | None = None,
    current_user: User = require_role(["admin", "manager"])
):
    """Get all coupons with optional filtering"""
    try:
        # Add CORS headers explicitly
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        
        # Build query with filters
        statement = select(Coupon)
        
        # Apply search filter if provided (search in code)
        if search:
            search_filter = f"%{search}%"
            statement = statement.where(
                (Coupon.code.ilike(search_filter))
            )
        
        # Apply category filter if provided
        # Since coupons don't have a direct category field, we'll join with campaigns to filter by campaign name
        if category:
            from app.models import Campaign
            category_filter = f"%{category}%"
            statement = statement.join(Campaign, Coupon.campaign_id == Campaign.id, isouter=True).where(
                (Campaign.title.ilike(category_filter)) | 
                (Campaign.description.ilike(category_filter))
            )
        
        # Apply campaign filter if provided
        if campaign_id:
            statement = statement.where(Coupon.campaign_id == campaign_id)
        
        # Apply assigned user filter if provided
        if assigned_user_id:
            statement = statement.where(Coupon.assigned_to_user_id == assigned_user_id)
        
        statement = statement.offset(skip).limit(limit)
        coupons = db.exec(statement).all()
        
        # Get total count without offset/limit
        count_statement = select(Coupon)
        if search:
            search_filter = f"%{search}%"
            count_statement = count_statement.where(
                (Coupon.code.ilike(search_filter))
            )
        if category:
            from app.models import Campaign
            category_filter = f"%{category}%"
            count_statement = count_statement.join(Campaign, Coupon.campaign_id == Campaign.id, isouter=True).where(
                (Campaign.title.ilike(category_filter)) | 
                (Campaign.description.ilike(category_filter))
            )
        if campaign_id:
            count_statement = count_statement.where(Coupon.campaign_id == campaign_id)
        if assigned_user_id:
            count_statement = count_statement.where(Coupon.assigned_to_user_id == assigned_user_id)
        
        total_count = db.exec(count_statement).count()
        
        return {"coupons": coupons, "count": total_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{coupon_id}", response_model=dict)
def get_coupon(
    coupon_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = require_role(["admin", "manager"])
):
    """Get a specific coupon"""
    try:
        coupon = db.get(Coupon, coupon_id)
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        return {"coupon": coupon}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=dict)
def create_coupon(
    coupon_in: CouponCreate,
    db: Session = Depends(get_db),
    current_user: User = require_role(["admin", "manager"])
):
    """Create a new coupon"""
    try:
        # Check if campaign exists if campaign_id is provided
        if coupon_in.campaign_id:
            from app.models import Campaign
            campaign = db.get(Campaign, coupon_in.campaign_id)
            if not campaign:
                raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Check if user exists if assigned_to_user_id is provided
        if coupon_in.assigned_to_user_id:
            user = db.get(User, coupon_in.assigned_to_user_id)
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
        
        coupon = Coupon.model_validate(coupon_in)
        db.add(coupon)
        db.commit()
        db.refresh(coupon)
        return {"coupon": coupon}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{coupon_id}", response_model=dict)
def update_coupon(
    coupon_id: uuid.UUID,
    coupon_update: CouponUpdate,
    db: Session = Depends(get_db),
    current_user: User = require_role(["admin", "manager"])
):
    """Update a coupon"""
    try:
        coupon = db.get(Coupon, coupon_id)
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        
        # Update coupon fields
        for key, value in coupon_update.model_dump(exclude_unset=True).items():
            setattr(coupon, key, value)
        
        db.add(coupon)
        db.commit()
        db.refresh(coupon)
        return {"coupon": coupon}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{coupon_id}", response_model=dict)
def delete_coupon(
    coupon_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = require_role(["admin"])
):
    """Delete a coupon (admin only)"""
    try:
        coupon = db.get(Coupon, coupon_id)
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        
        db.delete(coupon)
        db.commit()
        return {"message": "Coupon deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/{campaign_id}/{count}", response_model=dict)
def generate_coupons(
    campaign_id: uuid.UUID,
    count: int,
    db: Session = Depends(get_db),
    current_user: User = require_role(["admin", "manager"])
):
    """Generate coupons for a campaign"""
    try:
        service = CouponService(db)
        coupons = service.generate_coupons(campaign_id, count)
        return {"coupons": coupons, "count": len(coupons)}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/assign/bulk/{campaign_id}", response_model=dict)
def assign_campaign_to_all_users(
    campaign_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = require_role(["admin", "manager"])
):
    """Assign campaign coupons to all users"""
    try:
        service = CouponService(db)
        assigned_count = service.assign_campaign_to_all_users(campaign_id)
        return {"message": f"Assigned {assigned_count} coupons", "count": assigned_count}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/assign/{coupon_id}/user/{user_id}", response_model=dict)
def assign_coupon_to_user(
    coupon_id: uuid.UUID,
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = require_role(["admin", "manager"])
):
    """Assign specific coupon to specific user"""
    try:
        service = CouponService(db)
        coupon = service.assign_coupon_to_user(coupon_id, user_id)
        return {"coupon": coupon}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/unassigned/{campaign_id}", response_model=dict)
def get_unassigned_coupons(
    campaign_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = require_role(["admin", "manager"])
):
    """Get unassigned coupons for a campaign"""
    try:
        service = CouponService(db)
        coupons = service.get_unassigned_coupons(campaign_id)
        return {"coupons": coupons, "count": len(coupons)}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/{campaign_id}", response_model=dict)
def get_campaign_coupon_stats(
    campaign_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = require_role(["admin", "manager"])
):
    """Get campaign coupon statistics"""
    try:
        service = CouponService(db)
        stats = service.get_campaign_coupon_stats(campaign_id)
        return stats
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))