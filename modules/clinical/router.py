from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
import uuid

from core.database import get_db
from core.models.auth import Tenant, User
from core.services.auth_service import get_current_tenant, get_current_user, require_industry_entitlement
from modules.clinical.service import ClinicalComplianceService

router = APIRouter(dependencies=[Depends(require_industry_entitlement("clinical"))])

class ConsentVerificationRequest(BaseModel):
    patient_id: str
    consent_signed: bool

class ReferralCreate(BaseModel):
    pseudonymous_id: str
    study_id: Optional[uuid.UUID] = None
    referral_source: Optional[str] = "Clinical Portal"


class CriterionVerifyRequest(BaseModel):
    human_verified: bool = True


class ConsentRevokeRequest(BaseModel):
    patient_id: str
    reason: Optional[str] = "Subject withdrew consent"


class FollowUpCreateRequest(BaseModel):
    referral_id: uuid.UUID
    task_type: Optional[str] = "prescreen_call"
    days_from_now: Optional[int] = 2
    notes: Optional[str] = None

@router.get("/metrics")
def get_metrics(
    study_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant)
):
    return ClinicalComplianceService.get_funnel_metrics(db, tenant.id, study_id)

@router.post("/verify-consent")
def verify_consent(
    req: ConsentVerificationRequest,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user)
):
    try:
        result = ClinicalComplianceService.verify_and_randomize(
            db=db,
            tenant_id=tenant.id,
            patient_id=req.patient_id,
            consent_signed=req.consent_signed,
            user_id=user.id
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=result["error"]
        )
    return result

@router.get("/referrals")
def list_referrals(
    study_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant)
):
    referrals = ClinicalComplianceService.list_referrals(db, tenant.id, study_id)
    return {
        "referrals": [
            {
                "id": str(r.id),
                "pseudonymous_id": r.pseudonymous_id,
                "stage": r.stage,
                "consent_status": r.consent_status,
                "referral_source": r.referral_source,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in referrals
        ]
    }

@router.post("/referrals")
def create_referral(
    req: ReferralCreate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant)
):
    try:
        clean_pid = ClinicalComplianceService.validate_pseudonymous_id(req.pseudonymous_id)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    study = ClinicalComplianceService.get_or_create_demo_study(db, tenant.id)
    if req.study_id:
        from modules.clinical.models import Study
        owned_study = db.query(Study).filter(Study.id == req.study_id, Study.tenant_id == tenant.id).first()
        if not owned_study:
            raise HTTPException(status_code=404, detail="Study not found for active tenant")
        target_study_id = owned_study.id
    else:
        target_study_id = study.id

    from modules.clinical.models import Referral
    new_ref = Referral(
        id=uuid.uuid4(),
        tenant_id=tenant.id,
        study_id=target_study_id,
        pseudonymous_id=clean_pid,
        stage="identified",
        consent_status="pending",
        referral_source=req.referral_source
    )
    db.add(new_ref)
    db.commit()
    db.refresh(new_ref)

    return {
        "message": "Referral created successfully.",
        "referral": {
            "id": str(new_ref.id),
            "pseudonymous_id": new_ref.pseudonymous_id,
            "stage": new_ref.stage,
            "consent_status": new_ref.consent_status
        }
    }


@router.patch("/criteria/{criterion_id}/verify")
def verify_criterion(
    criterion_id: uuid.UUID,
    req: CriterionVerifyRequest,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    updated = ClinicalComplianceService.verify_eligibility_criterion(
        db=db,
        tenant_id=tenant.id,
        criterion_id=criterion_id,
        human_verified=req.human_verified,
        user_id=user.id,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Eligibility criterion not found for tenant")
    return {
        "id": str(updated.id),
        "criterion_type": updated.criterion_type,
        "description": updated.description,
        "human_verified": updated.human_verified,
    }


@router.post("/revoke-consent")
def revoke_consent(
    req: ConsentRevokeRequest,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    try:
        return ClinicalComplianceService.revoke_consent(
            db=db,
            tenant_id=tenant.id,
            patient_id=req.patient_id,
            reason=req.reason or "Subject withdrew consent",
            user_id=user.id,
        )
    except ValueError as e:
        raise HTTPException(status_code=422 if "PHI_SAFEGUARD" in str(e) else 404, detail=str(e))


@router.post("/follow-ups")
def create_followup_task(
    req: FollowUpCreateRequest,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    try:
        task = ClinicalComplianceService.schedule_followup_task(
            db=db,
            tenant_id=tenant.id,
            referral_id=req.referral_id,
            task_type=req.task_type or "prescreen_call",
            days_from_now=req.days_from_now if req.days_from_now is not None else 2,
            notes=req.notes,
        )
        return {
            "id": str(task.id),
            "referral_id": str(task.referral_id),
            "task_type": task.task_type,
            "status": task.status,
            "scheduled_for": task.scheduled_for.isoformat(),
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/follow-ups")
def list_followup_tasks(
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    tasks = ClinicalComplianceService.list_followup_tasks(db, tenant.id)
    return {
        "follow_ups": [
            {
                "id": str(t.id),
                "referral_id": str(t.referral_id),
                "task_type": t.task_type,
                "status": t.status,
                "notes": t.notes,
                "scheduled_for": t.scheduled_for.isoformat() if t.scheduled_for else None,
            }
            for t in tasks
        ]
    }
