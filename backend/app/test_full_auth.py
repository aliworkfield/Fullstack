#!/usr/bin/env python3

import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlmodel import Session
from app.core.db import engine
from app.models import User
from app.core.security import get_user_info_from_token

# Import KeycloakOpenID directly to use frontend client
from keycloak import KeycloakOpenID

def test_full_authentication_flow():
    """Test the full authentication flow including user creation in database"""
    try:
        # Initialize Keycloak client with frontend credentials
        keycloak_openid = KeycloakOpenID(
            server_url="http://keycloak:8080",  # Internal Docker network URL
            client_id="coupon-frontend",
            realm_name="coupon-realm",
            client_secret_key="",  # Public client has no secret
        )
        print("✅ Keycloak frontend client initialized")
        
        # Get a token for a test user
        print("Getting token for adminuser...")
        token_response = keycloak_openid.token(username="adminuser", password="password123")
        access_token = token_response.get('access_token')
        
        if not access_token:
            print("❌ No access token received")
            return
            
        print("✅ Got access token")
        
        # Now use the backend client to validate the token
        from app.core.security import keycloak_openid as backend_keycloak
        if not backend_keycloak:
            print("❌ Backend Keycloak client not initialized")
            return
            
        print("✅ Backend Keycloak client initialized")
        
        # Extract user info from token
        print("Extracting user info from token...")
        user_info = get_user_info_from_token(access_token)
        print(f"✅ Extracted user info:")
        print(f"  User ID: {user_info.get('user_id')}")
        print(f"  Email: {user_info.get('email')}")
        print(f"  Full name: {user_info.get('full_name')}")
        print(f"  Roles: {user_info.get('roles')}")
        
        # Check if user exists in database, create if not
        print("Checking if user exists in database...")
        with Session(engine) as session:
            # Look for user by Keycloak user ID first
            db_user = None
            keycloak_user_id = user_info.get("user_id")
            if keycloak_user_id:
                db_user = session.query(User).filter(User.keycloak_user_id == keycloak_user_id).first()
            
            # If not found by Keycloak ID, try by email
            if not db_user and user_info.get("email"):
                db_user = session.query(User).filter(User.email == user_info["email"]).first()
            
            if not db_user:
                print("User not found in database, creating new user...")
                # Create user
                db_user = User(
                    email=user_info["email"],
                    full_name=user_info["full_name"],
                    keycloak_user_id=keycloak_user_id,
                    is_active=True,
                    is_superuser=False
                )
                session.add(db_user)
                session.commit()
                session.refresh(db_user)
                print(f"✅ Created new user with ID: {db_user.id}")
            else:
                print(f"✅ Found existing user with ID: {db_user.id}")
                
            # Update user info if needed
            updated = False
            if db_user.email != user_info["email"]:
                db_user.email = user_info["email"]
                updated = True
                
            if db_user.full_name != user_info["full_name"]:
                db_user.full_name = user_info["full_name"]
                updated = True
                
            if db_user.keycloak_user_id != keycloak_user_id:
                db_user.keycloak_user_id = keycloak_user_id
                updated = True
                
            if updated:
                session.add(db_user)
                session.commit()
                session.refresh(db_user)
                print("✅ Updated user information")
                
        print("✅ Authentication flow completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during authentication flow: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_full_authentication_flow()