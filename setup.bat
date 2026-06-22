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

if not exist ".env" (
    echo ERROR: .env file not found.
    echo Copy .env.example to .env and add your Supabase credentials.
    echo See docs\supabase-phase0.md for setup steps.
    pause
    exit /b 1
)

findstr /C:"file:./dev.db" .env >nul 2>&1
if %errorlevel% equ 0 (
    echo ERROR: DATABASE_URL still points to SQLite.
    echo Update .env with Supabase Postgres URLs — see docs\supabase-phase0.md
    pause
    exit /b 1
)

findstr /C:"POSTGRES_PRISMA_URL" .env >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: POSTGRES_PRISMA_URL not found in .env.
    echo Run: npx vercel env pull .env   OR see docs\supabase-phase0.md
    echo.
)

echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed.
    pause
    exit /b 1
)

echo.
echo [2/4] Updating database schema (Supabase Postgres)...
call npm run db:push
if %errorlevel% neq 0 (
    echo ERROR: Database setup failed. Check POSTGRES_URL_NON_POOLING in .env.
    echo See docs\supabase-phase0.md
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
echo   Health:      http://localhost:3000/api/health
echo   Book:        http://localhost:3000/book
echo   Driver login: http://localhost:3000/driver/login
echo.
echo   Driver email:    driver@sparkride.co.uk
echo   Driver password: driver123
echo.
echo Press Ctrl+C to stop the server.
echo ============================================
call npm run dev
