# Stage 1: Build
FROM node:25-alpine AS build-stage

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_KEYCLOAK_URL
ARG VITE_KEYCLOAK_REALM=coupon-realm
ARG VITE_KEYCLOAK_CLIENT_ID=coupon-frontend

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_KEYCLOAK_URL=${VITE_KEYCLOAK_URL}
ENV VITE_KEYCLOAK_REALM=${VITE_KEYCLOAK_REALM}
ENV VITE_KEYCLOAK_CLIENT_ID=${VITE_KEYCLOAK_CLIENT_ID}

# Build the application
RUN npm run build


# Stage 2: Production with Nginx
FROM nginx:1-alpine

# Copy built files
COPY --from=build-stage /app/dist/ /usr/share/nginx/html

# Copy nginx config (configured for port 8080)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# OpenShift runs as non-root user - set proper permissions
RUN chown -R nginx:0 /usr/share/nginx/html && \
    chmod -R g=u /usr/share/nginx/html && \
    chown -R nginx:0 /var/cache/nginx && \
    chmod -R g=u /var/cache/nginx && \
    chown -R nginx:0 /var/log/nginx && \
    chmod -R g=u /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:0 /var/run/nginx.pid

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]