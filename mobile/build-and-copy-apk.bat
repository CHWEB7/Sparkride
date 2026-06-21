@echo off
echo ============================================
echo  Build Android APK and copy to website
echo ============================================
echo.

cd /d "%~dp0"

where npx >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js / npx not found.
    pause
    exit /b 1
)

echo This runs EAS Build in the cloud. You need:
echo   1. An Expo account (https://expo.dev)
echo   2. Run: npx eas-cli login
echo   3. Update EXPO_PUBLIC_API_URL in eas.json to your Vercel URL
echo.

set /p CONTINUE="Continue? (y/n): "
if /i not "!CONTINUE!"=="y" exit /b 0

echo.
echo Building APK (this may take 10-20 minutes)...
call npx eas-cli build -p android --profile preview --non-interactive
if %errorlevel% neq 0 (
    echo.
    echo Build failed. Run manually: npx eas-cli build -p android --profile preview
    pause
    exit /b 1
)

echo.
echo When the build finishes, download the .apk from the Expo dashboard URL above.
echo Then copy it to:
echo   ..\public\downloads\sparkride.apk
echo.
echo Commit and push to deploy the download on your website.
pause
