# Authentication Test Script

## Purpose
This script outlines the steps to verify that the FastCoupon authentication system is working correctly.

## Prerequisites
1. All Docker containers are running (`docker-compose up -d`)
2. Keycloak is accessible at http://localhost:8082
3. Backend is accessible at http://localhost:8000
4. Frontend is accessible at http://localhost:5173

## Test Steps

### 1. Verify Container Health
```bash
docker-compose ps
```
Expected: All containers should show "Up" status

### 2. Check Backend Health
```bash
curl http://localhost:8000/api/v1/utils/health-check/
```
Expected: Response should be `true`

### 3. Check Database Users
```bash
docker-compose exec backend python app/check_users_simple.py
```
Expected: Should show existing users with Keycloak IDs

### 4. Test Keycloak Accessibility
Open browser to http://localhost:8082
Expected: Keycloak admin console should load

### 5. Test Frontend Accessibility
Open browser to http://localhost:5173
Expected: Application should redirect to Keycloak login

### 6. Complete Authentication Flow
1. Navigate to http://localhost:5173
2. Login with Keycloak credentials:
   - Username: adminuser
   - Password: adminpassword
3. Verify successful login to dashboard
4. Check that user information is displayed correctly

### 7. Verify API Access
After authentication, check browser developer tools:
1. Network tab should show successful requests to `/api/v1/users/me`
2. Requests should include Authorization header with Bearer token
3. Responses should contain user data

### 8. Test Token Refresh
1. Stay logged in for token expiration period
2. Navigate between pages
3. Verify that token refresh occurs automatically
4. Confirm continued access to protected resources

## Expected Results

### Successful Authentication
- Users can log in through Keycloak
- Frontend displays personalized dashboard
- API calls to protected endpoints succeed
- Token refresh works seamlessly

### Data Consistency
- User information is consistent between Keycloak and local database
- User roles are properly synchronized
- Profile updates propagate correctly

### Error Handling
- Proper error messages for invalid credentials
- Graceful handling of token expiration
- Redirect to login on authentication failures

## Troubleshooting Guide

### If Authentication Fails
1. Check Keycloak container logs: `docker-compose logs keycloak`
2. Verify Keycloak realm configuration
3. Confirm client IDs match between frontend and backend
4. Check environment variables in containers

### If API Calls Fail
1. Check backend container logs: `docker-compose logs backend`
2. Verify token is being sent in Authorization header
3. Confirm CORS configuration allows frontend requests
4. Check database connectivity

### If Frontend Doesn't Load
1. Check frontend container logs: `docker-compose logs frontend`
2. Verify Vite development server is running
3. Confirm port mappings are correct
4. Check browser console for JavaScript errors

## Success Criteria
✅ All containers running healthily
✅ Backend health check returns true
✅ Keycloak login successful
✅ Frontend displays user dashboard
✅ Protected API endpoints accessible
✅ Token refresh working properly
✅ User data consistent across systems