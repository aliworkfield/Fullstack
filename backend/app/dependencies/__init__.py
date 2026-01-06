from fastapi import Depends, HTTPException, status
from sqlmodel import Session
from app.core.db import engine
from app.models import User
from typing import Generator


def get_db() -> Generator[Session, None, None]:
    """Dependency to get database session"""
    with Session(engine) as session:
        yield session


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