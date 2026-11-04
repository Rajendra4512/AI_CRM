from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from core.database import get_db
from core.models.auth import Tenant, User
from core.services.auth_service import get_current_tenant, get_current_user, require_industry_entitlement
from modules.construction.models import Project
from modules.construction.service import ConstructionSOVService

router = APIRouter(dependencies=[Depends(require_industry_entitlement("construction"))])

class SOVLineInput(BaseModel):
    line_item_id: str
    description: str
    scheduled_value: float
    work_previous: float = 0.0
    work_current: float = 0.0
    stored_materials: float = 0.0

class SOVCalculationRequest(BaseModel):
    retainage_rate_pct: float = Field(default=10.0, ge=0.0, le=100.0)
    lines: List[SOVLineInput]

class SOVApplicationCreate(BaseModel):
    project_id: Optional[uuid.UUID] = None
    application_number: int = Field(default=1, ge=1)
    retainage_rate_pct: float = Field(default=10.0, ge=0.0, le=100.0)
    lines: List[SOVLineInput]

class ChangeEventCreate(BaseModel):
    title: str
    trade_scope: str
    estimated_cost: float
    project_id: Optional[uuid.UUID] = None
    status: Optional[str] = "draft"

class ChangeEventStatusUpdate(BaseModel):
    status: str

class FieldTMCreate(BaseModel):
    trade: str
    worker_name: str
    hours_worked: float
    materials_cost: float = 0.0
    equipment_cost: float = 0.0
    project_id: Optional[uuid.UUID] = None
    change_event_id: Optional[uuid.UUID] = None

@router.post("/sov/calculate")
def calculate_sov(req: SOVCalculationRequest):
    lines_dict = [l.model_dump() for l in req.lines]
    return ConstructionSOVService.calculate_sov_application(lines_dict, req.retainage_rate_pct)

@router.post("/sov/applications")
def create_sov_application(
    req: SOVApplicationCreate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant)
):
    project_id = req.project_id
    if not project_id:
        demo_project = ConstructionSOVService.get_or_create_demo_project(db, tenant.id)
        project_id = demo_project.id

    lines_dict = [l.model_dump() for l in req.lines]
    try:
        app_record = ConstructionSOVService.persist_sov_application(
            db=db,
            tenant_id=tenant.id,
            project_id=project_id,
            application_number=req.application_number,
            lines=lines_dict,
            retainage_rate_pct=req.retainage_rate_pct,
            status="submitted"
        )
        return {
            "message": f"SOV Application #{app_record.application_number} saved and submitted successfully.",
            "application_id": str(app_record.id),
            "project_id": str(app_record.project_id),
            "application_number": app_record.application_number,
            "total_contract_value": float(app_record.total_contract_value or 0),
            "total_completed_stored": float(app_record.total_completed_stored or 0),
            "total_retainage": float(app_record.total_retainage or 0),
            "net_payment_due": float(app_record.net_payment_due or 0),
            "status": app_record.status
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sov/applications")
def list_sov_applications(
    project_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant)
):
    apps = ConstructionSOVService.list_sov_applications(db, tenant.id, project_id)
    return {
        "applications": [
            {
                "id": str(a.id),
                "application_number": a.application_number,
                "project_id": str(a.project_id),
                "total_contract_value": float(a.total_contract_value or 0),
                "total_completed_stored": float(a.total_completed_stored or 0),
                "total_retainage": float(a.total_retainage or 0),
                "net_payment_due": float(a.net_payment_due or 0),
                "status": a.status,
                "created_at": a.created_at.isoformat() if a.created_at else None
            }
            for a in apps
        ]
    }


@router.patch("/sov/applications/{application_id}/approve")
def approve_sov_application(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    try:
        approved = ConstructionSOVService.approve_sov_application(db, tenant.id, application_id, actor_id=user.id)
        return {
            "message": f"SOV Application #{approved.application_number} approved and locked.",
            "application_id": str(approved.id),
            "status": approved.status,
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/sov/applications/{application_id}/export")
def export_sov_application(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    try:
        return ConstructionSOVService.export_sov_for_accounting(db, tenant.id, application_id, actor_id=user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/change-events")
def list_change_events(
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant)
):
    events = ConstructionSOVService.list_change_events(db, tenant.id)
    # If empty, seed initial sample records for demo experience
    if not events:
        demo_events = [
            ("Additional Fire Stopping 4th Floor", "Drywall & Insulation", 18400.0, "pco_approved"),
            ("Re-routing Conduit Main Run", "Electrical", 24200.0, "pco_submitted"),
            ("Structural Tie-in Revision", "Structural Steel", 42000.0, "rfq_issued")
        ]
        demo_proj = ConstructionSOVService.get_or_create_demo_project(db, tenant.id)
        for title, trade, cost, st in demo_events:
            ConstructionSOVService.create_change_event(
                db, tenant.id, title, trade, cost, demo_proj.id, status=st
            )
        events = ConstructionSOVService.list_change_events(db, tenant.id)

    return {
        "change_events": [
            {
                "id": str(e.id),
                "event_number": e.event_number,
                "title": e.title,
                "trade_scope": e.trade_scope,
                "estimated_cost": float(e.estimated_cost or 0),
                "status": e.status,
                "created_at": e.created_at.isoformat() if e.created_at else None
            }
            for e in events
        ]
    }

@router.post("/change-events")
def create_change_event(
    req: ChangeEventCreate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user)
):
    event = ConstructionSOVService.create_change_event(
        db=db,
        tenant_id=tenant.id,
        title=req.title,
        trade_scope=req.trade_scope,
        estimated_cost=req.estimated_cost,
        project_id=req.project_id,
        actor_id=user.id,
        status=req.status or "draft"
    )
    return {
        "message": "Change event created successfully.",
        "change_event": {
            "id": str(event.id),
            "event_number": event.event_number,
            "title": event.title,
            "trade_scope": event.trade_scope,
            "estimated_cost": float(event.estimated_cost or 0),
            "status": event.status
        }
    }

@router.patch("/change-events/{event_id}/status")
def update_change_event_status(
    event_id: uuid.UUID,
    req: ChangeEventStatusUpdate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user)
):
    try:
        updated = ConstructionSOVService.transition_change_event(
            db=db,
            tenant_id=tenant.id,
            event_id=event_id,
            new_status=req.status,
            actor_id=user.id
        )
        return {
            "message": f"Change event status updated to {updated.status}",
            "change_event": {
                "id": str(updated.id),
                "event_number": updated.event_number,
                "status": updated.status
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/field-tm")
def create_field_tm(
    req: FieldTMCreate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant)
):
    record = ConstructionSOVService.record_field_tm(
        db=db,
        tenant_id=tenant.id,
        trade=req.trade,
        worker_name=req.worker_name,
        hours_worked=req.hours_worked,
        materials_cost=req.materials_cost,
        equipment_cost=req.equipment_cost,
        project_id=req.project_id,
        change_event_id=req.change_event_id
    )
    return {
        "message": "Field T&M slip submitted.",
        "record_id": str(record.id)
    }

@router.get("/projects")
def list_projects(
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant)
):
    ConstructionSOVService.get_or_create_demo_project(db, tenant.id)
    projects = (
        db.query(Project)
        .filter(Project.tenant_id == tenant.id)
        .order_by(Project.created_at.desc())
        .all()
    )
    return {
        "projects": [
            {
                "id": str(p.id),
                "project_name": p.project_name,
                "status": p.status,
                "budget": float(p.budget or 0),
                "start_date": p.start_date.isoformat() if p.start_date else None,
            }
            for p in projects
        ]
    }


# --- Construction Bid Desk: RFQs, Estimates, Bid/No-Bid, Award & Handover ---

class RFQCreate(BaseModel):
    project_name: str
    account_id: Optional[uuid.UUID] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = "open"
    description: Optional[str] = None


class RFQUpdate(BaseModel):
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    description: Optional[str] = None


class EstimateCreate(BaseModel):
    rfq_id: Optional[uuid.UUID] = None
    total_amount: float = Field(..., ge=0.0)
    version: Optional[str] = None
    status: Optional[str] = "draft"


class RFQAwardHandoverRequest(BaseModel):
    awarded_amount: Optional[float] = None


@router.get("/rfqs")
def list_rfqs(
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    return {"rfqs": ConstructionSOVService.list_rfqs(db, tenant.id)}


@router.post("/rfqs", status_code=status.HTTP_201_CREATED)
def create_rfq(
    req: RFQCreate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    try:
        rfq = ConstructionSOVService.create_rfq(
            db=db,
            tenant_id=tenant.id,
            project_name=req.project_name,
            due_date=req.due_date,
            account_id=req.account_id,
            status=req.status or "open",
            description=req.description,
            actor_id=user.id,
        )
        return {
            "id": str(rfq.id),
            "project_name": rfq.project_name,
            "account_id": str(rfq.account_id) if rfq.account_id else None,
            "due_date": rfq.due_date.isoformat() if rfq.due_date else None,
            "status": rfq.status,
            "description": rfq.description,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/rfqs/{rfq_id}")
def update_rfq(
    rfq_id: uuid.UUID,
    req: RFQUpdate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    rfq = ConstructionSOVService.update_rfq(
        db=db,
        tenant_id=tenant.id,
        rfq_id=rfq_id,
        status=req.status,
        due_date=req.due_date,
        description=req.description,
        actor_id=user.id,
    )
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found for active tenant.")
    return {
        "id": str(rfq.id),
        "project_name": rfq.project_name,
        "status": rfq.status,
        "due_date": rfq.due_date.isoformat() if rfq.due_date else None,
        "description": rfq.description,
    }


@router.get("/estimates")
def list_estimates(
    rfq_id: Optional[uuid.UUID] = Query(default=None),
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    return {"estimates": ConstructionSOVService.list_estimates(db, tenant.id, rfq_id=rfq_id)}


@router.post("/estimates", status_code=status.HTTP_201_CREATED)
def create_estimate(
    req: EstimateCreate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    try:
        est = ConstructionSOVService.create_estimate(
            db=db,
            tenant_id=tenant.id,
            rfq_id=req.rfq_id,
            total_amount=req.total_amount,
            version=req.version,
            status=req.status or "draft",
            actor_id=user.id,
        )
        return {
            "id": str(est.id),
            "rfq_id": str(est.rfq_id) if est.rfq_id else None,
            "version": est.version,
            "total_amount": float(est.total_amount or 0.0),
            "status": est.status,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/rfqs/{rfq_id}/award-handover")
def award_and_handover_rfq(
    rfq_id: uuid.UUID,
    req: RFQAwardHandoverRequest,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    try:
        return ConstructionSOVService.award_and_handover_rfq(
            db=db,
            tenant_id=tenant.id,
            rfq_id=rfq_id,
            awarded_amount=req.awarded_amount,
            actor_id=user.id,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/bid-analytics")
def get_bid_analytics(
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    return ConstructionSOVService.get_bid_analytics(db, tenant.id)
