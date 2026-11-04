import pytest
from fastapi.testclient import TestClient
from apps.api.main import app

@pytest.fixture(scope="module")
def client():
    return TestClient(app)

def test_auth_registration_and_login(client):
    import uuid
    suffix = uuid.uuid4().hex[:6]
    rand_email = f"director_{suffix}@apexcorp.com"
    # Register new tenant & user
    reg_payload = {
        "email": rand_email,
        "password": "SecurePassword123!",
        "first_name": "Apex",
        "last_name": "Director",
        "company_name": f"Apex Trade Corp {suffix}"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    assert "access_token" in reg_res.json()

    # Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": rand_email,
        "password": "SecurePassword123!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token is not None

def test_crm_live_account_crud(client):
    # Create account
    acc_payload = {
        "name": "Skanska Commercial Building",
        "account_type": "General Contractor",
        "industry": "Commercial Construction",
        "website": "https://skanska.com"
    }
    create_res = client.post("/api/v1/crm/accounts", json=acc_payload)
    assert create_res.status_code == 201
    acc_id = create_res.json()["account_id"]
    assert acc_id is not None

    # List accounts
    list_res = client.get("/api/v1/crm/accounts")
    assert list_res.status_code == 200
    accounts = list_res.json()["accounts"]
    assert any(a["name"] == "Skanska Commercial Building" for a in accounts)

def test_crm_live_lead_crud(client):
    lead_payload = {
        "first_name": "Marcus",
        "last_name": "Vance",
        "company": "Vance Glazing & Façade",
        "email": "marcus@vanceglazing.com",
        "status": "new",
        "source": "Inbound RFQ"
    }
    create_res = client.post("/api/v1/crm/leads", json=lead_payload)
    assert create_res.status_code == 201
    lead_id = create_res.json()["lead_id"]
    assert lead_id is not None

    list_res = client.get("/api/v1/crm/leads")
    assert list_res.status_code == 200
    leads = list_res.json()["leads"]
    assert any(l["first_name"] == "Marcus" for l in leads)

def test_crm_opportunity_lifecycle(client):
    opp_payload = {
        "name": "Medical Center Curtain Wall Subcontract",
        "amount": 450000.0,
        "stage": "prospecting"
    }
    create_res = client.post("/api/v1/crm/opportunities", json=opp_payload)
    assert create_res.status_code == 201
    opp_id = create_res.json()["opportunity_id"]

    # Advance stage to won
    update_res = client.patch(f"/api/v1/crm/opportunities/{opp_id}/stage", json={"stage": "closed_won"})
    assert update_res.status_code == 200
    assert update_res.json()["stage"] == "closed_won"
