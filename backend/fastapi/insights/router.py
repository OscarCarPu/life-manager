from fastapi import APIRouter

from .crud import router as crud_router

router = APIRouter()

# Include all CRUD operations
router.include_router(crud_router)
