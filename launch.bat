@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if /I "%~1"=="--check" goto check
if /I "%~1"=="web" goto web
if /I "%~1"=="streamlit" goto streamlit

cls
echo ==================================================
echo                  Estimate 456
echo ==================================================
echo.
echo   [1] Web application ^(HTML, CSS, JavaScript^)
echo   [2] Python application ^(Streamlit^)
echo   [S] Stop application ports
echo   [Q] Exit
echo.
choice /C 12SQ /N /M "Choose an application: "

if errorlevel 4 exit /b 0
if errorlevel 3 goto stop
if errorlevel 2 goto streamlit
if errorlevel 1 goto web

:web
call "%~dp0web-app\launch.bat"
exit /b %errorlevel%

:streamlit
call "%~dp0streamlit-app\launch.bat"
exit /b %errorlevel%

:stop
call "%~dp0stop.bat"
exit /b %errorlevel%

:check
call "%~dp0web-app\launch.bat" --check
if errorlevel 1 exit /b 1
call "%~dp0streamlit-app\launch.bat" --check
if errorlevel 1 exit /b 1
echo All launchers are ready.
exit /b 0
