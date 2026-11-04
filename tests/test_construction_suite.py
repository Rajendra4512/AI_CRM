import pytest
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.database import Base
from core.models.auth import Tenant, User
from core.models.admin import AuditLog
from modules.construction.models import Project, SOVApplication, SOVLineItem, ChangeEvent
from modules.construction.service import ConstructionSOVService

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_sov_calculation_math():
    lines = [
        {"line_item_id": "03-3000", "description": "Foundations", "scheduled_value": 200000.0, "work_previous": 50000.0, "work_current": 50000.0, "stored_materials": 0.0},
        {"line_item_id": "09-2200", "description": "Drywall", "scheduled_value": 300000.0, "work_previous": 0.0, "work_current": 100000.0, "stored_materials": 25000.0}
    ]
    result = ConstructionSOVService.calculate_sov_application(lines, retainage_rate_pct=10.0)

    assert result["total_contract_value"] == 500000.0
    assert result["total_completed"] == 225000.0
    assert result["total_retainage"] == 22500.0
    assert result["overall_pct_complete"] == 45.0
    assert result["balance_to_finish"] == 275000.0

def test_sov_persistence_and_idempotency(db_session):
    tenant = Tenant(id=uuid.uuid4(), name="Builder Corp", slug="builder-corp")
    db_session.add(tenant)
    db_session.commit()

    project = ConstructionSOVService.get_or_create_demo_project(db_session, tenant.id)

    lines = [
        {"line_item_id": "03-3000", "description": "Foundations", "scheduled_value": 100000.0, "work_previous": 0.0, "work_current": 40000.0, "stored_materials": 0.0}
    ]

    # Application #1
    app1 = ConstructionSOVService.persist_sov_application(
        db=db_session,
        tenant_id=tenant.id,
        project_id=project.id,
        application_number=1,
        lines=lines,
        retainage_rate_pct=10.0,
        status="submitted"
    )

    assert app1.application_number == 1
    assert float(app1.total_completed_stored) == 40000.0
    assert float(app1.total_retainage) == 4000.0
    assert float(app1.net_payment_due) == 36000.0

    # Lock when approved
    app1.status = "approved"
    db_session.commit()

    with pytest.raises(ValueError, match="already approved and locked"):
        ConstructionSOVService.persist_sov_application(
            db=db_session,
            tenant_id=tenant.id,
            project_id=project.id,
            application_number=1,
            lines=lines,
            retainage_rate_pct=10.0
        )

def test_change_event_status_transitions_and_isolation(db_session):
    tenant_a = Tenant(id=uuid.uuid4(), name="Tenant A", slug="tenant-a")
    tenant_b = Tenant(id=uuid.uuid4(), name="Tenant B", slug="tenant-b")
    db_session.add_all([tenant_a, tenant_b])
    db_session.commit()

    # Create event in Tenant A
    event = ConstructionSOVService.create_change_event(
        db=db_session,
        tenant_id=tenant_a.id,
        title="Fire dampers relocation",
        trade_scope="HVAC",
        estimated_cost=14500.0
    )
    assert event.status == "draft"
    assert event.event_number.startswith("CE-")

    # Valid transitions: draft -> rfq_issued -> pco_submitted -> pco_approved
    event = ConstructionSOVService.transition_change_event(db_session, tenant_a.id, event.id, "rfq_issued")
    assert event.status == "rfq_issued"

    event = ConstructionSOVService.transition_change_event(db_session, tenant_a.id, event.id, "pco_submitted")
    assert event.status == "pco_submitted"

    event = ConstructionSOVService.transition_change_event(db_session, tenant_a.id, event.id, "pco_approved")
    assert event.status == "pco_approved"

    # Invalid jump from approved to draft without authorized workflow
    with pytest.raises(ValueError, match="Invalid status transition"):
        ConstructionSOVService.transition_change_event(db_session, tenant_a.id, event.id, "draft")

    # Tenant B cannot access Tenant A event
    with pytest.raises(ValueError, match="Change event not found"):
        ConstructionSOVService.transition_change_event(db_session, tenant_b.id, event.id, "rejected")


def test_sov_previous_billing_carryforward_approval_and_accounting_export(db_session):
    tenant = Tenant(id=uuid.uuid4(), name="Apex Subcontractors", slug="apex-sub")
    db_session.add(tenant)
    db_session.commit()

    project = ConstructionSOVService.get_or_create_demo_project(db_session, tenant.id)

    # Application #1: $50,000 work_current on $200,000 scheduled
    app1 = ConstructionSOVService.persist_sov_application(
        db=db_session,
        tenant_id=tenant.id,
        project_id=project.id,
        application_number=1,
        lines=[{"line_item_id": "03-3000", "description": "Foundations", "scheduled_value": 200000.0, "work_previous": 0.0, "work_current": 50000.0}],
        retainage_rate_pct=10.0,
    )
    approved = ConstructionSOVService.approve_sov_application(db_session, tenant.id, app1.id)
    assert approved.status == "approved"

    # Application #2 omits work_previous (0.0) -> auto-carries $50,000 from Application #1!
    app2 = ConstructionSOVService.persist_sov_application(
        db=db_session,
        tenant_id=tenant.id,
        project_id=project.id,
        application_number=2,
        lines=[{"line_item_id": "03-3000", "description": "Foundations", "scheduled_value": 200000.0, "work_previous": 0.0, "work_current": 30000.0}],
        retainage_rate_pct=10.0,
    )
    assert float(app2.total_completed_stored) == 80000.0
    assert float(app2.net_payment_due) == 27000.0  # 30,000 * 0.9

    # Accounting export produces AIA G702/G703 summary + CSV and writes AuditLog
    export_pkg = ConstructionSOVService.export_sov_for_accounting(db_session, tenant.id, app2.id)
    assert export_pkg["format"] == "AIA_G702_G703"
    assert "03-3000" in export_pkg["csv_content"]
    assert export_pkg["g702_summary"]["current_payment_due"] == 27000.0

    audits = db_session.query(AuditLog).filter(AuditLog.tenant_id == tenant.id).all()
    actions = {a.action for a in audits}
    assert "construction.sov.approved" in actions
    assert "construction.sov.exported" in actions


