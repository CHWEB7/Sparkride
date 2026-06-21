@echo off
echo ============================================
echo  Sparkride Mobile App Setup
echo ============================================
echo.

cd /d "%~dp0"

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    pause
    exit /b 1
)

echo [1/3] Creating placeholder assets...
node create-assets.js

echo.
echo [2/3] Installing dependencies...
call npm install

echo.
echo [3/3] Environment file...
if not exist .env (
    copy .env.example .env
    echo Created mobile/.env — update EXPO_PUBLIC_API_URL if needed.
) else (
    echo mobile/.env already exists.
)

echo.
echo ============================================
echo  Setup complete!
echo.
echo  1. Start the website API first:
echo     cd .. ^&^& npm run dev
echo.
echo  2. Then start the mobile app:
echo     npm start
echo.
echo  On a physical phone, set EXPO_PUBLIC_API_URL in mobile/.env
echo  to your PC IP, e.g. http://192.168.1.10:3000
echo ============================================
pause
