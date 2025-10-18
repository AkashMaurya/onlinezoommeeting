# 🚀 Production Deployment Guide - Online Church Meeting Platform

## Overview

This guide covers production deployment using **Gunicorn with Uvicorn workers** for handling concurrent WebSocket connections at scale.

**Version:** 3.1.1 Patch 2  
**Last Updated:** 2025-10-18

---

## 📋 Table of Contents

1. [Why Gunicorn + Uvicorn?](#why-gunicorn--uvicorn)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running in Production](#running-in-production)
6. [Deployment Platforms](#deployment-platforms)
7. [Monitoring & Scaling](#monitoring--scaling)
8. [Troubleshooting](#troubleshooting)

---

## 🤔 Why Gunicorn + Uvicorn?

### The Problem with Development Server

The default FastAPI development server (`python main.py` or `uvicorn main:app`) is **NOT suitable for production** because:

- ❌ Single process - cannot handle concurrent users
- ❌ No worker management - crashes affect all users
- ❌ No automatic restarts - requires manual intervention
- ❌ Limited WebSocket connections - typically 1-10 concurrent users max
- ❌ No load balancing - all requests go to one process
- ❌ Memory leaks accumulate - no worker recycling

### The Solution: Gunicorn + Uvicorn Workers

✅ **Multiple worker processes** - handles 100+ concurrent users  
✅ **Automatic worker management** - restarts failed workers  
✅ **Graceful shutdowns** - WebSocket connections close properly  
✅ **Worker recycling** - prevents memory leaks  
✅ **Load balancing** - distributes connections across workers  
✅ **Production-grade** - battle-tested in enterprise environments

---

## 📦 Prerequisites

### System Requirements

- **Python:** 3.8 or higher
- **RAM:** Minimum 512MB, recommended 1GB+ for production
- **CPU:** 1+ cores (2+ recommended for better performance)
- **OS:** Linux, macOS, or Windows (with WSL for best results)

### Software Requirements

- Git
- Python pip
- Virtual environment (recommended)

---

## 💿 Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/AkashMaurya/onlinezoommeeting.git
cd onlinezoommeeting
```

### Step 2: Create Virtual Environment (Recommended)

```bash
# Linux/macOS
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- `fastapi==0.110.0` - Web framework
- `uvicorn[standard]==0.27.1` - ASGI server
- `gunicorn==21.2.0` - Production WSGI server (NEW!)
- `websockets==12.0` - WebSocket support
- `python-multipart==0.0.9` - Form data handling

### Step 4: Verify Installation

```bash
gunicorn --version
# Should output: gunicorn (version 21.2.0)

uvicorn --version
# Should output: Running uvicorn 0.27.1
```

---

## ⚙️ Configuration

### Gunicorn Configuration File

The application includes a production-ready configuration file: `gunicorn.conf.py`

**Key Settings:**

```python
# Worker processes (auto-calculated based on CPU cores)
workers = (2 x CPU_cores) + 1

# Worker class for ASGI + WebSocket support
worker_class = 'uvicorn.workers.UvicornWorker'

# WebSocket timeout (30 minutes)
timeout = 1800

# Graceful shutdown (2 minutes)
graceful_timeout = 120

# Worker recycling (prevents memory leaks)
max_requests = 1000
max_requests_jitter = 50
```

### Environment Variables

You can customize the configuration using environment variables:

```bash
# Port (default: 8000)
export PORT=8000

# Number of workers (default: auto-calculated)
export WEB_CONCURRENCY=4

# Log level (default: info)
export LOG_LEVEL=info
```

### Custom Configuration

To modify settings, edit `gunicorn.conf.py`:

```python
# Example: Increase timeout for longer meetings
timeout = 3600  # 1 hour

# Example: Reduce workers for low-resource environments
workers = 2

# Example: Increase worker connections
worker_connections = 2000
```

---

## 🏃 Running in Production

### ⚠️ Important: Platform-Specific Instructions

**Gunicorn only works on Linux/macOS** due to Unix-specific dependencies. For Windows users, see the Windows-specific instructions below.

### Method 1: Cross-Platform Production Script (Recommended for All Platforms)

**Linux/macOS:**
```bash
# Make script executable
chmod +x start_production.sh

# Run production server
./start_production.sh

# Or use Python directly
python3 start_production.py
```

**Windows:**
```bash
# Double-click start_production.bat
# Or run from command prompt:
start_production.bat

# Or use Python directly:
python start_production.py
```

This script automatically:
- Detects your operating system
- Calculates optimal worker count based on CPU cores
- Uses Gunicorn on Linux/macOS
- Uses Uvicorn with multiple workers on Windows
- Configures proper timeouts and settings

### Method 2: Using Gunicorn Directly (Linux/macOS Only)

```bash
# Basic command
gunicorn -c gunicorn.conf.py main:app

# With custom port
PORT=8080 gunicorn -c gunicorn.conf.py main:app

# With custom worker count
WEB_CONCURRENCY=4 gunicorn -c gunicorn.conf.py main:app

# With debug logging
LOG_LEVEL=debug gunicorn -c gunicorn.conf.py main:app
```

### Method 2b: Using Uvicorn with Workers (Windows Alternative)

```bash
# Basic command (Windows)
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# With custom settings
python -m uvicorn main:app --host 0.0.0.0 --port 8080 --workers 8 --log-level info
```

**Note:** Uvicorn's `--workers` option on Windows is less robust than Gunicorn on Linux. For production Windows deployments, consider:
- Using Docker with a Linux container
- Using WSL (Windows Subsystem for Linux)
- Deploying to a Linux-based cloud platform

### Method 2: Using Procfile (Platform Deployment)

For platforms like Render, Heroku, Railway:

```bash
# The Procfile contains:
web: gunicorn -c gunicorn.conf.py main:app
```

The platform will automatically run this command.

### Method 3: Systemd Service (Linux Servers)

Create `/etc/systemd/system/church-meeting.service`:

```ini
[Unit]
Description=Online Church Meeting Platform
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/var/www/church-meeting
Environment="PATH=/var/www/church-meeting/venv/bin"
ExecStart=/var/www/church-meeting/venv/bin/gunicorn -c gunicorn.conf.py main:app
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=120
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable church-meeting
sudo systemctl start church-meeting
sudo systemctl status church-meeting
```

### Method 4: Docker (Containerized Deployment)

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "-c", "gunicorn.conf.py", "main:app"]
```

Build and run:

```bash
docker build -t church-meeting .
docker run -p 8000:8000 church-meeting
```

---

## 🌐 Deployment Platforms

### Render.com (Recommended)

1. Connect GitHub repository
2. Create new Web Service
3. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn -c gunicorn.conf.py main:app`
   - **Environment:** Python 3
4. Deploy!

**Render automatically uses the Procfile**, so no additional configuration needed.

### Heroku

```bash
# Login
heroku login

# Create app
heroku create your-church-meeting

# Deploy
git push heroku main

# Scale workers (optional)
heroku ps:scale web=2
```

### Railway

1. Connect GitHub repository
2. Railway auto-detects Python and uses Procfile
3. Deploy automatically

### DigitalOcean App Platform

1. Connect GitHub repository
2. Configure:
   - **Run Command:** `gunicorn -c gunicorn.conf.py main:app`
3. Deploy

### AWS EC2 / VPS

1. SSH into server
2. Clone repository
3. Install dependencies
4. Set up systemd service (see Method 3 above)
5. Configure nginx as reverse proxy (optional)

---

## 📊 Monitoring & Scaling

### Health Check Endpoint

The application includes a health check endpoint:

```bash
curl http://localhost:8000/api/health
```

Response:
```json
{
  "status": "healthy",
  "active_meetings": 5,
  "total_participants": 23
}
```

### Monitoring Logs

```bash
# View Gunicorn logs
tail -f /var/log/gunicorn/access.log
tail -f /var/log/gunicorn/error.log

# With systemd
journalctl -u church-meeting -f

# With Docker
docker logs -f <container_id>
```

### Scaling Guidelines

**Small Church (1-20 participants):**
- Workers: 2-4
- RAM: 512MB - 1GB
- CPU: 1 core

**Medium Church (20-50 participants):**
- Workers: 4-8
- RAM: 1GB - 2GB
- CPU: 2 cores

**Large Church (50-100+ participants):**
- Workers: 8-16
- RAM: 2GB - 4GB
- CPU: 4+ cores

**Formula:**
```
workers = (2 x CPU_cores) + 1
max_concurrent_users ≈ workers x 10-20
```

### Auto-Scaling

For cloud platforms, configure auto-scaling based on:
- CPU usage > 70%
- Memory usage > 80%
- Active connections > threshold

---

## 🔧 Troubleshooting

### Issue 1: Workers Timing Out

**Symptom:** Workers killed after 30 seconds

**Solution:** Increase timeout in `gunicorn.conf.py`:
```python
timeout = 1800  # 30 minutes
```

### Issue 2: WebSocket Connections Dropping

**Symptom:** Users disconnected randomly

**Solution:** 
1. Increase `graceful_timeout`:
   ```python
   graceful_timeout = 120
   ```
2. Check reverse proxy timeout (nginx, etc.)

### Issue 3: Too Many Workers

**Symptom:** High memory usage, server crashes

**Solution:** Reduce worker count:
```bash
WEB_CONCURRENCY=2 gunicorn -c gunicorn.conf.py main:app
```

### Issue 4: Port Already in Use

**Symptom:** `Address already in use`

**Solution:**
```bash
# Find process using port 8000
lsof -i :8000
# or
netstat -tulpn | grep 8000

# Kill process
kill -9 <PID>

# Or use different port
PORT=8080 gunicorn -c gunicorn.conf.py main:app
```

### Issue 5: Module Not Found

**Symptom:** `ModuleNotFoundError: No module named 'gunicorn'`

**Solution:**
```bash
pip install -r requirements.txt
# or
pip install gunicorn==21.2.0
```

---

## 🧪 Testing Production Setup

### Test 1: Single Worker

```bash
gunicorn -w 1 -k uvicorn.workers.UvicornWorker main:app
```

Open browser: `http://localhost:8000`

### Test 2: Multiple Workers

```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

Open 3-4 browser windows and create meetings.

### Test 3: Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test 100 requests, 10 concurrent
ab -n 100 -c 10 http://localhost:8000/

# Test WebSocket connections (requires custom script)
```

---

## 📝 Best Practices

1. **Always use Gunicorn in production** - Never use `python main.py`
2. **Monitor worker health** - Set up alerts for worker crashes
3. **Use reverse proxy** - nginx or Caddy for SSL and load balancing
4. **Enable logging** - Track errors and performance
5. **Set resource limits** - Prevent runaway processes
6. **Regular restarts** - Schedule weekly restarts to clear memory
7. **Backup database** - Regular backups of `meetings.db`
8. **Use environment variables** - Never hardcode secrets
9. **Enable HTTPS** - Use SSL certificates for production
10. **Test before deploying** - Always test in staging environment

---

## 🙏 Support

**All Glory to Our LORD JESUS CHRIST (The Son of GOD)**  
**Made with ❤️ by Jesus Sheep Akash**

**Repository:** https://github.com/AkashMaurya/onlinezoommeeting  
**Version:** 3.1.1 Patch 2  
**Status:** PRODUCTION READY ✅

