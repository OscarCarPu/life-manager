from fastapi import FastAPI
from fastapi.responses import JSONResponse
from tasks.router import router as tasks_router

app = FastAPI()

app.include_router(tasks_router, prefix="/tasks")


@app.get("/healthcheck")
def healthcheck():
    return JSONResponse(content={"status": "ok"})
