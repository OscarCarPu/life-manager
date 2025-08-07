FROM python:3.12-slim-bookworm

WORKDIR /app


COPY flask/requirements.txt .
COPY common /app/common
RUN pip install --no-cache-dir -r requirements.txt

COPY flask /app

# gunicorn with debug
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--reload", "main:app", "--log-level", "debug"]
