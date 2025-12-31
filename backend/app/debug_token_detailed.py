import json
from app.core.security import keycloak_openid

if keycloak_openid:
    print("=== Public Key Analysis ===")
    # Get the public key that the library is using
    public_key = keycloak_openid.public_key()
    print(f"Public key from keycloak_openid.public_key(): {public_key[:50]}...")
    
    # Get all certificates
    certs = keycloak_openid.certs()
    print(f"\nNumber of keys in certs: {len(certs['keys'])}")
    
    for i, key in enumerate(certs['keys']):
        print(f"\nKey {i}:")
        print(f"  kid: {key.get('kid')}")
        print(f"  kty: {key.get('kty')}")
        print(f"  alg: {key.get('alg')}")
        print(f"  use: {key.get('use')}")
        print(f"  n: {key.get('n')[:50]}...")
        print(f"  e: {key.get('e')}")
        
        # Check if this is the signing key (used for RS256)
        if key.get('use') == 'sig' and key.get('alg') == 'RS256':
            print(f"  >>> This appears to be the signing key!")
            
            # Try to construct the PEM format for this key
            from cryptography.hazmat.primitives import serialization
            from cryptography.hazmat.primitives.asymmetric import rsa
            import base64
            
            try:
                # Decode the modulus and exponent
                n = int.from_bytes(base64.urlsafe_b64decode(key['n'] + '=' * (4 - len(key['n']) % 4)), 'big')
                e = int.from_bytes(base64.urlsafe_b64decode(key['e'] + '=' * (4 - len(key['e']) % 4)), 'big')
                
                # Create RSA public key
                public_numbers = rsa.RSAPublicNumbers(e, n)
                public_key_obj = public_numbers.public_key()
                
                # Serialize to PEM format
                pem = public_key_obj.public_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PublicFormat.SubjectPublicKeyInfo
                )
                
                pem_str = pem.decode('utf-8')
                print(f"  Constructed PEM: {pem_str[:50]}...")
                
                # Compare with the public_key() method result
                if pem_str.strip() == f"-----BEGIN PUBLIC KEY-----\n{public_key}\n-----END PUBLIC KEY-----":
                    print("  >>> Matches the public_key() method result!")
                else:
                    print("  >>> Does NOT match the public_key() method result!")
                    print(f"  public_key() method: {public_key[:50]}...")
                    
            except Exception as e:
                print(f"  Error constructing PEM: {e}")
else:
    print("Keycloak not configured")