@echo off
chcp 65001 >nul
title = GYMER Setup

echo ============================================
echo   GYMER SETUP - Bat dau
echo ============================================
echo.

REM ── STEP 1 ──
echo [1/5] Kiem tra SQL Server...
sqlcmd -S localhost -E -Q "SELECT 1" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  SQL Server chua chay!
    echo  → Mo SQL Server Configuration Manager → Start dich vu
    exit /b 1
)
echo   SQL Server dang chay

REM ── STEP 2 ──
echo.
echo [2/5] Setup database...

cd /d "%~dp0"

sqlcmd -S localhost -E -Q "SELECT 1 FROM sys.databases WHERE name='gymer'" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   Database 'gymer' da ton tai
    set /p reload="  Reload schema? (y/N): "
    if /i "!reload!"=="y" (
        sqlcmd -S localhost -E -Q "DROP DATABASE gymer" >nul 2>&1
        cd database && sqlcmd -S localhost -E -i full_schema.sql >nul 2>&1 && cd ..
        echo   Schema reloaded
    ) else (
        echo   Bo qua
    )
) else (
    cd database && sqlcmd -S localhost -E -i full_schema.sql >nul 2>&1 && cd ..
    echo   Database created (34 tables, 8 procs, seed data)
)

REM ── STEP 3 ──
echo.
echo [3/5] Cai dependencies backend...
cd /d "%~dp0database\.."
cd backend
copy .env.example .env /y >nul 2>&1
call npm install --silent >nul 2>&1
echo   Backend dependencies ready
cd ..

REM ── STEP 4 ──
echo.
echo [4/5] Cai dependencies frontend...
cd frontend
call npm install --silent >nul 2>&1
echo   Frontend dependencies ready
cd ..

echo.
echo ============================================
echo   Setup hoan tat!
echo ============================================
echo.
echo Mo 2 Terminal rieng biet:
echo.
echo   Terminal 1 (Backend):
echo     cd backend ^&^& npm run dev
echo.
echo   Terminal 2 (Frontend):
echo     cd frontend ^&^& npm run dev
echo.
echo   Truy cap: http://localhost:5173
echo   Admin:    admin@gymer.com / admin123
echo.
pause
