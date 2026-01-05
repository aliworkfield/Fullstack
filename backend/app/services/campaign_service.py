from typing import List, Dict
from sqlmodel import Session, select
from app.models import Campaign, Coupon
import uuid


class CampaignService:
    def __init__(self, session: Session):
        self.session = session

    def get_campaign_with_coupon_counts(self, campaign_id: uuid.UUID) -> Dict:
        """
        Get campaign with coupon statistics
        
        Args:
            campaign_id: ID of the campaign
            
        Returns:
            Dictionary with campaign data and coupon counts
        """
        # Get campaign
        campaign = self.session.get(Campaign, campaign_id)
        if not campaign:
            raise ValueError("Campaign not found")
        
        # Get coupon stats
        statement = select(Coupon).where(Coupon.campaign_id == campaign_id)
        all_coupons = self.session.exec(statement).all()
        
        total = len(all_coupons)
        assigned = sum(1 for coupon in all_coupons if coupon.assigned_user_id is not None)
        redeemed = sum(1 for coupon in all_coupons if coupon.redeemed)
        
        return {
            "id": campaign.id,
            "title": campaign.title,
            "description": campaign.description,
            "start_date": campaign.start_date,
            "end_date": campaign.end_date,
            "active": campaign.active,
            "created_at": campaign.created_at,
            "stats": {
                "total": total,
                "assigned": assigned,
                "redeemed": redeemed
            }
        }

    def get_all_campaigns_with_coupon_counts(self) -> List[Dict]:
        """
        Get all campaigns with coupon statistics
        
        Returns:
            List of dictionaries with campaign data and coupon counts
        """
        # Get all campaigns
        campaigns = self.session.exec(select(Campaign)).all()
        
        result = []
        for campaign in campaigns:
            # Get coupon stats for each campaign
            statement = select(Coupon).where(Coupon.campaign_id == campaign.id)
            all_coupons = self.session.exec(statement).all()
            
            total = len(all_coupons)
            assigned = sum(1 for coupon in all_coupons if coupon.assigned_user_id is not None)
            redeemed = sum(1 for coupon in all_coupons if coupon.redeemed)
            
            result.append({
                "id": campaign.id,
                "title": campaign.title,
                "description": campaign.description,
                "start_date": campaign.start_date,
                "end_date": campaign.end_date,
                "active": campaign.active,
                "created_at": campaign.created_at,
                "stats": {
                    "total": total,
                    "assigned": assigned,
                    "redeemed": redeemed
                }
            })
        
        return result