from fastapi import APIRouter
from apps.api.routers import auth, admin, crm
from modules import router as modules_router
from ai.router import router as ai_router

app_router = APIRouter()

app_router.include_router(auth.router, prefix="/auth", tags=["auth"])
app_router.include_router(admin.router, prefix="/admin", tags=["admin"])
app_router.include_router(crm.router, prefix="/crm", tags=["crm"])
app_router.include_router(modules_router, prefix="/verticals", tags=["verticals"])
app_router.include_router(ai_router, prefix="/ai", tags=["ai"])
