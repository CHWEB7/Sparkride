@echo off
echo ============================================
echo  Sparkride Booking - Local Setup
echo ============================================
echo.

cd /d "%~dp0"

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo Download it from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed.
    pause
    exit /b 1
)

echo.
echo [2/4] Updating database schema...
call npm run db:push
if %errorlevel% neq 0 (
    echo ERROR: Database setup failed.
    pause
    exit /b 1
)

echo.
echo [3/4] Seeding demo driver account...
call npm run db:seed

echo.
echo [4/4] Starting development server...
echo.
echo   Homepage:    http://localhost:3000
echo   Book:        http://localhost:3000/book
echo   Driver login: http://localhost:3000/driver/login
echo.
echo   Driver email:    driver@sparkride.co.uk
echo   Driver password: driver123
echo.
echo Press Ctrl+C to stop the server.
echo ============================================
call npm run dev
