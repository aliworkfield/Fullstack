from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session, select, func
from app.api.deps import SessionDep, require_role, CurrentUser
from app.models import User, Coupon, Campaign
from app.schemas import CouponCreate, CouponUpdate, CouponsPublic
import uuid
from datetime import datetime
from app.services.coupon_service import CouponService

router = APIRouter(prefix="/admin/coupons", tags=["admin/coupons"])


@router.get("/user/{user_id}/campaign/{campaign_id}", response_model=dict, dependencies=[require_role(["admin", "manager"])])
def get_user_coupon_for_campaign(
    user_id: uuid.UUID,
    campaign_id: uuid.UUID,
    current_user: CurrentUser,
    session: SessionDep
):
    """Get the coupon assigned to a specific user for a specific campaign"""
    try:
        statement = select(Coupon).where(
            Coupon.assigned_to_user_id == user_id,
            Coupon.campaign_id == campaign_id
        )
        coupon = session.exec(statement).first()
        
        if not coupon:
            raise HTTPException(status_code=404, detail="No coupon assigned to user for this campaign")
        
        return {"coupon": coupon}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=dict, dependencies=[require_role(["admin", "manager"])])
def get_all_coupons(
    response: Response,
    current_user: CurrentUser,
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    search: str | None = None,
    category: str | None = None,  # Adding category filter
    campaign_id: uuid.UUID | None = None,
    assigned_to_user_id: uuid.UUID | None = None
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
            category_filter = f"%{category}%"
            statement = statement.join(Campaign, Coupon.campaign_id == Campaign.id, isouter=True).where(
                (Campaign.name.ilike(category_filter)) | 
                (Campaign.description.ilike(category_filter))
            )
        
        if campaign_id:
            statement = statement.where(Coupon.campaign_id == campaign_id)
        if assigned_to_user_id:
            statement = statement.where(Coupon.assigned_to_user_id == assigned_to_user_id)
        
        coupons = session.exec(statement.offset(skip).limit(limit)).all()
        
        # Count total for pagination
        count_statement = select(func.count(Coupon.id))
        if search:
            count_statement = count_statement.where(Coupon.code.ilike(search_filter))
        if category:
            count_statement = count_statement.join(Campaign, Coupon.campaign_id == Campaign.id, isouter=True).where(
                (Campaign.name.ilike(category_filter)) | 
                (Campaign.description.ilike(category_filter))
            )
        if campaign_id:
            count_statement = count_statement.where(Coupon.campaign_id == campaign_id)
        if assigned_to_user_id:
            count_statement = count_statement.where(Coupon.assigned_to_user_id == assigned_to_user_id)
        
        total_count = session.exec(count_statement).one()
        
        # Return in the format expected by the frontend (using 'data' instead of 'coupons')
        return {"data": coupons, "count": total_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{coupon_id}", response_model=dict, dependencies=[require_role(["admin", "manager"])])
def get_coupon(
    coupon_id: uuid.UUID,
    current_user: CurrentUser,
    session: SessionDep
):
    """Get a specific coupon"""
    try:
        coupon = session.get(Coupon, coupon_id)
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        return {"coupon": coupon}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=dict, dependencies=[require_role(["admin", "manager"])])
def create_coupon(
    coupon_in: CouponCreate,
    current_user: CurrentUser,
    session: SessionDep
):
    """Create a new coupon"""
    try:
        from app.crud import create_coupon as create_coupon_crud
        coupon = create_coupon_crud(session=session, coupon_in=coupon_in)
        return {"coupon": coupon}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{coupon_id}", response_model=dict, dependencies=[require_role(["admin", "manager"])])
def update_coupon(
    coupon_id: uuid.UUID,
    coupon_update: CouponUpdate,
    current_user: CurrentUser,
    session: SessionDep
):
    """Update a coupon"""
    try:
        coupon = session.get(Coupon, coupon_id)
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        
        # Update coupon fields
        for key, value in coupon_update.dict(exclude_unset=True).items():
            setattr(coupon, key, value)
        
        session.add(coupon)
        session.commit()
        session.refresh(coupon)
        return {"coupon": coupon}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{coupon_id}", response_model=dict, dependencies=[require_role(["admin"])])
def delete_coupon(
    coupon_id: uuid.UUID,
    current_user: CurrentUser,
    session: SessionDep
):
    """Delete a coupon (admin only)"""
    try:
        coupon = session.get(Coupon, coupon_id)
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        
        session.delete(coupon)
        session.commit()
        return {"message": "Coupon deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/{campaign_id}/{count}", response_model=dict, dependencies=[require_role(["admin", "manager"])])
def generate_coupons(
    campaign_id: uuid.UUID,
    count: int,
    current_user: CurrentUser,
    session: SessionDep
):
    """Generate coupons for a campaign"""
    try:
        service = CouponService(session)
        coupons = service.generate_coupons(campaign_id, count)
        return {"coupons": coupons, "count": len(coupons)}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/assign/bulk/{campaign_id}", response_model=dict, dependencies=[require_role(["admin", "manager"])])
def assign_campaign_to_all_users(
    campaign_id: uuid.UUID,
    current_user: CurrentUser,
    session: SessionDep
):
    """Assign campaign coupons to all users"""
    try:
        service = CouponService(session)
        assigned_count = service.assign_campaign_to_all_users(campaign_id)
        return {"message": f"Assigned {assigned_count} coupons", "count": assigned_count}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/unassigned/{campaign_id}", response_model=dict, dependencies=[require_role(["admin", "manager"])])
def get_unassigned_coupons(
    campaign_id: uuid.UUID,
    current_user: CurrentUser,
    session: SessionDep
):
    """Get unassigned coupons for a campaign"""
    try:
        statement = select(Coupon).where(
            Coupon.campaign_id == campaign_id,
            Coupon.assigned_to_user_id.is_(None)
        )
        coupons = session.exec(statement).all()
        
        # Count total unassigned for pagination
        count_statement = select(func.count(Coupon.id)).where(
            Coupon.campaign_id == campaign_id,
            Coupon.assigned_to_user_id.is_(None)
        )
        total_count = session.exec(count_statement).one()
        
        # Return in the format expected by the frontend (using 'data' instead of 'coupons')
        return {"data": coupons, "count": total_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/{campaign_id}", response_model=dict, dependencies=[require_role(["admin", "manager"])])
def get_campaign_coupon_stats(
    campaign_id: uuid.UUID,
    current_user: CurrentUser,
    session: SessionDep
):
    """Get campaign coupon statistics"""
    try:
        # Get all coupons for the campaign
        statement = select(Coupon).where(Coupon.campaign_id == campaign_id)
        all_coupons = session.exec(statement).all()
        
        total = len(all_coupons)
        assigned = sum(1 for coupon in all_coupons if coupon.assigned_to_user_id is not None)
        redeemed = sum(1 for coupon in all_coupons if coupon.redeemed)
        unassigned = total - assigned
        
        return {
            "stats": {
                "total": total,
                "assigned": assigned,
                "unassigned": unassigned,
                "redeemed": redeemed
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))