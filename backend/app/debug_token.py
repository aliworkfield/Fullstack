import json
from app.core.security import keycloak_openid, validate_keycloak_token, get_user_info_from_token

# Print the public key
if keycloak_openid:
    print("Public key:", keycloak_openid.public_key())
    
    # Try to get the certs directly
    try:
        certs = keycloak_openid.certs()
        print("Certificates:", json.dumps(certs, indent=2))
    except Exception as e:
        print("Error getting certs:", e)
else:
    print("Keycloak not configured")