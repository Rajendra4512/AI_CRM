import pytest
import uuid
from fastapi.testclient import TestClient
from apps.api.main import app
from core.database import SessionLocal
from core.models.auth import Tenant, User
from core.services.auth_service import get_password_hash, create_access_token

@pytest.fixture(scope="module")
def client():
    return TestClient(app)

@pytest.fixture(scope="module")
def superadmin_client():
    c = TestClient(app)
    db = SessionLocal()
    try:
        t_admin = Tenant(
            id=uuid.uuid4(),
            name="Platform Superadmin Tenant",
            slug=f"platform-admin-{uuid.uuid4().hex[:6]}",
            industry="all",
            status="active"
        )
        u_admin = User(
            id=uuid.uuid4(),
            tenant_id=t_admin.id,
            email=f"superadmin_{uuid.uuid4().hex[:6]}@salesfortis.com",
            hashed_password=get_password_hash("superadminpass"),
            first_name="Platform",
            last_name="SuperAdmin",
            status="active",
            is_superadmin=True
        )
        db.add(t_admin)
        db.add(u_admin)
        db.commit()

        token = create_access_token({"sub": u_admin.email})
        c.headers.update({"Authorization": f"Bearer {token}"})
        return c
    finally:
        db.close()

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "SalesFortis"

def test_auth_me(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert "user" in data
    assert "tenant" in data

def test_auth_login(client):
    response = client.post("/api/v1/auth/login", json={"email": "demo@salesfortis.com", "password": "demopassword"})
    assert response.status_code == 200
    assert "token" in response.json()

def test_admin_dashboard_rbac(client, superadmin_client):
    # Standard user without superadmin privilege must be rejected (403)
    standard_resp = client.get("/api/v1/admin/dashboard")
    assert standard_resp.status_code == 403

    # Authenticated superadmin must succeed (200)
    admin_resp = superadmin_client.get("/api/v1/admin/dashboard")
    assert admin_resp.status_code == 200
    assert "sections" in admin_resp.json()

def test_crm_leads(client):
    response = client.get("/api/v1/crm/leads")
    assert response.status_code == 200
    assert "leads" in response.json()

def test_crm_accounts(client):
    response = client.get("/api/v1/crm/accounts")
    assert response.status_code == 200
    assert "accounts" in response.json()

def test_ai_query(client):
    response = client.post("/api/v1/ai/query", json={"query": "test query"})
    assert response.status_code == 200
    assert "answer" in response.json()


def test_register_duplicate_company_hijack_prevented(client):
    unique_suffix = uuid.uuid4().hex[:6]
    company_name = f"Sovereign Builders {unique_suffix}"
    first_reg = client.post("/api/v1/auth/register", json={
        "email": f"founder_{unique_suffix}@sovereignbuilders.com",
        "password": "StrongPassword123!",
        "first_name": "Elena",
        "last_name": "Vance",
        "company_name": company_name,
        "industry": "construction"
    })
    assert first_reg.status_code == 201

    hijack_attempt = client.post("/api/v1/auth/register", json={
        "email": f"attacker_{unique_suffix}@evilcorp.com",
        "password": "AttackerPassword123!",
        "first_name": "Mallory",
        "last_name": "Intruder",
        "company_name": company_name,
        "industry": "construction"
    })
    assert hijack_attempt.status_code == 400
    assert "already registered" in hijack_attempt.json()["detail"].lower()


def test_demo_user_wrong_password_returns_401(client):
    # Ensure demo user exists first
    ok_resp = client.post("/api/v1/auth/login", json={"email": "demo@salesfortis.com", "password": "demopassword"})
    assert ok_resp.status_code == 200

    # Wrong password must return 401, not 500 IntegrityError
    bad_resp = client.post("/api/v1/auth/login", json={"email": "demo@salesfortis.com", "password": "wrongpassword"})
    assert bad_resp.status_code == 401


def test_full_industry_registration_login_logout_journey(client):
    for industry, ok_path, forbidden_path in [
        ("construction", "/api/v1/verticals/construction/change-events", "/api/v1/verticals/maritime/rate-cards"),
        ("clinical", "/api/v1/verticals/clinical/metrics", "/api/v1/verticals/construction/change-events"),
        ("maritime", "/api/v1/verticals/maritime/rate-cards", "/api/v1/verticals/clinical/metrics"),
    ]:
        suffix = uuid.uuid4().hex[:6]
        email = f"owner_{industry}_{suffix}@salesfortis.com"
        company = f"Journey {industry.title()} Org {suffix}"

        reg = client.post("/api/v1/auth/register", json={
            "email": email,
            "password": "ValidPassword123!",
            "first_name": "Alex",
            "last_name": "Mercer",
            "company_name": company,
            "industry": industry
        })
        assert reg.status_code == 201
        reg_data = reg.json()
        assert reg_data["industry"] == industry
        assert reg_data["tenant"]["name"] == company

        login_resp = client.post("/api/v1/auth/login", json={
            "email": email,
            "password": "ValidPassword123!"
        })
        assert login_resp.status_code == 200
        login_data = login_resp.json()
        token = login_data["access_token"]
        assert login_data["tenant"]["industry"] == industry
        assert login_data["tenant"]["name"] == company

        headers = {"Authorization": f"Bearer {token}"}
        me_resp = client.get("/api/v1/auth/me", headers=headers)
        assert me_resp.status_code == 200
        assert me_resp.json()["tenant"]["industry"] == industry

        ok_vertical = client.get(ok_path, headers=headers)
        assert ok_vertical.status_code == 200

        blocked_vertical = client.get(forbidden_path, headers=headers)
        assert blocked_vertical.status_code == 403

        logout_resp = client.post("/api/v1/auth/logout", headers=headers)
        assert logout_resp.status_code == 200
        assert logout_resp.json()["status"] == "logged_out"
