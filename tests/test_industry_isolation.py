import pytest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from core.database import Base, get_db
from core.models.auth import Tenant, User
from core.services.auth_service import get_password_hash, create_access_token
from apps.api.main import app
from modules.construction.models import ChangeEvent

client = TestClient(app)

@pytest.fixture
def auth_tenants(db_session=None):
    from core.database import SessionLocal
    db = SessionLocal()
    try:
        # 1. Construction Tenant
        t_const = Tenant(
            id=uuid.uuid4(),
            name="Apex Builders",
            slug=f"apex-builders-{uuid.uuid4().hex[:6]}",
            industry="construction",
            status="active"
        )
        u_const = User(
            id=uuid.uuid4(),
            tenant_id=t_const.id,
            email=f"builder_{uuid.uuid4().hex[:6]}@apex.com",
            hashed_password=get_password_hash("pass123"),
            first_name="Bob",
            last_name="Builder",
            status="active",
            is_superadmin=False
        )

        # 2. Clinical Tenant
        t_clin = Tenant(
            id=uuid.uuid4(),
            name="Novartis Trials",
            slug=f"novartis-trials-{uuid.uuid4().hex[:6]}",
            industry="clinical",
            status="active"
        )
        u_clin = User(
            id=uuid.uuid4(),
            tenant_id=t_clin.id,
            email=f"clin_{uuid.uuid4().hex[:6]}@novartis.com",
            hashed_password=get_password_hash("pass123"),
            first_name="Dr.",
            last_name="Novak",
            status="active",
            is_superadmin=False
        )

        # 3. Maritime Tenant
        t_mar = Tenant(
            id=uuid.uuid4(),
            name="Maersk Logistics",
            slug=f"maersk-logistics-{uuid.uuid4().hex[:6]}",
            industry="maritime",
            status="active"
        )
        u_mar = User(
            id=uuid.uuid4(),
            tenant_id=t_mar.id,
            email=f"mar_{uuid.uuid4().hex[:6]}@maersk.com",
            hashed_password=get_password_hash("pass123"),
            first_name="Captain",
            last_name="Miller",
            status="active",
            is_superadmin=False
        )

        # 4. Unassigned (Fail-closed) Tenant
        t_none = Tenant(
            id=uuid.uuid4(),
            name="Unassigned LLC",
            slug=f"unassigned-{uuid.uuid4().hex[:6]}",
            industry=None,  # Fail-closed
            status="active"
        )
        u_none = User(
            id=uuid.uuid4(),
            tenant_id=t_none.id,
            email=f"none_{uuid.uuid4().hex[:6]}@unassigned.com",
            hashed_password=get_password_hash("pass123"),
            first_name="Anon",
            last_name="User",
            status="active",
            is_superadmin=False
        )

        # 5. Platform Superadmin
        t_admin = Tenant(
            id=uuid.uuid4(),
            name="SalesFortis Ops",
            slug=f"salesfortis-ops-{uuid.uuid4().hex[:6]}",
            industry="all",
            status="active"
        )
        u_admin = User(
            id=uuid.uuid4(),
            tenant_id=t_admin.id,
            email=f"superadmin_{uuid.uuid4().hex[:6]}@salesfortis.com",
            hashed_password=get_password_hash("adminpass"),
            first_name="Root",
            last_name="SuperAdmin",
            status="active",
            is_superadmin=True
        )

        db.add_all([t_const, u_const, t_clin, u_clin, t_mar, u_mar, t_none, u_none, t_admin, u_admin])
        db.commit()

        return {
            "const": {"tenant": t_const, "user": u_const, "token": create_access_token({"sub": u_const.email, "tenant_id": str(t_const.id)})},
            "clin": {"tenant": t_clin, "user": u_clin, "token": create_access_token({"sub": u_clin.email, "tenant_id": str(t_clin.id)})},
            "mar": {"tenant": t_mar, "user": u_mar, "token": create_access_token({"sub": u_mar.email, "tenant_id": str(t_mar.id)})},
            "none": {"tenant": t_none, "user": u_none, "token": create_access_token({"sub": u_none.email, "tenant_id": str(t_none.id)})},
            "super": {"tenant": t_admin, "user": u_admin, "token": create_access_token({"sub": u_admin.email, "tenant_id": str(t_admin.id)})},
        }
    finally:
        db.close()

def test_cross_industry_denial(auth_tenants):
    # SEC-TEST-05: Construction calling Clinical API must be rejected
    const_token = auth_tenants["const"]["token"]
    res_clin = client.get(
        "/api/v1/verticals/clinical/metrics",
        headers={"Authorization": f"Bearer {const_token}"}
    )
    assert res_clin.status_code == 403
    assert "not entitled to the 'clinical' industry suite" in res_clin.json()["detail"]

    # SEC-TEST-07: Construction calling Maritime API must be rejected
    res_mar = client.post(
        "/api/v1/verticals/maritime/quote",
        headers={"Authorization": f"Bearer {const_token}"},
        json={"trade_lane": "ASIA-USEC"}
    )
    assert res_mar.status_code == 403
    assert "not entitled to the 'maritime' industry suite" in res_mar.json()["detail"]

def test_authorized_industry_access(auth_tenants):
    # Construction tenant calling Construction API -> OK
    const_token = auth_tenants["const"]["token"]
    res_const = client.get(
        "/api/v1/verticals/construction/change-events",
        headers={"Authorization": f"Bearer {const_token}"}
    )
    assert res_const.status_code == 200
    assert "change_events" in res_const.json()

    # Clinical tenant calling Clinical API -> OK
    clin_token = auth_tenants["clin"]["token"]
    res_clin = client.get(
        "/api/v1/verticals/clinical/metrics",
        headers={"Authorization": f"Bearer {clin_token}"}
    )
    assert res_clin.status_code == 200
    assert "total_screened" in res_clin.json()

    # Maritime tenant calling Maritime API -> OK
    mar_token = auth_tenants["mar"]["token"]
    res_mar = client.post(
        "/api/v1/verticals/maritime/quote",
        headers={"Authorization": f"Bearer {mar_token}"},
        json={"trade_lane": "ASIA-USEC", "container_type": "40HC", "container_count": 1}
    )
    assert res_mar.status_code == 200
    assert "total_freight_quote" in res_mar.json()

def test_fail_closed_unassigned_industry(auth_tenants):
    # Tenant with industry=None must be blocked from all verticals
    none_token = auth_tenants["none"]["token"]
    r1 = client.get("/api/v1/verticals/construction/change-events", headers={"Authorization": f"Bearer {none_token}"})
    r2 = client.get("/api/v1/verticals/clinical/metrics", headers={"Authorization": f"Bearer {none_token}"})
    r3 = client.post("/api/v1/verticals/maritime/quote", headers={"Authorization": f"Bearer {none_token}"}, json={"trade_lane": "ASIA-USEC"})

    assert r1.status_code == 403
    assert r2.status_code == 403
    assert r3.status_code == 403

def test_superadmin_separation(auth_tenants):
    # Standard user attempting to access Superadmin dashboard -> 403
    const_token = auth_tenants["const"]["token"]
    res_denied = client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {const_token}"})
    assert res_denied.status_code == 403
    assert "Superadmin privileges required" in res_denied.json()["detail"]

    # Actual Superadmin -> 200
    super_token = auth_tenants["super"]["token"]
    res_ok = client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {super_token}"})
    assert res_ok.status_code == 200
    assert res_ok.json()["message"] == "SuperAdmin Dashboard"

def test_forged_header_rejection(auth_tenants):
    # SEC-TEST-04: User from Clinical tenant injects X-Tenant-ID of Construction tenant
    clin_token = auth_tenants["clin"]["token"]
    const_tenant_id = str(auth_tenants["const"]["tenant"].id)

    res = client.get(
        "/api/v1/verticals/construction/change-events",
        headers={
            "Authorization": f"Bearer {clin_token}",
            "X-Tenant-ID": const_tenant_id
        }
    )
    # Must still be rejected because server checks authenticated user's authoritative DB tenant
    assert res.status_code == 403

