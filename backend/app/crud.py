import uuid
from datetime import datetime, timedelta
from typing import Any

from sqlmodel import Session, select


from app.models import (
    Announcement, 
    AnnouncementCreate,
    AnnouncementUpdate,
)
from app.models import (
    Campaign, 
    Coupon, 
    User,
    Item
)
from app.schemas import (
    CampaignCreate,
    CouponCreate,
    UserCreate,
    UserUpdate,
    ItemCreate
)


def create_user(*, session: Session, user_create: UserCreate) -> User:
    user_data = user_create.model_dump()
    db_obj = User(**user_data)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    # With Keycloak-only authentication, this function should only validate that the user exists
    user = get_user_by_email(session=session, email=email)
    if not user:
        return None
    # In Keycloak-only mode, we assume authentication was handled by Keycloak
    # and the user is valid
    return user


def create_item(*, session: Session, item_in: ItemCreate, owner_id: uuid.UUID) -> Item:
    item = Item.model_validate(item_in, update={"owner_id": owner_id})
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def get_item(*, session: Session, item_id: uuid.UUID) -> Item | None:
    return session.get(Item, item_id)


def get_items(*, session: Session, owner_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Item]:
    statement = select(Item).where(Item.owner_id == owner_id).offset(skip).limit(limit)
    return session.exec(statement).all()


def update_item(*, session: Session, item: Item, item_in: ItemCreate) -> Item:
    item_data = item_in.model_dump(exclude_unset=True)
    item.sqlmodel_update(item_data)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def delete_item(*, session: Session, item: Item) -> None:
    session.delete(item)
    session.commit()


# Campaign CRUD operations
def create_campaign(*, session: Session, campaign_in: CampaignCreate) -> Campaign:
    db_obj = Campaign.model_validate(campaign_in)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_campaign(*, session: Session, campaign_id: uuid.UUID) -> Campaign | None:
    return session.get(Campaign, campaign_id)


def get_campaigns(*, session: Session, skip: int = 0, limit: int = 100) -> list[Campaign]:
    from sqlmodel import select
    statement = select(Campaign).offset(skip).limit(limit)
    result = session.exec(statement).all()
    return result


def update_campaign(*, session: Session, campaign: Campaign, campaign_in: CampaignCreate) -> Campaign:
    campaign_data = campaign_in.model_dump(exclude_unset=True)
    for key, value in campaign_data.items():
        setattr(campaign, key, value)
    session.add(campaign)
    session.commit()
    session.refresh(campaign)
    return campaign


def delete_campaign(*, session: Session, campaign: Campaign) -> None:
    session.delete(campaign)
    session.commit()


# Coupon CRUD operations
def create_coupon(*, session: Session, coupon_in: CouponCreate) -> Coupon:
    db_obj = Coupon.model_validate(coupon_in)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_coupon(*, session: Session, coupon_id: uuid.UUID) -> Coupon | None:
    return session.get(Coupon, coupon_id)


def get_coupons(*, session: Session, skip: int = 0, limit: int = 100) -> list[Coupon]:
    statement = select(Coupon).offset(skip).limit(limit)
    return session.exec(statement).all()


def get_user_coupons(*, session: Session, user_id: uuid.UUID) -> list[Coupon]:
    print(f"DEBUG: Getting coupons for user_id: {user_id}")
    try:
        statement = select(Coupon).where(Coupon.assigned_to_user_id == user_id)
        result = session.exec(statement).all()
        print(f"DEBUG: Got {len(result)} coupons for user")
        return result
    except Exception as e:
        print(f"DEBUG: Error getting user coupons: {e}")
        raise


def update_coupon(*, session: Session, coupon: Coupon, coupon_in: CouponCreate) -> Coupon:
    coupon_data = coupon_in.model_dump(exclude_unset=True)
    coupon.sqlmodel_update(coupon_data)
    session.add(coupon)
    session.commit()
    session.refresh(coupon)
    return coupon


def delete_coupon(*, session: Session, coupon: Coupon) -> None:
    session.delete(coupon)
    session.commit()


def redeem_coupon(*, session: Session, coupon: Coupon) -> Coupon:
    coupon.redeemed = True
    session.add(coupon)
    session.commit()
    session.refresh(coupon)
    return coupon


# Announcement CRUD operations
def create_announcement(*, session: Session, announcement_in: AnnouncementCreate) -> Announcement:
    db_obj = Announcement.model_validate(announcement_in)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_announcement(*, session: Session, announcement_id: uuid.UUID) -> Announcement | None:
    return session.get(Announcement, announcement_id)


def get_announcements(*, session: Session, skip: int = 0, limit: int = 100, status: str | None = None, include_deleted: bool = False, category: str | None = None, search: str | None = None, include_new: bool = False, include_expired: bool = False) -> list[Announcement]:
    statement = select(Announcement)
    if not include_deleted:
        statement = statement.where(Announcement.deleted_at.is_(None))  # Exclude soft deleted records
    if status:
        # Convert status to is_published for compatibility
        if status == "published":
            statement = statement.where(Announcement.is_published == True)
        elif status == "draft":
            statement = statement.where(Announcement.is_published == False)
    
    # Apply include_new filter if provided - for 'New' category (created in last 10 days)
    if include_new:
        ten_days_ago = datetime.utcnow() - timedelta(days=10)
        statement = statement.where(Announcement.created_date >= ten_days_ago)
    
    # Conditionally exclude expired announcements (where expiry_date is in the past)
    if not include_expired:
        statement = statement.where(
            (Announcement.expiry_date.is_(None)) | (Announcement.expiry_date > datetime.utcnow())
        )
    
    # Apply category filter if provided
    if category:
        statement = statement.where(Announcement.category.ilike(f"%{category}%"))
    
    # Apply search filter if provided (search in title and description)
    if search:
        search_filter = f"%{search}%"
        statement = statement.where(
            (Announcement.title.ilike(search_filter)) | 
            (Announcement.description.ilike(search_filter))
        )
    
    statement = statement.offset(skip).limit(limit)
    result = session.exec(statement).all()
    return result


def get_published_announcements(*, session: Session, skip: int = 0, limit: int = 100, include_deleted: bool = False, category: str | None = None, search: str | None = None, include_new: bool = False) -> list[Announcement]:
    statement = select(Announcement).where(Announcement.is_published == True)
    if not include_deleted:
        statement = statement.where(Announcement.deleted_at.is_(None))  # Exclude soft deleted records
    
    # Apply include_new filter if provided - for 'New' category (created in last 10 days)
    if include_new:
        ten_days_ago = datetime.utcnow() - timedelta(days=10)
        statement = statement.where(Announcement.created_date >= ten_days_ago)
    
    # Exclude expired announcements (where expiry_date is in the past)
    statement = statement.where(
        (Announcement.expiry_date.is_(None)) | (Announcement.expiry_date > datetime.utcnow())
    )
    
    # Apply category filter if provided
    if category:
        statement = statement.where(Announcement.category.ilike(f"%{category}%"))
    
    # Apply search filter if provided (search in title and description)
    if search:
        search_filter = f"%{search}%"
        statement = statement.where(
            (Announcement.title.ilike(search_filter)) | 
            (Announcement.description.ilike(search_filter))
        )
    
    statement = statement.offset(skip).limit(limit)
    result = session.exec(statement).all()
    return result


def update_announcement(*, session: Session, announcement: Announcement, announcement_in: AnnouncementUpdate) -> Announcement:
    announcement_data = announcement_in.model_dump(exclude_unset=True)
    announcement.sqlmodel_update(announcement_data)
    session.add(announcement)
    session.commit()
    session.refresh(announcement)
    return announcement


def delete_announcement(*, session: Session, announcement: Announcement) -> None:
    # Soft delete: set deleted_at timestamp instead of removing from database
    announcement.deleted_at = datetime.utcnow()
    session.add(announcement)
    session.commit()