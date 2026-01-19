import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'coupon-realm',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'coupon-frontend',
  'confidential-port': 0,
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;