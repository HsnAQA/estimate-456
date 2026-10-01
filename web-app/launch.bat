@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if not exist "index.html" (
    echo [ERROR] index.html was not found in:
    echo %CD%
    pause
    exit /b 1
)

if /I "%~1"=="--check" (
    echo Web launcher is ready.
    exit /b 0
)

echo Opening the web application in your default browser...
start "" "index.html"

endlocal
