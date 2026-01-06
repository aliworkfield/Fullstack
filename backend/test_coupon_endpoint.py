"""
Test script to verify the new user coupon for campaign endpoint is working properly.
"""
import requests
import json

# Test the new endpoint
def test_endpoint():
    # This is just to verify the endpoint exists in the API
    print("Testing that the coupon endpoint is properly registered...")
    
    # Check the OpenAPI spec to see if our endpoint is there
    try:
        # If the server is running on port 8001
        response = requests.get("http://localhost:8001/api/v1/openapi.json")
        if response.status_code == 200:
            spec = response.json()
            
            # Look for our new endpoint
            paths = spec.get('paths', {})
            
            found_endpoint = False
            for path, methods in paths.items():
                if 'campaign' in path and 'user' in path and path.startswith('/api/v1/user/coupons'):
                    print(f"Found user coupon for campaign endpoint: {path}")
                    found_endpoint = True
                    break
            
            if not found_endpoint:
                # Check for the specific endpoint we created
                target_path = "/api/v1/user/coupons/campaign/{campaign_id}"
                if target_path in paths:
                    print(f"Found our endpoint: {target_path}")
                    found_endpoint = True
                else:
                    print(f"Endpoint not found in API spec. Available user coupon paths:")
                    for path in paths:
                        if 'coupon' in path.lower():
                            print(f"  - {path}")
            
            if found_endpoint:
                print("✅ Endpoint is properly registered in the API")
            else:
                print("❌ Endpoint not found in API spec")
        else:
            print(f"❌ Could not fetch OpenAPI spec. Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing endpoint: {e}")
        print("Make sure the backend server is running on http://localhost:8001")

if __name__ == "__main__":
    test_endpoint()