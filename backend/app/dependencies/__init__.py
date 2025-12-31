from fastapi import Depends, HTTPException, status
from sqlmodel import Session
from app.core.database import get_session
from app.models import User


def get_db():
    """Dependency to get database session"""
    return Depends(get_session)


def get_current_user():
    """Dependency to get current authenticated user"""
    # This would integrate with your authentication system
    # For now, returning a mock user
    return User()


def get_current_admin_user():
    """Dependency to get current admin user"""
    # This would integrate with your authentication system
    # For now, returning a mock user with admin privileges
    return User()