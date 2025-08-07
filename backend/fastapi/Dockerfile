FROM python:3.12-slim-bookworm

WORKDIR /app

COPY fastapi/requirements.txt .
COPY common /app/common
RUN pip install --no-cache-dir -r requirements.txt

COPY fastapi /app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
