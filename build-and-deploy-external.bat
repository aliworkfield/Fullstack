@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================================
echo    Kurumsal Indirim External Services Build & Deploy
echo ========================================================
echo.

REM Function to build backend
:build_backend
echo.
echo Building backend...
cd /d "%~dp0backend"
docker build -f Dockerfile.prod -t kurumsal-indirim-backend:production .
if errorlevel 1 (
    echo Backend build failed!
    pause
    exit /b 1
)
echo Backend built successfully!
goto :eof

REM Function to build frontend
:build_frontend
echo.
echo Building frontend...
cd /d "%~dp0frontend"
docker build -f Dockerfile.prod -t kurumsal-indirim-frontend:production .
if errorlevel 1 (
    echo Frontend build failed!
    pause
    exit /b 1
)
echo Frontend built successfully!
goto :eof

REM Function to deploy with external services
:deploy_external
echo.
echo Deploying application with external services...
cd /d "%~dp0"
docker-compose -f production-external-services.yml up -d
if errorlevel 1 (
    echo External services deployment failed!
    pause
    exit /b 1
)
echo Application deployed with external services successfully!
goto :eof

REM Function to deploy with internal services
:deploy_internal
echo.
echo Deploying application with internal services...
cd /d "%~dp0"
docker-compose -f production-docker-compose.yml up -d
if errorlevel 1 (
    echo Internal services deployment failed!
    pause
    exit /b 1
)
echo Application deployed with internal services successfully!
goto :eof

REM Function to stop application
:stop_app
echo.
echo Stopping application...
cd /d "%~dp0"
echo Stopping external services deployment...
docker-compose -f production-external-services.yml down
echo Stopping internal services deployment...
docker-compose -f production-docker-compose.yml down
echo Application stopped.
goto :eof

REM Function to show status
:show_status
echo.
echo Application status (External Services):
cd /d "%~dp0"
docker-compose -f production-external-services.yml ps
echo.
echo Application status (Internal Services):
docker-compose -f production-docker-compose.yml ps
goto :eof

REM Main script logic
if "%1"=="build" (
    call :build_backend
    call :build_frontend
    echo.
    echo All components built successfully!
) else if "%1"=="deploy-external" (
    call :deploy_external
) else if "%1"=="deploy-internal" (
    call :deploy_internal
) else if "%1"=="build-and-deploy-external" (
    call :build_backend
    call :build_frontend
    call :deploy_external
) else if "%1"=="build-and-deploy-internal" (
    call :build_backend
    call :build_frontend
    call :deploy_internal
) else if "%1"=="stop" (
    call :stop_app
) else if "%1"=="status" (
    call :show_status
) else (
    echo Usage: %0 {build^|deploy-external^|deploy-internal^|build-and-deploy-external^|build-and-deploy-internal^|stop^|status}
    echo   build                      - Build backend and frontend images
    echo   deploy-external            - Deploy with external PostgreSQL and Keycloak
    echo   deploy-internal            - Deploy with internal PostgreSQL and Keycloak
    echo   build-and-deploy-external  - Build and deploy with external services
    echo   build-and-deploy-internal  - Build and deploy with internal services
    echo   stop                       - Stop all deployments
    echo   status                     - Show application status
    echo.
    echo Press any key to continue...
    pause >nul
)

echo.
echo Build and deployment process completed!