# Function to create a user in Keycloak
function Create-KeycloakUser {
    param(
        [string]$KeycloakUrl = "http://localhost:8082",
        [string]$Realm = "coupon-realm",
        [string]$AdminUser = "admin",
        [string]$AdminPass = "admin",
        [string]$NewUser,
        [string]$NewUserPass,
        [string]$Email,
        [string]$FirstName,
        [string]$LastName,
        [string[]]$Roles
    )

    Write-Host "Creating user $NewUser in Keycloak..."

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

    # Create user
    try {
        $userPayload = @{
            username = $NewUser
            email = $Email
            firstName = $FirstName
            lastName = $LastName
            enabled = $true
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$KeycloakUrl/admin/realms/$Realm/users" -Method POST -Headers @{
            "Authorization" = "Bearer $adminToken"
            "Content-Type" = "application/json"
        } -Body $userPayload
        
        Write-Host "User created successfully"
    } catch {
        Write-Host "Failed to create user: $_"
        return $false
    }

    # Get user ID
    try {
        $users = Invoke-RestMethod -Uri "$KeycloakUrl/admin/realms/$Realm/users?username=$NewUser" -Method GET -Headers @{
            "Authorization" = "Bearer $adminToken"
            "Content-Type" = "application/json"
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
            value = $NewUserPass
            temporary = $false
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$KeycloakUrl/admin/realms/$Realm/users/$userId/reset-password" -Method PUT -Headers @{
            "Authorization" = "Bearer $adminToken"
            "Content-Type" = "application/json"
        } -Body $passwordPayload
        
        Write-Host "Password set successfully"
    } catch {
        Write-Host "Failed to set password: $_"
        return $false
    }

    # Assign roles
    if ($Roles -and $Roles.Count -gt 0) {
        try {
            # Get available roles
            $availableRoles = Invoke-RestMethod -Uri "$KeycloakUrl/admin/realms/$Realm/roles" -Method GET -Headers @{
                "Authorization" = "Bearer $adminToken"
                "Content-Type" = "application/json"
            }
            
            $rolesToAssign = @()
            foreach ($roleName in $Roles) {
                $role = $availableRoles | Where-Object { $_.name -eq $roleName }
                if ($role) {
                    $rolesToAssign += @{
                        id = $role.id
                        name = $role.name
                    }
                }
            }
            
            if ($rolesToAssign.Count -gt 0) {
                $rolesPayload = $rolesToAssign | ConvertTo-Json
                
                $response = Invoke-RestMethod -Uri "$KeycloakUrl/admin/realms/$Realm/users/$userId/role-mappings/realm" -Method POST -Headers @{
                    "Authorization" = "Bearer $adminToken"
                    "Content-Type" = "application/json"
                } -Body $rolesPayload
                
                Write-Host "Roles assigned successfully: $($Roles -join ', ')"
            }
        } catch {
            Write-Host "Failed to assign roles: $_"
            return $false
        }
    }

    Write-Host "User creation completed successfully!"
    return $true
}

# Create an admin user
Create-KeycloakUser -NewUser "adminuser" -NewUserPass "password123" -Email "admin@example.com" -FirstName "Admin" -LastName "User" -Roles @("admin")

# Create a manager user
Create-KeycloakUser -NewUser "manageruser" -NewUserPass "password123" -Email "manager@example.com" -FirstName "Manager" -LastName "User" -Roles @("manager")

# Create a regular user
Create-KeycloakUser -NewUser "regularuser" -NewUserPass "password123" -Email "user@example.com" -FirstName "Regular" -LastName "User" -Roles @("user")