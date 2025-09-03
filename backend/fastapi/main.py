import os

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from tasks.router import router as tasks_router

load_dotenv()


async def get_api_key(x_api_key: str = Header(None)):
    if not x_api_key or x_api_key != os.getenv("FASTAPI_API_KEY"):
        raise HTTPException(status_code=403, detail="Access forbidden")
    return x_api_key


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

app.include_router(tasks_router, prefix="/tasks", dependencies=[Depends(get_api_key)])


@app.get("/healthcheck")
def healthcheck():
    return JSONResponse(content={"status": "ok"})
