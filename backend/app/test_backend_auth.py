#!/usr/bin/env python3

"""
Test script to validate backend authentication with Keycloak
"""

import os
import sys

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.core.security import keycloak_openid
from app.core.config import settings

def debug_token_validation():
    print("=== Testing Backend Authentication ===")
    
    if not keycloak_openid:
        print("✗ Keycloak not configured")
        return
    
    try:
        # Test if we can get the public key
        public_key = keycloak_openid.public_key()
        print(f"✓ Public key retrieved: {public_key[:20]}...")
        
        # Test getting well-known configuration
        well_known = keycloak_openid.well_known()
        print(f"✓ Well-known config retrieved")
        print(f"  Issuer: {well_known.get('issuer')}")
        print(f"  Token endpoint: {well_known.get('token_endpoint')}")
        
        # Test getting certs
        certs = keycloak_openid.certs()
        print(f"✓ Certs retrieved: {len(certs.get('keys', []))} keys")
        
    except Exception as e:
        print(f"✗ Keycloak connection failed: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Create a fake token for testing validation (this would normally come from the frontend)
    # We'll test the validation function directly with a malformed token to see the error
    print("\n=== Testing token validation with empty token ===")
    try:
        # Import the validation function here to catch any import errors
        from app.core.security import validate_keycloak_token
        result = validate_keycloak_token("")
        print(f"Unexpected success: {result}")
    except Exception as e:
        print(f"Expected validation failure: {e}")
        
    print("\n=== Testing token validation with invalid token ===")
    try:
        from app.core.security import validate_keycloak_token
        result = validate_keycloak_token("invalid.token.string")
        print(f"Unexpected success: {result}")
    except Exception as e:
        print(f"Expected validation failure: {e}")
        
    print("\n=== Testing user info extraction with empty token ===")
    try:
        from app.core.security import get_user_info_from_token
        result = get_user_info_from_token("")
        print(f"Unexpected success: {result}")
    except Exception as e:
        print(f"Expected extraction failure: {e}")
        
    print("\n=== Testing user info extraction with invalid token ===")
    try:
        from app.core.security import get_user_info_from_token
        result = get_user_info_from_token("invalid.token.string")
        print(f"Unexpected success: {result}")
    except Exception as e:
        print(f"Expected extraction failure: {e}")
        
    print("\n=== Configuration Check ===")
    # Access configuration through the keycloak_openid object
    print(f"Realm: {getattr(keycloak_openid, 'realm_name', 'Not available')}")
    print(f"Client ID: {getattr(keycloak_openid, 'client_id', 'Not available')}")

if __name__ == "__main__":
    debug_token_validation()