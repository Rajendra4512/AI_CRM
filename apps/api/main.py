from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from apps.api.routers import app_router
from core.database import Base, engine
import core.models.auth  # noqa: F401
import core.models.crm  # noqa: F401
import core.models.admin  # noqa: F401
import modules.construction.models  # noqa: F401
import modules.clinical.models  # noqa: F401
import modules.maritime.models  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="SalesFortis API",
    version="1.0.0",
    description="AI-Native Multi-Vertical CRM SaaS Platform",
    lifespan=lifespan,
)

DEFAULT_CORS_ORIGINS = [
    "http://localhost:5000",
    "http://localhost:5001",
    "http://app.localhost:5001",
    "http://localhost:4173",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5001",
    "http://127.0.0.1:4173",
    "https://www.salesfortis.com",
    "https://app.salesfortis.com",
]
cors_env = os.getenv("CORS_ORIGINS", "")
allowed_origins = (
    [origin.strip() for origin in cors_env.split(",") if origin.strip()]
    if cors_env
    else DEFAULT_CORS_ORIGINS
)

# Enable CORS for authorized frontend origins (Marketing, CRM App, Vite preview, Production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API endpoints under /api/v1
app.include_router(app_router, prefix="/api/v1")

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "app": "SalesFortis",
        "version": "1.0.0",
        "service": "api"
    }

# Mount static files for monolithic single-container fallback if present
if os.path.exists("/app/apps/web/dist"):
    app.mount("/", StaticFiles(directory="/app/apps/web/dist", html=True), name="static")

@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail=f"API route not found: /{full_path}")
    if os.path.exists("/app/apps/web/dist/index.html"):
        return FileResponse("/app/apps/web/dist/index.html")
    return {
        "message": "SalesFortis API is active",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }
