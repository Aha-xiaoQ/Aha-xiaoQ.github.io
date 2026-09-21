@echo off
setlocal
cd /d "%~dp0"
node scripts\dev.mjs
if errorlevel 1 pause
