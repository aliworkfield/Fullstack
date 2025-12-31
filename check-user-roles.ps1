# Function to check roles assigned to a user in Keycloak
function Check-UserRoles {
    param(
        [string]$KeycloakUrl = "http://localhost:8082",
        [string]$Realm = "coupon-realm",
        [string]$AdminUser = "admin",
        [string]$AdminPass = "admin",
        [string]$Username
    )

    Write-Host "Checking roles for user '$Username'..."

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

    # Get user roles
    try {
        $userRoles = Invoke-RestMethod -Uri "$KeycloakUrl/admin/realms/$Realm/users/$userId/role-mappings" -Method GET -Headers @{
            "Authorization" = "Bearer $adminToken"
            "Content-Type" = "application/json"
        }
        
        Write-Host "Roles assigned to user '$Username':"
        if ($userRoles.realmMappings) {
            foreach ($role in $userRoles.realmMappings) {
                Write-Host "- $($role.name)"
            }
        } else {
            Write-Host "No realm roles assigned"
        }
        
        return $true
    } catch {
        Write-Host "Failed to get user roles: $_"
        return $false
    }
}

# Check roles for all users
Check-UserRoles -Username "adminuser"
Check-UserRoles -Username "manageruser"
Check-UserRoles -Username "regularuser"