# Multi-service image combining FastAPI (API) and Flask (Web UI)
# Not recommended for large scale (better separate images) but useful for simple single-host deployment.

FROM python:3.12-slim-bookworm

WORKDIR /app

# Install shared dependencies first to leverage Docker layer caching
COPY backend/common /app/common

# Copy requirements for both services and install them together to reduce layers
COPY backend/fastapi/requirements.txt /tmp/fastapi-requirements.txt
COPY backend/flask/requirements.txt /tmp/flask-requirements.txt

# Merge requirement files (simple concat; you may want to dedupe later)
RUN cat /tmp/fastapi-requirements.txt /tmp/flask-requirements.txt | sort -u > /tmp/combined-requirements.txt \
    && pip install --no-cache-dir -r /tmp/combined-requirements.txt

# Copy application code
COPY backend/fastapi /app/fastapi
COPY backend/flask /app/flask

# Copy a simple process manager script
COPY deploy/start.sh /app/start.sh
RUN chmod +x /app/start.sh

ENV PYTHONUNBUFFERED=1 \
    STAGE=prod

# Expose both ports (FastAPI 8001, Flask 8000)
EXPOSE 8000 8001

# Start both services
CMD ["/app/start.sh"]
