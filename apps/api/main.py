from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from apps.api.routers import app_router

app = FastAPI(
    title="SalesFortis API",
    version="1.0.0",
    description="AI-Native Multi-Vertical CRM SaaS Platform"
)

# Enable CORS for frontend applications (Local Vite & Production domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        return {"error": "API route not found", "path": full_path}
    if os.path.exists("/app/apps/web/dist/index.html"):
        return FileResponse("/app/apps/web/dist/index.html")
    return {
        "message": "SalesFortis API is active",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }
