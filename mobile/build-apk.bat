@echo off
setlocal enabledelayedexpansion
echo.
echo  ============================================
echo   Sparkride - Build Android APK (Expo EAS)
echo  ============================================
echo.
echo  Creating an Expo account does NOT create an APK.
echo  You must run this script to start a cloud build.
echo  The APK appears on expo.dev when the build finishes
echo  ^(usually 10-20 minutes^).
echo.
pause

cd /d "%~dp0"

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    pause
    exit /b 1
)

echo [1/5] Creating app icons...
node create-assets.js

echo.
echo [2/5] Installing dependencies...
if not exist node_modules call npm install

echo.
echo [3/5] Log in to Expo ^(browser will open if needed^)...
call npx eas-cli login
if %errorlevel% neq 0 (
    echo Login failed. Try again: npx eas-cli login
    pause
    exit /b 1
)

echo.
echo [4/5] Linking project to your Expo account ^(first time only^)...
call npx eas-cli init --id 2>nul
if %errorlevel% neq 0 (
    call npx eas-cli build:configure
)

echo.
echo [5/5] Starting Android APK build in the cloud...
echo.
echo  IMPORTANT: When this finishes STARTING, it will print a URL like:
echo    https://expo.dev/accounts/YOU/projects/sparkride-mobile/builds/...
echo.
echo  Open that URL to watch progress. When status = Finished,
echo  click the Download button to get the .apk file.
echo.
pause

call npx eas-cli build -p android --profile preview
if %errorlevel% neq 0 (
    echo.
    echo Build failed to start. See the error above.
    pause
    exit /b 1
)

echo.
echo ============================================
echo  Build submitted!
echo.
echo  NEXT STEPS:
echo  1. Open the build URL printed above
echo  2. Wait until status shows "Finished"
echo  3. Click Download on that page
echo  4. Save the file as:
echo       ..\public\downloads\sparkride.apk
echo  5. Commit and push to deploy on your website
echo.
echo  Or run: npx eas-cli build:list
echo  to see all builds and download links.
echo ============================================
pause
