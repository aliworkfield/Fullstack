from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, File
from app.api.deps import get_current_user, get_db
from sqlmodel import Session, select, func
from app.api.deps import SessionDep, require_role, CurrentUser
from app.models import User, Coupon, Campaign
from app.schemas import CouponCreate, CouponUpdate, CouponsPublic
import uuid
from datetime import datetime
from app.services.coupon_service import CouponService
import pandas as pd
from typing import List

from io import BytesIO


router = APIRouter(prefix="/admin/coupons", tags=["admin/coupons"])

@router.post(
    "/upload/{campaign_id}",
    response_model=dict,
    dependencies=[require_role(["admin", "manager"])]
)
def upload_coupons_from_excel(
    *,
    campaign_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
):
    """
    Upload coupons from Excel file

    Excel format:
    - code (required)
    - discount_type (required, 'fixed' or 'percentage')
    - discount_value (required)
    - expires_at (optional, formats: YYYY-MM-DD HH:MM:SS, YYYY.MM.DD HH:MM:SS, DD/MM/YYYY HH:MM:SS, etc.)
    - user_id (optional)
    """

    # 1️⃣ Validate file type
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=400,
            detail="File must be an Excel file (.xlsx or .xls)",
        )

    # 2️⃣ Read Excel safely
    try:
        # Log file info for debugging
        print(f"DEBUG: File name: {file.filename}")
        print(f"DEBUG: File size: {file.size}")
        print(f"DEBUG: File content type: {getattr(file, 'content_type', 'unknown')}")
        
        contents = file.file.read()
        print(f"DEBUG: Raw content length: {len(contents)}")
        
        df = pd.read_excel(BytesIO(contents))
        print(f"DEBUG: DataFrame shape: {df.shape}")
        print(f"DEBUG: DataFrame columns: {list(df.columns)}")
    except Exception as e:
        print(f"DEBUG: Excel reading error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid or corrupted Excel file: {str(e)}",
        )

    # 3️⃣ Validate required columns
    required_columns = {"code", "discount_type", "discount_value"}
    if not required_columns.issubset(df.columns):
        missing = required_columns - set(df.columns)
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(missing)}",
        )
    
    # Validate discount_type values
    valid_discount_types = {'fixed', 'percentage'}
    invalid_types = set(df['discount_type'].unique()) - valid_discount_types
    if invalid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid discount_type values: {', '.join(map(str, invalid_types))}. Must be 'fixed' or 'percentage'."
        )

    # 4️⃣ Validate campaign exists
    campaign = session.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    created_coupons = []
    seen_codes = set()

    # 5️⃣ Process rows
    for index, row in df.iterrows():
        code = str(row["code"]).strip()

        if not code:
            raise HTTPException(
                status_code=400,
                detail=f"Empty coupon code at row {index + 2}",
            )

        if code in seen_codes:
            raise HTTPException(
                status_code=400,
                detail=f"Duplicate coupon code in file: {code}",
            )

        seen_codes.add(code)

        # Prepare coupon data
        coupon_data = {
            "code": code,
            "campaign_id": campaign_id,
            "discount_type": str(row["discount_type"]),
            "discount_value": float(row["discount_value"]),
        }
        
        # Handle optional expires_at field
        if "expires_at" in df.columns and pd.notna(row["expires_at"]):
            expires_at_str = str(row["expires_at"])
            if expires_at_str.lower() != 'null' and expires_at_str.strip() != '':
                try:
                    # Parse the date - could be in various formats
                    # Try multiple common date formats
                    date_formats = [
                        '%Y-%m-%d %H:%M:%S',  # 2027-01-01 00:00:54
                        '%Y.%m.%d %H:%M:%S',  # 2027.01.01 00:00:54
                        '%d/%m/%Y %H:%M:%S',  # 01/01/2027 00:00:54
                        '%d-%m-%Y %H:%M:%S',  # 01-01-2027 00:00:54
                        '%Y/%m/%d %H:%M:%S',  # 2027/01/01 00:00:54
                        '%m/%d/%Y %H:%M',     # 01/01/2027 00:00
                        '%d.%m.%Y %H:%M:%S',  # 01.01.2027 00:00:54
                    ]
                    
                    parsed_date = None
                    for fmt in date_formats:
                        try:
                            parsed_date = pd.to_datetime(expires_at_str, format=fmt)
                            break
                        except:
                            continue
                    
                    # If none of the specific formats worked, try general parsing
                    if parsed_date is None:
                        parsed_date = pd.to_datetime(expires_at_str)
                    
                    coupon_data["expires_at"] = parsed_date
                except Exception as e:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid date format for expires_at: '{expires_at_str}'. Expected format: YYYY-MM-DD HH:MM:SS or similar (e.g., YYYY.MM.DD HH:MM:SS)"
                    )
        
        # Optional user assignment
        if "user_id" in df.columns and pd.notna(row["user_id"]):
            try:
                user_id = uuid.UUID(str(row["user_id"]))
                coupon_data["assigned_to_user_id"] = user_id  # Use the correct field name
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid user_id at row {index + 2}",
                )
        
        coupon = Coupon(**coupon_data)

        session.add(coupon)
        created_coupons.append(coupon)

    # 6️⃣ Commit once (atomic)
    session.commit()

    return {
        "message": f"Successfully uploaded {len(created_coupons)} coupons",
        "count": len(created_coupons),
        "coupon_codes": [c.code for c in created_coupons],
    }

@router.get("/user/{user_id}/campaign/{campaign_id}", response_model=dict, dependencies=[require_role(["admin", "manager"])])
def get_user_coupon_for_campaign(
    user_id: uuid.UUID,
    campaign_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
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
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
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
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
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
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
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
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
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
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
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
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
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
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
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
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
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
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
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