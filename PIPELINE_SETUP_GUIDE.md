# TFS/ Azure DevOps Pipeline Setup Guide

This document explains how to set up the CI/CD pipeline for the Kurumsal Indirim project using Azure DevOps.

## Prerequisites

Before setting up the pipeline, you'll need:

1. **Azure DevOps Organization** with a project created
2. **Service Connections** configured for:
   - Azure Container Registry (ACR) 
   - Azure Kubernetes Service (AKS) for dev and prod
   - Azure Subscription access
3. **Variable Groups** created in Azure DevOps
4. **Environments** set up in Azure DevOps (development, production)

## Pipeline Configuration

The pipeline is defined in `azure-pipelines.yml` and consists of several stages:

### 1. Build Stage
- Builds Docker images for both backend and frontend
- Tags images with build ID and 'latest'

### 2. Test Stage
- Runs backend tests using pytest
- Runs frontend tests using npm test
- Quality gates to ensure code quality

### 3. Publish Stage
- Pushes Docker images to Azure Container Registry
- Makes images available for deployment

### 4. Deploy Dev Stage
- Deploys to development Kubernetes cluster
- Uses development configuration
- Automated deployment on main branch commits

### 5. Deploy Prod Stage
- Deploys to production Kubernetes cluster
- Manual approval required
- Runs database migrations after deployment

## Required Azure DevOps Setup

### 1. Variable Group: `kurumsal-indirim-variables`

Create a variable group with these variables:
- `acrLoginServer` - Your Azure Container Registry login server
- `acrUsername` - ACR username
- `acrPassword` - ACR password (stored as secret)

### 2. Service Connections

You need these service connections:
- `kurumsal-indirim-acr` - For Azure Container Registry access
- `kurumsal-indirim-k8s-dev` - For development Kubernetes cluster
- `kurumsal-indirim-k8s-prod` - For production Kubernetes cluster
- `kurumsal-indirim-subscription` - For Azure subscription access

### 3. Environments

Create these environments:
- `development` - For dev deployments
- `production` - For prod deployments (with manual approval)

## Kubernetes Resources Required

Before running the pipeline, ensure these Kubernetes resources exist:

1. **Namespaces**: `default` (or your preferred namespace)
2. **Secrets**: `kurumsal-indirim-secrets` containing:
   - database-url
   - secret-key
   - postgres-user
   - postgres-password
3. **Persistent Volumes**: For database storage
4. **Ingress Controller**: NGINX ingress controller installed
5. **Cert Manager**: For SSL certificate management

## Deployment Configuration

### Development Configuration
- Environment: `development`
- Domain: `dev.kurumsalindirim.mfa.gov.tr`
- Replicas: 1 for each service
- SSL: Let's Encrypt staging

### Production Configuration
- Environment: `production`
- Domain: `kurumsalindirim.mfa.gov.tr`
- Replicas: 2 for each service (for HA)
- SSL: Let's Encrypt production
- Resource limits and requests configured
- Health checks implemented

## Setting Up the Pipeline

1. Navigate to your Azure DevOps project
2. Go to Pipelines > Pipelines
3. Click "New Pipeline"
4. Select "Azure Repos Git" as the source
5. Choose your repository
6. Select "Existing Azure Pipelines YAML file"
7. Choose `/azure-pipelines.yml`
8. Save and run the pipeline

## Security Considerations

- Store all secrets in Azure Key Vault or Azure DevOps variable groups with secret flag
- Use managed identities where possible
- Implement network security between services
- Regular security scanning of container images
- RBAC for Kubernetes access

## Troubleshooting

Common issues and solutions:

1. **Permission errors**: Check service connection permissions
2. **Image pull errors**: Verify ACR service connection and image tags
3. **Kubernetes deployment failures**: Check RBAC permissions and resource availability
4. **SSL certificate issues**: Verify cert-manager and DNS configuration
5. **Database connection failures**: Check secret configuration and network connectivity

## Maintenance

- Regularly rotate secrets and credentials
- Monitor pipeline execution logs
- Update base images for security patches
- Review and update resource requirements
- Maintain backup and disaster recovery procedures