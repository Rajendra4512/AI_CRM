# SalesFortis — Change Manifest

### 1. Database Migrations
- `alembic/versions/c7f1a8e2d39b_add_tenant_industry_column.py`:
  - Added non-destructive, fail-closed `industry` column (`sa.String`, nullable=True) to `tenants` table.

### 2. Backend Security & Service Layer
- `core/models/auth.py`:
  - Added `industry = Column(String, nullable=True)` to `Tenant` model.
- `core/services/auth_service.py`:
  - Implemented `require_industry_entitlement(required_industry)` with fail-closed checks against authoritative database records.
  - Implemented `require_superadmin` enforcing platform administrator boundaries.
  - Hardened `get_current_tenant` to resolve strictly from the authenticated user's DB record, neutralizing client header spoofing (`X-Tenant-ID`).
- `apps/api/routers/auth.py`:
  - Added `industry` validation (`construction`, `clinical`, `maritime`) to `RegisterRequest`.
  - Provisioned new tenants with explicit industry entitlement.
  - Updated `/me` endpoint to return tenant industry.
- `apps/api/routers/admin.py`:
  - Protected all admin dashboard and configuration routes with `require_superadmin`.
- `modules/construction/router.py`:
  - Applied `dependencies=[Depends(require_industry_entitlement("construction"))]`.
- `modules/clinical/router.py`:
  - Applied `dependencies=[Depends(require_industry_entitlement("clinical"))]`.
- `modules/maritime/router.py`:
  - Applied `dependencies=[Depends(require_industry_entitlement("maritime"))]`.

### 5. Archify & Graphifyy Knowledge Graph Generation
- `archify/`:
  - `README.md`: Index and maintenance instructions.
  - `01-system-overview.md`: High-level system architecture and data stores.
  - `02-frontend-backend-runtime.md`: React 19 runtime, routing, and Vite proxy sequence.
  - `03-database-er-model.md`: Complete 33-table schema ER diagram.
  - `04-api-and-service-layer.md`: Route hierarchy, dependencies, and service contracts.
  - `05-docker-infrastructure.md`: Container topology, non-destructive isolation, and port maps.
  - `06-ai-rag-pipeline.md`: Document chunking, vector retrieval, and vertical extractors.
  - `07-security-isolation-boundaries.md`: Triple-boundary security decision matrix.
  - `08-vertical-industry-modules.md`: Construction, Clinical, and Maritime domain architectures.
- `graphify/`:
  - `README.md`: Tooling verification and operational guidelines.
  - `CODEBASE_GRAPH.md`: Persistent memory graph separating implemented vs planned architecture.
  - `graph.json`, `manifest.json`, `GRAPH_REPORT.md`: AST graph output (1,390 nodes, 2,171 edges, 124 communities).
  - `AI_CRM-callflow.html`: Interactive Mermaid call-flow visualization.
  - `wiki/`: 134 modular wiki reference articles.




### 6. Phase 2–5 Implementation, Security Hardening & Compound Engineering Artifacts
- `core/services/audit_service.py`: Added `AuditService.record()` writing structured `AuditLog` entries.
- `workers/ingestion.py`: Added empty-bytes guard and UTF-8-BOM CSV/TSV decoding.
- `ai/rag_service.py` & `ai/router.py`: Synchronized `Document` + `DocumentChunk` DB persistence, prompt-injection sanitization, `GET /api/v1/ai/documents/{id}`, vertical `require_industry_entitlement` guards, CSI addendum delta diff, dynamic protocol criteria staging, and CSV/text maritime tariff staging (`/upload-tariff`).
- `modules/construction/models.py`, `service.py`, `router.py`: Explicit `core.models.crm` import for isolated FK resolution, Application `N-1` `work_previous` carry-forward, `PATCH /sov/applications/{id}/approve`, and CSV-formula-hardened `GET /sov/applications/{id}/export`.
- `modules/clinical/service.py`, `router.py`: Safe Harbor pseudonymous ID guard, `PATCH /criteria/{id}/verify`, `POST /revoke-consent`, and `GET/POST /follow-ups`.
- `modules/maritime/service.py`, `router.py`: `GET /rate-cards`, `POST /rate-cards/{id}/approve`, `POST /shipments/{bl_number}/milestones` (LFD demurrage math), and `GET /tracking/{bl_number}` (`contract_stub`).
- `apps/api/routers/admin.py`: DB-backed `GET /tenants` and `GET /audit-logs` under `require_superadmin`.
- `apps/api/routers/auth.py` & `apps/api/main.py`: Prevented duplicate-organization registration hijacking, fixed demo login `IntegrityError`, added `POST /logout`, added startup `init_db()`, fixed `/api/*` catch-all `404`, and enforced explicit CORS origins.
- `core/services/crm_service.py` & `apps/api/routers/crm.py`: Closed cross-tenant `account_id` FK IDOR in `create_opportunity` and added tenant-scoped `DELETE /leads/{lead_id}`.
- `apps/web/`: Updated `vite.config.ts` (`preview.proxy`), `App.tsx`, `Welcome.tsx`, `ConstructionMarketing.tsx`, `ClinicalMarketing.tsx`, `MaritimeMarketing.tsx`, `Login.tsx`, `AppLayout.tsx`, `Dashboard.tsx`, `VerticalHub.tsx`, and `e2e/crm_flow.spec.ts`.
- `infra/`: Hardened `Dockerfile.api` (`workers/` + PDF/DOCX deps), `Dockerfile.web` (`HEALTHCHECK`), and `docker-compose.dev.yml` (loopback `127.0.0.1` DB/Redis bindings + healthchecks).
- `docs/solutions/security-issues/multi-tenant-registration-hijack-and-fk-idor-prevention.md`: Durable Compound Engineering (`ce-compound`) learning artifact.
- `archify/` & `graphify/`: Updated architecture diagrams (`02`, `04`, `05`, `06`, `07`, `08`), `.graphifyignore`, `graph.json` (`1,529` nodes, `2,643` edges), and `AI_CRM-callflow.html`.


### REA Competitive UX & Enterprise Workbench Modernization (2026-11-04)
- `docs/competitive-ux-research/00-REA-METHODOLOGY-AND-EVIDENCE-LEDGER.md`: REA readiness audit and 12 cryptographic `evidence_id` records.
- `docs/competitive-ux-research/01-CONSTRUCTION-BENCHMARK-PROCORE-CONTRACTOR-FOREMAN.md`: Construction UX & workflow synthesis.
- `docs/competitive-ux-research/02-CLINICAL-BENCHMARK-TRIALX-REALTIME-ECLINICAL.md`: Clinical UX, WAF 403 boundary record, and 21 CFR Part 50/11 synthesis.
- `docs/competitive-ux-research/03-MARITIME-BENCHMARK-LOGITUDE-MAGAYA.md`: Maritime freight CRM, tariff, HBL & LFD synthesis.
- `apps/web/src/components/Icons.tsx` & `apps/web/src/components/EnterpriseWorkbench.tsx`: Shared enterprise vector icons, KPI telemetry strip, ARIA `tablist` sub-navigation, lifecycle stepper, and searchable/filterable data table.
- `apps/web/src/index.css`, `apps/web/src/pages/Welcome.{tsx,css}`, `apps/web/src/pages/Marketing.css`, `apps/web/src/pages/{Construction,Clinical,Maritime}Marketing.tsx`: Enterprise multi-vertical marketing portal & domain product pages.
- `apps/web/src/pages/app/AppPortal.css`, `AppLayout.tsx`, `Login.tsx`, `Dashboard.tsx`, `LeadsPipeline.tsx`, `VerticalHub.tsx`: Enterprise CRM shell, split-screen auth with isolated sandboxes, live RAG Copilot drawer, Kanban + Register pipeline, and strict single-vertical entitlement routing.
- `apps/web/src/pages/app/workbenches/{Construction,Clinical,Maritime}Workbench.tsx`: Reference Construction workbench + Clinical CTMS & Maritime Freight Control Tower workbenches wired to FastAPI/PostgreSQL.
- `apps/web/e2e/crm_flow.spec.ts`: Expanded to 16 end-to-end Playwright verification tests (`16/16 passed`).
- `REA_out041126.txt`: Complete execution report, REA evidence ledger, architectural updates, and test verification record.
