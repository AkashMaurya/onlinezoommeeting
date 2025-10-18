"""
Production startup script for Online Church Meeting Platform
Works on Windows, Linux, and macOS

This script provides a cross-platform way to run the application
with multiple Uvicorn workers for production use.
"""

import os
import sys
import multiprocessing
import subprocess
from pathlib import Path

def get_worker_count():
    """Calculate optimal worker count based on CPU cores"""
    cpu_count = multiprocessing.cpu_count()
    # Formula: (2 x CPU cores) + 1
    workers = (2 * cpu_count) + 1
    
    # Allow override via environment variable
    env_workers = os.getenv('WEB_CONCURRENCY')
    if env_workers:
        try:
            workers = int(env_workers)
        except ValueError:
            pass
    
    return workers

def get_port():
    """Get port from environment or use default"""
    return int(os.getenv('PORT', 8000))

def run_windows():
    """Run on Windows using multiple Uvicorn processes"""
    print("=" * 60)
    print("🚀 Starting Online Church Meeting Platform (Windows)")
    print("=" * 60)
    
    workers = get_worker_count()
    port = get_port()
    
    print(f"📊 Configuration:")
    print(f"   - Workers: {workers}")
    print(f"   - Port: {port}")
    print(f"   - CPU Cores: {multiprocessing.cpu_count()}")
    print(f"   - Platform: Windows")
    print()
    
    # On Windows, we can't use Gunicorn, so we use Uvicorn with multiple workers
    # Note: This is not as robust as Gunicorn but works for development/testing
    print("⚠️  Note: For production on Windows, consider using:")
    print("   - Docker with Linux container")
    print("   - WSL (Windows Subsystem for Linux)")
    print("   - Deploy to Linux-based cloud platform (Render, Heroku, etc.)")
    print()
    
    print(f"🌐 Starting server on http://0.0.0.0:{port}")
    print("   Press Ctrl+C to stop")
    print("=" * 60)
    print()
    
    # Run Uvicorn with workers
    # Note: Uvicorn's --workers option works on Windows but is less robust than Gunicorn
    cmd = [
        sys.executable, "-m", "uvicorn",
        "main:app",
        "--host", "0.0.0.0",
        "--port", str(port),
        "--workers", str(workers),
        "--log-level", "info"
    ]
    
    try:
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down server...")
        print("✅ Server stopped successfully")

def run_unix():
    """Run on Linux/macOS using Gunicorn"""
    print("=" * 60)
    print("🚀 Starting Online Church Meeting Platform (Unix)")
    print("=" * 60)
    
    port = get_port()
    
    print(f"📊 Configuration:")
    print(f"   - Port: {port}")
    print(f"   - CPU Cores: {multiprocessing.cpu_count()}")
    print(f"   - Platform: Unix/Linux")
    print(f"   - Using: Gunicorn + Uvicorn workers")
    print()
    
    print(f"🌐 Starting server on http://0.0.0.0:{port}")
    print("   Press Ctrl+C to stop")
    print("=" * 60)
    print()
    
    # Run Gunicorn with config file
    cmd = [
        "gunicorn",
        "-c", "gunicorn.conf.py",
        "main:app"
    ]
    
    try:
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down server...")
        print("✅ Server stopped successfully")

def main():
    """Main entry point"""
    # Check if running on Windows
    if sys.platform == "win32":
        run_windows()
    else:
        run_unix()

if __name__ == "__main__":
    main()

