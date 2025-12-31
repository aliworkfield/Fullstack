from typing import List, Dict
from sqlmodel import Session, select
from app.models import Coupon, Campaign, User
from app.schemas import CouponCreate, CouponUpdate
import uuid
from datetime import datetime


class CouponService:
    def __init__(self, session: Session):
        self.session = session

    def generate_coupons(self, campaign_id: uuid.UUID, count: int) -> List[Coupon]:
        """
        Generate coupons for a campaign
        
        Args:
            campaign_id: ID of the campaign
            count: Number of coupons to generate
            
        Returns:
            List of generated coupons
        """
        # Verify campaign exists
        campaign = self.session.get(Campaign, campaign_id)
        if not campaign:
            raise ValueError("Campaign not found")
        
        # Generate coupons
        coupons = []
        for i in range(count):
            # Generate unique code
            code = f"{campaign.title[:3].upper()}-{uuid.uuid4().hex[:8].upper()}"
            
            # Create coupon using model constructor instead of from_orm
            coupon = Coupon(
                code=code,
                discount_type="percentage",
                discount_value=10.0,
                campaign_id=campaign_id
            )
            self.session.add(coupon)
            coupons.append(coupon)
        
        self.session.commit()
        
        # Refresh objects
        for coupon in coupons:
            self.session.refresh(coupon)
            
        return coupons

    def assign_campaign_to_all_users(self, campaign_id: uuid.UUID) -> int:
        """
        Assign campaign coupons to all users
        
        Args:
            campaign_id: ID of the campaign
            
        Returns:
            Number of coupons assigned
        """
        # Get all users
        users = self.session.exec(select(User)).all()
        
        # Get unassigned coupons for campaign
        statement = select(Coupon).where(
            Coupon.campaign_id == campaign_id,
            Coupon.assigned_user_id.is_(None)
        )
        coupons = self.session.exec(statement).all()
        
        # Assign coupons to users in round-robin fashion
        assigned_count = 0
        user_index = 0
        
        for coupon in coupons:
            if user_index >= len(users):
                user_index = 0
                
            coupon.assigned_user_id = users[user_index].id
            self.session.add(coupon)
            assigned_count += 1
            user_index += 1
        
        self.session.commit()
        return assigned_count

    def assign_coupon_to_user(self, coupon_id: uuid.UUID, user_id: uuid.UUID) -> Coupon:
        """
        Assign specific coupon to specific user
        
        Args:
            coupon_id: ID of the coupon
            user_id: ID of the user
            
        Returns:
            Updated coupon
        """
        # Get coupon
        coupon = self.session.get(Coupon, coupon_id)
        if not coupon:
            raise ValueError("Coupon not found")
            
        # Check if coupon is already assigned
        if coupon.assigned_user_id is not None:
            raise ValueError("Coupon is already assigned")
            
        # Check if coupon is redeemed
        if coupon.redeemed:
            raise ValueError("Cannot assign redeemed coupon")
            
        # Get user
        user = self.session.get(User, user_id)
        if not user:
            raise ValueError("User not found")
            
        # Assign coupon to user
        coupon.assigned_user_id = user_id
        self.session.add(coupon)
        self.session.commit()
        self.session.refresh(coupon)
        
        return coupon

    def redeem_coupon(self, coupon_id: uuid.UUID, current_user: User) -> Coupon:
        """
        Redeem a coupon
        
        Args:
            coupon_id: ID of the coupon
            current_user: Current user
            
        Returns:
            Redeemed coupon
        """
        # Get coupon
        coupon = self.session.get(Coupon, coupon_id)
        if not coupon:
            raise ValueError("Coupon not found")
            
        # Check ownership
        if coupon.assigned_user_id != current_user.id:
            raise ValueError("Not authorized to redeem this coupon")
            
        # Check if already redeemed
        if coupon.redeemed:
            raise ValueError("Coupon already redeemed")
            
        # Redeem coupon
        coupon.redeemed = True
        coupon.redeemed_at = datetime.utcnow()
        self.session.add(coupon)
        self.session.commit()
        self.session.refresh(coupon)
        
        return coupon

    def get_campaign_coupon_stats(self, campaign_id: uuid.UUID) -> Dict:
        """
        Get campaign coupon statistics
        
        Args:
            campaign_id: ID of the campaign
            
        Returns:
            Dictionary with stats: total, assigned, redeemed
        """
        # Verify campaign exists
        campaign = self.session.get(Campaign, campaign_id)
        if not campaign:
            raise ValueError("Campaign not found")
        
        # Get all coupons for campaign
        statement = select(Coupon).where(Coupon.campaign_id == campaign_id)
        all_coupons = self.session.exec(statement).all()
        
        total = len(all_coupons)
        
        # Count assigned coupons
        assigned = sum(1 for coupon in all_coupons if coupon.assigned_user_id is not None)
        
        # Count redeemed coupons
        redeemed = sum(1 for coupon in all_coupons if coupon.redeemed)
        
        return {
            "total": total,
            "assigned": assigned,
            "redeemed": redeemed
        }

    def get_unassigned_coupons(self, campaign_id: uuid.UUID) -> List[Coupon]:
        """
        Get unassigned coupons for a campaign
        
        Args:
            campaign_id: ID of the campaign
            
        Returns:
            List of unassigned coupons
        """
        # Verify campaign exists
        campaign = self.session.get(Campaign, campaign_id)
        if not campaign:
            raise ValueError("Campaign not found")
        
        # Get unassigned coupons
        statement = select(Coupon).where(
            Coupon.campaign_id == campaign_id,
            Coupon.assigned_user_id.is_(None)
        )
        return self.session.exec(statement).all()