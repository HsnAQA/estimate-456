@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if not exist "streamlit_app.py" (
    echo [ERROR] streamlit_app.py was not found in:
    echo %CD%
    pause
    exit /b 1
)

if not exist "requirements.txt" (
    echo [ERROR] requirements.txt was not found in:
    echo %CD%
    pause
    exit /b 1
)

if /I "%~1"=="--check" (
    echo Streamlit launcher is ready.
    exit /b 0
)

if defined LOCALAPPDATA (
    set "VENV_DIR=%LOCALAPPDATA%\CPIT456\venv"
) else (
    set "VENV_DIR=%TEMP%\CPIT456\venv"
)
set "VENV_PYTHON=%VENV_DIR%\Scripts\python.exe"

if not exist "%VENV_PYTHON%" goto create_environment
"%VENV_PYTHON%" -c "import sys" >nul 2>nul
if not errorlevel 1 goto ensure_packages

echo The existing CPIT 456 environment is not usable. Recreating it in a short Windows path.
if defined LOCALAPPDATA (
    set "VENV_DIR=%LOCALAPPDATA%\CPIT456\venv-recovery"
) else (
    set "VENV_DIR=%TEMP%\CPIT456\venv-recovery"
)
set "VENV_PYTHON=%VENV_DIR%\Scripts\python.exe"
if exist "%VENV_PYTHON%" goto ensure_packages

:create_environment
echo Creating the Python virtual environment...
where py >nul 2>nul
if errorlevel 1 goto try_python_command
py -3 -c "import sys" >nul 2>nul
if errorlevel 1 goto try_python_command
py -3 -m venv "%VENV_DIR%"
goto environment_created

:try_python_command
where python >nul 2>nul
if errorlevel 1 goto python_not_found
python -c "import sys" >nul 2>nul
if errorlevel 1 goto python_not_found
python -m venv "%VENV_DIR%"

:environment_created
if errorlevel 1 (
    echo [ERROR] Could not create the virtual environment.
    pause
    exit /b 1
)

:ensure_packages

"%VENV_PYTHON%" -c "import streamlit, pandas" >nul 2>nul
if errorlevel 1 (
    echo Installing the required packages. This is needed only on first launch...
    "%VENV_PYTHON%" -m pip install --disable-pip-version-check -r "requirements.txt"
    if errorlevel 1 (
        echo [ERROR] Package installation failed. Check your internet connection and try again.
        pause
        exit /b 1
    )
)

echo Starting the Streamlit application...
echo Keep this window open while using the application.
"%VENV_PYTHON%" -m streamlit run "streamlit_app.py"

if errorlevel 1 (
    echo.
    echo [ERROR] The Streamlit application stopped with an error.
    pause
    exit /b 1
)

endlocal
exit /b 0

:python_not_found
echo [ERROR] Python 3 was not found.
echo Install Python from https://www.python.org/downloads/ and try again.
pause
exit /b 1
