#!/bin/bash
# Production startup script for Linux/macOS
# Online Church Meeting Platform

echo "========================================"
echo "Starting Production Server (Unix)"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

# Check if Gunicorn is installed
if ! command -v gunicorn &> /dev/null; then
    echo "ERROR: Gunicorn is not installed"
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Run the production startup script
python3 start_production.py

