import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from core.database import get_db
from core.models.auth import Tenant, User
from core.services.auth_service import get_current_tenant, get_current_user
from core.services.crm_service import CRMService

router = APIRouter()


class AccountCreate(BaseModel):
    name: str
    account_type: Optional[str] = "Customer"
    industry: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    account_type: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None


class ContactCreate(BaseModel):
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    title: Optional[str] = None
    account_id: Optional[uuid.UUID] = None


class LeadCreate(BaseModel):
    first_name: str
    last_name: str
    company: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: Optional[str] = "new"
    source: Optional[str] = "Web"


class LeadUpdate(BaseModel):
    status: Optional[str] = None
    source: Optional[str] = None
    company: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class LeadQualifyRequest(BaseModel):
    account_type: Optional[str] = "General Contractor"
    contact_title: Optional[str] = "Preconstruction / Estimator"
    opportunity_name: Optional[str] = None
    estimated_amount: float = Field(default=175000.0, ge=0.0)
    initial_stage: str = "qualified"
    create_rfq: bool = False
    due_days: int = Field(default=14, ge=1, le=365)
    scope_notes: Optional[str] = None


class OpportunityCreate(BaseModel):
    name: str
    amount: float = 0.0
    stage: str = "prospecting"
    account_id: Optional[uuid.UUID] = None
    probability: Optional[str] = None
    close_date: Optional[datetime] = None


class OpportunityStageUpdate(BaseModel):
    stage: str


class OpportunityUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    stage: Optional[str] = None
    probability: Optional[str] = None
    close_date: Optional[datetime] = None
    account_id: Optional[uuid.UUID] = None


class PipelineStageItem(BaseModel):
    key: str
    label: str
    probability: int = Field(default=30, ge=0, le=100)


class PipelineConfigUpdate(BaseModel):
    stages: List[PipelineStageItem]


class ActivityCreate(BaseModel):
    activity_type: str = "call"  # call, site_walk, meeting, task, followup, note, email
    subject: str
    resource_type: str = "opportunity"
    resource_id: Optional[str] = None
    due_date: Optional[str] = None
    notes: Optional[str] = None
    completed: bool = False


class ActivityCompleteRequest(BaseModel):
    completed: bool = True


# --- Accounts (Organizations: GCs, Owners, Subcontractors, Suppliers) ---
@router.get("/accounts")
def list_accounts(
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    accounts = CRMService.list_accounts(db, tenant.id)
    return {"accounts": accounts}


@router.post("/accounts", status_code=status.HTTP_201_CREATED)
def create_account(
    req: AccountCreate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    account = CRMService.create_account(
        db=db,
        tenant_id=tenant.id,
        name=req.name,
        account_type=req.account_type,
        industry=req.industry,
        website=req.website,
        phone=req.phone,
        email=req.email,
        owner_id=user.id,
    )
    return {"message": "Account created successfully", "account_id": str(account.id), "account": account}


@router.patch("/accounts/{account_id}")
def update_account(
    account_id: uuid.UUID,
    req: AccountUpdate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    updated = CRMService.update_account(
        db=db,
        tenant_id=tenant.id,
        account_id=account_id,
        name=req.name,
        account_type=req.account_type,
        industry=req.industry,
        website=req.website,
        phone=req.phone,
        email=req.email,
        actor_id=user.id,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"message": "Account updated successfully", "account": updated}


# --- Contacts (People: Estimators, Preconstruction Managers, PMs) ---
@router.get("/contacts")
def list_contacts(
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    contacts = CRMService.list_contacts(db, tenant.id)
    return {"contacts": contacts}


@router.post("/contacts", status_code=status.HTTP_201_CREATED)
def create_contact(
    req: ContactCreate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    try:
        contact = CRMService.create_contact(
            db=db,
            tenant_id=tenant.id,
            first_name=req.first_name,
            last_name=req.last_name,
            email=req.email,
            phone=req.phone,
            title=req.title,
            account_id=req.account_id,
            actor_id=user.id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return {"message": "Contact created successfully", "contact_id": str(contact.id), "contact": contact}


# --- Leads Inbox & Qualification ---
@router.get("/leads")
def list_leads(
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    leads = CRMService.list_leads(db, tenant.id)
    return {"leads": leads}


@router.post("/leads", status_code=status.HTTP_201_CREATED)
def create_lead(
    req: LeadCreate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    lead = CRMService.create_lead(
        db=db,
        tenant_id=tenant.id,
        first_name=req.first_name,
        last_name=req.last_name,
        company=req.company,
        email=req.email,
        phone=req.phone,
        status=req.status or "new",
        source=req.source,
        owner_id=user.id,
    )
    return {"message": "Lead created successfully", "lead_id": str(lead.id), "lead": lead}


@router.patch("/leads/{lead_id}")
def update_lead(
    lead_id: uuid.UUID,
    req: LeadUpdate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    lead = CRMService.update_lead(
        db=db,
        tenant_id=tenant.id,
        lead_id=lead_id,
        status=req.status,
        source=req.source,
        company=req.company,
        email=req.email,
        phone=req.phone,
        actor_id=user.id,
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead updated successfully", "lead": lead}


@router.post("/leads/{lead_id}/qualify")
def qualify_lead(
    lead_id: uuid.UUID,
    req: LeadQualifyRequest,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    allow_rfq = bool(req.create_rfq) and (
        tenant.industry in ("all", "construction")
        or "construction" in (tenant.industry or "").lower()
    )
    result = CRMService.qualify_lead(
        db=db,
        tenant_id=tenant.id,
        lead_id=lead_id,
        actor_id=user.id,
        account_type=req.account_type or "General Contractor",
        contact_title=req.contact_title or "Preconstruction / Estimator",
        opportunity_name=req.opportunity_name,
        estimated_amount=req.estimated_amount,
        initial_stage=req.initial_stage,
        create_rfq=allow_rfq,
        due_days=req.due_days,
        scope_notes=req.scope_notes,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead qualified into Opportunity, Account, and Contact", **result}


@router.delete("/leads/{lead_id}")
def delete_lead(
    lead_id: uuid.UUID,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    deleted = CRMService.delete_lead(db, tenant.id, lead_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted successfully", "lead_id": str(lead_id)}


# --- Opportunities & Customizable Pipeline ---
@router.get("/opportunities")
def list_opportunities(
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    opportunities = CRMService.list_opportunities(db, tenant.id)
    accounts = {a.id: a.name for a in CRMService.list_accounts(db, tenant.id)}
    now = datetime.utcnow()
    enriched: List[Dict[str, Any]] = []
    for o in opportunities:
        ref_dt = o.updated_at or o.created_at or now
        days_idle = max(0, (now - ref_dt).days)
        enriched.append(
            {
                "id": str(o.id),
                "tenant_id": str(o.tenant_id),
                "account_id": str(o.account_id) if o.account_id else None,
                "account_name": accounts.get(o.account_id) if o.account_id else None,
                "name": o.name,
                "amount": float(o.amount or 0.0),
                "stage": o.stage,
                "probability": o.probability,
                "close_date": o.close_date.isoformat() if o.close_date else None,
                "owner_id": str(o.owner_id) if o.owner_id else None,
                "created_at": o.created_at.isoformat() if o.created_at else None,
                "updated_at": o.updated_at.isoformat() if o.updated_at else None,
                "days_in_stage": days_idle,
                "is_stale": days_idle >= 7 and (o.stage or "").lower() not in ("won", "closed_won", "lost"),
            }
        )
    return {"opportunities": enriched}


@router.post("/opportunities", status_code=status.HTTP_201_CREATED)
def create_opportunity(
    req: OpportunityCreate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    try:
        opp = CRMService.create_opportunity(
            db=db,
            tenant_id=tenant.id,
            name=req.name,
            amount=req.amount,
            stage=req.stage,
            account_id=req.account_id,
            probability=req.probability,
            close_date=req.close_date,
            owner_id=user.id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return {"message": "Opportunity created successfully", "opportunity_id": str(opp.id)}


@router.patch("/opportunities/{opportunity_id}/stage")
def update_opportunity_stage(
    opportunity_id: uuid.UUID,
    req: OpportunityStageUpdate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    opp = CRMService.update_opportunity_stage(
        db, tenant.id, opportunity_id, req.stage, actor_id=user.id
    )
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return {
        "message": "Stage updated successfully",
        "opportunity_id": str(opp.id),
        "stage": opp.stage,
        "probability": opp.probability,
    }


@router.patch("/opportunities/{opportunity_id}")
def update_opportunity(
    opportunity_id: uuid.UUID,
    req: OpportunityUpdate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    try:
        opp = CRMService.update_opportunity(
            db=db,
            tenant_id=tenant.id,
            opportunity_id=opportunity_id,
            name=req.name,
            amount=req.amount,
            stage=req.stage,
            probability=req.probability,
            close_date=req.close_date,
            account_id=req.account_id,
            actor_id=user.id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return {"message": "Opportunity updated successfully", "opportunity_id": str(opp.id), "stage": opp.stage}


# --- Customizable Pipeline Stage Configuration ---
@router.get("/pipeline-config")
def get_pipeline_config(
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    stages = CRMService.get_pipeline_stages(db, tenant.id, tenant.industry or "construction")
    return {"stages": stages, "industry": tenant.industry}


@router.put("/pipeline-config")
def save_pipeline_config(
    req: PipelineConfigUpdate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    if len(req.stages) < 2:
        raise HTTPException(status_code=422, detail="At least 2 pipeline stages are required")
    saved = CRMService.save_pipeline_stages(
        db,
        tenant.id,
        [s.model_dump() for s in req.stages],
        actor_id=user.id,
    )
    return {"message": "Pipeline configuration saved", "stages": saved}


# --- Activities, Tasks, Site Walks, Notes & Tracked Emails ---
@router.get("/activities")
def list_activities(
    resource_type: Optional[str] = Query(default=None),
    resource_id: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    activities = CRMService.list_activities(
        db, tenant.id, resource_type=resource_type, resource_id=resource_id
    )
    return {"activities": activities}


@router.post("/activities", status_code=status.HTTP_201_CREATED)
def create_activity(
    req: ActivityCreate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    activity = CRMService.create_activity(
        db=db,
        tenant_id=tenant.id,
        activity_type=req.activity_type,
        subject=req.subject,
        resource_type=req.resource_type,
        resource_id=req.resource_id,
        due_date=req.due_date,
        notes=req.notes,
        completed=req.completed,
        actor_id=user.id,
    )
    return {"message": "Activity logged successfully", "activity": activity}


@router.patch("/activities/{activity_id}/complete")
def complete_activity(
    activity_id: uuid.UUID,
    req: ActivityCompleteRequest,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    updated = CRMService.complete_activity(db, tenant.id, activity_id, completed=req.completed)
    if not updated:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"message": "Activity status updated", "activity": updated}


# --- Live Tenant CRM Analytics & Revenue Forecast ---
@router.get("/analytics")
def get_crm_analytics(
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    return CRMService.get_crm_analytics(db, tenant.id, tenant.industry or "construction")
