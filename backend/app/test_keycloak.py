#!/usr/bin/env python3

import sys
import os
import json

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.core.security import keycloak_openid

def test_keycloak_connection():
    """Test Keycloak connection and token validation"""
    if not keycloak_openid:
        print("❌ Keycloak client not initialized")
        return
    
    print("✅ Keycloak client initialized")
    
    try:
        # Test getting public keys
        certs = keycloak_openid.certs()
        print(f"✅ Got certs: {len(certs.get('keys', []))} keys")
        
        # Print all key info
        for i, key in enumerate(certs.get('keys', [])):
            print(f"Key {i+1}:")
            print(f"  alg: {key.get('alg')}")
            print(f"  use: {key.get('use')}")
            print(f"  kid: {key.get('kid')}")
            
        # Look for signing key specifically
        signing_keys = [key for key in certs.get('keys', []) if key.get('use') == 'sig']
        print(f"\nSigning keys found: {len(signing_keys)}")
        
        if signing_keys:
            signing_key = signing_keys[0]
            print(f"Using signing key with alg: {signing_key.get('alg')}")
        else:
            print("No signing keys found!")
            
    except Exception as e:
        print(f"❌ Error getting certs: {e}")
        import traceback
        traceback.print_exc()
        return

if __name__ == "__main__":
    test_keycloak_connection()