"""
Gunicorn configuration file for Online Church Meeting Platform
Production-ready settings for handling concurrent WebSocket connections
"""

import multiprocessing
import os

# Server socket
bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"
backlog = 2048

# Worker processes
# For WebSocket applications, use 1 worker per CPU core
# Formula: (2 x $num_cores) + 1 is common, but for WebSockets we use fewer workers
workers = int(os.getenv('WEB_CONCURRENCY', multiprocessing.cpu_count() * 2 + 1))

# Use Uvicorn worker class for ASGI applications with WebSocket support
worker_class = 'uvicorn.workers.UvicornWorker'

# Worker connections
# Maximum number of simultaneous clients per worker
# For WebSocket apps, this should be high
worker_connections = 1000

# Timeouts
# Increased timeout for WebSocket connections (30 minutes)
timeout = 1800
keepalive = 5

# Graceful timeout for worker shutdown
# Allows WebSocket connections to close gracefully
graceful_timeout = 120

# Restart workers after this many requests (prevents memory leaks)
max_requests = 1000
max_requests_jitter = 50

# Logging
accesslog = '-'  # Log to stdout
errorlog = '-'   # Log to stderr
loglevel = os.getenv('LOG_LEVEL', 'info')
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = 'church_meeting_platform'

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (if needed for production)
# keyfile = '/path/to/keyfile'
# certfile = '/path/to/certfile'

# Server hooks
def on_starting(server):
    """Called just before the master process is initialized."""
    server.log.info("Starting Online Church Meeting Platform")

def on_reload(server):
    """Called to recycle workers during a reload via SIGHUP."""
    server.log.info("Reloading workers")

def when_ready(server):
    """Called just after the server is started."""
    server.log.info(f"Server is ready. Listening on: {bind}")
    server.log.info(f"Using {workers} worker processes")

def worker_int(worker):
    """Called when a worker receives the SIGINT or SIGQUIT signal."""
    worker.log.info("Worker received INT or QUIT signal")

def worker_abort(worker):
    """Called when a worker receives the SIGABRT signal."""
    worker.log.info("Worker received SIGABRT signal")

def pre_fork(server, worker):
    """Called just before a worker is forked."""
    pass

def post_fork(server, worker):
    """Called just after a worker has been forked."""
    server.log.info(f"Worker spawned (pid: {worker.pid})")

def post_worker_init(worker):
    """Called just after a worker has initialized the application."""
    worker.log.info("Worker initialized successfully")

def worker_exit(server, worker):
    """Called just after a worker has been exited."""
    server.log.info(f"Worker exited (pid: {worker.pid})")

def child_exit(server, worker):
    """Called just after a worker has been exited, in the master process."""
    pass

def on_exit(server):
    """Called just before exiting Gunicorn."""
    server.log.info("Shutting down Online Church Meeting Platform")

# Environment variables
raw_env = [
    'PYTHONUNBUFFERED=1',
]

# Preload application code before worker processes are forked
# This can save RAM but may cause issues with some applications
# For WebSocket apps, it's generally safe
preload_app = False  # Set to False for WebSocket apps to avoid connection issues

# Limit the allowed size of an HTTP request header field
limit_request_field_size = 8190

# Limit the number of HTTP headers fields in a request
limit_request_fields = 100

# Limit the allowed size of an HTTP request line
limit_request_line = 4094

