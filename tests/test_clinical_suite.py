import pytest
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.database import Base
from core.models.auth import Tenant, User
from core.models.admin import AuditLog
from modules.clinical.models import Study, Referral, ConsentEvidence, FollowUpTask
from modules.clinical.service import ClinicalComplianceService

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_clinical_consent_guardrail_and_persistence(db_session):
    tenant = Tenant(id=uuid.uuid4(), name="BioPharma Labs", slug="biopharma-labs")
    db_session.add(tenant)
    db_session.commit()

    study = ClinicalComplianceService.get_or_create_demo_study(db_session, tenant.id)
    assert study.protocol_number == "PROTO-NC-004"

    # Attempt to randomize without consent signed must fail with compliance error
    res_fail = ClinicalComplianceService.verify_and_randomize(
        db=db_session,
        tenant_id=tenant.id,
        patient_id="PT-999-01",
        consent_signed=False
    )
    assert res_fail["success"] is False
    assert "COMPLIANCE_ERROR" in res_fail["error"]

    # Verify that patient is not in randomized stage
    referral = db_session.query(Referral).filter(
        Referral.tenant_id == tenant.id,
        Referral.pseudonymous_id == "PT-999-01"
    ).first()
    assert referral is not None
    assert referral.stage != "randomized"

    # Now verify with signed electronic consent
    res_success = ClinicalComplianceService.verify_and_randomize(
        db=db_session,
        tenant_id=tenant.id,
        patient_id="PT-999-01",
        consent_signed=True
    )
    assert res_success["success"] is True
    assert res_success["stage"] == "randomized"

    db_session.refresh(referral)
    assert referral.stage == "randomized"
    assert referral.consent_status == "verified"

    # Verify ConsentEvidence record exists with cryptographic hash
    evidence = db_session.query(ConsentEvidence).filter(
        ConsentEvidence.tenant_id == tenant.id,
        ConsentEvidence.referral_id == referral.id
    ).first()
    assert evidence is not None
    assert evidence.audit_hash is not None
    assert len(evidence.audit_hash) == 64  # SHA-256 length

def test_clinical_tenant_isolation(db_session):
    tenant_1 = Tenant(id=uuid.uuid4(), name="Clinical Site A", slug="site-a")
    tenant_2 = Tenant(id=uuid.uuid4(), name="Clinical Site B", slug="site-b")
    db_session.add_all([tenant_1, tenant_2])
    db_session.commit()

    study_1 = ClinicalComplianceService.get_or_create_demo_study(db_session, tenant_1.id)
    metrics_1 = ClinicalComplianceService.get_funnel_metrics(db_session, tenant_1.id, study_1.id)
    assert metrics_1["total_screened"] > 0

    # Tenant 2 metrics should be completely separate and isolated
    study_2 = ClinicalComplianceService.get_or_create_demo_study(db_session, tenant_2.id)
    assert study_1.id != study_2.id


def test_clinical_consent_revocation_phi_guard_and_followups(db_session):
    tenant = Tenant(id=uuid.uuid4(), name="CRO Partners", slug="cro-partners")
    db_session.add(tenant)
    db_session.commit()

    # PHI guard rejects raw email as pseudonymous_id
    with pytest.raises(ValueError, match="PHI_SAFEGUARD"):
        ClinicalComplianceService.validate_pseudonymous_id("john.doe@gmail.com")

    # Randomize with consent, then revoke consent -> must invalidate evidence & block re-randomization
    ok = ClinicalComplianceService.verify_and_randomize(db_session, tenant.id, "PT-777-01", consent_signed=True)
    assert ok["success"] is True

    revoked = ClinicalComplianceService.revoke_consent(db_session, tenant.id, "PT-777-01", reason="Subject withdrew ICF")
    assert revoked["consent_status"] == "revoked"
    assert revoked["stage"] == "withdrawn"

    # Coordinator follow-up scheduling
    ref = db_session.query(Referral).filter(
        Referral.tenant_id == tenant.id,
        Referral.pseudonymous_id == "PT-777-01",
    ).first()
    task = ClinicalComplianceService.schedule_followup_task(
        db=db_session,
        tenant_id=tenant.id,
        referral_id=ref.id,
        task_type="consent_review",
        days_from_now=2,
        notes="Confirm withdrawal documentation per GCP",
    )
    assert task.task_type == "consent_review"
    tasks = ClinicalComplianceService.list_followup_tasks(db_session, tenant.id)
    assert any(t.id == task.id for t in tasks)

    audits = db_session.query(AuditLog).filter(AuditLog.tenant_id == tenant.id).all()
    assert any(a.action == "clinical.consent.revoked" for a in audits)


