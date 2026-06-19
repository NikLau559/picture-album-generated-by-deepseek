@echo off
chcp 65001 >nul
cd /d "%~dp0"

:: Check if built, if not build first
if not exist "out\main\index.js" (
    echo 🔨 First run - building...
    call npm run build
    if %errorlevel% neq 0 (
        echo ❌ Build failed
        pause
        exit /b 1
    )
)

echo 🚀 Starting Picture Album...
start "" node_modules\electron\dist\electron.exe .
exit
