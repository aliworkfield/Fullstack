#!/usr/bin/env python3

import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Import KeycloakOpenID directly to use frontend client
from keycloak import KeycloakOpenID
from app.core.security import get_user_info_from_token

def debug_token_claims():
    """Debug what claims are available in the Keycloak token"""
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
        print(f"Token length: {len(access_token)} characters")
        
        # Decode the token without validation to see raw claims
        import jwt
        try:
            # Decode without verification to see raw claims
            decoded_token = jwt.decode(access_token, options={"verify_signature": False})
            print("\n=== Raw Token Claims ===")
            for key, value in decoded_token.items():
                print(f"{key}: {value}")
        except Exception as e:
            print(f"Error decoding token: {e}")
            
        # Now test our validation method
        print("\n=== Our Validation Method ===")
        from app.core.security import keycloak_openid as backend_keycloak
        if not backend_keycloak:
            print("❌ Backend Keycloak client not initialized")
            return
            
        print("✅ Backend Keycloak client initialized")
        
        # Extract user info from token
        print("Extracting user info from token...")
        user_info = get_user_info_from_token(access_token)
        print(f"✅ Extracted user info:")
        for key, value in user_info.items():
            print(f"  {key}: {value}")
        
    except Exception as e:
        print(f"❌ Error during token debugging: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_token_claims()