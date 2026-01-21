@echo off
setlocal enabledelayedexpansion

echo.
echo ================================================
echo    Kurumsal Indirim Backend Deployment Script
echo ================================================
echo.

REM Function to build backend
:build_backend
echo.
echo Building backend...
docker build -f Dockerfile.prod -t kurumsal-indirim-backend:production .
if errorlevel 1 (
    echo Backend build failed!
    pause
    exit /b 1
)
echo Backend built successfully!
goto :eof

REM Function to deploy backend
:deploy_backend
echo.
echo Deploying backend...
docker-compose -f production-deploy.yml up -d
if errorlevel 1 (
    echo Backend deployment failed!
    pause
    exit /b 1
)
echo Backend deployed successfully!
goto :eof

REM Function to stop backend
:stop_backend
echo.
echo Stopping backend...
docker-compose -f production-deploy.yml down
echo Backend stopped.
goto :eof

REM Function to show status
:show_status
echo.
echo Backend status:
docker-compose -f production-deploy.yml ps
goto :eof

REM Main script logic
if "%1"=="build" (
    call :build_backend
) else if "%1"=="deploy" (
    call :deploy_backend
) else if "%1"=="build-and-deploy" (
    call :build_backend
    call :deploy_backend
) else if "%1"=="stop" (
    call :stop_backend
) else if "%1"=="status" (
    call :show_status
) else (
    echo Usage: %0 {build^|deploy^|build-and-deploy^|stop^|status}
    echo   build           - Build backend image
    echo   deploy          - Deploy backend service
    echo   build-and-deploy - Build and deploy backend
    echo   stop            - Stop backend service
    echo   status          - Show backend status
    echo.
    echo Press any key to continue...
    pause >nul
)

echo.
echo Backend deployment process completed!