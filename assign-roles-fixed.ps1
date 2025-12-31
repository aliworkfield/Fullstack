# Function to assign roles to users in Keycloak
function Assign-RoleToUser {
    param(
        [string]$KeycloakUrl = "http://localhost:8082",
        [string]$Realm = "coupon-realm",
        [string]$AdminUser = "admin",
        [string]$AdminPass = "admin",
        [string]$Username,
        [string]$RoleName
    )

    Write-Host "Assigning role '$RoleName' to user '$Username'..."

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

    # Get role details
    try {
        $roles = Invoke-RestMethod -Uri "$KeycloakUrl/admin/realms/$Realm/roles" -Method GET -Headers @{
            "Authorization" = "Bearer $adminToken"
            "Content-Type" = "application/json"
        }
        
        $role = $roles | Where-Object { $_.name -eq $RoleName }
        if (-not $role) {
            Write-Host "Role $RoleName not found"
            return $false
        }
        
        Write-Host "Role details obtained: Name=$($role.name), ID=$($role.id)"
    } catch {
        Write-Host "Failed to get role details: $_"
        return $false
    }

    # Assign role to user
    try {
        $rolePayload = @(@{
            id = $role.id
            name = $role.name
            composite = $role.composite
            clientRole = $role.clientRole
            containerId = $role.containerId
        }) | ConvertTo-Json

        Write-Host "Sending role assignment payload: $rolePayload"

        $response = Invoke-RestMethod -Uri "$KeycloakUrl/admin/realms/$Realm/users/$userId/role-mappings/realm" -Method POST -Headers @{
            "Authorization" = "Bearer $adminToken"
            "Content-Type" = "application/json"
        } -Body $rolePayload
        
        Write-Host "Role '$RoleName' assigned successfully to user '$Username'"
        return $true
    } catch {
        Write-Host "Failed to assign role: $_"
        return $false
    }
}

# Assign roles to users
Write-Host "Starting role assignment process..."
Assign-RoleToUser -Username "adminuser" -RoleName "admin"
Assign-RoleToUser -Username "manageruser" -RoleName "manager"
Assign-RoleToUser -Username "regularuser" -RoleName "user"