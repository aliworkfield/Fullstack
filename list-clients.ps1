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

# List clients
try {
    $clients = Invoke-RestMethod -Uri "http://localhost:8082/admin/realms/coupon-realm/clients" -Method GET -Headers @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    
    Write-Host "Available clients:"
    foreach ($client in $clients) {
        Write-Host "- Client ID: $($client.clientId), Name: $($client.name), Enabled: $($client.enabled)"
        if ($client.clientId -eq "coupon-frontend") {
            Write-Host "  Redirect URIs:"
            foreach ($uri in $client.redirectUris) {
                Write-Host "    - $uri"
            }
            Write-Host "  Web Origins:"
            foreach ($origin in $client.webOrigins) {
                Write-Host "    - $origin"
            }
        }
    }
} catch {
    Write-Host "Failed to list clients: $_"
    exit 1
}