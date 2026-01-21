@echo off
setlocal enabledelayedexpansion

echo Starting deployment of separated components...

REM Function to deploy database
:deploy_db
echo Deploying database...
cd /d "%~dp0db"
docker-compose -f docker-compose.db.yml up -d
echo Waiting for database to be ready...
timeout /t 30 /nobreak >nul
docker-compose -f docker-compose.db.yml ps
cd /d "%~dp0"
echo Database deployed successfully!
goto :eof

REM Function to deploy backend
:deploy_backend
echo Deploying backend...
cd /d "%~dp0backend"
docker-compose -f docker-compose.backend.yml up -d
cd /d "%~dp0"
echo Backend deployed successfully!
goto :eof

REM Function to deploy frontend
:deploy_frontend
echo Deploying frontend...
cd /d "%~dp0frontend"
docker-compose -f docker-compose.frontend.yml up -d
cd /d "%~dp0"
echo Frontend deployed successfully!
goto :eof

REM Function to deploy all components
:deploy_all
call :deploy_db
call :deploy_backend
call :deploy_frontend
echo All components deployed successfully!
goto :eof

REM Function to stop all components
:stop_all
echo Stopping all components...
cd /d "%~dp0db"
docker-compose -f docker-compose.db.yml down
cd /d "%~dp0backend"
docker-compose -f docker-compose.backend.yml down
cd /d "%~dp0frontend"
docker-compose -f docker-compose.frontend.yml down
cd /d "%~dp0"
echo All components stopped!
goto :eof

REM Function to show status
:show_status
echo Status of database:
cd /d "%~dp0db"
docker-compose -f docker-compose.db.yml ps
cd /d "%~dp0backend"
echo Status of backend:
docker-compose -f docker-compose.backend.yml ps
cd /d "%~dp0frontend"
echo Status of frontend:
docker-compose -f docker-compose.frontend.yml ps
cd /d "%~dp0"
goto :eof

REM Parse command line arguments
if "%1"=="db" (
    call :deploy_db
) else if "%1"=="backend" (
    call :deploy_backend
) else if "%1"=="frontend" (
    call :deploy_frontend
) else if "%1"=="all" (
    call :deploy_all
) else if "%1"=="stop" (
    call :stop_all
) else if "%1"=="status" (
    call :show_status
) else (
    echo Usage: %0 {db^|backend^|frontend^|all^|stop^|status}
    echo   db       - Deploy only the database
    echo   backend  - Deploy only the backend
    echo   frontend - Deploy only the frontend
    echo   all      - Deploy all components in order
    echo   stop     - Stop all components
    echo   status   - Show status of all components
    exit /b 1
)

echo Deployment process completed!