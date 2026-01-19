from app.core.security import keycloak_openid

if keycloak_openid:
    # Get all certificates
    certs = keycloak_openid.certs()
    
    # Find the signing key
    signing_key = None
    for key in certs['keys']:
        if key.get('use') == 'sig' and key.get('alg') == 'RS256':
            # Just use the key as-is (it should already be in the right format)
            signing_key = key
            print("Found signing key:")
            print(f"  kid: {key.get('kid')}")
            print(f"  kty: {key.get('kty')}")
            print(f"  alg: {key.get('alg')}")
            print(f"  use: {key.get('use')}")
            break
    
    if signing_key:
        # Try to validate a token with this key
        print("\nTrying to validate with signing key...")
        try:
            # Import the necessary modules
            from jose import jwt
            import base64
            from cryptography.hazmat.primitives import serialization
            from cryptography.hazmat.primitives.asymmetric import rsa
            
            # Decode the modulus and exponent
            n = int.from_bytes(base64.urlsafe_b64decode(signing_key['n'] + '=' * (4 - len(signing_key['n']) % 4)), 'big')
            e = int.from_bytes(base64.urlsafe_b64decode(signing_key['e'] + '=' * (4 - len(signing_key['e']) % 4)), 'big')
            
            # Create RSA public key
            public_numbers = rsa.RSAPublicNumbers(e, n)
            public_key_obj = public_numbers.public_key()
            
            # Serialize to PEM format
            pem = public_key_obj.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            )
            
            pem_str = pem.decode('utf-8')
            print(f"PEM key constructed: {pem_str[:50]}...")
            
            # Try to use this key for validation
            print("Key construction successful!")
            
        except Exception as e:
            print(f"Error constructing key: {e}")
            import traceback
            traceback.print_exc()
else:
    print("Keycloak not configured")