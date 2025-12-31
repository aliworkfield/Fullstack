import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.core.security import keycloak_openid, validate_keycloak_token, get_user_info_from_token

def debug_auth():
    try:
        print("=== Keycloak Debug Info ===")
        
        # Test if we can get the public key
        public_key = keycloak_openid.public_key()
        print(f"✓ Public key retrieved: {public_key[:20]}...")
        
        # Test getting well-known configuration
        well_known = keycloak_openid.well_known()
        print(f"✓ Well-known config retrieved")
        print(f"  Issuer: {well_known.get('issuer')}")
        print(f"  Token endpoint: {well_known.get('token_endpoint')}")
        
        # Try to get a token for testing (this would normally come from the frontend)
        print("\n=== Trying to get test token ===")
        try:
            token = keycloak_openid.token("adminuser", "password123")
            print("✓ Token obtained successfully")
            print(f"  Token type: {token.get('token_type')}")
            print(f"  Expires in: {token.get('expires_in')} seconds")
            
            # Try to validate the token
            print("\n=== Validating token ===")
            access_token = token.get('access_token')
            if access_token:
                try:
                    token_info = validate_keycloak_token(access_token)
                    print("✓ Token validated successfully")
                    print(f"  Subject: {token_info.get('sub')}")
                    print(f"  Email: {token_info.get('email')}")
                    print(f"  Roles: {token_info.get('realm_access', {}).get('roles', [])}")
                    
                    # Try to extract user info
                    user_info = get_user_info_from_token(access_token)
                    print("✓ User info extracted successfully")
                    print(f"  User ID: {user_info.get('user_id')}")
                    print(f"  Email: {user_info.get('email')}")
                    print(f"  Full name: {user_info.get('full_name')}")
                    print(f"  Roles: {user_info.get('roles')}")
                    
                except Exception as e:
                    print(f"✗ Token validation failed: {e}")
            else:
                print("✗ No access token in response")
                
        except Exception as e:
            print(f"✗ Failed to get token: {e}")
            print("  This is expected if the user doesn't exist or credentials are wrong")
            
    except Exception as e:
        print(f"✗ Debug failed: {e}")

if __name__ == "__main__":
    debug_auth()