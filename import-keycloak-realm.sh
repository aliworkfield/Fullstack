#!/bin/bash

# Wait for Keycloak to be ready
echo "Waiting for Keycloak to be ready..."
until curl -s http://localhost:8082 > /dev/null; do
  sleep 5
done

echo "Keycloak is ready. Importing realm..."

# Get admin token
ADMIN_TOKEN=$(curl -s -X POST \
  http://localhost:8082/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

# Import the realm
curl -s -X POST \
  http://localhost:8082/admin/realms \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d @keycloak-realm.json

echo "Realm imported successfully!"