# 05 - Clinical Trials Suite Technical Implementation Plan

## 1. Domain Requirements
- **REQ-CLN-01**: Subject recruitment funnel persistence and eICF electronic consent audit trail (21 CFR Part 50 / GCP).
- **REQ-CLN-02**: AI Protocol intelligence (inclusion/exclusion parsing, visit schedule extraction).
- **REQ-CLN-03**: PHI safeguards and de-identification controls (Safe Harbor guidelines).
- **REQ-CLN-04**: Real-time recruitment analytics and site milestone dashboards.
- **REQ-CLN-05**: Coordinator follow-up workflows and patient reminder schedules.

---

## 2. Database Models (`modules/clinical/models.py`)

### 2.1 Enhancing `Study`, `Site`, `Referral`
- Ensure strict multi-tenant isolation with `tenant_id` foreign keys.
- Add recruitment target, protocol version, and current enrollment count to `Study`.
- Add pseudonymous identifier hashing to `Referral`.

### 2.2 `ConsentEvidence`
- `id`: UUID (Primary Key)
- `tenant_id`: UUID (FK to `tenants.id`, non-nullable)
- `study_id`: UUID (FK to `studies.id`)
- `referral_id`: UUID (FK to `referrals.id`)
- `icf_document_version`: String (e.g., "v2.1-2026")
- `signature_timestamp`: DateTime
- `signature_type`: String (`electronic`, `wet_ink_scanned`)
- `verified_by`: UUID (FK to `users.id`)
- `audit_hash`: String (SHA-256 integrity hash of consent verification payload)
- `is_valid`: Boolean (default True)

### 2.3 `EligibilityCriteria`
- `id`: UUID (Primary Key)
- `tenant_id`: UUID (FK to `tenants.id`)
- `study_id`: UUID (FK to `studies.id`)
- `criterion_type`: String (`inclusion`, `exclusion`)
- `description`: Text
- `clinical_threshold`: String
- `protocol_section`: String (e.g. "Section 4.2.1")
- `human_verified`: Boolean (default False)

---

## 3. Service Layer Enhancements (`modules/clinical/service.py`)
- Replace in-memory `_PATIENTS_DATABASE` with live PostgreSQL database queries.
- Implement `advance_recruitment_stage(referral_id, target_stage)`:
  - If `target_stage == "randomized"`, verify that active, unrevoked `ConsentEvidence` exists for the referral.
  - If consent is missing, abort transaction and raise HTTP 422 Unprocessable Entity with GCP compliance alert.
- Implement `get_live_funnel_metrics(study_id)` aggregating counts by stage (`identified`, `prescreened`, `consented`, `randomized`).

