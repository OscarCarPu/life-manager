from fastapi import APIRouter

from .crud import router as crud_router

router = APIRouter()

# Include all CRUD operations from main.py
router.include_router(crud_router)
