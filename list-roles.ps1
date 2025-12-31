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

# List roles
try {
    $roles = Invoke-RestMethod -Uri "http://localhost:8082/admin/realms/coupon-realm/roles" -Method GET -Headers @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    
    Write-Host "Available roles:"
    foreach ($role in $roles) {
        Write-Host "- Name: $($role.name), ID: $($role.id)"
    }
} catch {
    Write-Host "Failed to list roles: $_"
    exit 1
}