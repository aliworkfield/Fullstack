#!/usr/bin/env python3

import sys
import os
import json

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlmodel import Session
from app.core.db import engine
from app.models import User

def check_user_data():
    """Check what user data is in the database"""
    print("Checking user data in database...")
    with Session(engine) as session:
        users = session.query(User).all()
        print(f"Found {len(users)} users")
        for i, user in enumerate(users):
            print(f"\nUser {i+1}:")
            print(f"  ID: {user.id}")
            print(f"  Email: {user.email}")
            print(f"  Full name: {user.full_name}")
            print(f"  Keycloak user ID: {user.keycloak_user_id}")
            print(f"  Is active: {user.is_active}")
            print(f"  Is superuser: {user.is_superuser}")
            
            # Convert to dict to see what would be returned by the API
            user_dict = {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "keycloak_user_id": user.keycloak_user_id,
                "is_active": user.is_active,
                "is_superuser": user.is_superuser
            }
            print(f"  API response would be: {json.dumps(user_dict, indent=2)}")

if __name__ == "__main__":
    check_user_data()