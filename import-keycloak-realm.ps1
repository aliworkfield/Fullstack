# Wait for Keycloak to be ready
Write-Host "Waiting for Keycloak to be ready..."
do {
  Start-Sleep -Seconds 5
  try {
    $response = Invoke-WebRequest -Uri "http://localhost:8082" -Method GET -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
      Write-Host "Keycloak is ready!"
      break
    }
  } catch {
    Write-Host "Still waiting for Keycloak..."
  }
} while ($true)

Write-Host "Importing realm..."

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

# Import the realm
try {
  $realmConfig = Get-Content -Path "keycloak-realm.json" -Raw
  $response = Invoke-RestMethod -Uri "http://localhost:8082/admin/realms" -Method POST -Headers @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
  } -Body $realmConfig
  
  Write-Host "Realm imported successfully!"
} catch {
  Write-Host "Failed to import realm: $_"
  exit 1
}