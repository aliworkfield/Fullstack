import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.core.security import keycloak_openid, validate_keycloak_token

def test_keycloak_connection():
    try:
        # Test if we can get the public key
        public_key = keycloak_openid.public_key()
        print("Successfully retrieved public key from Keycloak")
        print(f"Public key: {public_key[:50]}...")
        return True
    except Exception as e:
        print(f"Failed to retrieve public key from Keycloak: {e}")
        return False

if __name__ == "__main__":
    print("Testing Keycloak connection...")
    success = test_keycloak_connection()
    if success:
        print("Keycloak connection test passed!")
    else:
        print("Keycloak connection test failed!")