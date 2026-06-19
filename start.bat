@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 🚀 Starting Picture Album...
call npm run dev
pause
