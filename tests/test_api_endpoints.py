import pytest
from fastapi.testclient import TestClient
from apps.api.main import app

@pytest.fixture(scope="module")
def client():
    return TestClient(app)

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
    response = client.post("/api/v1/auth/login", json={"email": "admin@salesfortis.com", "password": "securepassword"})
    assert response.status_code == 200
    assert "token" in response.json()

def test_admin_dashboard(client):
    response = client.get("/api/v1/admin/dashboard")
    assert response.status_code == 200
    assert "sections" in response.json()

def test_crm_leads(client):
    response = client.get("/api/v1/crm/leads")
    assert response.status_code == 200
    assert "leads" in response.json()

def test_crm_accounts(client):
    response = client.get("/api/v1/crm/accounts")
    assert response.status_code == 200
    assert "accounts" in response.json()

def test_construction_rfqs(client):
    response = client.get("/api/v1/verticals/construction/rfqs")
    assert response.status_code == 200
    assert "rfqs" in response.json()

def test_clinical_studies(client):
    response = client.get("/api/v1/verticals/clinical/studies")
    assert response.status_code == 200
    assert "studies" in response.json()

def test_maritime_enquiries(client):
    response = client.get("/api/v1/verticals/maritime/enquiries")
    assert response.status_code == 200
    assert "enquiries" in response.json()

def test_ai_query(client):
    response = client.post("/api/v1/ai/query", json={"query": "test query"})
    assert response.status_code == 200
    assert "answer" in response.json()

