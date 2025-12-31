#!/usr/bin/env python3

import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Import KeycloakOpenID directly to use frontend client
from keycloak import KeycloakOpenID
from app.core.security import get_user_info_from_token

def test_sub_claim():
    """Test if we can extract the sub claim correctly"""
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
        
        # Extract user info using our method
        print("Extracting user info...")
        user_info = get_user_info_from_token(access_token)
        print(f"✅ User info extracted")
        print(f"user_id: {user_info.get('user_id')}")
        print(f"email: {user_info.get('email')}")
        print(f"full_name: {user_info.get('full_name')}")
        print(f"roles: {user_info.get('roles')}")
        
    except Exception as e:
        print(f"❌ Error during user info extraction: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_sub_claim()