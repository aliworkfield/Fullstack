#!/usr/bin/env python3

import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Import KeycloakOpenID directly to use frontend client
from keycloak import KeycloakOpenID
import jwt

def debug_jwk():
    """Debug JWK construction and token validation"""
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
        print("\n=== Raw Token Claims (no validation) ===")
        decoded_token_no_validation = jwt.decode(access_token, options={"verify_signature": False})
        print(f"Raw token has sub: {'sub' in decoded_token_no_validation}")
        if 'sub' in decoded_token_no_validation:
            print(f"sub value: {decoded_token_no_validation['sub']}")
        for key, value in decoded_token_no_validation.items():
            print(f"{key}: {value}")
            
        # Get certs from Keycloak
        print("\n=== Keycloak Certs ===")
        certs = keycloak_openid.certs()
        print(f"Number of keys: {len(certs['keys'])}")
        
        for i, key in enumerate(certs['keys']):
            print(f"\nKey {i+1}:")
            print(f"  alg: {key.get('alg')}")
            print(f"  use: {key.get('use')}")
            print(f"  kid: {key.get('kid')}")
            if 'n' in key:
                print(f"  n length: {len(key['n'])}")
            if 'e' in key:
                print(f"  e: {key['e']}")
        
        # Find the signing key
        signing_key = None
        for key in certs['keys']:
            if key.get('use') == 'sig' and key.get('alg') == 'RS256':
                signing_key = key
                break
        
        if not signing_key:
            print("❌ No RS256 signing key found")
            return
            
        print(f"\n✅ Found signing key")
        print(f"  alg: {signing_key.get('alg')}")
        print(f"  use: {signing_key.get('use')}")
        print(f"  kid: {signing_key.get('kid')}")
        
        # Try to validate with jose
        print("\n=== Validating with jose ===")
        from jose import jwt as jose_jwt
        
        # Create a JWK dict for jose
        jwk_dict = {
            'kty': 'RSA',
            'n': signing_key['n'],
            'e': signing_key['e'],
            'alg': 'RS256',
            'use': 'sig'
        }
        
        print(f"JWK dict keys: {list(jwk_dict.keys())}")
        
        # Decode the token
        try:
            token_info = jose_jwt.decode(
                access_token,
                jwk_dict,
                algorithms=['RS256'],
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_nbf": True,
                    "verify_iat": True,
                    "verify_aud": False
                }
            )
            print("✅ Token validated successfully with jose")
            print(f"Validated token has sub: {'sub' in token_info}")
            if 'sub' in token_info:
                print(f"sub value: {token_info['sub']}")
            print(f"Token info keys: {list(token_info.keys())}")
            for key, value in token_info.items():
                print(f"{key}: {value}")
        except Exception as e:
            print(f"❌ Error validating with jose: {e}")
            import traceback
            traceback.print_exc()
        
    except Exception as e:
        print(f"❌ Error during JWK debugging: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_jwk()