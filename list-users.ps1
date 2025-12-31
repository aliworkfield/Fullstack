# Get admin token
try {
    $tokenResponse = Invoke-RestMethod -Uri "http://localhost:8082/realms/master/protocol/openid-connect/token" -Method POST -Body @{
        username = "admin"
        password = "admin"
        grant_type = "password"
        client_id = "admin-cli"
    } -ContentType "application/x-www-form-urlencoded"
    
    $adminToken = $tokenResponse.access_token
    Write-Host "Admin token obtained successfully"
} catch {
    Write-Host "Failed to obtain admin token: $_"
    exit 1
}

# List users
try {
    $users = Invoke-RestMethod -Uri "http://localhost:8082/admin/realms/coupon-realm/users" -Method GET -Headers @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    
    Write-Host "Existing users:"
    foreach ($user in $users) {
        Write-Host "- Username: $($user.username), Email: $($user.email), Enabled: $($user.enabled)"
    }
} catch {
    Write-Host "Failed to list users: $_"
    exit 1
}