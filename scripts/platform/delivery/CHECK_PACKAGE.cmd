@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0bootstrap.ps1" -Mode PackageCheck
set "result=%errorlevel%"
echo.
pause
exit /b %result%
