# Function to set password for an existing user in Keycloak
function Set-KeycloakUserPassword {
    param(
        [string]$KeycloakUrl = "http://localhost:8082",
        [string]$Realm = "coupon-realm",
        [string]$AdminUser = "admin",
        [string]$AdminPass = "admin",
        [string]$Username,
        [string]$NewPassword
    )

    Write-Host "Setting password for user $Username in Keycloak..."

    # Get admin token
    try {
        $tokenResponse = Invoke-RestMethod -Uri "$KeycloakUrl/realms/master/protocol/openid-connect/token" -Method POST -Body @{
            username = $AdminUser
            password = $AdminPass
            grant_type = "password"
            client_id = "admin-cli"
        } -ContentType "application/x-www-form-urlencoded"
        
        $adminToken = $tokenResponse.access_token
        Write-Host "Admin token obtained successfully"
    } catch {
        Write-Host "Failed to obtain admin token: $_"
        return $false
    }

    # Get user ID
    try {
        $users = Invoke-RestMethod -Uri "$KeycloakUrl/admin/realms/$Realm/users?username=$Username" -Method GET -Headers @{
            "Authorization" = "Bearer $adminToken"
            "Content-Type" = "application/json"
        }
        
        if ($users.Count -eq 0) {
            Write-Host "User $Username not found"
            return $false
        }
        
        $userId = $users[0].id
        Write-Host "User ID obtained: $userId"
    } catch {
        Write-Host "Failed to get user ID: $_"
        return $false
    }

    # Set password
    try {
        $passwordPayload = @{
            type = "password"
            value = $NewPassword
            temporary = $false
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$KeycloakUrl/admin/realms/$Realm/users/$userId/reset-password" -Method PUT -Headers @{
            "Authorization" = "Bearer $adminToken"
            "Content-Type" = "application/json"
        } -Body $passwordPayload
        
        Write-Host "Password set successfully for user $Username"
        return $true
    } catch {
        Write-Host "Failed to set password: $_"
        return $false
    }
}

# Set passwords for existing users
Set-KeycloakUserPassword -Username "adminuser" -NewPassword "password123"
Set-KeycloakUserPassword -Username "manageruser" -NewPassword "password123"
Set-KeycloakUserPassword -Username "regularuser" -NewPassword "password123"