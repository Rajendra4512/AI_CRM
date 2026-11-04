from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from core.models.auth import User, Tenant
from core.models.admin import AuditLog
from core.services.auth_service import require_superadmin

router = APIRouter(dependencies=[Depends(require_superadmin)])


@router.get("/dashboard")
def admin_dashboard(admin: User = Depends(require_superadmin)):
    return {
        "message": "SuperAdmin Dashboard",
        "admin_email": admin.email,
        "sections": ["app", "llmops", "mlops", "marketing", "tenants", "audit-logs"]
    }


@router.get("/tenants")
def list_tenants(db: Session = Depends(get_db)):
    tenants = db.query(Tenant).order_by(Tenant.created_at.desc()).limit(100).all()
    return {
        "tenants": [
            {
                "id": str(t.id),
                "name": t.name,
                "slug": t.slug,
                "industry": t.industry,
                "subscription_tier": t.subscription_tier,
                "status": t.status,
            }
            for t in tenants
        ]
    }


@router.get("/audit-logs")
def list_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
    return {
        "audit_logs": [
            {
                "id": str(a.id),
                "tenant_id": str(a.tenant_id) if a.tenant_id else None,
                "user_id": str(a.user_id) if a.user_id else None,
                "action": a.action,
                "resource_type": a.resource_type,
                "resource_id": a.resource_id,
                "details": a.details,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in logs
        ]
    }


@router.get("/llmops/providers")
def llmops_providers():
    return {"providers": []}


@router.get("/mlops/models")
def mlops_models():
    return {"models": []}


@router.get("/marketing/plans")
def marketing_plans():
    return {"plans": []}


@router.get("/marketing/combo-packs")
def combo_packs():
    return {"combo_packs": []}
