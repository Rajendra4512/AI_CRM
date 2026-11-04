import uuid
import pytest
from fastapi.testclient import TestClient

from apps.api.main import app

client = TestClient(app)


def _register_tenant(industry: str = "construction"):
    suffix = uuid.uuid4().hex[:6]
    email = f"estimator_{suffix}@apextrades.com"
    res = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "SecurePassword123!",
            "first_name": "Dana",
            "last_name": "Mercer",
            "company_name": f"Apex Trades {suffix}",
            "industry": industry,
        },
    )
    assert res.status_code == 201, res.text
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}, res.json()


def test_lead_qualification_creates_gc_account_contact_opportunity_and_rfq():
    headers, _ = _register_tenant("construction")

    lead_res = client.post(
        "/api/v1/crm/leads",
        headers=headers,
        json={
            "first_name": "Elena",
            "last_name": "Rostova",
            "company": "Turner Preconstruction Group",
            "email": "elena.rostova@turner-demo.com",
            "phone": "555-0192",
            "source": "BuildingConnected ITB",
        },
    )
    assert lead_res.status_code == 201, lead_res.text
    lead_id = lead_res.json()["lead_id"]

    qual_res = client.post(
        f"/api/v1/crm/leads/{lead_id}/qualify",
        headers=headers,
        json={
            "account_type": "General Contractor",
            "contact_title": "Chief Estimator",
            "opportunity_name": "Civic Hospital MEP Retrofit Package",
            "estimated_amount": 640000.0,
            "initial_stage": "rfq_takeoff",
            "create_rfq": True,
            "due_days": 10,
            "scope_notes": "Section 23 05 00 HVAC ductwork and chillers",
        },
    )
    assert qual_res.status_code == 200, qual_res.text
    qdata = qual_res.json()
    assert qdata["account_id"] is not None
    assert qdata["contact_id"] is not None
    assert qdata["opportunity_id"] is not None
    assert qdata["rfq_id"] is not None

    # Verify GC Account, Contact, Opportunity, RFQ, and initial follow-up task exist
    accs = client.get("/api/v1/crm/accounts", headers=headers).json()["accounts"]
    assert any(a["name"] == "Turner Preconstruction Group" for a in accs)

    contacts = client.get("/api/v1/crm/contacts", headers=headers).json()["contacts"]
    assert any(c["email"] == "elena.rostova@turner-demo.com" for c in contacts)

    opps = client.get("/api/v1/crm/opportunities", headers=headers).json()["opportunities"]
    matched_opp = next(o for o in opps if o["id"] == qdata["opportunity_id"])
    assert matched_opp["amount"] == 640000.0
    assert matched_opp["account_name"] == "Turner Preconstruction Group"

    rfqs = client.get("/api/v1/verticals/construction/rfqs", headers=headers).json()["rfqs"]
    assert any(r["id"] == qdata["rfq_id"] and r["gc_name"] == "Turner Preconstruction Group" for r in rfqs)


def test_pipeline_customization_stage_automation_and_activities():
    headers, _ = _register_tenant("construction")

    cfg_get = client.get("/api/v1/crm/pipeline-config", headers=headers)
    assert cfg_get.status_code == 200
    stages = cfg_get.json()["stages"]
    assert any("Inbound Leads" in s["label"] for s in stages)

    # Customize stage probability and save
    stages[1]["probability"] = 35
    cfg_put = client.put("/api/v1/crm/pipeline-config", headers=headers, json={"stages": stages})
    assert cfg_put.status_code == 200
    assert cfg_put.json()["stages"][1]["probability"] == 35

    # Create opportunity and advance to 'proposal' (Bid Submitted) -> triggers automated follow-up task
    opp_res = client.post(
        "/api/v1/crm/opportunities",
        headers=headers,
        json={"name": "Airport Concourse Curtain Wall", "amount": 920000.0, "stage": "qualified"},
    )
    assert opp_res.status_code == 201
    opp_id = opp_res.json()["opportunity_id"]

    stage_res = client.patch(
        f"/api/v1/crm/opportunities/{opp_id}/stage",
        headers=headers,
        json={"stage": "proposal"},
    )
    assert stage_res.status_code == 200
    assert stage_res.json()["stage"] == "proposal"

    # Verify automated follow-up task was generated + manual site walk activity + completion
    acts = client.get(
        f"/api/v1/crm/activities?resource_type=opportunity&resource_id={opp_id}",
        headers=headers,
    ).json()["activities"]
    assert len(acts) >= 1

    new_act = client.post(
        "/api/v1/crm/activities",
        headers=headers,
        json={
            "activity_type": "site_walk",
            "subject": "Jobsite Walk with GC Superintendent",
            "resource_type": "opportunity",
            "resource_id": opp_id,
            "notes": "Confirmed crane laydown area on North elevation.",
        },
    )
    assert new_act.status_code == 201
    act_id = new_act.json()["activity"]["id"]

    comp_res = client.patch(
        f"/api/v1/crm/activities/{act_id}/complete",
        headers=headers,
        json={"completed": True},
    )
    assert comp_res.status_code == 200
    assert comp_res.json()["activity"]["completed"] is True


def test_rfq_estimate_revisions_award_handover_analytics_and_deal_coach():
    headers, _ = _register_tenant("construction")

    rfq_res = client.post(
        "/api/v1/verticals/construction/rfqs",
        headers=headers,
        json={
            "project_name": "Data Center Substation Switchgear",
            "status": "bid_go",
            "description": "Section 26 24 13 Switchboards and backup feeders",
        },
    )
    assert rfq_res.status_code == 201, rfq_res.text
    rfq_id = rfq_res.json()["id"]

    # Estimate v1.0 & v2.0 auto-versioning
    est1 = client.post(
        "/api/v1/verticals/construction/estimates",
        headers=headers,
        json={"rfq_id": rfq_id, "total_amount": 480000.0, "status": "draft"},
    )
    assert est1.status_code == 201
    assert est1.json()["version"] == "1.0"

    est2 = client.post(
        "/api/v1/verticals/construction/estimates",
        headers=headers,
        json={"rfq_id": rfq_id, "total_amount": 515000.0, "status": "submitted"},
    )
    assert est2.status_code == 201
    assert est2.json()["version"] == "2.0"

    # AI Construction Deal Coach separates verified_facts from ai_recommendations
    coach_res = client.post(
        "/api/v1/ai/construction-deal-coach",
        headers=headers,
        json={
            "rfq_id": rfq_id,
            "gc_relationship_status": "repeat_gc",
            "competitor_count": 3,
            "margin_target_pct": 15.0,
        },
    )
    assert coach_res.status_code == 200, coach_res.text
    cdata = coach_res.json()
    assert cdata["verified_facts"]["source"] == "postgresql_tenant_workspace"
    assert cdata["verified_facts"]["estimate_revisions_count"] == 2
    assert cdata["verified_facts"]["latest_estimate_version"] == "2.0"
    assert cdata["ai_recommendations"]["model_generated"] is True
    assert 10 <= cdata["bid_qualification"]["score"] <= 98

    # Award & Project Handover
    award_res = client.post(
        f"/api/v1/verticals/construction/rfqs/{rfq_id}/award-handover",
        headers=headers,
        json={"awarded_amount": 510000.0},
    )
    assert award_res.status_code == 200, award_res.text
    adata = award_res.json()
    assert adata["status"] == "awarded"
    assert adata["awarded_value"] == 510000.0
    assert adata["project_id"] is not None

    # Verify Bid Analytics & CRM Analytics reflect real persisted math
    bid_stats = client.get("/api/v1/verticals/construction/bid-analytics", headers=headers).json()
    assert bid_stats["has_bid_records"] is True
    assert bid_stats["bids_awarded_count"] == 1
    assert bid_stats["bid_hit_ratio_pct"] == 100.0
    assert bid_stats["total_awarded_contract_value"] >= 510000.0

    crm_stats = client.get("/api/v1/crm/analytics", headers=headers).json()
    assert crm_stats["has_tenant_records"] is True
    assert crm_stats["won_value"] == 510000.0


def test_cross_tenant_idor_and_clinical_industry_isolation():
    const_a, _ = _register_tenant("construction")
    const_b, _ = _register_tenant("construction")
    clin_headers, _ = _register_tenant("clinical")

    rfq_a = client.post(
        "/api/v1/verticals/construction/rfqs",
        headers=const_a,
        json={"project_name": "Tenant A Private Tower", "status": "open"},
    )
    assert rfq_a.status_code == 201
    rfq_a_id = rfq_a.json()["id"]

    # Tenant B cannot view, update, or award Tenant A's RFQ
    rfqs_b = client.get("/api/v1/verticals/construction/rfqs", headers=const_b).json()["rfqs"]
    assert all(r["id"] != rfq_a_id for r in rfqs_b)

    idor_patch = client.patch(
        f"/api/v1/verticals/construction/rfqs/{rfq_a_id}",
        headers=const_b,
        json={"status": "no_bid"},
    )
    assert idor_patch.status_code == 404

    idor_award = client.post(
        f"/api/v1/verticals/construction/rfqs/{rfq_a_id}/award-handover",
        headers=const_b,
        json={"awarded_amount": 100000.0},
    )
    assert idor_award.status_code == 404

    # Clinical tenant is strictly blocked (403) from Construction Bid Desk & Construction AI Coach
    clin_rfq = client.get("/api/v1/verticals/construction/rfqs", headers=clin_headers)
    assert clin_rfq.status_code == 403

    clin_coach = client.post(
        "/api/v1/ai/construction-deal-coach",
        headers=clin_headers,
        json={"competitor_count": 2},
    )
    assert clin_coach.status_code == 403
