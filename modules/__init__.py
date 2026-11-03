from fastapi import APIRouter
from modules.construction import router as construction_router
from modules.clinical import router as clinical_router
from modules.maritime import router as maritime_router

router = APIRouter()

router.include_router(construction_router.router, prefix="/construction", tags=["construction"])
router.include_router(clinical_router.router, prefix="/clinical", tags=["clinical"])
router.include_router(maritime_router.router, prefix="/maritime", tags=["maritime"])
