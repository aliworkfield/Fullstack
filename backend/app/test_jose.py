from app.core.security import keycloak_openid
from jose import jwt

if keycloak_openid:
    # Get all certificates
    certs = keycloak_openid.certs()
    
    # Find the signing key
    signing_key_pem = None
    for key in certs['keys']:
        if key.get('use') == 'sig' and key.get('alg') == 'RS256':
            # Construct the PEM format for this key
            from cryptography.hazmat.primitives import serialization
            from cryptography.hazmat.primitives.asymmetric import rsa
            import base64
            
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
            
            signing_key_pem = pem.decode('utf-8')
            print(f"PEM key constructed: {signing_key_pem[:50]}...")
            break
    
    if signing_key_pem:
        # Try to decode a fake token with this key
        print("\nTrying to decode with jose...")
        try:
            # Create a fake token for testing
            fake_token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJlSmRBanpXaXI0Q1Y1VTZzMW1GLThOZG0xWXRoUHpodzVaNUZRSlI4Z3RvIn0.eyJleHAiOjE3NzE0MzQ4MDAsImlhdCI6MTczOTg5ODgwMCwiYXV0aF90aW1lIjoxNzM5ODk4ODAwLCJqdGkiOiJmYWtlLWp0aSIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4Mi9yZWFsbXMvY291cG9uLXJlYWxtIiwiYXVkIjoiY291cG9uLWJhY2tlbmQiLCJzdWIiOiJmYWtlLXN1YiIsInR5cCI6IkJlYXJlciIsImF6cCI6ImNvdXBvbi1iYWNrZW5kIiwic2Vzc2lvbl9zdGF0ZSI6ImZha2Utc3NzIiwiYWNyIjoiMSIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJ1c2VyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiY291cG9uLWJhY2tlbmQiOnsicm9sZXMiOlsidXNlciJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImNsaWVudElkIjoiY291cG9uLWJhY2tlbmQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ1c2VyIiwiY2xpZW50SG9zdCI6IjE3Mi4xOC4wLjYiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20ifQ.fake-signature"
            
            decoded = jwt.decode(
                fake_token,
                signing_key_pem,
                algorithms=['RS256'],
                options={"verify_signature": False, "verify_exp": False}
            )
            print("Decoding successful!")
            print(f"Decoded token: {decoded}")
        except Exception as e:
            print(f"Error decoding token: {e}")
            import traceback
            traceback.print_exc()
else:
    print("Keycloak not configured")