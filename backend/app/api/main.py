from fastapi import APIRouter

from app.api.routes import announcements, campaigns, coupons, items, private, users, utils
from app.core.config import settings

api_router = APIRouter()

api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(campaigns.router)
api_router.include_router(coupons.router)
api_router.include_router(announcements.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)