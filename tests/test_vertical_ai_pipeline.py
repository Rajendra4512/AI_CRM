import uuid
import pytest
from fastapi.testclient import TestClient
from apps.api.main import app
from core.database import SessionLocal
from core.models.auth import Tenant, User
from core.services.auth_service import get_password_hash, create_access_token

client = TestClient(app)


@pytest.fixture(scope="module")
def vertical_ai_tokens():
    db = SessionLocal()
    try:
        tokens = {}
        for key, ind in [("const", "construction"), ("clin", "clinical"), ("mar", "maritime")]:
            t = Tenant(
                id=uuid.uuid4(),
                name=f"AI {ind.title()} Org",
                slug=f"ai-{key}-{uuid.uuid4().hex[:6]}",
                industry=ind,
                status="active",
            )
            u = User(
                id=uuid.uuid4(),
                tenant_id=t.id,
                email=f"ai_{key}_{uuid.uuid4().hex[:6]}@salesfortis.test",
                hashed_password=get_password_hash("pass123"),
                first_name=ind.title(),
                last_name="Specialist",
                status="active",
            )
            db.add_all([t, u])
            db.flush()
            tokens[key] = {"Authorization": f"Bearer {create_access_token({'sub': u.email})}"}
        db.commit()
        return tokens
    finally:
        db.close()


def test_vertical_ai_industry_isolation(vertical_ai_tokens):
    # Construction tenant denied on Clinical and Maritime AI processors
    r1 = client.post(
        "/api/v1/ai/analyze-protocol",
        headers=vertical_ai_tokens["const"],
        json={"protocol_text": "Section 4.1 Inclusion: Age >= 18"},
    )
    assert r1.status_code == 403

    r2 = client.post(
        "/api/v1/ai/extract-rate-sheet",
        headers=vertical_ai_tokens["clin"],
        json={"carrier_name": "MSC", "rate_sheet_text": "ASIA-USWC,40HC,2600"},
    )
    assert r2.status_code == 403

    r3 = client.post(
        "/api/v1/ai/analyze-spec",
        headers=vertical_ai_tokens["mar"],
        json={"spec_text": "Section 03 30 00 Cast-in-place concrete"},
    )
    assert r3.status_code == 403


def test_csi_spec_analysis_citations_and_addendum_diff(vertical_ai_tokens):
    prev_spec = "Section 03 30 00 Cast-in-place concrete foundations."
    curr_spec = (
        "Section 03 30 00 Cast-in-place concrete foundations (4500 PSI). "
        "Addendum 2 adds Section 26 05 00 Common Work Results for Electrical conductors and cables."
    )
    response = client.post(
        "/api/v1/ai/analyze-spec",
        headers=vertical_ai_tokens["const"],
        json={"spec_text": curr_spec, "previous_spec_text": prev_spec},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["analysis_type"] == "CSI_MasterFormat_Extraction"
    assert data["human_review_required"] is True
    divisions = [d["division"] for d in data["divisions_detected"]]
    assert "Division 03" in divisions
    assert "Division 26" in divisions
    assert any("03 30 00" in c or "26 05 00" in c for d in data["divisions_detected"] for c in d["section_citations"])
    assert data["addendum_comparison"]["has_scope_delta"] is True
    assert "Division 26" in data["addendum_comparison"]["added_divisions"]


def test_clinical_protocol_extraction_and_human_verification(vertical_ai_tokens):
    protocol_text = (
        "Protocol ONC-2026-09:\n"
        "Section 5.1.1 Inclusion: Adults age >= 21 and <= 80 years with HbA1c <= 8.5%.\n"
        "Section 5.2.1 Exclusion: Prior immunotherapy within 28 days or eGFR < 45 mL/min."
    )
    response = client.post(
        "/api/v1/ai/analyze-protocol",
        headers=vertical_ai_tokens["clin"],
        json={"protocol_text": protocol_text, "persist_draft": True},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["analysis_type"] == "Protocol_Eligibility_Criteria_Extraction"
    assert data["autonomous_eligibility_prohibited"] is True
    assert "21 CFR Part 50" in data["regulatory_warning"]
    assert any("HbA1c" in c["criterion"] or "21" in c["criterion"] for c in data["inclusion_criteria"])
    assert any("28 days" in c["criterion"] or "eGFR" in c["criterion"] for c in data["exclusion_criteria"])
    assert len(data["persisted_criteria_ids"]) >= 2

    # Human coordinator verifies the first extracted draft criterion
    crit_id = data["persisted_criteria_ids"][0]
    verify_res = client.patch(
        f"/api/v1/verticals/clinical/criteria/{crit_id}/verify",
        headers=vertical_ai_tokens["clin"],
        json={"human_verified": True},
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["human_verified"] is True


def test_maritime_rate_sheet_upload_normalization_and_broker_approval(vertical_ai_tokens):
    csv_tariff = (
        "trade_lane,container_type,currency,base_rate,baf,thc,pss\n"
        "ASIA-USWC,40HQ,USD,2490,360,245,120\n"
        "EUR-ASIA,20DC,USD,1190,275,205,90\n"
    )
    files = {"file": ("cma_q4_tariff.csv", csv_tariff.encode("utf-8"), "text/csv")}
    upload_res = client.post(
        "/api/v1/ai/upload-tariff?carrier_name=CMA%20CGM",
        headers=vertical_ai_tokens["mar"],
        files=files,
    )
    assert upload_res.status_code == 200
    data = upload_res.json()
    assert data["carrier_name"] == "CMA CGM"
    assert data["approval_status"] == "pending_broker_approval"
    lanes = {r["trade_lane"]: r for r in data["normalized_rates"]}
    assert lanes["ASIA-USWC"]["container_type"] == "40HC"
    assert lanes["EUR-ASIA"]["container_type"] == "20GP"
    staged_id = lanes["ASIA-USWC"]["rate_card_id"]

    # Before broker approval, quoting ASIA-USWC 40HC uses seeded active rate (2650), NOT unapproved 2490
    pre_quote = client.post(
        "/api/v1/verticals/maritime/quote",
        headers=vertical_ai_tokens["mar"],
        json={"trade_lane": "ASIA-USWC", "container_type": "40HC", "container_count": 1},
    )
    assert pre_quote.status_code == 200
    assert pre_quote.json()["base_rate_per_unit"] != 2490.0

    # Broker approves staged rate card -> becomes active for live quoting
    approve_res = client.post(
        f"/api/v1/verticals/maritime/rate-cards/{staged_id}/approve",
        headers=vertical_ai_tokens["mar"],
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "active"

    post_quote = client.post(
        "/api/v1/verticals/maritime/quote",
        headers=vertical_ai_tokens["mar"],
        json={"trade_lane": "ASIA-USWC", "container_type": "40HC", "container_count": 1},
    )
    assert post_quote.status_code == 200
    assert post_quote.json()["base_rate_per_unit"] == 2490.0
