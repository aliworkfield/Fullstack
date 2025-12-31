# Test authentication with Keycloak
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8082/realms/coupon-realm/protocol/openid-connect/token" -Method POST -Body @{
        username = "adminuser"
        password = "password123"
        grant_type = "password"
        client_id = "coupon-frontend"
    } -ContentType "application/x-www-form-urlencoded"
    
    Write-Host "Authentication successful!"
    Write-Host "Access Token: $($response.access_token)"
} catch {
    Write-Host "Authentication failed: $_"
}