from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.dependencies import get_db
from app.api.deps import require_role
from app.models import User
from app.services.campaign_service import CampaignService
from app.models import Campaign, Coupon
from app.schemas import CampaignCreate, CampaignUpdate, CampaignWithStats
import uuid
from datetime import datetime

router = APIRouter(prefix="/admin/campaigns", tags=["admin/campaigns"])


@router.get("/", response_model=dict)
def get_all_campaigns(
    db: Session = Depends(get_db),
    search: str | None = None,
    category: str | None = None,  # Adding category filter for campaigns
    current_user: User = require_role(["admin", "manager"])
):
    """Get all campaigns with coupon statistics"""
    try:
        from sqlmodel import select
        
        # Build query with filters
        statement = select(Campaign)
        
        # Apply search filter if provided (search in title and description)
        if search:
            search_filter = f"%{search}%"
            statement = statement.where(
                (Campaign.title.ilike(search_filter)) | 
                (Campaign.description.ilike(search_filter))
            )
        
        # Apply category filter if provided
        # Note: campaigns don't have a direct category field, but we can search in title/description
        # If campaigns had a category field, we would add it here
        if category:
            # For campaigns, we might want to implement a different category approach
            # For now, just using search in title/description
            category_filter = f"%{category}%"
            statement = statement.where(
                (Campaign.title.ilike(category_filter)) | 
                (Campaign.description.ilike(category_filter))
            )
        
        campaigns = db.exec(statement).all()
        
        # Get coupon stats for each campaign
        service = CampaignService(db)
        campaign_stats = []
        for campaign in campaigns:
            campaign_with_stats = service.get_campaign_with_coupon_counts(campaign.id)
            campaign_stats.append(campaign_with_stats)
        
        return {"campaigns": campaign_stats, "count": len(campaign_stats)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{campaign_id}", response_model=dict)
def get_campaign(
    campaign_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = require_role(["admin", "manager"])
):
    """Get a specific campaign with coupon statistics"""
    try:
        service = CampaignService(db)
        campaign = service.get_campaign_with_coupon_counts(campaign_id)
        return {"campaign": campaign}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=dict)
def create_campaign(
    campaign_in: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = require_role(["admin", "manager"])
):
    """Create a new campaign"""
    try:
        campaign = Campaign.model_validate(campaign_in)
        db.add(campaign)
        db.commit()
        db.refresh(campaign)
        return {"campaign": campaign}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{campaign_id}", response_model=dict)
def update_campaign(
    campaign_id: uuid.UUID,
    campaign_update: CampaignUpdate,
    db: Session = Depends(get_db),
    current_user: User = require_role(["admin", "manager"])
):
    """Update a campaign"""
    try:
        campaign = db.get(Campaign, campaign_id)
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Update campaign fields
        for key, value in campaign_update.dict(exclude_unset=True).items():
            setattr(campaign, key, value)
        
        db.add(campaign)
        db.commit()
        db.refresh(campaign)
        return {"campaign": campaign}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{campaign_id}", response_model=dict)
def delete_campaign(
    campaign_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = require_role(["admin"])
):
    """Delete a campaign"""
    try:
        campaign = db.get(Campaign, campaign_id)
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Check if campaign has coupons (restrict deletion)
        statement = select(Coupon).where(Coupon.campaign_id == campaign_id)
        coupons = db.exec(statement).all()
        if coupons:
            raise HTTPException(status_code=400, detail="Cannot delete campaign with existing coupons")
        
        db.delete(campaign)
        db.commit()
        return {"message": "Campaign deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))