# Function to create a new user in Keycloak
function Create-NewKeycloakUser {
    param(
        [string]$KeycloakUrl = "http://localhost:8082",
        [string]$Realm = "coupon-realm",
        [string]$AdminUser = "admin",
        [string]$AdminPass = "admin",
        [string]$NewUser,
        [string]$NewUserPass,
        [string]$Email,
        [string]$FirstName,
        [string]$LastName
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

    Write-Host "User creation completed successfully!"
    return $true
}

# Create new users with different usernames
Create-NewKeycloakUser -NewUser "newadmin" -NewUserPass "password123" -Email "newadmin@example.com" -FirstName "New" -LastName "Admin"
Create-NewKeycloakUser -NewUser "newmanager" -NewUserPass "password123" -Email "newmanager@example.com" -FirstName "New" -LastName "Manager"
Create-NewKeycloakUser -NewUser "newuser" -NewUserPass "password123" -Email "newuser@example.com" -FirstName "New" -LastName "User"