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

# Check realm configuration
try {
    $realm = Invoke-RestMethod -Uri "http://localhost:8082/admin/realms/coupon-realm" -Method GET -Headers @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    
    Write-Host "Realm configuration:"
    Write-Host "- Realm ID: $($realm.id)"
    Write-Host "- Realm Name: $($realm.realm)"
    Write-Host "- Enabled: $($realm.enabled)"
    Write-Host "- Display Name: $($realm.displayName)"
} catch {
    Write-Host "Failed to get realm configuration: $_"
    exit 1
}