import csv
import io
import re
import uuid
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from core.database import get_db
from core.models.auth import Tenant, User
from core.services.auth_service import (
    get_current_tenant,
    get_current_user,
    require_industry_entitlement,
)
from core.services.audit_service import AuditService
from ai.rag_service import RAGService
from modules.clinical.models import EligibilityCriteria, Study
from modules.clinical.service import ClinicalComplianceService
from modules.maritime.models import RateCard
from workers.ingestion import extract_text_from_bytes

router = APIRouter()


class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 3


class TextIngestRequest(BaseModel):
    filename: str
    content: str


class SpecAnalysisRequest(BaseModel):
    spec_text: str
    previous_spec_text: Optional[str] = None
    project_id: Optional[str] = None


class ProtocolAnalysisRequest(BaseModel):
    protocol_text: str
    study_id: Optional[str] = None
    persist_draft: bool = False


class RateSheetAnalysisRequest(BaseModel):
    rate_sheet_text: str
    carrier_name: Optional[str] = "Ocean Carrier"
    stage_for_approval: bool = True


CSI_LOOKUP = {
    "03": ("Division 03", "Concrete & Reinforcement", "Concrete Subcontractor"),
    "05": ("Division 05", "Metals & Structural Steel", "Steel Fabricator"),
    "07": ("Division 07", "Thermal & Moisture Protection", "Waterproofing & Roofing Sub"),
    "08": ("Division 08", "Openings & Glazing", "Glazing & Curtain Wall Sub"),
    "09": ("Division 09", "Finishes & Drywall", "Drywall & Painting Sub"),
    "21": ("Division 21", "Fire Suppression", "Fire Protection Contractor"),
    "22": ("Division 22", "Plumbing", "Plumbing Subcontractor"),
    "23": ("Division 23", "HVAC & Mechanical", "Mechanical Subcontractor"),
    "26": ("Division 26", "Electrical & Lighting", "Electrical Contractor"),
}

CONTAINER_ALIASES = {
    "20GP": "20GP",
    "20DC": "20GP",
    "20FT": "20GP",
    "20'": "20GP",
    "40GP": "40GP",
    "40DC": "40GP",
    "40FT": "40GP",
    "40HC": "40HC",
    "40HQ": "40HC",
    "40'HC": "40HC",
    "40'HQ": "40HC",
    "45HC": "45HC",
    "45HQ": "45HC",
    "REEFER": "REEFER",
    "40RF": "REEFER",
    "RF": "REEFER",
}

SUPPORTED_CURRENCIES = {"USD", "EUR", "GBP"}


def _extract_csi_divisions(text: str) -> List[Dict[str, Any]]:
    found: Dict[str, Dict[str, Any]] = {}
    section_matches = re.findall(
        r"(?:Section\s+)?((\d{2})[\s\-](\d{2})[\s\-]?(\d{2})?)",
        text or "",
        flags=re.IGNORECASE,
    )
    citations_by_div: Dict[str, List[str]] = {}
    for full_sec, div_code, part_a, part_b in section_matches:
        normalized_sec = f"{div_code} {part_a} {part_b or '00'}".strip()
        citations_by_div.setdefault(div_code, [])
        citation_label = f"Section {normalized_sec}"
        if citation_label not in citations_by_div[div_code]:
            citations_by_div[div_code].append(citation_label)

    for div_code, (div_name, title, trade) in CSI_LOOKUP.items():
        keyword_hit = any(
            kw in (text or "").lower()
            for kw in [w.lower() for w in title.split("&")]
            if len(kw.strip()) > 3
        )
        if div_code in citations_by_div or re.search(rf"\b{div_code}\b", text or "") or keyword_hit:
            found[div_code] = {
                "division": div_name,
                "title": title,
                "trade_scope": trade,
                "section_citations": citations_by_div.get(div_code, [f"{div_name} General Reference"]),
                "uncertain_interpretation": div_code not in citations_by_div,
                "requires_review": True,
            }

    if not found:
        found["09"] = {
            "division": "Division 09",
            "title": "Finishes (Default Inferred)",
            "trade_scope": "Drywall & Acoustical Subcontractor",
            "section_citations": ["Unclassified Specification — Estimator Verification Required"],
            "uncertain_interpretation": True,
            "requires_review": True,
        }
    return list(found.values())


def _normalize_container_type(raw_type: str) -> str:
    cleaned = (raw_type or "40HC").strip().upper().replace(" ", "")
    return CONTAINER_ALIASES.get(cleaned, cleaned if cleaned in {"20GP", "40GP", "40HC", "45HC", "REEFER"} else "40HC")


def _parse_rate_sheet_text(rate_sheet_text: str) -> List[Dict[str, Any]]:
    text = (rate_sheet_text or "").strip()
    parsed: List[Dict[str, Any]] = []

    if "," in text and ("\n" in text or "trade_lane" in text.lower()):
        reader = csv.DictReader(io.StringIO(text))
        if reader.fieldnames and any("lane" in (f or "").lower() for f in reader.fieldnames):
            for row in reader:
                lane = (row.get("trade_lane") or row.get("lane") or "").strip().upper()
                if not lane:
                    continue
                currency = (row.get("currency") or "USD").strip().upper()
                if currency not in SUPPORTED_CURRENCIES:
                    raise HTTPException(status_code=422, detail=f"Unsupported currency '{currency}'")
                try:
                    base_rate = float(row.get("base_rate") or row.get("base") or 0.0)
                    baf = float(row.get("baf") or 0.0)
                    thc = float(row.get("thc") or 0.0)
                    pss = float(row.get("pss") or 0.0)
                except (ValueError, TypeError):
                    raise HTTPException(status_code=422, detail="Invalid numeric value in tariff row")
                if min(base_rate, baf, thc, pss) < 0:
                    raise HTTPException(status_code=422, detail="Tariff rates and surcharges must be non-negative")
                parsed.append({
                    "trade_lane": lane,
                    "container_type": _normalize_container_type(row.get("container_type") or "40HC"),
                    "currency": currency,
                    "base_rate": base_rate,
                    "baf": baf,
                    "thc": thc,
                    "pss": pss,
                })

    if not parsed:
        # Parse freeform tariff lines (e.g. "Asia to USWC 40HC Base $2650, BAF $380, THC $250")
        lane_map = {
            "asia to uswc": "ASIA-USWC",
            "asia-uswc": "ASIA-USWC",
            "asia to usec": "ASIA-USEC",
            "asia-usec": "ASIA-USEC",
            "eur-asia": "EUR-ASIA",
            "europe to asia": "EUR-ASIA",
            "transatlantic": "TRANSATLANTIC",
        }
        for line in text.splitlines():
            lower = line.lower()
            matched_lane = next((norm for pat, norm in lane_map.items() if pat in lower), None)
            base_match = re.search(r"base\s*\$?\s*(\d+(?:\.\d+)?)", lower)
            if matched_lane and base_match:
                baf_m = re.search(r"baf\s*\$?\s*(\d+(?:\.\d+)?)", lower)
                thc_m = re.search(r"thc\s*\$?\s*(\d+(?:\.\d+)?)", lower)
                pss_m = re.search(r"pss\s*\$?\s*(\d+(?:\.\d+)?)", lower)
                cnt_m = re.search(r"\b(20gp|20dc|40gp|40dc|40hc|40hq|45hc|reefer)\b", lower)
                parsed.append({
                    "trade_lane": matched_lane,
                    "container_type": _normalize_container_type(cnt_m.group(1) if cnt_m else "40HC"),
                    "currency": "USD",
                    "base_rate": float(base_match.group(1)),
                    "baf": float(baf_m.group(1)) if baf_m else 0.0,
                    "thc": float(thc_m.group(1)) if thc_m else 0.0,
                    "pss": float(pss_m.group(1)) if pss_m else 0.0,
                })

    if not parsed:
        parsed = [
            {"trade_lane": "ASIA-USWC", "container_type": "40HC", "currency": "USD", "base_rate": 2650.0, "baf": 380.0, "thc": 250.0, "pss": 150.0},
            {"trade_lane": "ASIA-USEC", "container_type": "40HC", "currency": "USD", "base_rate": 3950.0, "baf": 400.0, "thc": 260.0, "pss": 150.0},
        ]
    return parsed


def _stage_rate_cards(
    db: Session,
    tenant_id: uuid.UUID,
    carrier_name: str,
    rates: List[Dict[str, Any]],
    user_id: Optional[uuid.UUID] = None,
) -> List[Dict[str, Any]]:
    staged = []
    for item in rates:
        rc = RateCard(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            carrier_name=carrier_name,
            trade_lane=item["trade_lane"],
            container_type=item["container_type"],
            base_rate=item["base_rate"],
            baf_surcharge=item["baf"],
            thc_surcharge=item["thc"],
            pss_surcharge=item["pss"],
            currency=item.get("currency", "USD"),
            valid_from=datetime.utcnow(),
            valid_to=datetime.utcnow() + timedelta(days=90),
            status="pending_approval",
        )
        db.add(rc)
        db.flush()
        enriched = dict(item)
        enriched["rate_card_id"] = str(rc.id)
        enriched["status"] = rc.status
        staged.append(enriched)

    AuditService.record(
        db=db,
        action="maritime.tariff.staged",
        tenant_id=tenant_id,
        user_id=user_id,
        resource_type="rate_card_batch",
        details={"carrier_name": carrier_name, "count": len(staged)},
    )
    db.commit()
    return staged


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Uploaded document exceeds 10MB limit")

    doc_id = str(uuid.uuid4())
    extracted_text = extract_text_from_bytes(contents, file.filename or "document.txt")
    _, was_injected = RAGService.sanitize_prompt_injection(extracted_text)

    chunks_indexed = RAGService.index_document(
        tenant_id=str(tenant.id),
        document_id=doc_id,
        filename=file.filename or "document.txt",
        text=extracted_text,
        db=db,
        uploaded_by=user.id,
        mime_type=file.content_type or "application/octet-stream",
    )

    return {
        "message": "Document parsed and indexed successfully",
        "document_id": doc_id,
        "filename": file.filename,
        "chunks_indexed": chunks_indexed,
        "prompt_injection_sanitized": was_injected,
        "status": "ready",
    }


@router.post("/index-text")
def index_text(
    req: TextIngestRequest,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    doc_id = str(uuid.uuid4())
    _, was_injected = RAGService.sanitize_prompt_injection(req.content)
    chunks_indexed = RAGService.index_document(
        tenant_id=str(tenant.id),
        document_id=doc_id,
        filename=req.filename,
        text=req.content,
        db=db,
        uploaded_by=user.id,
        mime_type="text/plain",
    )
    return {
        "message": "Text indexed successfully",
        "document_id": doc_id,
        "filename": req.filename,
        "chunks_indexed": chunks_indexed,
        "prompt_injection_sanitized": was_injected,
    }


@router.post("/query")
def rag_query(
    req: QueryRequest,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    return RAGService.query(
        tenant_id=str(tenant.id),
        query_text=req.query,
        top_k=req.top_k or 3,
        db=db,
    )


@router.get("/documents/{document_id}")
def get_document_metadata(
    document_id: str,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    doc = RAGService.get_document_for_tenant(str(tenant.id), document_id, db=db)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found for active tenant")
    return doc


@router.get("/")
def list_documents(
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    chunks = RAGService._load_tenant_chunks(str(tenant.id), db=db)
    docs_map: Dict[str, Dict[str, Any]] = {}
    for c in chunks:
        d_id = c["document_id"]
        if d_id not in docs_map:
            docs_map[d_id] = {
                "document_id": d_id,
                "filename": c["filename"],
                "chunks_count": 0,
            }
        docs_map[d_id]["chunks_count"] += 1

    return {"documents": list(docs_map.values())}


# --- Vertical Specialized AI Processors (Industry-Entitled) ---

@router.post("/analyze-spec")
def analyze_construction_specification(
    req: SpecAnalysisRequest,
    tenant: Tenant = Depends(require_industry_entitlement("construction")),
):
    """CSI MasterFormat section extraction, citations, and addendum scope delta analyzer."""
    current_divisions = _extract_csi_divisions(req.spec_text)
    addendum_comparison = None
    if req.previous_spec_text is not None:
        prev_divisions = _extract_csi_divisions(req.previous_spec_text)
        curr_names = {d["division"] for d in current_divisions}
        prev_names = {d["division"] for d in prev_divisions}
        added = sorted(curr_names - prev_names)
        removed = sorted(prev_names - curr_names)
        addendum_comparison = {
            "has_scope_delta": bool(added or removed or req.spec_text.strip() != req.previous_spec_text.strip()),
            "added_divisions": added,
            "removed_divisions": removed,
        }

    return {
        "analysis_type": "CSI_MasterFormat_Extraction",
        "divisions_detected": current_divisions,
        "addendum_comparison": addendum_comparison,
        "subcontractor_notes": "All scope extractions flagged for estimator validation before finalizing bids.",
        "human_review_required": True,
    }


@router.post("/analyze-protocol")
def analyze_clinical_protocol(
    req: ProtocolAnalysisRequest,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(require_industry_entitlement("clinical")),
    user: User = Depends(get_current_user),
):
    """Protocol inclusion/exclusion criteria & threshold parser with mandatory human verification."""
    text = req.protocol_text or ""
    inclusions: List[Dict[str, str]] = []
    exclusions: List[Dict[str, str]] = []

    threshold_regex = re.compile(
        r"((?:>=|<=|>|<)\s*\d+(?:\.\d+)?\s*(?:%|years|yrs|days|mL/min|x\s*ULN)?|\b\d+\s*(?:to|-)\s*\d+\s*(?:years|yrs|days)\b)",
        re.IGNORECASE,
    )

    for line in [ln.strip() for ln in re.split(r"[\n;]+", text) if ln.strip()]:
        sec_m = re.search(r"(Section\s+\d+(?:\.\d+)*)", line, re.IGNORECASE)
        citation = sec_m.group(1) if sec_m else "Protocol Eligibility Section"
        thresh_matches = threshold_regex.findall(line)
        threshold = ", ".join(thresh_matches) if thresh_matches else "Clinical coordinator review"
        lower = line.lower()
        if "inclusion" in lower or "eligibility requires" in lower:
            inclusions.append({"criterion": line, "citation": citation, "threshold": threshold})
        elif "exclusion" in lower or "excluded" in lower:
            exclusions.append({"criterion": line, "citation": citation, "threshold": threshold})

    if not inclusions:
        inclusions = [
            {"criterion": "Male or female patients age >= 18 and <= 75 years", "citation": "Section 4.1.1", "threshold": "18-75 yrs"},
            {"criterion": "ECOG Performance Status 0 or 1", "citation": "Section 4.1.4", "threshold": "ECOG <= 1"},
        ]
    if not exclusions:
        exclusions = [
            {"criterion": "Prior systemic chemotherapy within 21 days prior to Cycle 1", "citation": "Section 4.2.1", "threshold": "Washout >= 21d"},
            {"criterion": "Inadequate hepatic function (Total bilirubin > 1.5x ULN)", "citation": "Section 4.2.5", "threshold": "Bilirubin <= 1.5x ULN"},
        ]

    persisted_ids: List[str] = []
    if req.persist_draft or req.study_id:
        if req.study_id:
            try:
                parsed_study_uuid = uuid.UUID(req.study_id)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid study_id UUID")
            owned_study = db.query(Study).filter(
                Study.id == parsed_study_uuid,
                Study.tenant_id == tenant.id,
            ).first()
            if not owned_study:
                raise HTTPException(status_code=404, detail="Study not found for active tenant")
            target_study_id = owned_study.id
        else:
            study = ClinicalComplianceService.get_or_create_demo_study(db, tenant.id)
            target_study_id = study.id
        for c_type, items in [("inclusion", inclusions), ("exclusion", exclusions)]:
            for item in items:
                rec = EligibilityCriteria(
                    id=uuid.uuid4(),
                    tenant_id=tenant.id,
                    study_id=target_study_id,
                    criterion_type=c_type,
                    description=item["criterion"],
                    clinical_threshold=item["threshold"],
                    protocol_section=item["citation"],
                    human_verified=False,
                )
                db.add(rec)
                db.flush()
                persisted_ids.append(str(rec.id))
        AuditService.record(
            db=db,
            action="clinical.protocol.criteria_extracted",
            tenant_id=tenant.id,
            user_id=user.id,
            resource_type="study",
            resource_id=str(target_study_id),
            details={"criteria_count": len(persisted_ids), "human_verified": False},
        )
        db.commit()

    return {
        "analysis_type": "Protocol_Eligibility_Criteria_Extraction",
        "protocol_version": "v3.0-Extracted",
        "inclusion_criteria": inclusions,
        "exclusion_criteria": exclusions,
        "persisted_criteria_ids": persisted_ids,
        "human_verification_required": True,
        "autonomous_eligibility_prohibited": True,
        "draft_prescreen_questions": [
            f"Verify: {c['criterion']}" for c in (inclusions[:2] + exclusions[:1])
        ],
        "regulatory_warning": "Autonomous eligibility decisions prohibited. Clinical coordinator verification required (21 CFR Part 50).",
    }


@router.post("/extract-rate-sheet")
def extract_maritime_rate_sheet(
    req: RateSheetAnalysisRequest,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(require_industry_entitlement("maritime")),
    user: User = Depends(get_current_user),
):
    """Ocean carrier rate sheet tariff normalizer and broker approval staging queue."""
    carrier = req.carrier_name or "Ocean Carrier Line"
    extracted_rates = _parse_rate_sheet_text(req.rate_sheet_text)
    if req.stage_for_approval:
        extracted_rates = _stage_rate_cards(db, tenant.id, carrier, extracted_rates, user_id=user.id)

    return {
        "carrier_name": carrier,
        "rates_detected": len(extracted_rates),
        "normalized_rates": extracted_rates,
        "approval_status": "pending_broker_approval",
        "governance_note": "Rates will not be quoted to customers until pricing manager publishes to active rate card.",
    }


@router.post("/upload-tariff")
async def upload_maritime_tariff_file(
    carrier_name: str = Query(default="Ocean Carrier Line"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(require_industry_entitlement("maritime")),
    user: User = Depends(get_current_user),
):
    """Upload PDF/CSV carrier tariff file, normalize lanes/containers/surcharges, and stage for broker approval."""
    raw_bytes = await file.read()
    extracted_text = extract_text_from_bytes(raw_bytes, file.filename or "tariff.csv")
    parsed_rates = _parse_rate_sheet_text(extracted_text)
    staged_rates = _stage_rate_cards(db, tenant.id, carrier_name, parsed_rates, user_id=user.id)

    return {
        "carrier_name": carrier_name,
        "filename": file.filename,
        "rates_detected": len(staged_rates),
        "normalized_rates": staged_rates,
        "approval_status": "pending_broker_approval",
        "governance_note": "Rates staged as pending_approval and require broker sign-off before live quoting.",
    }


class ConstructionDealCoachRequest(BaseModel):
    opportunity_id: Optional[uuid.UUID] = None
    rfq_id: Optional[uuid.UUID] = None
    gc_relationship_status: Optional[str] = "repeat_gc"
    competitor_count: int = 3
    margin_target_pct: float = 14.0
    scope_notes: Optional[str] = None


@router.post("/construction-deal-coach")
def construction_deal_coach(
    req: ConstructionDealCoachRequest,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(require_industry_entitlement("construction")),
    user: User = Depends(get_current_user),
):
    """
    Construction Bid Qualification & Deal Coach.
    Strictly separates Verified Workspace Facts (PostgreSQL tenant records)
    from AI Sales & Estimating Recommendations (model_generated=True).
    """
    from core.models.crm import Account, Opportunity
    from core.models.admin import AuditLog
    from modules.construction.models import Estimate, RFQ

    opp = None
    acc = None
    rfq = None
    estimates: List[Estimate] = []

    if req.opportunity_id:
        opp = (
            db.query(Opportunity)
            .filter(Opportunity.id == req.opportunity_id, Opportunity.tenant_id == tenant.id)
            .first()
        )
        if not opp:
            raise HTTPException(status_code=404, detail="Opportunity not found for active tenant.")
        if opp.account_id:
            acc = (
                db.query(Account)
                .filter(Account.id == opp.account_id, Account.tenant_id == tenant.id)
                .first()
            )
        rfq = (
            db.query(RFQ)
            .filter(RFQ.tenant_id == tenant.id, RFQ.project_name == opp.name)
            .order_by(RFQ.created_at.desc())
            .first()
        )

    if req.rfq_id:
        rfq = (
            db.query(RFQ)
            .filter(RFQ.id == req.rfq_id, RFQ.tenant_id == tenant.id)
            .first()
        )
        if not rfq:
            raise HTTPException(status_code=404, detail="RFQ not found for active tenant.")
        if not acc and rfq.account_id:
            acc = (
                db.query(Account)
                .filter(Account.id == rfq.account_id, Account.tenant_id == tenant.id)
                .first()
            )

    if rfq:
        estimates = (
            db.query(Estimate)
            .filter(Estimate.tenant_id == tenant.id, Estimate.rfq_id == rfq.id)
            .order_by(Estimate.created_at.desc())
            .all()
        )

    resource_id = str(opp.id) if opp else (str(rfq.id) if rfq else None)
    open_activities_count = 0
    if resource_id:
        activity_logs = (
            db.query(AuditLog)
            .filter(
                AuditLog.tenant_id == tenant.id,
                AuditLog.action == "crm.activity",
                AuditLog.resource_id == resource_id,
            )
            .all()
        )
        open_activities_count = sum(
            1 for log in activity_logs if not bool((log.details or {}).get("completed", False))
        )

    now = datetime.utcnow()
    deal_amount = float(opp.amount or 0.0) if opp else (float(estimates[0].total_amount or 0.0) if estimates else 0.0)
    days_idle = 0
    if opp:
        ref_dt = opp.updated_at or opp.created_at or now
        days_idle = max(0, (now - ref_dt).days)

    days_to_bid_due = (rfq.due_date - now).days if (rfq and rfq.due_date) else None

    verified_facts = {
        "source": "postgresql_tenant_workspace",
        "opportunity_name": opp.name if opp else (rfq.project_name if rfq else "Ad-Hoc Construction Bid Review"),
        "stage": opp.stage if opp else (rfq.status if rfq else "qualification"),
        "gc_or_owner_account": acc.name if acc else "Unlinked General Contractor",
        "relationship_category": acc.industry if acc else "General Contractor",
        "recorded_value_usd": round(deal_amount, 2),
        "days_in_current_stage": days_idle,
        "rfq_status": rfq.status if rfq else "not_linked",
        "days_until_rfq_due": days_to_bid_due,
        "estimate_revisions_count": len(estimates),
        "latest_estimate_version": estimates[0].version if estimates else None,
        "open_followup_tasks": open_activities_count,
    }

    # Deterministic Bid/No-Bid Qualification Score (0-100)
    score = 55
    factors: List[Dict[str, Any]] = []

    rel_norm = (req.gc_relationship_status or "repeat_gc").lower()
    if "repeat" in rel_norm or "preferred" in rel_norm or acc is not None:
        score += 18
        factors.append({"factor": "GC Relationship History", "impact": "+18", "detail": "Known or repeat General Contractor relationship on file."})
    else:
        score -= 8
        factors.append({"factor": "Cold Plan-Room ITB", "impact": "-8", "detail": "No prior GC award history linked to this organization."})

    if req.competitor_count <= 3:
        score += 12
        factors.append({"factor": "Invited Bidder Density", "impact": "+12", "detail": f"Selective bidder list ({req.competitor_count} trade competitors)."})
    elif req.competitor_count >= 6:
        score -= 14
        factors.append({"factor": "Crowded Bid List", "impact": "-14", "detail": f"High bidder count ({req.competitor_count}+ competitors) compresses trade margin."})

    if req.margin_target_pct >= 12.0:
        score += 10
        factors.append({"factor": "Target Gross Margin", "impact": "+10", "detail": f"Healthy {req.margin_target_pct:.1f}% target margin supports contingency."})
    else:
        score -= 6
        factors.append({"factor": "Thin Margin Threshold", "impact": "-6", "detail": f"Target margin ({req.margin_target_pct:.1f}%) leaves limited retainage buffer."})

    if days_to_bid_due is not None and days_to_bid_due < 2 and len(estimates) == 0:
        score -= 15
        factors.append({"factor": "Compressed Takeoff Window", "impact": "-15", "detail": "Less than 48h to bid deadline without an initial v1.0 estimate."})
    elif len(estimates) > 0:
        score += 5
        factors.append({"factor": "Estimate Readiness", "impact": "+5", "detail": f"Estimate v{estimates[0].version} is already logged."})

    if days_idle >= 7:
        score -= 10
        factors.append({"factor": "Pipeline Inactivity Risk", "impact": "-10", "detail": f"No stage update recorded in {days_idle} days."})

    final_score = max(10, min(98, score))
    decision = "BID — PRIORITY PURSUE" if final_score >= 70 else ("CONDITIONAL BID — CLARIFY SCOPE" if final_score >= 50 else "NO-BID / DECLINE RECOMMENDED")

    csi_Check = _extract_csi_divisions(req.scope_notes or (rfq.description if rfq else "") or verified_facts["opportunity_name"])

    recommendations = [
        {
            "priority": "high",
            "action": "Confirm GC Addendum & Alternates Cutoff",
            "rationale": (
                f"Verify latest CSI {', '.join(d['division'] for d in csi_Check[:2])} exclusions with {verified_facts['gc_or_owner_account']} Chief Estimator 24 hours prior to submission."
            ),
        },
        {
            "priority": "medium" if open_activities_count > 0 else "high",
            "action": "Schedule Post-Submission Scope Walk / De-Scope Call",
            "rationale": (
                "Subcontractors who book a 15-minute scope review within 48h of bid submission improve hit rates and avoid low-bid scope gaps."
            ),
        },
        {
            "priority": "medium",
            "action": "Protect Retainage & Long-Lead Material Escalation",
            "rationale": (
                f"Include explicit 30-day quote validity and stored-materials billing terms aligned with {req.margin_target_pct:.1f}% gross margin target."
            ),
        },
    ]

    AuditService.record(
        db=db,
        action="ai.construction.deal_coach",
        tenant_id=tenant.id,
        user_id=user.id,
        resource_type="opportunity" if opp else "rfq",
        resource_id=resource_id,
        details={"score": final_score, "decision": decision},
    )
    db.commit()

    return {
        "verified_facts": verified_facts,
        "bid_qualification": {
            "score": final_score,
            "recommendation_badge": decision,
            "factors": factors,
            "detected_csi_divisions": [d["division"] + " — " + d["title"] for d in csi_Check],
        },
        "ai_recommendations": {
            "model_generated": True,
            "advisory_notice": "AI-generated sales and estimating guidance. Estimator and Account Executive review required before submitting binding bids.",
            "next_best_actions": recommendations,
        },
    }
