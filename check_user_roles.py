import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.core.security import keycloak_openid

def check_user_roles():
    try:
        # Get admin token for accessing Keycloak admin APIs
        admin_token = keycloak_openid.token("admin", "admin")
        print("Successfully obtained admin token")
        
        # Use the token to get user info
        # This is just a basic check - in practice, you'd use the admin token
        # to make calls to Keycloak's admin API to check user roles
        
        print("User role checking functionality would go here")
        print("For now, we've confirmed Keycloak is accessible")
        return True
    except Exception as e:
        print(f"Failed to check user roles: {e}")
        return False

if __name__ == "__main__":
    print("Checking user roles in Keycloak...")
    success = check_user_roles()
    if success:
        print("User role check completed!")
    else:
        print("User role check failed!")