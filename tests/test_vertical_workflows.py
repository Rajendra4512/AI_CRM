import pytest
import uuid
from fastapi.testclient import TestClient
from apps.api.main import app
from core.database import SessionLocal
from core.models.auth import Tenant, User
from core.services.auth_service import get_password_hash, create_access_token

@pytest.fixture(scope="module")
def multi_vertical_client():
    client = TestClient(app)
    db = SessionLocal()
    try:
        t_all = Tenant(
            id=uuid.uuid4(),
            name="Omni Logistics & Contracting Inc.",
            slug=f"omni-{uuid.uuid4().hex[:6]}",
            industry="construction,clinical,maritime",
            status="active"
        )
        u_all = User(
            id=uuid.uuid4(),
            tenant_id=t_all.id,
            email=f"operator_{uuid.uuid4().hex[:6]}@omni.com",
            hashed_password=get_password_hash("omnipass"),
            first_name="Omni",
            last_name="Manager",
            status="active",
            is_superadmin=False
        )
        db.add(t_all)
        db.add(u_all)
        db.commit()

        token = create_access_token({"sub": u_all.email})
        client.headers.update({"Authorization": f"Bearer {token}"})
        return client
    finally:
        db.close()

# 1. Construction Tests
def test_construction_sov_calculation(multi_vertical_client):
    payload = {
        "retainage_rate_pct": 10.0,
        "lines": [
            {
                "line_item_id": "08-440",
                "description": "Exterior Glazed Curtain Wall",
                "scheduled_value": 500000.0,
                "work_previous": 200000.0,
                "work_current": 100000.0,
                "stored_materials": 50000.0
            },
            {
                "line_item_id": "08-800",
                "description": "Interior Acoustic Glass Partitions",
                "scheduled_value": 150000.0,
                "work_previous": 50000.0,
                "work_current": 25000.0,
                "stored_materials": 0.0
            }
        ]
    }
    res = multi_vertical_client.post("/api/v1/verticals/construction/sov/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total_contract_value"] == 650000.0
    assert data["total_completed"] == 425000.0
    assert data["total_retainage"] == 42500.0
    assert data["balance_to_finish"] == 225000.0

def test_construction_change_events(multi_vertical_client):
    res = multi_vertical_client.post("/api/v1/verticals/construction/change-events", json={
        "title": "Seismic Expansion Joint Sealant Upgrade",
        "trade_scope": "Waterproofing",
        "estimated_cost": 12800.0,
        "status": "under_review"
    })
    assert res.status_code == 200
    assert "change_event" in res.json()
    assert res.json()["change_event"]["title"] == "Seismic Expansion Joint Sealant Upgrade"

# 2. Clinical CTMS Tests
def test_clinical_recruitment_funnel(multi_vertical_client):
    res = multi_vertical_client.get("/api/v1/verticals/clinical/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "total_screened" in data
    assert "compliance_pass_rate" in data

def test_clinical_consent_compliance_enforcement(multi_vertical_client):
    # Attempt randomize without signed consent - must fail with 422
    fail_res = multi_vertical_client.post("/api/v1/verticals/clinical/verify-consent", json={
        "patient_id": "PT-NEW-99",
        "consent_signed": False
    })
    assert fail_res.status_code == 422
    assert "COMPLIANCE_ERROR" in fail_res.json()["detail"]

    # Randomize with verified consent - must succeed
    pass_res = multi_vertical_client.post("/api/v1/verticals/clinical/verify-consent", json={
        "patient_id": "PT-NEW-99",
        "consent_signed": True
    })
    assert pass_res.status_code == 200
    assert pass_res.json()["stage"] == "randomized"

# 3. Maritime Freight Tests
def test_maritime_freight_quote_engine(multi_vertical_client):
    quote_req = {
        "trade_lane": "ASIA-USEC",
        "container_type": "40HC",
        "container_count": 5,
        "baf_fuel_surcharge": 400.0,
        "terminal_handling_charges": 260.0,
        "peak_season_surcharge": 150.0
    }
    res = multi_vertical_client.post("/api/v1/verticals/maritime/quote", json=quote_req)
    assert res.status_code == 200
    data = res.json()
    assert data["trade_lane"] == "ASIA-USEC"
    assert data["container_count"] == 5
    # Base: 3950 + 810 surcharges = 4760 * 5 = 23800.0
    assert data["total_freight_quote"] == 23800.0

def test_maritime_shipment_timeline(multi_vertical_client):
    res = multi_vertical_client.get("/api/v1/verticals/maritime/shipments/BL-MAEU-9821/timeline")
    assert res.status_code == 200
    data = res.json()
    assert data["bl_number"] == "BL-MAEU-9821"
    assert len(data["events"]) >= 5
