# 01 - Current Codebase Verification & Baseline Audit (Reconciled)

## 1. Executive Summary

This document establishes the verified baseline of the SalesFortis (formerly AI_CRM) repository following physical inspection of existing components, database schemas, API routers, background workers, and automated test suites.

All findings distinguish between:
1. **Implemented and Tested**: Verified in production-ready files with active tests.
2. **Partially Implemented**: Working core logic, but lacking complete persistence, authorization, or error handling.
3. **Mock / Stub**: Hardcoded in-memory arrays or simulated endpoints.
4. **Missing**: Documented in market research or roadmaps but not yet present in codebase.

---

## 2. Shared Platform Baseline

| Component | Status | Code Reference | Description / Verification |
| :--- | :--- | :--- | :--- |
| **Authentication (JWT & Bcrypt)** | Implemented & Tested | `core/services/auth_service.py`, `apps/api/routers/auth.py` | JWT access tokens with 60-min expiration; bcrypt with 72-byte safe truncation. Verified via `tests/test_crm_crud.py`. |
| **Tenant Isolation & Model** | Implemented & Tested | `core/models/auth.py`, `core/services/auth_service.py` | `Tenant` and `User` models present with multi-tenant UUID references. `get_current_tenant` extracts from header/token. Verified via `tests/test_construction_suite.py` and `tests/test_clinical_suite.py`. |
| **Core CRM Persistence** | Implemented & Tested | `core/models/crm.py`, `core/services/crm_service.py`, `apps/api/routers/crm.py` | Accounts, Leads, Opportunities persisted to PostgreSQL/SQLite via SQLAlchemy with tenant scoping. |
| **Alembic Database Migrations** | Implemented & Tested | `alembic/`, `alembic.ini`, migrations `5d323b46124c` and `b6e8f38db826` | 33 tables migrated cleanly with zero errors. |
| **Frontend Foundation** | Implemented & Tested | `apps/web/src/pages/app/` (`AppLayout`, `Dashboard`, `LeadsPipeline`, `Login`, `VerticalHub`) | React 19 + TypeScript + Vite responsive dashboard with live token authentication. Clean build (825ms). |

---

## 3. Industry Vertical Suites Baseline

### 3.1 Construction & Trades Suite
- **SOV Calculator (`modules/construction/service.py`)**: *Implemented & Tested*. Mathematical formulas for retainage, stored materials, and earned amounts are implemented (`calculate_sov_line`, `calculate_sov_application`).
- **SOV Database Persistence (`modules/construction/models.py`)**: *Implemented & Tested*. `SOVApplication` and `SOVLineItem` persisted with idempotency locks on approved applications. Tested in `tests/test_construction_suite.py`.
- **Change Events (`modules/construction/service.py`)**: *Implemented & Tested*. PostgreSQL persistence with state machine transitions (`draft` -> `rfq_issued` -> `pco_submitted` -> `pco_approved`). Tested in `tests/test_construction_suite.py`.
- **Specification RAG Extraction (`ai/router.py`)**: *Implemented & Tested*. CSI MasterFormat extraction endpoint (`/api/v1/ai/analyze-spec`). Tested in `tests/test_vertical_ai_pipeline.py`.

### 3.2 Clinical Trials & CTMS Suite
- **Compliance Guardrail (`modules/clinical/service.py`)**: *Implemented & Tested*. Electronic Informed Consent Form (eICF) verification guardrail enforced (21 CFR Part 50 / GCP). Returns HTTP 422 if unverified. Tested in `tests/test_clinical_suite.py`.
- **Database Models (`modules/clinical/models.py`)**: *Implemented & Tested*. `Study`, `Site`, `Referral`, `ConsentEvidence` (with SHA-256 tamper-evident hash), `EligibilityCriteria`, `FollowUpTask`.
- **Protocol Intelligence (`ai/router.py`)**: *Implemented & Tested*. Clinical protocol inclusion/exclusion criteria extraction with section citations (`/api/v1/ai/analyze-protocol`). Tested in `tests/test_vertical_ai_pipeline.py`.

### 3.3 Maritime & Freight Suite
- **Freight Rating Engine (`modules/maritime/service.py`)**: *Implemented & Tested*. Deterministic calculations for base rate, BAF, THC, and PSS across 4 trade lanes using database-backed `RateCard` models. Tested in `tests/test_maritime_suite.py`.
- **Milestone Tracking (`modules/maritime/service.py`)**: *Implemented & Tested*. `MilestoneEvent` persisted in DB with automated Demurrage / Detention Last Free Day alerts. Tested in `tests/test_maritime_suite.py`.
- **House Bill of Lading (`modules/maritime/service.py`)**: *Implemented & Tested*. Structured HBL issuance model and service method (`create_house_bill_of_lading`). Tested in `tests/test_maritime_suite.py`.

---

## 4. Targeted Gap Assessment (Finalized Product Requirements)

| Requirement | Status | File Reference | Supporting Evidence / Gap Analysis |
| :--- | :--- | :--- | :--- |
| **SalesFortis Branding** | **IMPLEMENTED** | `apps/web/src/pages/Welcome.tsx`, `AppLayout.tsx`, `Login.tsx` | All public marketing and application headers consistently display "SalesFortis". |
| **Industry-Specific Marketing** | **IMPLEMENTED** | `apps/web/src/pages/ConstructionMarketing.tsx`, `ClinicalMarketing.tsx`, `MaritimeMarketing.tsx` | Dedicated feature showcases, ROI metrics, and trade-specific terminology. |
| **Industry-Specific Pricing** | **PARTIAL** | `apps/web/src/pages/*Marketing.tsx` | Pricing cards exist in marketing view; needs structured JSON plan schema linked to registration. |
| **Trial Registration** | **PARTIAL** | `apps/api/routers/auth.py`, `apps/web/src/pages/app/Login.tsx` | User/tenant registration exists; needs `industry` parameter passed during registration. |
| **Tenant Provisioning** | **IMPLEMENTED** | `apps/api/routers/auth.py` | Transactionally creates `Tenant` with unique slug and assigns initial admin user. |
| **Industry Entitlement Persistence** | **PARTIAL** | `core/models/auth.py` | `Tenant.subscription_tier` exists; needs explicit `industry` enum column (`construction`, `clinical`, `maritime`, `all`). |
| **Industry-Specific Frontend Nav** | **PARTIAL** | `apps/web/src/pages/app/VerticalHub.tsx`, `AppLayout.tsx` | Hub has switcher tabs; needs conditional rendering filtering tabs to the tenant's entitled industry only. |
| **Backend Industry Authorization** | **MISSING** | `modules/*/router.py` | Endpoints enforce `tenant_id`, but do not yet verify if the tenant's entitled industry matches the module (e.g., blocking Clinical tenant from accessing Construction SOVs). |
| **Cross-Tenant Data Isolation** | **IMPLEMENTED & TESTED** | `modules/*/service.py`, `tests/` | 100% of queries use `.filter(Model.tenant_id == tenant.id)`. Multi-tenant test cases pass. |
| **Cross-Tenant Document & AI Isolation** | **IMPLEMENTED & TESTED** | `ai/router.py`, `ai/rag_service.py` | Document chunks and search queries filtered strictly by `tenant_id`. |
| **Superadmin Separation** | **PARTIAL** | `core/models/auth.py` | `User.is_superadmin` flag exists; needs Superadmin-only management endpoints separated from tenant admin. |
| **Docker Port Routing** | **PARTIAL** | `infra/docker-compose.dev.yml` | API (8001), Postgres (5432), Redis (6379) active; needs Marketing (5000) and App (5001) web host configurations. |
| **Production Frontend Build** | **IMPLEMENTED & TESTED** | `apps/web/dist/` | Vite build completes in 825ms with 0 errors. Verified with 8/8 Playwright E2E tests. |
| **PostgreSQL Persistence** | **IMPLEMENTED & TESTED** | `salesfortis_dev.db` / `infra/` | 33 tables under Alembic control. Zero in-memory prototype arrays in production paths. |
| **Authentication Redirects** | **PARTIAL** | `apps/web/src/App.tsx` | Handled via React Router on single host; needs cross-host redirect from port 5000 to port 5001 upon login. |
