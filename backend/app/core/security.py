from datetime import datetime, timedelta, timezone
from typing import Any
import base64
import json

import jwt
try:
    from keycloak import KeycloakOpenID
    from keycloak.exceptions import KeycloakAuthenticationError, KeycloakGetError
    KEYCLOAK_AVAILABLE = True
except ImportError:
    KEYCLOAK_AVAILABLE = False

from app.core.config import settings

# Initialize Keycloak client only if settings are available
print(f"DEBUG: KEYCLOAK_AVAILABLE: {KEYCLOAK_AVAILABLE}")
print(f"DEBUG: Has KEYCLOAK_URL: {hasattr(settings, 'KEYCLOAK_URL')}")
if hasattr(settings, 'KEYCLOAK_URL'):
    print(f"DEBUG: KEYCLOAK_URL: {settings.KEYCLOAK_URL}")
    print(f"DEBUG: KEYCLOAK_CLIENT_ID: {settings.KEYCLOAK_CLIENT_ID}")
    print(f"DEBUG: KEYCLOAK_REALM: {settings.KEYCLOAK_REALM}")
    print(f"DEBUG: KEYCLOAK_CLIENT_SECRET: {'*' * len(settings.KEYCLOAK_CLIENT_SECRET) if settings.KEYCLOAK_CLIENT_SECRET else 'None'}")

if KEYCLOAK_AVAILABLE and hasattr(settings, 'KEYCLOAK_URL'):
    print("DEBUG: Initializing Keycloak client")
    keycloak_openid = KeycloakOpenID(
        server_url=settings.KEYCLOAK_URL,
        client_id=settings.KEYCLOAK_CLIENT_ID,
        realm_name=settings.KEYCLOAK_REALM,
        client_secret_key=settings.KEYCLOAK_CLIENT_SECRET,
    )
    print("DEBUG: Keycloak client initialized successfully")
else:
    print("DEBUG: Keycloak client not initialized")
    keycloak_openid = None


def validate_keycloak_token(token: str) -> dict:
    """
    Validate Keycloak access token
    """
    if not keycloak_openid:
        raise ValueError("Keycloak is not configured")
    
    try:
        # Get the public key from Keycloak
        certs = keycloak_openid.certs()
        
        # Find the signing key (use=sig, alg=RS256)
        signing_key = None
        for key in certs['keys']:
            if key.get('use') == 'sig' and key.get('alg') == 'RS256':
                signing_key = key
                break
        
        if not signing_key:
            raise ValueError("No RS256 signing key found")
        
        # Use the jose library for token validation
        from jose import jwt as jose_jwt
        
        # Create a JWK dict for jose
        jwk_dict = {
            'kty': 'RSA',
            'n': signing_key['n'],
            'e': signing_key['e'],
            'alg': 'RS256',
            'use': 'sig'
        }
        
        # Decode the token
        token_info = jose_jwt.decode(
            token,
            jwk_dict,
            algorithms=['RS256'],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_nbf": True,
                "verify_iat": True,
                "verify_aud": False  # We're not verifying audience for now
            }
        )
        return token_info
    except Exception as e:
        raise ValueError(f"Token validation failed: {str(e)}")


def get_user_info_from_token(token: str) -> dict:
    """
    Extract user information from Keycloak token
    """
    if not keycloak_openid:
        raise ValueError("Keycloak is not configured")
    
    try:
        token_info = validate_keycloak_token(token)
        
        # Use preferred_username as fallback for user_id if sub is not available
        user_id = token_info.get("sub")
        if not user_id:
            user_id = token_info.get("preferred_username")
        
        # Extract email - try different possible field names
        email = (
            token_info.get("email") or 
            token_info.get("email_address") or
            token_info.get("upn")  # User Principal Name
        )
        
        # Extract full name - try different possible field names
        full_name = (
            token_info.get("name") or  # Full name
            f"{token_info.get('given_name', '')} {token_info.get('family_name', '')}".strip() or  # First + Last name
            token_info.get("preferred_username") or  # Username as fallback
            token_info.get("sub")  # Subject as last resort
        )
        
        user_info = {
            "user_id": user_id,
            "email": email,
            "full_name": full_name,
            "roles": token_info.get("realm_access", {}).get("roles", []),
        }
        return user_info
    except Exception as e:
        raise ValueError(f"Failed to extract user info from token: {str(e)}")


def create_access_token(subject: str | Any, expires_delta: timedelta | None = None) -> str:
    """
    Create access token for the given subject.
    """
    from app.core.config import settings
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"sub": str(subject), "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt