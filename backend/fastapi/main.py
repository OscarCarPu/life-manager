import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from tasks.router import router as tasks_router

# Allow setting a deployment path prefix (e.g. /api) so swagger fetches /api/openapi.json
ROOT_PATH = os.getenv("FASTAPI_ROOT_PATH", "")  # set FASTAPI_ROOT_PATH=/api in Koyeb
app = FastAPI(root_path=ROOT_PATH)

# CORS

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks_router, prefix="/tasks")


@app.get("/healthcheck")
def healthcheck():
    return JSONResponse(content={"status": "ok"})
