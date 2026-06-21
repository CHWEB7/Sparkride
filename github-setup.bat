@echo off
setlocal enabledelayedexpansion

echo ============================================
echo  Sparkride - Push to GitHub
echo ============================================
echo.

cd /d "%~dp0"

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed.
    echo Download from https://git-scm.com/download/win
    pause
    exit /b 1
)

where gh >nul 2>&1
if %errorlevel% neq 0 (
    echo NOTE: GitHub CLI ^(gh^) not found. You can still push manually after creating a repo on github.com
    echo.
)

if not exist .git (
    echo [1/5] Initialising git repository...
    git init
    git branch -M main
) else (
    echo [1/5] Git repository already exists.
)

echo.
echo [2/5] Staging files ^(.env and database are excluded by .gitignore^)...
git add .

echo.
echo [3/5] Creating initial commit...
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo Nothing new to commit. Skipping commit.
) else (
    git commit -m "Initial commit: Sparkride booking website and driver portal"
)

echo.
echo [4/5] GitHub repository setup
echo.
set /p REPO_URL="Paste your GitHub repo URL (e.g. https://github.com/you/sparkride-booking.git): "

if "!REPO_URL!"=="" (
    echo No URL provided. Stopping before push.
    echo.
    echo Create a repo at https://github.com/new then run this script again.
    pause
    exit /b 1
)

git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    git remote add origin "!REPO_URL!"
) else (
    git remote set-url origin "!REPO_URL!"
)

echo.
echo [5/5] Pushing to GitHub...
git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo Push failed. Common fixes:
    echo   - Log in: gh auth login
    echo   - Or use a Personal Access Token when prompted for password
    echo   - Make sure the GitHub repo exists and is empty
    pause
    exit /b 1
)

echo.
echo Done! Your code is on GitHub.
echo Next: connect the repo to Vercel at https://vercel.com/new
echo.
pause
