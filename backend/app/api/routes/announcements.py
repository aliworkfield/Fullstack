from fastapi import APIRouter, Depends, HTTPException, Response, Query
from sqlmodel import Session, select
from datetime import datetime, timedelta

from app.api.deps import CurrentUser, SessionDep, require_role, TokenDep
from app.crud import (
    create_announcement,
    delete_announcement,
    get_announcement,
    get_announcements,
    get_published_announcements,
    update_announcement,
)
from app.models import (
    Announcement,
    AnnouncementPublic,
    AnnouncementsPublic,
    AnnouncementCreate,
    AnnouncementUpdate,
)
from app.schemas import Message
from app.core import security


router = APIRouter(prefix="/announcements", tags=["announcements"])


@router.options("/")
def announcements_options(response: Response):
    """Handle OPTIONS request for announcements collection"""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    return {}


@router.get("/published", response_model=AnnouncementsPublic)
def read_published_announcements(
    response: Response,
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    category: str | None = None,
    search: str | None = None,
    new_category: bool = Query(default=False, description="Include announcements created in the last 10 days"),
) -> AnnouncementsPublic:
    """
    Retrieve published announcements.
    All users can see published, non-expired, non-soft-deleted announcements.
    Supports optional filtering by category and search in title/description.
    """
    # Add CORS headers explicitly
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    
    # Get published announcements that are not soft deleted or expired
    announcements = get_published_announcements(
        session=session, 
        skip=skip, 
        limit=limit, 
        include_deleted=False,
        category=category,
        search=search,
        include_new=new_category
    )
    
    return AnnouncementsPublic(data=announcements, count=len(announcements))


@router.post("/", response_model=AnnouncementPublic, dependencies=[require_role(["admin", "manager"])])
def create_announcement_endpoint(
    *, 
    response: Response,
    session: SessionDep, 
    current_user: CurrentUser, 
    announcement_in: AnnouncementCreate
) -> Announcement:
    """
    Create new announcement.
    Requires admin or manager role.
    """
    # Add CORS headers explicitly
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    
    return create_announcement(session=session, announcement_in=announcement_in)


@router.get("/", response_model=AnnouncementsPublic)
def read_announcements(
    response: Response,
    session: SessionDep,
    current_user: CurrentUser,
    token: TokenDep,  # Added token dependency to extract roles from JWT
    skip: int = 0,
    limit: int = 100,
    category: str | None = None,
    search: str | None = None,
    new_category: bool = Query(default=False, description="Include announcements created in the last 10 days"),
) -> AnnouncementsPublic:
    """
    Retrieve announcements.
    Regular users only see published, non-expired, non-soft-deleted announcements.
    Managers and admins see ALL their announcements (published, drafts, and expired) that are not soft deleted.
    Supports optional filtering by category and search in title/description.
    """
    # Add CORS headers explicitly
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    
    # Extract roles from the JWT token
    try:
        user_info = security.get_user_info_from_token(token.credentials)
        user_roles = user_info.get("roles", [])
    except Exception as e:
        print(f"DEBUG: Error extracting roles from token: {e}")
        user_roles = []
    
    # Determine if user is manager/admin to see all announcements
    is_manager_or_admin = any(role in ['manager', 'admin'] for role in user_roles)
    
    if is_manager_or_admin:
        # Managers/admins can see ALL their announcements (published, drafts, and expired) that are not soft deleted
        # Do NOT filter out expired announcements for managers/admins so they can see everything
        announcements = get_announcements(
            session=session, 
            skip=skip, 
            limit=limit, 
            include_deleted=False, 
            category=category, 
            search=search, 
            include_new=new_category,
            include_expired=True  # Include expired announcements for managers/admins
        )
    else:
        # Regular users only see published, non-expired announcements that are not soft deleted
        announcements = get_published_announcements(
            session=session, 
            skip=skip, 
            limit=limit, 
            include_deleted=False, 
            category=category, 
            search=search, 
            include_new=new_category
        )
        
        # Filter out expired announcements for regular users
        now = datetime.utcnow()
        non_expired_announcements = [ann for ann in announcements if not ann.expiry_date or ann.expiry_date > now]
        return AnnouncementsPublic(data=non_expired_announcements, count=len(non_expired_announcements))
    
    return AnnouncementsPublic(data=announcements, count=len(announcements))


@router.get("/{id}", response_model=AnnouncementPublic)
def read_announcement(
    response: Response,
    session: SessionDep, 
    current_user: CurrentUser,
    token: TokenDep,  # Added token dependency to extract roles from JWT
    id: str
) -> Announcement:
    """
    Get announcement by ID.
    Regular users can only access published, non-expired, non-soft-deleted announcements.
    Managers/admins can access all their announcements that are not soft deleted.
    """
    # Add CORS headers explicitly
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    
    announcement = get_announcement(session=session, announcement_id=id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    # Check if announcement is soft deleted
    if announcement.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    # Extract roles from the JWT token
    try:
        user_info = security.get_user_info_from_token(token.credentials)
        user_roles = user_info.get("roles", [])
    except Exception as e:
        print(f"DEBUG: Error extracting roles from token: {e}")
        user_roles = []
    
    # Check permissions
    is_manager_or_admin = any(role in ['manager', 'admin'] for role in user_roles)
    
    if not is_manager_or_admin:
        # Regular users: check if announcement is expired
        if announcement.expiry_date and announcement.expiry_date < datetime.utcnow():
            raise HTTPException(status_code=404, detail="Announcement not found")
        
        # Regular users: can't access unpublished announcements
        if not announcement.is_published:
            raise HTTPException(status_code=403, detail="Not authorized to view this announcement")
    
    return announcement


@router.put("/{id}", response_model=AnnouncementPublic, dependencies=[require_role(["admin", "manager"])])
def update_announcement_endpoint(
    *,
    response: Response,
    session: SessionDep,
    current_user: CurrentUser,
    id: str,
    announcement_in: AnnouncementUpdate
) -> AnnouncementPublic:
    """
    Update an announcement.
    Requires admin or manager role.
    """
    # Add CORS headers explicitly
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    
    announcement = get_announcement(session=session, announcement_id=id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    # Check if announcement is soft deleted
    if announcement.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    return update_announcement(session=session, announcement=announcement, announcement_in=announcement_in)


@router.delete("/{id}", dependencies=[require_role(["admin"])])
def delete_announcement_endpoint(
    response: Response,
    session: SessionDep, 
    current_user: CurrentUser, 
    id: str
) -> Message:
    """
    Delete an announcement (soft delete).
    Requires admin role.
    """
    # Add CORS headers explicitly
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    
    announcement = get_announcement(session=session, announcement_id=id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    # Check if announcement is already soft deleted
    if announcement.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Announcement already deleted")
    
    delete_announcement(session=session, announcement=announcement)
    return Message(message="Announcement deleted successfully")