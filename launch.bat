@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if /I "%~1"=="--check" (
    call "%~dp0web-app\launch.bat" --check
    exit /b %errorlevel%
)

call "%~dp0web-app\launch.bat"
exit /b %errorlevel%
