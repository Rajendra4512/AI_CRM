# SalesFortis — Codebase Knowledge & Persistent Memory Graph

## 1. High-Level Graph Topology & Community Clusters
Based on static AST extraction of 1,390 nodes and 2,171 edges, the codebase clusters into the following primary architectural communities:

```
[ Frontend: React 19 / Vite / Tailwind ]
       | (REST API via Port 8001 / Vite Proxy)
       v
[ API Layer: FastAPI /apps/api/routers ]
       |
       +---> [ Core Security & Auth: /core/services/auth_service.py ]
       |        | (Authoritative Database Tenant Resolution)
       |        +---> [ Core Models: /core/models/auth.py, crm.py ]
       |
       +---> [ AI / RAG Pipeline: /ai/router.py, /ai/rag_service.py ]
       |        | (Vector store, chunking, domain prompt templates)
       |        +---> [ Workers: /workers/ingestion.py ] (Celery / Redis)
       |
       +---> [ Vertical Modules: /modules/* ]
                +---> [ Construction: models.py, router.py, service.py ]
                +---> [ Clinical CTMS: models.py, router.py, service.py ]
                +---> [ Maritime Freight: models.py, router.py, service.py ]
```

---

## 2. Implemented vs. Planned Architecture Matrix

| Architectural Subsystem | Existing Implementation (Verified Source Code) | Planned / Future Architecture (Docs 01–15) |
| :--- | :--- | :--- |
| **Frontend Web App** | React 19 + TypeScript + Vite (`apps/web`). Single-page application with tabs for Landing, Login, Dashboard, Leads Pipeline (Kanban), and Vertical Hub (Construction, Clinical, Maritime). | Separate sub-domain routing (`app.salesfortis.com` vs `www.salesfortis.com`), full multi-tab CTMS portal, SOV export wizard. |
| **Backend API Gateway** | FastAPI running on port 8001 (`apps/api/main.py`). Centralized routing under `/api/v1` for `auth`, `crm`, `admin`, `verticals`, and `ai`. | Celery beat scheduled polling, webhook ingestion triggers, automated PDF dispatch. |
| **Tenant & Industry Isolation** | Fail-closed tenant entitlement column `industry` in `tenants` table. `get_current_tenant` resolves authoritatively from user DB record (neutralizing spoofed headers). `require_industry_entitlement` enforces HTTP 403 on mismatched calls. | Dynamic multi-license provisioning and enterprise tenant role delegation. |
| **Construction Suite** | `modules/construction/`: SOV calculation math (`calculate_sov_application`), SOV persistence (`persist_sov_application`), change events status engine (`update_change_event_status`), field T&M capture. | AIA G702/G703 official PDF generation, QuickBooks / Procore export synchronization. |
| **Clinical Trials CTMS** | `modules/clinical/`: Protocol recruitment funnels, pseudonymous patient referrals, electronic consent verification guardrail (`21 CFR Part 50` hard block on unconsented randomization), site milestones. | EDC electronic data capture integration, HL7/FHIR health data connectors. |
| **Maritime Freight Suite** | `modules/maritime/`: Container freight rating engine with dynamic BAF/THC/PSS surcharges, shipment tracking timeline with detention/demurrage alerts, House Bill of Lading (`HBL`) generator. | EDI 300/304/310 carrier booking integrations, live AIS vessel GPS tracking. |
| **Shared AI / RAG Engine** | `ai/rag_service.py` & `ai/router.py`: In-memory keyword/TF vector index, text chunker with overlap, multi-part document ingestion (`workers/ingestion.py`), CSI spec extractor, Clinical protocol extractor, Maritime rate sheet extractor. | PGVector or Qdrant persistent embedding store, LiteLLM live neural embeddings, asynchronous Celery OCR worker. |
| **Database Schema** | 33 tables migrated via Alembic (`b6e8f38db826` and `c7f1a8e2d39b`) in `salesfortis_dev.db`. | Dedicated read replicas, multi-tenant row-level security (RLS) policies on raw PostgreSQL. |
| **Deployment Infrastructure** | Multi-container Docker Compose (`infra/docker-compose.dev.yml`): API (`8001`), Web (`5000:80`, `5001:80`), Postgres (`5432`), Redis (`6379`), Worker. | Kubernetes Helm charts, AWS ECS Fargate task definitions, Cloudflare Zero Trust tunnel. |

---

## 3. Detailed Component & Symbol Dependency Graph

### 3.1 Core Security & Tenant Platform
- **Files**:
  - `core/models/auth.py`: `Tenant` (has `industry`, `subscription_tier`), `User` (has `tenant_id`, `is_superadmin`), `AuditLog`.
  - `core/services/auth_service.py`:
    - `get_password_hash(password: str) -> str`
    - `verify_password(plain: str, hashed: str) -> bool`
    - `create_access_token(data: dict) -> str`
    - `get_current_user(credentials) -> User`
    - `get_current_tenant(user) -> Tenant` (Authoritative resolver)
    - `require_industry_entitlement(required_industry: str) -> dependency`
    - `require_superadmin(user) -> User`
- **Dependencies**: Depends on SQLAlchemy `Session`, `jose.jwt`, `bcrypt`.
- **Callers**: Used across all routers in `apps/api/routers/` and `modules/*/router.py`.

### 3.2 Construction Subcontractor Module
- **Files**:
  - `modules/construction/models.py`: `ConstructionProject`, `SOVApplication`, `SOVLineItem`, `ChangeEvent`, `FieldTimeMaterial`.
  - `modules/construction/service.py`: `ConstructionSOVService`
    - `calculate_sov_application(lines, retainage_rate_pct)`
    - `persist_sov_application(db, tenant_id, project_id, ...)`
    - `list_sov_applications(db, tenant_id, project_id)`
    - `create_change_event(db, tenant_id, ...)`
    - `update_change_event_status(db, tenant_id, change_event_id, new_status)`
    - `log_field_tm(db, tenant_id, ...)`
  - `modules/construction/router.py`:
    - Guard: `dependencies=[Depends(require_industry_entitlement("construction"))]`
    - Endpoints: `POST /sov/calculate`, `POST /sov/applications`, `GET /sov/applications`, `POST /change-events`, `PATCH /change-events/{id}/status`, `POST /field-tm`.

### 3.3 Clinical Trials CTMS Module
- **Files**:
  - `modules/clinical/models.py`: `Study`, `Site`, `Referral`, `ConsentEvidence`, `EligibilityCriteria`, `FollowUpTask`.
  - `modules/clinical/service.py`: `ClinicalComplianceService`
    - `get_or_create_demo_study(db, tenant_id)`
    - `get_funnel_metrics(db, tenant_id, study_id)`
    - `list_referrals(db, tenant_id, study_id)`
    - `verify_and_randomize(db, tenant_id, patient_id, consent_signed, user_id)`
    - `create_followup_task(db, tenant_id, ...)`
  - `modules/clinical/router.py`:
    - Guard: `dependencies=[Depends(require_industry_entitlement("clinical"))]`
    - Endpoints: `GET /metrics`, `GET /referrals`, `POST /verify-consent`, `POST /followup-tasks`.

### 3.4 Maritime Freight Forwarding Module
- **Files**:
  - `modules/maritime/models.py`: `OceanTariff`, `CarrierSurcharge`, `FreightQuotation`, `Shipment`, `MilestoneEvent`, `HouseBillOfLading`.
  - `modules/maritime/service.py`: `MaritimeFreightService`
    - `calculate_freight_quote(db, tenant_id, trade_lane, container_type, ...)`
    - `get_shipment_timeline(db, tenant_id, bl_number)`
    - `generate_house_bill_of_lading(db, tenant_id, ...)`
    - `check_demurrage_risk(db, tenant_id, bl_number)`
  - `modules/maritime/router.py`:
    - Guard: `dependencies=[Depends(require_industry_entitlement("maritime"))]`
    - Endpoints: `POST /quote`, `GET /shipments/{bl_number}/timeline`, `POST /hbl`, `GET /rates/tariffs`.

### 3.5 Shared AI & RAG Engine
- **Files**:
  - `ai/rag_service.py`: `RAGService`
    - `chunk_text(text, chunk_size, chunk_overlap) -> List[str]`
    - `index_document(tenant_id, document_id, filename, text) -> int`
    - `query(tenant_id, query_text, top_k) -> Dict[str, Any]`
  - `workers/ingestion.py`:
    - `extract_text_from_bytes(data: bytes, filename: str) -> str`
    - `process_document(document_id, tenant_id, filename, file_content)`
  - `ai/router.py`:
    - Endpoints: `POST /upload`, `POST /index-text`, `POST /query`, `GET /`, `POST /analyze-spec`, `POST /analyze-protocol`, `POST /extract-rate-sheet`.

---

## 4. Graph Navigation Quick Reference
- Shortest path inquiry:
  `graphify path "ConstructionSOVService" "require_industry_entitlement"`
- Node explanation:
  `graphify explain "ClinicalComplianceService"`
- Query by concept:
  `graphify query "Where is 21 CFR Part 50 consent checked?"`

