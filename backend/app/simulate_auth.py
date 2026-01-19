#!/usr/bin/env python3

import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Import the Keycloak client directly to test with frontend client
try:
    from keycloak import KeycloakOpenID
    print("✅ Keycloak library imported")
except ImportError as e:
    print(f"❌ Failed to import Keycloak library: {e}")
    sys.exit(1)

def test_authentication():
    """Test the authentication flow using frontend client"""
    try:
        # Initialize Keycloak client with frontend credentials
        keycloak_openid = KeycloakOpenID(
            server_url="http://keycloak:8080",  # Internal Docker network URL
            client_id="coupon-frontend",
            realm_name="coupon-realm",
            client_secret_key="",  # Public client has no secret
        )
        print("✅ Keycloak frontend client initialized")
        
        # Try to get a token for a test user
        # Note: For public clients, we don't use client_secret
        # Using the correct password from the PowerShell script
        token = keycloak_openid.token(username="adminuser", password="password123")
        print("✅ Got token from Keycloak")
        print(f"Token type: {token.get('token_type')}")
        print(f"Expires in: {token.get('expires_in')} seconds")
        
        # Extract access token
        access_token = token.get('access_token')
        if not access_token:
            print("❌ No access token in response")
            return
            
        print("✅ Extracted access token")
        print(f"Token length: {len(access_token)} characters")
        
        # Now test with the backend client to validate the token
        from app.core.security import keycloak_openid as backend_keycloak, get_user_info_from_token
        
        if not backend_keycloak:
            print("❌ Backend Keycloak client not initialized")
            return
            
        print("✅ Backend Keycloak client initialized")
        
        # Try to validate the token and extract user info
        user_info = get_user_info_from_token(access_token)
        print("✅ Extracted user info from token")
        print(f"User ID: {user_info.get('user_id')}")
        print(f"Email: {user_info.get('email')}")
        print(f"Full name: {user_info.get('full_name')}")
        print(f"Roles: {user_info.get('roles')}")
        
    except Exception as e:
        print(f"❌ Error during authentication test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_authentication()