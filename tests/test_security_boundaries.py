import uuid
import pytest
from fastapi.testclient import TestClient
from apps.api.main import app

client = TestClient(app)


def _provision_tenant(industry: str, prefix: str) -> dict:
    suffix = uuid.uuid4().hex[:6]
    email = f"{prefix}_{suffix}@salesfortis.com"
    company = f"{prefix.upper()} {industry.title()} Org {suffix}"
    res = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "BoundaryPassword123!",
        "first_name": "Security",
        "last_name": "Auditor",
        "company_name": company,
        "industry": industry,
    })
    assert res.status_code == 201
    data = res.json()
    return {
        "token": data["access_token"],
        "headers": {"Authorization": f"Bearer {data['access_token']}"},
        "tenant_id": data["tenant_id"],
        "company": company,
        "email": email,
    }


def test_cross_tenant_read_write_delete_and_forged_fk_isolation():
    tenant_a = _provision_tenant("construction", "tenant_a")
    tenant_b = _provision_tenant("construction", "tenant_b")

    # Tenant A creates Account, Lead, Opportunity
    acc_res = client.post(
        "/api/v1/crm/accounts",
        headers=tenant_a["headers"],
        json={"name": "Confidential GC Account A"},
    )
    assert acc_res.status_code == 201
    acc_a_id = acc_res.json()["account_id"]

    lead_res = client.post(
        "/api/v1/crm/leads",
        headers=tenant_a["headers"],
        json={"first_name": "Private", "last_name": "LeadA", "email": "lead_a@private.com"},
    )
    assert lead_res.status_code == 201
    lead_a_id = lead_res.json()["lead_id"]

    opp_res = client.post(
        "/api/v1/crm/opportunities",
        headers=tenant_a["headers"],
        json={"name": "Secret Bid A", "amount": 900000.0, "account_id": acc_a_id},
    )
    assert opp_res.status_code == 201
    opp_a_id = opp_res.json()["opportunity_id"]

    # 1. Cross-tenant reads must never return Tenant A records
    b_accounts = client.get("/api/v1/crm/accounts", headers=tenant_b["headers"]).json()["accounts"]
    assert all(a["id"] != acc_a_id for a in b_accounts)

    b_leads = client.get("/api/v1/crm/leads", headers=tenant_b["headers"]).json()["leads"]
    assert all(l["id"] != lead_a_id for l in b_leads)

    # 2. Cross-tenant writes (updating Tenant A opportunity or linking Tenant A account_id) must fail
    patch_cross = client.patch(
        f"/api/v1/crm/opportunities/{opp_a_id}/stage",
        headers=tenant_b["headers"],
        json={"stage": "closed_lost"},
    )
    assert patch_cross.status_code == 404

    forged_fk = client.post(
        "/api/v1/crm/opportunities",
        headers=tenant_b["headers"],
        json={"name": "Hijack FK", "amount": 100.0, "account_id": acc_a_id},
    )
    assert forged_fk.status_code == 404

    # 3. Cross-tenant delete must fail with 404 and leave Tenant A's lead intact
    del_cross = client.delete(f"/api/v1/crm/leads/{lead_a_id}", headers=tenant_b["headers"])
    assert del_cross.status_code == 404

    a_leads_after = client.get("/api/v1/crm/leads", headers=tenant_a["headers"]).json()["leads"]
    assert any(l["id"] == lead_a_id for l in a_leads_after)


def test_unauthorized_exports_privilege_escalation_and_ai_isolation():
    const_a = _provision_tenant("construction", "exp_a")
    const_b = _provision_tenant("construction", "exp_b")
    maritime_c = _provision_tenant("maritime", "exp_mar")

    # Construction Tenant A creates an SOV application
    sov_res = client.post(
        "/api/v1/verticals/construction/sov/applications",
        headers=const_a["headers"],
        json={
            "application_number": 1,
            "retainage_rate_pct": 10.0,
            "lines": [
                {
                    "line_item_id": "03-3000",
                    "description": "Concrete Foundations",
                    "scheduled_value": 100000.0,
                    "work_previous": 0.0,
                    "work_current": 50000.0,
                    "stored_materials": 0.0,
                }
            ],
        },
    )
    assert sov_res.status_code == 200
    app_id = sov_res.json()["application_id"]

    # Unauthorized cross-tenant export -> 404
    cross_tenant_export = client.get(
        f"/api/v1/verticals/construction/sov/applications/{app_id}/export",
        headers=const_b["headers"],
    )
    assert cross_tenant_export.status_code == 404

    # Unauthorized cross-industry export -> 403
    cross_industry_export = client.get(
        f"/api/v1/verticals/construction/sov/applications/{app_id}/export",
        headers=maritime_c["headers"],
    )
    assert cross_industry_export.status_code == 403

    # Privilege escalation: standard tenant user cannot list all platform tenants or audit logs
    assert client.get("/api/v1/admin/tenants", headers=const_a["headers"]).status_code == 403
    assert client.get("/api/v1/admin/audit-logs", headers=const_a["headers"]).status_code == 403

    # Cross-industry AI vertical endpoint denial
    ai_cross = client.post(
        "/api/v1/ai/analyze-protocol",
        headers=const_a["headers"],
        json={"protocol_text": "Inclusion: Age >= 18"},
    )
    assert ai_cross.status_code == 403

    # Server-side billing entitlement cannot be forged at registration
    me_data = client.get("/api/v1/auth/me", headers=const_a["headers"]).json()
    assert me_data["tenant"]["subscription_tier"] == "trial"
