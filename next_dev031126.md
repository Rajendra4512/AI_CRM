# SalesFortis - Next Development Sprint Plan

**Plan Reference:** `next_dev031126.md`  
**Target Platform:** SalesFortis - AI-Native Multi-Vertical CRM SaaS  
**Scope:** Live Database Persistence (Alembic), AI Document RAG Engine, and Deepened Vertical Workflows  
**Methodology:** Compound Engineering with Automated Verification (Pytest + Playwright)

---

## 1. Executive Sprint Overview

This sprint transforms the structural scaffold and mock endpoints into fully functional, database-backed, AI-augmented business workflows across the 3 target verticals:
1. **Track 1: Alembic Migrations & Live Database Persistence**
2. **Track 2: AI Document Ingestion & Vector RAG Engine**
3. **Track 3: Deepened Domain Workflow Engines (Construction, Clinical, Maritime)**

---

## 2. Detailed Workstream Specifications

### Track 1: Alembic Migrations & Live Database Persistence

#### Objectives
- Initialize Alembic version control for database schemas.
- Consolidate all SQLAlchemy declarative models into Alembic's `target_metadata`.
- Replace in-memory/mock API router stubs with real CRUD operations enforcing multi-tenant isolation (`tenant_id`).

#### Technical Architecture & Primitives
- **Alembic Root**: `alembic/` directory with `env.py` importing all models:
  - `core.models.auth` (Tenant, User, Role)
  - `core.models.crm` (Account, Contact, Lead, Opportunity/Deal, Activity)
  - `core.models.admin` (AuditLog, SystemSetting, Subscription)
  - `modules.construction.models` & `models_comprehensive`
  - `modules.clinical.models` & `models_enhanced`
  - `modules.maritime.models` & `models_enhanced`
  - `ai.models` (Document, DocumentChunk)
- **Tenant Context Middleware / Dependency**:
  - `get_current_tenant(request: Request)` dependency extracting `tenant_id` from JWT or tenant header.
  - Automatic filtering on all queries: `db.query(Model).filter(Model.tenant_id == current_tenant.id)`.

#### Deliverables & File Changes
- [ ] Initialize Alembic configuration: `alembic.ini` and `alembic/env.py`.
- [ ] Generate Initial Migration: `alembic/versions/001_initial_schema.py`.
- [ ] Implement CRUD Services:
  - `core/services/crm_service.py`: Accounts, Contacts, Leads, Deals CRUD with pagination.
  - `core/services/auth_service.py`: Password hashing via `passlib`, JWT generation/verification via `python-jose`.
- [ ] Update Routers:
  - `apps/api/routers/crm.py`: Replace mock returns with `crm_service` database calls.
  - `apps/api/routers/auth.py`: Real authentication and session resolution.

---

### Track 2: AI Document Ingestion & RAG Engine

#### Objectives
- Enable asynchronous parsing for complex documents (Construction RFQ specs, Clinical Trial protocols, Maritime bills of lading/manifests).
- Generate embeddings and store semantic vectors in Qdrant collections partitioned by `tenant_id`.
- Provide natural language document querying with cited source snippets via LiteLLM.

#### Technical Architecture
```
[User Document Upload]
        │
        ▼
[FastAPI /api/v1/ai/upload]
        │
        ├──► Store metadata in Postgres `documents` table (Status: PENDING)
        └──► Dispatch Celery Task: `ingest_document_task.delay(doc_id)`
                    │
                    ▼
           [Celery Worker Engine]
                    │
                    ├── 1. Parse text & tables (pypdf, python-docx)
                    ├── 2. Chunk text with overlap (500 tokens / 50 token stride)
                    ├── 3. Generate Embeddings via LiteLLM (text-embedding-3-small or open-source)
                    ├── 4. Upsert vectors to Qdrant collection with payload:
                    │      { tenant_id, document_id, chunk_index, text }
                    └── 5. Update Postgres `documents` table (Status: READY)
```

#### Deliverables & File Changes
- [ ] `workers/ingestion.py`:
  - Enhance `process_document` task to parse PDF/DOCX into chunks using `pypdf` and `python-docx`.
  - Connect LiteLLM client for embedding generation.
  - Integrate `qdrant-client` to upsert vectors into tenant-isolated collections.
- [ ] `ai/rag_service.py`:
  - Search query retrieval from Qdrant with payload filter: `tenant_id == current_tenant_id`.
  - Contextual prompt synthesis and answer generation with citations.
- [ ] `ai/router.py`:
  - Live `/upload` endpoint accepting multipart file uploads.
  - Live `/query` endpoint returning synthesized answers and matching citations.
- [ ] `apps/web/src/pages/app/`: Add AI Assistant drawer / document upload widget in the CRM portal.

---

### Track 3: Deepened Domain Workflow Engines

#### 1. Construction & Trades Suite (Procore / Contractor Foreman Alignment)
- **Schedule of Values (SOV) & Progress Billing**:
  - Data structure for line-item contract sums, scheduled values, work completed from previous applications, and current retainage (e.g. 10% retainage rules).
  - Endpoint: `POST /api/v1/verticals/construction/sov/calculate`
  - Automated calculation of retainage, net billing, and balance to finish.
- **Change Event to Change Order Workflow**:
  - Lifecycle: `Change Event` ➔ `RFQ to Subcontractor` ➔ `Potential Change Order (PCO)` ➔ `Commitment Change Order (CCO)`.
  - UI Component in `VerticalHub.tsx`: Dedicated SOV table and interactive Change Event status progression.

#### 2. Clinical Trials & CTMS Suite (TrialX Alignment)
- **Subject Recruitment Funnel & Feasibility Tracker**:
  - Funnel metrics: `Identified` ➔ `Prescreened` ➔ `Consented` ➔ `Randomized` ➔ `Completed`.
  - Endpoints:
    - `GET /api/v1/verticals/clinical/funnel/{study_id}`
    - `POST /api/v1/verticals/clinical/consent/verify`
  - Compliance safeguard: Prevents patient status transition to `Randomized` unless electronic consent is marked `Verified`.
- **Site Enrollment Quota Monitor**:
  - Live site capacity vs. enrolled subjects chart in `VerticalHub.tsx`.

#### 3. Maritime Logistics & Freight Brokerage (Logitude / Magaya Alignment)
- **Dynamic Freight Rate Calculator**:
  - Multi-component rating engine: Base Ocean Freight + Bunker Adjustment Factor (BAF) + Terminal Handling Charges (THC) + Peak Season Surcharge (PSS).
  - Endpoints:
    - `POST /api/v1/verticals/maritime/rates/quote`
    - `GET /api/v1/verticals/maritime/shipments/{tracking_no}/timeline`
  - Container Milestone Tracker: Event log (`Gate-In`, `Vessel Loaded`, `Transshipment`, `Discharged`, `Customs Cleared`, `Delivered`).

---

## 3. Step-by-Step Implementation Sequence

```
Step 1: Alembic Initialization & Migrations
   └─ Setup alembic/env.py, generate initial schema, verify migration on SQLite & Postgres.

Step 2: CRM Core CRUD & Live API Endpoints
   └─ Implement core CRM services, replace mock responses, verify via Pytest.

Step 3: Deepen Construction Workflow (SOV & Change Events)
   └─ Implement SOV calculation service, wire endpoints, update frontend tab.

Step 4: Deepen Clinical Workflow (Recruitment Funnel & Consent)
   └─ Implement enrollment funnel logic, consent verification rule, update frontend tab.

Step 5: Deepen Maritime Workflow (Rate Engine & Milestone Timeline)
   └─ Implement multi-factor rate calculation, shipment event timeline, update frontend tab.

Step 6: AI Ingestion & RAG Pipeline
   └─ Implement document chunking, Qdrant vector indexing, and LiteLLM query synthesis.

Step 7: Automated Verification (Pytest + Playwright)
   └─ Run comprehensive backend test suite and extend Playwright E2E browser tests.
```

---

## 4. Verification & Testing Strategy

### Backend Pytest Suite (`tests/`)
- `tests/test_crm_crud.py`: Test creation, retrieval, filtering, and tenant isolation for accounts and leads.
- `tests/test_construction_sov.py`: Test SOV retainage calculations, work completed formulas, and change order progression.
- `tests/test_clinical_compliance.py`: Test consent verification guardrails preventing unauthorized subject randomization.
- `tests/test_maritime_rates.py`: Test freight rating engine calculations across container types (20GP, 40HC) and surcharges.
- `tests/test_ai_rag.py`: Test document text extraction, chunking, and mock vector retrieval.

### Frontend Playwright E2E Suite (`apps/web/e2e/`)
- Test SOV calculation interaction in Construction tab.
- Test subject recruitment stage advancement in Clinical tab.
- Test freight rate generation in Maritime tab.
- Test end-to-end deal creation persisting across page reloads.

---

## 5. Security & Multi-Tenancy Invariants

1. **Mandatory Tenant Filtering**: Every database select, update, and delete query must explicitly assert `tenant_id == current_tenant.id`.
2. **Vector Space Partitioning**: Vector embeddings stored in Qdrant must always store `tenant_id` in their payload and apply a filter on all similarity searches.
3. **No Unencrypted Patient Identifiers**: Clinical module patient data must comply with de-identification standards (HIPAA/GDPR safe harbor).

