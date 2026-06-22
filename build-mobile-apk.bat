@echo off
echo ============================================
echo  Sparkride - Build APK (must run from mobile/)
echo ============================================
cd /d "%~dp0mobile"
if not exist app\index.tsx (
  echo ERROR: mobile/app/index.tsx is missing. Pull latest code first.
  pause
  exit /b 1
)
call npm run verify
if %errorlevel% neq 0 pause & exit /b 1
echo.
echo Commit and push BEFORE building if EAS uses GitHub:
echo   git add mobile
echo   git commit -m "Mobile app update"
echo   git push
echo.
pause
call npx eas-cli build -p android --profile preview --clear-cache
