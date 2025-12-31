import sentry_sdk
from fastapi import FastAPI, Request, Response
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import Response as StarletteResponse
import traceback
import logging

from app.api.main import api_router
from app.core.config import settings
from app.routers.admin import campaigns as admin_campaigns_router
from app.routers.admin import coupons as admin_coupons_router
from app.routers.admin import announcements as admin_announcements_router
from app.routers.user import coupons as user_coupons_router


def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

# Set all CORS enabled origins
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        # Remove expose_headers that might cause issues
    )


# DEBUG TOKEN INTERCEPT - Log incoming requests and tokens
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger = logging.getLogger("uvicorn")
    
    # Log all headers
    logger.info(f"DEBUG ALL HEADERS: {dict(request.headers)}")
    
    # Log the authorization header
    auth_header = request.headers.get("authorization")
    if auth_header:
        logger.info(f"DEBUG AUTH HEADER: {auth_header[:50]}{'...' if len(auth_header) > 50 else ''}")
    else:
        logger.info("DEBUG AUTH HEADER: None")
    
    # Log the request
    logger.info(f"DEBUG REQUEST: {request.method} {request.url}")
    
    try:
        response = await call_next(request)
        logger.info(f"DEBUG RESPONSE: {response.status_code}")
    except Exception as e:
        logger.error(f"DEBUG EXCEPTION: {e}")
        logger.error(f"DEBUG TRACEBACK: {traceback.format_exc()}")
        # Create a response with CORS headers even for exceptions
        response = StarletteResponse(
            content='{"detail": "Internal server error"}',
            status_code=500,
            media_type="application/json"
        )
        # Add CORS headers to error responses
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    
    # Only add CORS headers if not already set by middleware (to avoid conflicts)
    # This handles both normal responses and exception responses
    if hasattr(response, "headers"):
        # Don't override existing CORS headers to avoid conflicts
        if "Access-Control-Allow-Origin" not in response.headers:
            response.headers["Access-Control-Allow-Origin"] = "*"
        if "Access-Control-Allow-Methods" not in response.headers:
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        if "Access-Control-Allow-Headers" not in response.headers:
            response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        
    return response

app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(admin_campaigns_router.router, prefix=settings.API_V1_STR)
app.include_router(admin_coupons_router.router, prefix=settings.API_V1_STR)
app.include_router(admin_announcements_router.router, prefix=settings.API_V1_STR)
app.include_router(user_coupons_router.router, prefix=settings.API_V1_STR)