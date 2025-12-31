from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session, select
from app.dependencies import get_db
from app.api.deps import require_role
from app.models import Announcement, User
from app.schemas import AnnouncementCreate, AnnouncementUpdate, AnnouncementPublic
from app.crud import get_announcements, get_announcement
import uuid
from datetime import datetime, timedelta

router = APIRouter(prefix="/admin/announcements", tags=["admin/announcements"])


@router.options("/")
def announcements_options(response: Response):
    """Handle OPTIONS request for announcements collection"""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    return {}


@router.options("/{announcement_id}")
def announcement_item_options(response: Response):
    """Handle OPTIONS request for announcements item"""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    return {}


@router.get("/", response_model=dict)
def get_all_announcements(
    db: Session = Depends(get_db),
    category: str | None = None,
    search: str | None = None,
    new_category: bool = False,
    current_user: User = require_role(["admin", "manager"])
):
    """Get all announcements that are not soft deleted and not expired"""
    try:
        # Get announcements that are not soft deleted and not expired
        announcements = get_announcements(
            session=db,
            skip=0,
            limit=1000,  # High limit for admin view
            include_deleted=False,
            category=category,
            search=search,
            include_new=new_category
        )
        return {"announcements": announcements, "count": len(announcements)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{announcement_id}", response_model=AnnouncementPublic)
def get_announcement_by_id(
    announcement_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = require_role(["admin", "manager"])
):
    """Get a specific announcement that is not soft deleted"""
    try:
        announcement = get_announcement(session=db, announcement_id=announcement_id)
        if not announcement:
            raise HTTPException(status_code=404, detail="Announcement not found")
        
        # Check if announcement is soft deleted
        if announcement.deleted_at is not None:
            raise HTTPException(status_code=404, detail="Announcement not found")
        
        # Check if announcement is expired
        if announcement.expiry_date and announcement.expiry_date < datetime.utcnow():
            raise HTTPException(status_code=404, detail="Announcement not found")
        
        return announcement
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=AnnouncementPublic)
def create_announcement(
    announcement_in: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = require_role(["admin", "manager"])
):
    """Create a new announcement"""
    try:
        announcement = Announcement.model_validate(announcement_in)
        db.add(announcement)
        db.commit()
        db.refresh(announcement)
        return announcement
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{announcement_id}", response_model=AnnouncementPublic)
def update_announcement(
    announcement_id: uuid.UUID,
    announcement_update: AnnouncementUpdate,
    db: Session = Depends(get_db),
    current_user: User = require_role(["admin", "manager"])
):
    """Update an announcement that is not soft deleted"""
    try:
        announcement = db.get(Announcement, announcement_id)
        if not announcement:
            raise HTTPException(status_code=404, detail="Announcement not found")
        
        # Check if announcement is soft deleted
        if announcement.deleted_at is not None:
            raise HTTPException(status_code=404, detail="Announcement not found")
        
        # Update announcement fields
        for key, value in announcement_update.dict(exclude_unset=True).items():
            setattr(announcement, key, value)
        
        db.add(announcement)
        db.commit()
        db.refresh(announcement)
        return announcement
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{announcement_id}", response_model=dict)
def delete_announcement(
    announcement_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = require_role(["admin"])
):
    """Delete an announcement (soft delete)"""
    try:
        announcement = db.get(Announcement, announcement_id)
        if not announcement:
            raise HTTPException(status_code=404, detail="Announcement not found")
        
        # Check if announcement is already soft deleted
        if announcement.deleted_at is not None:
            raise HTTPException(status_code=404, detail="Announcement already deleted")
        
        # Perform soft delete
        announcement.deleted_at = datetime.utcnow()
        db.add(announcement)
        db.commit()
        return {"message": "Announcement deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))