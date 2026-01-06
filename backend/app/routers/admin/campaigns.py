from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.api.deps import SessionDep, require_role, CurrentUser
from app.models import User
from app.services.campaign_service import CampaignService
from app.models import Campaign, Coupon
from app.schemas import CampaignCreate, CampaignUpdate, CampaignWithStats
import uuid
from datetime import datetime

router = APIRouter(prefix="/admin/campaigns", tags=["admin/campaigns"])


@router.get("/", response_model=dict, dependencies=[require_role(["admin", "manager"])])
def get_all_campaigns(
    current_user: CurrentUser,
    session: SessionDep,
    search: str | None = None,
    category: str | None = None  # Adding category filter for campaigns
):
    """Get all campaigns with coupon statistics"""
    try:
        from sqlmodel import select
        
        # Build query with filters
        statement = select(Campaign)
        
        # Apply search filter if provided (search in name and description)
        if search:
            search_filter = f"%{search}%"
            statement = statement.where(
                (Campaign.name.ilike(search_filter)) | 
                (Campaign.description.ilike(search_filter))
            )
        
        # Apply category filter if provided
        # Note: campaigns don't have a direct category field, but we can search in name/description
        # If campaigns had a category field, we would add it here
        if category:
            # For campaigns, we might want to implement a different category approach
            # For now, just using search in name/description
            category_filter = f"%{category}%"
            statement = statement.where(
                (Campaign.name.ilike(category_filter)) | 
                (Campaign.description.ilike(category_filter))
            )
        
        campaigns = session.exec(statement).all()
        
        # Get coupon stats for each campaign
        service = CampaignService(session)
        campaign_stats = []
        for campaign in campaigns:
            campaign_with_stats = service.get_campaign_with_coupon_counts(campaign.id)
            campaign_stats.append(campaign_with_stats)
        
        return {"campaigns": campaign_stats, "count": len(campaign_stats)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{campaign_id}", response_model=dict, dependencies=[require_role(["admin", "manager"])])
def get_campaign(
    campaign_id: uuid.UUID,
    current_user: CurrentUser,
    session: SessionDep
):
    """Get a specific campaign by ID"""
    try:
        campaign = session.get(Campaign, campaign_id)
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        return {"campaign": campaign}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=dict, dependencies=[require_role(["admin", "manager"])])
def create_campaign(
    campaign_in: CampaignCreate,
    current_user: CurrentUser,
    session: SessionDep
):
    """Create a new campaign"""
    try:
        from app.crud import create_campaign as create_campaign_crud
        campaign = create_campaign_crud(session=session, campaign_in=campaign_in)
        return {"campaign": campaign}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{campaign_id}", response_model=dict, dependencies=[require_role(["admin", "manager"])])
def update_campaign(
    campaign_id: uuid.UUID,
    campaign_update: CampaignUpdate,
    current_user: CurrentUser,
    session: SessionDep
):
    """Update a campaign"""
    try:
        campaign = session.get(Campaign, campaign_id)
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Update campaign fields
        for key, value in campaign_update.dict(exclude_unset=True).items():
            setattr(campaign, key, value)
        
        session.add(campaign)
        session.commit()
        session.refresh(campaign)
        return {"campaign": campaign}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{campaign_id}", response_model=dict, dependencies=[require_role(["admin"])])
def delete_campaign(
    campaign_id: uuid.UUID,
    current_user: CurrentUser,
    session: SessionDep
):
    """Delete a campaign"""
    try:
        campaign = session.get(Campaign, campaign_id)
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Check if campaign has associated coupons
        coupon_statement = select(Coupon).where(Coupon.campaign_id == campaign_id)
        coupons = session.exec(coupon_statement).all()
        
        if coupons:
            raise HTTPException(status_code=400, detail="Cannot delete campaign with associated coupons")
        
        session.delete(campaign)
        session.commit()
        return {"message": "Campaign deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))