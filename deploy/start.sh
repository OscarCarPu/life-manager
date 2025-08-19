#!/usr/bin/env bash
set -euo pipefail

# Launch FastAPI (API)
uvicorn fastapi.main:app --host 0.0.0.0 --port 8001 --log-level info &
FASTAPI_PID=$!

echo "Started FastAPI with PID $FASTAPI_PID"

# Launch Flask via gunicorn
cd /app/flask
exec gunicorn --bind 0.0.0.0:8000 main:app --log-level info
