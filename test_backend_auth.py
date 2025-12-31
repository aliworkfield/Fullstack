#!/usr/bin/env python3

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.core import security
from app.core.config import settings

print("=== Backend Authentication Test ===")
print(f"KEYCLOAK_URL: {settings.KEYCLOAK_URL}")
print(f"KEYCLOAK_REALM: {settings.KEYCLOAK_REALM}")
print(f"KEYCLOAK_CLIENT_ID: {settings.KEYCLOAK_CLIENT_ID}")

# Test Keycloak client initialization
if security.keycloak_openid:
    print("Keycloak client initialized successfully")
    try:
        # Try to get the public key
        public_key = security.keycloak_openid.public_key()
        print(f"Public key retrieved: {public_key[:20]}...")
        
        # Test getting well-known configuration
        well_known = security.keycloak_openid.well_known()
        print(f"Well-known config retrieved")
        print(f"  Issuer: {well_known.get('issuer')}")
        print(f"  Token endpoint: {well_known.get('token_endpoint')}")
        
        print("\n=== Backend Configuration ===")
        print(f"Realm: {security.keycloak_openid.realm_name}")
        print(f"Client ID: {security.keycloak_openid.client_id}")
        
    except Exception as e:
        print(f"Error testing Keycloak client: {e}")
        import traceback
        traceback.print_exc()
else:
    print("Keycloak client not initialized")

print("=== Test Complete ===")