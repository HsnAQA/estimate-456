@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Stop CPIT 456 applications

if /I "%~1"=="--check" (
    echo Stop launcher is ready for ports 8501-8510 and 8765.
    exit /b 0
)

echo Closing CPIT 456 application ports...
set "FOUND=0"

for %%P in (8501 8502 8503 8504 8505 8506 8507 8508 8509 8510 8765) do (
    for /f "tokens=5" %%A in ('netstat -ano ^| findstr /R /C:":%%P .*LISTENING"') do (
        if not "%%A"=="0" (
            echo Stopping process %%A on port %%P...
            taskkill /PID %%A /T /F >nul 2>nul
            if not errorlevel 1 set "FOUND=1"
        )
    )
)

if "!FOUND!"=="0" (
    echo No CPIT 456 application ports were open.
) else (
    echo All detected CPIT 456 application ports are closed.
)

echo.
pause
endlocal
