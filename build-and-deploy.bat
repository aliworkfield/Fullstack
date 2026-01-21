@echo off
setlocal enabledelayedexpansion

echo.
echo ================================================
echo    Kurumsal Indirim Production Build Script
echo ================================================
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

REM Function to deploy application
:deploy_app
echo.
echo Deploying application...
cd /d "%~dp0"
docker-compose -f production-docker-compose.yml up -d
if errorlevel 1 (
    echo Deployment failed!
    pause
    exit /b 1
)
echo Application deployed successfully!
goto :eof

REM Function to stop application
:stop_app
echo.
echo Stopping application...
cd /d "%~dp0"
docker-compose -f production-docker-compose.yml down
echo Application stopped.
goto :eof

REM Function to show status
:show_status
echo.
echo Application status:
cd /d "%~dp0"
docker-compose -f production-docker-compose.yml ps
goto :eof

REM Main script logic
if "%1"=="build" (
    call :build_backend
    call :build_frontend
    echo.
    echo All components built successfully!
) else if "%1"=="deploy" (
    call :deploy_app
) else if "%1"=="build-and-deploy" (
    call :build_backend
    call :build_frontend
    call :deploy_app
) else if "%1"=="stop" (
    call :stop_app
) else if "%1"=="status" (
    call :show_status
) else (
    echo Usage: %0 {build^|deploy^|build-and-deploy^|stop^|status}
    echo   build           - Build backend and frontend images
    echo   deploy          - Deploy the application
    echo   build-and-deploy - Build and deploy the application
    echo   stop            - Stop the application
    echo   status          - Show application status
    echo.
    echo Press any key to continue...
    pause >nul
)

echo.
echo Build and deployment process completed!