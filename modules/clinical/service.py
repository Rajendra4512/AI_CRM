from typing import List, Dict, Any, Optional
import re
import uuid
import hashlib
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from core.services.audit_service import AuditService
from modules.clinical.models import Study, Site, Referral, ConsentEvidence, EligibilityCriteria, FollowUpTask

class ClinicalComplianceService:
    """
    CTMS Funnel tracking and electronic consent (21 CFR Part 50 / GCP) compliance safeguards
    backed by PostgreSQL persistence.
    """

    @classmethod
    def get_or_create_demo_study(cls, db: Session, tenant_id: uuid.UUID) -> Study:
        study = db.query(Study).filter(Study.tenant_id == tenant_id).first()
        if not study:
            study = Study(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                protocol_number="PROTO-NC-004",
                title="Phase III Randomized Double-Blind Oncology Assessment",
                phase="Phase III",
                status="active",
                target_enrollment=100,
                current_enrolled=82
            )
            db.add(study)
            db.flush()

            site = Site(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                study_id=study.id,
                site_name="Memorial Sloan Comprehensive Cancer Center",
                site_number="SITE-01",
                pi_name="Dr. Eleanor Vance, MD",
                status="active"
            )
            db.add(site)
            db.flush()

            # Seed demo referrals
            demo_patients = [
                ("PT-401-01", "randomized", "verified"),
                ("PT-401-02", "consented", "verified"),
                ("PT-401-03", "prescreened", "pending"),
                ("PT-401-04", "identified", "pending"),
            ]
            for pid, st, cst in demo_patients:
                ref = Referral(
                    id=uuid.uuid4(),
                    tenant_id=tenant_id,
                    study_id=study.id,
                    site_id=site.id,
                    pseudonymous_id=pid,
                    stage=st,
                    consent_status=cst,
                    referral_source="Digital Protocol Pre-screener"
                )
                db.add(ref)
                db.flush()

                if cst == "verified":
                    audit_str = f"{ref.id}:{study.id}:{datetime.utcnow().isoformat()}"
                    h = hashlib.sha256(audit_str.encode('utf-8')).hexdigest()
                    evidence = ConsentEvidence(
                        id=uuid.uuid4(),
                        tenant_id=tenant_id,
                        study_id=study.id,
                        referral_id=ref.id,
                        icf_document_version="ICF-v2.1",
                        signature_type="electronic",
                        audit_hash=h,
                        is_valid=True
                    )
                    db.add(evidence)

            db.commit()
            db.refresh(study)
        return study

    @classmethod
    def get_funnel_metrics(cls, db: Session, tenant_id: uuid.UUID, study_id: Optional[uuid.UUID] = None) -> Dict[str, Any]:
        if not study_id:
            study = cls.get_or_create_demo_study(db, tenant_id)
            study_id = study.id

        referrals = db.query(Referral).filter(
            Referral.tenant_id == tenant_id,
            Referral.study_id == study_id
        ).all()

        total = len(referrals)
        identified = sum(1 for r in referrals if r.stage == "identified")
        prescreened = sum(1 for r in referrals if r.stage == "prescreened")
        consented = sum(1 for r in referrals if r.stage == "consented")
        randomized = sum(1 for r in referrals if r.stage == "randomized")

        return {
            "study_id": str(study_id),
            "total_screened": total,
            "identified": identified,
            "prescreened": prescreened,
            "consented": consented,
            "randomized": randomized,
            "compliance_pass_rate": 100.0
        }

    @classmethod
    def list_referrals(cls, db: Session, tenant_id: uuid.UUID, study_id: Optional[uuid.UUID] = None) -> List[Referral]:
        if not study_id:
            study = cls.get_or_create_demo_study(db, tenant_id)
            study_id = study.id

        return db.query(Referral).filter(
            Referral.tenant_id == tenant_id,
            Referral.study_id == study_id
        ).order_by(Referral.created_at.desc()).all()

    @classmethod
    def record_consent_evidence(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        referral_id: uuid.UUID,
        study_id: uuid.UUID,
        icf_version: str = "ICF-v2.1",
        verified_by: Optional[uuid.UUID] = None
    ) -> ConsentEvidence:
        audit_payload = f"{tenant_id}:{study_id}:{referral_id}:{icf_version}:{datetime.utcnow().isoformat()}"
        audit_hash = hashlib.sha256(audit_payload.encode('utf-8')).hexdigest()

        evidence = ConsentEvidence(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            study_id=study_id,
            referral_id=referral_id,
            icf_document_version=icf_version,
            signature_type="electronic",
            verified_by=verified_by,
            audit_hash=audit_hash,
            is_valid=True
        )
        db.add(evidence)

        # Update referral consent_status
        referral = db.query(Referral).filter(Referral.id == referral_id).first()
        if referral:
            referral.consent_status = "verified"
            if referral.stage in ("identified", "prescreened"):
                referral.stage = "consented"

        AuditService.record(
            db=db,
            action="clinical.consent.verified",
            tenant_id=tenant_id,
            user_id=verified_by,
            resource_type="consent_evidence",
            resource_id=str(evidence.id),
            details={"referral_id": str(referral_id), "icf_version": icf_version, "audit_hash": audit_hash},
        )
        db.commit()
        db.refresh(evidence)
        return evidence

    @classmethod
    def verify_and_randomize(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        patient_id: str,
        consent_signed: bool,
        user_id: Optional[uuid.UUID] = None
    ) -> Dict[str, Any]:
        cls.validate_pseudonymous_id(patient_id)
        study = cls.get_or_create_demo_study(db, tenant_id)

        # Find or create referral
        referral = db.query(Referral).filter(
            Referral.tenant_id == tenant_id,
            Referral.study_id == study.id,
            Referral.pseudonymous_id == patient_id
        ).first()

        if not referral:
            referral = Referral(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                study_id=study.id,
                pseudonymous_id=patient_id,
                stage="prescreened",
                consent_status="pending",
                referral_source="Manual Clinical Entry"
            )
            db.add(referral)
            db.flush()

        if consent_signed:
            # Check or create consent record
            existing_consent = db.query(ConsentEvidence).filter(
                ConsentEvidence.tenant_id == tenant_id,
                ConsentEvidence.referral_id == referral.id,
                ConsentEvidence.is_valid == True
            ).first()

            if not existing_consent:
                cls.record_consent_evidence(
                    db=db,
                    tenant_id=tenant_id,
                    referral_id=referral.id,
                    study_id=study.id,
                    verified_by=user_id
                )

            referral.stage = "randomized"
            referral.consent_status = "verified"
            study.current_enrolled = (study.current_enrolled or 0) + 1
            db.commit()

            return {
                "success": True,
                "message": f"Patient {patient_id} successfully verified and randomized into protocol cohort.",
                "patient_id": patient_id,
                "stage": "randomized",
                "consent_verified": True
            }
        else:
            # Reject advancement to randomized without verified consent
            return {
                "success": False,
                "error": "COMPLIANCE_ERROR: Cannot advance patient to Randomized without verified ICF (Informed Consent Form) signature.",
                "patient_id": patient_id,
                "stage": referral.stage,
                "consent_verified": False
            }

    @classmethod
    def verify_eligibility_criterion(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        criterion_id: uuid.UUID,
        human_verified: bool = True,
        user_id: Optional[uuid.UUID] = None,
    ) -> Optional[EligibilityCriteria]:
        criterion = db.query(EligibilityCriteria).filter(
            EligibilityCriteria.id == criterion_id,
            EligibilityCriteria.tenant_id == tenant_id,
        ).first()
        if not criterion:
            return None
        criterion.human_verified = human_verified
        AuditService.record(
            db=db,
            action="clinical.criterion.verified",
            tenant_id=tenant_id,
            user_id=user_id,
            resource_type="eligibility_criteria",
            resource_id=str(criterion.id),
            details={"human_verified": human_verified, "study_id": str(criterion.study_id)},
        )
        db.commit()
        db.refresh(criterion)
        return criterion

    @staticmethod
    def validate_pseudonymous_id(pseudonymous_id: str) -> str:
        val = (pseudonymous_id or "").strip()
        if not val or "@" in val or re.search(r"\b\d{3}-\d{2}-\d{4}\b", val):
            raise ValueError("PHI_SAFEGUARD: Patient identifier must be pseudonymized (no emails or SSNs permitted).")
        return val

    @classmethod
    def revoke_consent(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        patient_id: str,
        reason: str = "Subject withdrew consent",
        user_id: Optional[uuid.UUID] = None,
    ) -> Dict[str, Any]:
        cls.validate_pseudonymous_id(patient_id)
        referral = db.query(Referral).filter(
            Referral.tenant_id == tenant_id,
            Referral.pseudonymous_id == patient_id,
        ).first()
        if not referral:
            raise ValueError("Referral not found for active tenant.")

        db.query(ConsentEvidence).filter(
            ConsentEvidence.tenant_id == tenant_id,
            ConsentEvidence.referral_id == referral.id,
        ).update({"is_valid": False})

        was_randomized = referral.stage == "randomized"
        referral.consent_status = "revoked"
        referral.stage = "withdrawn"

        if was_randomized:
            study = db.query(Study).filter(Study.id == referral.study_id, Study.tenant_id == tenant_id).first()
            if study and (study.current_enrolled or 0) > 0:
                study.current_enrolled -= 1

        AuditService.record(
            db=db,
            action="clinical.consent.revoked",
            tenant_id=tenant_id,
            user_id=user_id,
            resource_type="referral",
            resource_id=str(referral.id),
            details={"pseudonymous_id": patient_id, "reason": reason},
        )
        db.commit()
        return {
            "patient_id": patient_id,
            "stage": referral.stage,
            "consent_status": referral.consent_status,
            "reason": reason,
        }

    @classmethod
    def schedule_followup_task(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        referral_id: uuid.UUID,
        task_type: str = "prescreen_call",
        days_from_now: int = 2,
        notes: Optional[str] = None,
    ) -> FollowUpTask:
        referral = db.query(Referral).filter(
            Referral.id == referral_id,
            Referral.tenant_id == tenant_id,
        ).first()
        if not referral:
            raise ValueError("Referral not found for active tenant.")

        task = FollowUpTask(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            referral_id=referral.id,
            task_type=task_type,
            scheduled_for=datetime.utcnow() + timedelta(days=max(0, days_from_now)),
            status="pending",
            notes=notes,
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    @classmethod
    def list_followup_tasks(cls, db: Session, tenant_id: uuid.UUID) -> List[FollowUpTask]:
        return db.query(FollowUpTask).filter(
            FollowUpTask.tenant_id == tenant_id
        ).order_by(FollowUpTask.scheduled_for.asc()).all()
