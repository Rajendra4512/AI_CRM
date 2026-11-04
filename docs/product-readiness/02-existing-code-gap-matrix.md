# Product Readiness: Codebase Gap Matrix & Component Reconciliation

**Document ID:** `02-existing-code-gap-matrix.md`  
**Audit Date:** 2026-11-03  
**Scope:** Direct mapping of all proposed capabilities to existing frontend components, backend APIs, database models, and test coverage.  

---

## 1. Component Reconciliation & Code Readiness Matrix

| Feature / Capability | Frontend Component | Backend API & Service Logic | Database Entities & Persistence | Test Coverage | Classification | Smallest Necessary Code Change | Reusable Assets |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication & User Management** | `Login.tsx` | `apps/api/routers/auth.py`, `core/services/auth_service.py` | `users`, `tenants` (PostgreSQL / SQLite via Alembic) | `tests/test_crm_crud.py`, `tests/test_api_endpoints.py`, Playwright Test #3 | **Functional** | None required for baseline; add password reset flow in Phase 2. | JWT token encoding, bcrypt hashing, `get_current_user` dependency. |
| **Multi-Tenant Isolation** | `AppLayout.tsx` (tenant badge) | `core/services/auth_service.py` (`get_current_tenant`) | `tenant_id` foreign key on all tables | `tests/test_crm_crud.py` | **Functional** | None required; strictly enforced on all CRM queries. | Context dependency injection, UUID validation. |
| **Shared CRM Accounts & Leads** | `LeadsPipeline.tsx` | `apps/api/routers/crm.py`, `core/services/crm_service.py` | `accounts`, `leads`, `opportunities` (Live SQL persistence) | `tests/test_crm_crud.py`, Playwright Test #4 | **Functional** | Add edit/delete actions and custom field support. | Pydantic validation schemas, Kanban UI state, pagination. |
| **Construction: Schedule of Values (SOV) Billing** | `VerticalHub.tsx` (Live calculator) | `modules/construction/service.py`, `router.py` (`/sov/calculate`) | `rfqs`, `estimates` exist in DB; line-item persistence missing | `tests/test_vertical_workflows.py`, Playwright Test #6 | **Partial** | Create `sov_line_items` table in DB and bind frontend calculator inputs to API POST. | Math formula engine in `ConstructionSOVService`. |
| **Construction: Change Event to PCO Flow** | `VerticalHub.tsx` (Table display) | `modules/construction/router.py` (`POST /change-events`) | Stored in in-memory Python list `_CHANGE_EVENTS` | `tests/test_vertical_workflows.py` | **Partial** | Persist change events to `modules/construction/models_comprehensive.py` DB table. | Event status transition logic and router schema. |
| **Construction: AI Spec & RFQ Analyzer** | Missing (Only text quoter) | `ai/rag_service.py` (Generic sliding text window) | `documents`, `document_chunks` exist in DB | `tests/test_ai_rag.py` | **Partial / Missing Trade Parser** | Add regex/CSI division splitter in `rag_service.py` (e.g. MasterFormat divisions 01–48) and UI drawer. | Document parser (`pypdf`, `python-docx`), citation generator. |
| **Clinical: 21 CFR Part 50 Consent Guardrail** | `VerticalHub.tsx` (Consent checkbox) | `modules/clinical/service.py`, `router.py` (`/consent/verify`) | In-memory `_PATIENTS_DATABASE` | `tests/test_vertical_workflows.py`, Playwright Test #7 | **Partial** | Persist patients and consent timestamps to `referrals`/`patients` database table. | HTTP 400 compliance rejection logic, interactive UI state. |
| **Clinical: Protocol Eligibility Extractor** | Missing | `ai/rag_service.py` | `documents`, `document_chunks` | Generic RAG test in `test_ai_rag.py` | **Missing Clinical Parser** | Add section header detector (Inclusion / Exclusion criteria) in `rag_service.py` to populate prescreening surveys. | RAG retrieval and citation engine. |
| **Maritime: Ocean Freight Surcharge Engine** | `VerticalHub.tsx` (Interactive Quoter) | `modules/maritime/service.py`, `router.py` (`/rates/quote`) | Trade lane rates hardcoded in `TRADE_LANE_BASE_RATES` dict | `tests/test_vertical_workflows.py`, Playwright Test #8 | **Partial** | Persist trade lane rate sheets and customer quote records to `quotations` DB table. | Surcharge math formula (Base + BAF + THC + PSS). |
| **Maritime: Shipment Milestone Timeline** | `VerticalHub.tsx` (Table display) | `modules/maritime/service.py`, `router.py` (`/shipments/{bl}/timeline`)| Hardcoded dictionary `_SHIPMENT_TIMELINES` | `tests/test_vertical_workflows.py` | **Partial** | Wire `/shipments` API to query `shipments` database table with foreign key milestone events. | Milestone array schema and UI status badges. |
| **Maritime: AI Carrier Rate Sheet Ingestion** | Missing | `workers/ingestion.py` (`extract_text_from_bytes`) | Missing rate card table | `tests/test_ai_rag.py` | **Missing Tabular Parser** | Build Excel/PDF tabular tariff parser using `openpyxl` / `pypdf` to extract origin, destination, and container rates. | File upload endpoint (`/api/v1/ai/upload`). |
| **Admin & System Settings** | Missing in UI | `apps/api/routers/admin.py` | `system_config`, `audit_logs` exist in DB | `test_api_endpoints.py` | **Mock / Stub** | Connect `apps/api/routers/admin.py` to query `system_config` table rather than returning static dictionaries. | Existing Pydantic schemas. |

---

## 2. Reusability & Minimal Change Assessment

1. **Shared Foundation is 80% Complete**:
   - Authentication, multi-tenant isolation, database migrations (Alembic), shared CRM models, and core document upload endpoints are fully operational and tested.
2. **The "Smallest Necessary Change" Strategy**:
   - Rather than creating new microservices or introducing heavy enterprise libraries, each vertical only requires **persisting its existing business logic to the database** and **adding domain-specific regex/prompt parsing on top of the existing RAG service**.
3. **Preserving Architecture**:
   - The modular monolith layout (`apps/api`, `core`, `modules/`, `apps/web`) cleanly separates concerns and must remain unchanged.

