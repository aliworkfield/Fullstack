@echo off
setlocal enabledelayedexpansion

echo.
echo ================================================
echo    Kurumsal Indirim Frontend Deployment Script
echo ================================================
echo.

REM Function to build frontend
:build_frontend
echo.
echo Building frontend...
docker build -f Dockerfile.prod -t kurumsal-indirim-frontend:production .
if errorlevel 1 (
    echo Frontend build failed!
    pause
    exit /b 1
)
echo Frontend built successfully!
goto :eof

REM Function to deploy frontend
:deploy_frontend
echo.
echo Deploying frontend...
docker-compose -f production-deploy.yml up -d
if errorlevel 1 (
    echo Frontend deployment failed!
    pause
    exit /b 1
)
echo Frontend deployed successfully!
goto :eof

REM Function to stop frontend
:stop_frontend
echo.
echo Stopping frontend...
docker-compose -f production-deploy.yml down
echo Frontend stopped.
goto :eof

REM Function to show status
:show_status
echo.
echo Frontend status:
docker-compose -f production-deploy.yml ps
goto :eof

REM Main script logic
if "%1"=="build" (
    call :build_frontend
) else if "%1"=="deploy" (
    call :deploy_frontend
) else if "%1"=="build-and-deploy" (
    call :build_frontend
    call :deploy_frontend
) else if "%1"=="stop" (
    call :stop_frontend
) else if "%1"=="status" (
    call :show_status
) else (
    echo Usage: %0 {build^|deploy^|build-and-deploy^|stop^|status}
    echo   build           - Build frontend image
    echo   deploy          - Deploy frontend service
    echo   build-and-deploy - Build and deploy frontend
    echo   stop            - Stop frontend service
    echo   status          - Show frontend status
    echo.
    echo Press any key to continue...
    pause >nul
)

echo.
echo Frontend deployment process completed!