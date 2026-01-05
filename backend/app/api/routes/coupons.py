from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session

from app.api.deps import CurrentUser, SessionDep, require_role
from app.crud import (
    create_coupon,
    delete_coupon,
    get_coupon,
    get_coupons,
    get_user_coupons,
    redeem_coupon,
    update_coupon,
)
from app.models import (
    Coupon,
)
from app.schemas import (
    CouponCreate,
    CouponPublic,
    CouponsPublic,
    Message,
)

router = APIRouter(prefix="/coupons", tags=["coupons"])


@router.options("/")
def coupons_options(response: Response):
    """Handle OPTIONS request for coupons collection"""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    return {}


@router.post("/", response_model=CouponPublic, dependencies=[require_role(["admin", "manager"])])
def create_coupon_endpoint(
    *, 
    response: Response,
    session: SessionDep, 
    current_user: CurrentUser, 
    coupon_in: CouponCreate
) -> Coupon:
    """
    Create new coupon.
    Requires admin or manager role.
    """
    # Add CORS headers explicitly
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    
    return create_coupon(session=session, coupon_in=coupon_in)


# @router.get("/", response_model=CouponsPublic, dependencies=[require_role(["admin", "manager"])])
# def read_coupons(
#     response: Response,
#     session: SessionDep, 
#     current_user: CurrentUser, 
#     skip: int = 0, 
#     limit: int = 100
# ) -> CouponsPublic:
#     """
#     Retrieve coupons.
#     Requires admin or manager role.
#     """
#     # Add CORS headers explicitly
#     response.headers["Access-Control-Allow-Origin"] = "*"
#     response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
#     response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    
#     coupons = get_coupons(session=session, skip=skip, limit=limit)
#     count = len(coupons)
#     return CouponsPublic(data=coupons, count=count)

@router.get("/", response_model=CouponsPublic, dependencies=[require_role(["admin", "manager"])])
def read_coupons(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100
) -> CouponsPublic:
    """
    Retrieve coupons. Requires admin or manager role.
    """
    try:
        # Fetch coupons
        coupons_list = get_coupons(session=session, skip=skip, limit=limit)

        # Count total number of coupons in DB
        total_count = session.exec(select(func.count()).select_from(Coupon)).one()

        return CouponsPublic(data=coupons_list, count=total_count)
    except Exception as e:
        # Catch unexpected errors to avoid 500 without trace
        return JSONResponse(status_code=500, content={"detail": str(e)})


        # -------------------------------------------------------------------------------


@router.options("/my")
def user_coupons_options(response: Response):
    """Handle OPTIONS request for user coupons"""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    return {}


@router.get("/my", response_model=CouponsPublic)
def read_user_coupons(
    response: Response,
    session: SessionDep, 
    current_user: CurrentUser
) -> CouponsPublic:
    """
    Retrieve coupons assigned to current user.
    """
    # Add CORS headers explicitly
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    
    coupons = get_user_coupons(session=session, user_id=current_user.id)
    count = len(coupons)
    return CouponsPublic(data=coupons, count=count)


@router.options("/{id}")
def coupon_options(response: Response, id: str):
    """Handle OPTIONS request for a specific coupon"""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    return {}


@router.get("/{id}", response_model=CouponPublic)
def read_coupon(
    response: Response,
    session: SessionDep, 
    id: str
) -> Coupon:
    """
    Get coupon by ID.
    """
    # Add CORS headers explicitly
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    
    coupon = get_coupon(session=session, coupon_id=id)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return coupon


@router.put("/{id}", response_model=CouponPublic, dependencies=[require_role(["admin", "manager"])])
def update_coupon_endpoint(
    *,
    response: Response,
    session: SessionDep,
    current_user: CurrentUser,
    id: str,
    coupon_in: CouponCreate
) -> Coupon:
    """
    Update a coupon.
    Requires admin or manager role.
    """
    # Add CORS headers explicitly
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    
    coupon = get_coupon(session=session, coupon_id=id)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return update_coupon(session=session, coupon=coupon, coupon_in=coupon_in)


@router.delete("/{id}", dependencies=[require_role(["admin"])])
def delete_coupon_endpoint(
    response: Response,
    session: SessionDep, 
    current_user: CurrentUser, 
    id: str
) -> Message:
    """
    Delete a coupon.
    Requires admin role.
    """
    # Add CORS headers explicitly
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    
    coupon = get_coupon(session=session, coupon_id=id)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    delete_coupon(session=session, coupon=coupon)
    return Message(message="Coupon deleted successfully")


@router.options("/{id}/redeem")
def redeem_coupon_options(response: Response, id: str):
    """Handle OPTIONS request for redeeming a coupon"""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    return {}


@router.post("/{id}/redeem", response_model=CouponPublic)
def redeem_coupon_endpoint(
    response: Response,
    session: SessionDep, 
    current_user: CurrentUser, 
    id: str
) -> Coupon:
    """
    Redeem a coupon.
    Requires user role and ownership of the coupon.
    """
    # Add CORS headers explicitly
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    
    coupon = get_coupon(session=session, coupon_id=id)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    # Check if coupon is assigned to the current user
    if coupon.assigned_to_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to redeem this coupon")
    
    if coupon.redeemed:
        raise HTTPException(status_code=400, detail="Coupon already redeemed")
    
    return redeem_coupon(session=session, coupon=coupon)