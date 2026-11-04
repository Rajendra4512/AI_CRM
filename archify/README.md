# SalesFortis — System Architecture Blueprint Repository (`archify/`)

## 1. Purpose & Standards
This folder contains the authoritative architectural diagrams and technical system specifications for the **SalesFortis Multi-Vertical AI CRM & ERP Platform**.

All diagrams follow standard GitHub-flavored Markdown Mermaid notation (`flowchart TD`, `sequenceDiagram`, `erDiagram`, `classDiagram`) to ensure high readability and native visual rendering across modern IDEs and web browsers.

Each document clearly distinguishes **Existing Implementation** (active in current source code and verified by automated tests) from **Planned Architecture** (specified in the 15 implementation blueprints under `docs/implementation/`).

---

## 2. Architecture Diagram Index

| Document | Scope & Focus | Primary Diagram Types |
| :--- | :--- | :--- |
| [`01-system-overview.md`](file:///c:/Users/raj45/OneDrive/Desktop/AI_CRM/archify/01-system-overview.md) | High-level system architecture, client hosts, service boundaries, and data stores | `flowchart TD` |
| [`02-frontend-backend-runtime.md`](file:///c:/Users/raj45/OneDrive/Desktop/AI_CRM/archify/02-frontend-backend-runtime.md) | Client SPA runtime, routing, state management, Vite proxy, and API communication | `sequenceDiagram`, `flowchart LR` |
| [`03-database-er-model.md`](file:///c:/Users/raj45/OneDrive/Desktop/AI_CRM/archify/03-database-er-model.md) | Complete Relational Entity-Relationship diagram across all 33 migrated schema tables | `erDiagram` |
| [`04-api-and-service-layer.md`](file:///c:/Users/raj45/OneDrive/Desktop/AI_CRM/archify/04-api-and-service-layer.md) | FastAPI route hierarchy (`/api/v1/`), dependency injection, and service orchestrators | `flowchart TD`, `classDiagram` |
| [`05-docker-infrastructure.md`](file:///c:/Users/raj45/OneDrive/Desktop/AI_CRM/archify/05-docker-infrastructure.md) | Multi-container local Docker Desktop topology, non-destructive isolation, and port maps | `flowchart TD` |
| [`06-ai-rag-pipeline.md`](file:///c:/Users/raj45/OneDrive/Desktop/AI_CRM/archify/06-ai-rag-pipeline.md) | Ingestion pipeline, document chunking, semantic retrieval, citations, and domain extractors | `flowchart LR`, `sequenceDiagram` |
| [`07-security-isolation-boundaries.md`](file:///c:/Users/raj45/OneDrive/Desktop/AI_CRM/archify/07-security-isolation-boundaries.md) | Triple-boundary authorization: Tenant DB resolution, Industry guardrails, Superadmin RBAC | `flowchart TD`, `sequenceDiagram` |
| [`08-vertical-industry-modules.md`](file:///c:/Users/raj45/OneDrive/Desktop/AI_CRM/archify/08-vertical-industry-modules.md) | Domain suites: Construction SOV/Change Events, Clinical CTMS Consent, Maritime Logistics | `flowchart TD`, `stateDiagram-v2` |

---

## 3. Maintenance Protocol During Autonomous Execution
- Before modifying or adding models, routers, or workflows during Phases 1–5, consult the corresponding blueprint in this directory.
- When adding new tables, migrations, or endpoints, update the ER model ([`03-database-er-model.md`](file:///c:/Users/raj45/OneDrive/Desktop/AI_CRM/archify/03-database-er-model.md)) and API layer diagram ([`04-api-and-service-layer.md`](file:///c:/Users/raj45/OneDrive/Desktop/AI_CRM/archify/04-api-and-service-layer.md)).
- Record diagram updates in `docs/implementation/execution/MASTER_EXECUTION_LOG.md` and `docs/implementation/execution/CHANGE_MANIFEST.md`.

