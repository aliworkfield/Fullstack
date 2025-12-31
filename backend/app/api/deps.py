from collections.abc import Generator
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlmodel import Session

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
        print(f"DEBUG: Token object: {token}")
        print(f"DEBUG: Token credentials: {token.credentials}")
        print(f"DEBUG: Token scheme: {token.scheme}")
        
        if not token.credentials:
            print("DEBUG: Empty token credentials")
            raise HTTPException(status_code=403, detail="Empty token")
            
        # Validate Keycloak token and extract user info
        # The token.credentials contains the actual JWT token
        user_info = security.get_user_info_from_token(token.credentials)
        
        # Log the extracted user info for debugging
        print(f"DEBUG: Extracted user info: {user_info}")
        
        keycloak_user_id = user_info.get("user_id")
        user_roles = user_info.get("roles", [])
        
        # Check if user exists in our database, create if not
        user = None
        
        # First, try to find by Keycloak user ID if available
        if keycloak_user_id:
            user = session.query(User).filter(User.keycloak_user_id == keycloak_user_id).first()
        
        # If not found by Keycloak ID, try to find by email
        email = user_info.get("email")
        if not user and email:
            user = session.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"DEBUG: Creating new user for email: {email}")
            # Create user if not exists
            user = User(
                email=email or f"unknown_{keycloak_user_id}@example.com",  # Use a fallback if no email
                full_name=user_info.get("full_name") or f"User {keycloak_user_id}",  # Use a fallback if no name
                keycloak_user_id=keycloak_user_id,
                is_active=True,
                is_superuser="admin" in user_roles  # Set superuser based on Keycloak roles
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            print(f"DEBUG: Created new user with id: {user.id}")
        else:
            print(f"DEBUG: Using existing user with id: {user.id}")
            # Update user info if needed
            updated = False
            
            # Update Keycloak user ID if it was missing
            if not user.keycloak_user_id and keycloak_user_id:
                user.keycloak_user_id = keycloak_user_id
                updated = True
                
            # Update email if it was missing or changed
            email = user_info.get("email")
            if email and user.email != email:
                user.email = email
                updated = True
                
            # Update full name if it was missing or changed
            full_name = user_info.get("full_name")
            if full_name and user.full_name != full_name:
                user.full_name = full_name
                updated = True
                
            # Update superuser status based on Keycloak roles
            is_admin = "admin" in user_roles
            if user.is_superuser != is_admin:
                user.is_superuser = is_admin
                updated = True
                
            if updated:
                session.add(user)
                session.commit()
                session.refresh(user)
                print(f"DEBUG: Updated user information for user id: {user.id}")
            
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
        return user
    except (ValueError, InvalidTokenError, ValidationError) as e:
        print(f"DEBUG: Token validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )

CurrentUser = Annotated[User, Depends(get_current_user)]

def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user

def require_role(required_roles: str | list[str]):
    """
    Dependency to check if user has specific roles (any of the provided roles)
    """
    def role_checker(current_user: CurrentUser, token: TokenDep) -> User:
        try:
            # Validate Keycloak token and extract user info
            user_info = security.get_user_info_from_token(token.credentials)
            user_roles = user_info.get("roles", [])
            
            # Convert single role to list for uniform processing
            if isinstance(required_roles, str):
                required_roles_list = [required_roles]
            else:
                required_roles_list = required_roles
            
            # Check if user has any of the required roles
            if not any(role in user_roles for role in required_roles_list):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"The user doesn't have any of the required roles: {required_roles_list}"
                )
            return current_user
        except (ValueError, InvalidTokenError, ValidationError):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Could not validate credentials",
            )
    
    return Depends(role_checker)