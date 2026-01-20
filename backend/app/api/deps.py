from collections.abc import Generator
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlmodel import Session, select

from app.core import security
from app.core.config import settings
from app.core.db import engine
from app.models import User

# Use HTTPBearer instead of OAuth2PasswordBearer for JWT tokens
reusable_http_bearer = HTTPBearer()

def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[HTTPAuthorizationCredentials, Depends(reusable_http_bearer)]

def get_current_user(session: SessionDep, token: TokenDep) -> User:
    try:
        if not token.credentials:
            raise HTTPException(status_code=403, detail="Empty token")
            
        # Validate Keycloak token and extract user info
        # Keycloak only handles authentication, not authorization
        user_info = security.get_user_info_from_token(token.credentials)
        
        keycloak_user_id = user_info.get("user_id")
        
        # Check if user exists in our database
        user = None
        
        # First, try to find by Keycloak user ID
        if keycloak_user_id:
            statement = select(User).where(User.keycloak_user_id == keycloak_user_id)
            user = session.exec(statement).first()
        
        # If not found by Keycloak ID, try to find by email
        email = user_info.get("email")
        if not user and email:
            statement = select(User).where(User.email == email)
            user = session.exec(statement).first()
        
        if not user:
            # Create user if not exists - default role is "user"
            user = User(
                email=email or f"unknown_{keycloak_user_id}@example.com",
                full_name=user_info.get("full_name") or f"User {keycloak_user_id}",
                keycloak_user_id=keycloak_user_id,
                is_active=True,
                role="user"  # New users get "user" role by default
            )
            session.add(user)
            session.commit()
            session.refresh(user)
        else:
            # Update Keycloak user ID if it was missing
            updated = False
            if not user.keycloak_user_id and keycloak_user_id:
                user.keycloak_user_id = keycloak_user_id
                updated = True
                
            # Update email if changed
            if email and user.email != email:
                user.email = email
                updated = True
                
            # Update full name if changed
            full_name = user_info.get("full_name")
            if full_name and user.full_name != full_name:
                user.full_name = full_name
                updated = True
                
            if updated:
                session.add(user)
                session.commit()
                session.refresh(user)
            
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
        return user
    except (ValueError, InvalidTokenError, ValidationError) as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )

CurrentUser = Annotated[User, Depends(get_current_user)]

def get_current_active_superuser(current_user: CurrentUser) -> User:
    """Check if user has admin role"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user

def require_role(required_roles: str | list[str]):
    """
    Dependency to check if user has specific roles (any of the provided roles).
    Roles are now stored in the database, not from Keycloak token.
    
    Usage:
        @router.get("/", dependencies=[require_role(["admin", "manager"])])
        @router.delete("/", dependencies=[require_role("admin")])
    """
    if isinstance(required_roles, str):
        required_roles = [required_roles]
    
    def role_checker(current_user: CurrentUser) -> User:
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{current_user.role}' not authorized. Required roles: {required_roles}"
            )
        return current_user

    return Depends(role_checker)
