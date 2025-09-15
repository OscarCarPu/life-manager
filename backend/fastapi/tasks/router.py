from fastapi import APIRouter

from .crud import router as crud_router
from .endpoints import router as endpoints_router

router = APIRouter()

# Include all CRUD operations from main.py
router.include_router(endpoints_router, tags=["tasks"])
router.include_router(crud_router, tags=["CRUD"])
