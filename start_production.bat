@echo off
REM Production startup script for Windows
REM Online Church Meeting Platform

echo ========================================
echo Starting Production Server (Windows)
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

REM Run the production startup script
python start_production.py

pause

