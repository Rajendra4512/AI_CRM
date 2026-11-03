# SalesFortis - Commercial Architecture & Execution Plan

**Document Version:** 1.0.0  
**Target Product:** SalesFortis - AI-Native Multi-Vertical CRM SaaS  
**Scope:** Production-Ready Decoupled Architecture, Multi-Tenancy, and Delivery Roadmap  

---

## 1. Executive Summary

SalesFortis is designed as an AI-native CRM tailored for high-compliance and domain-specific verticals:
1. **Construction**: Field workflows, RFQs, change orders, estimates, and commitments (aligned with Procore / Contractor Foreman).
2. **Clinical Trials**: Study protocols, site operations, patient prescreening, and consent lifecycle (aligned with CTMS standards).
3. **Maritime & Freight**: Rate sheets, quotations, vessel bookings, milestones, and Bills of Lading (aligned with Logitude / Magaya).

To operate reliably and commercially as a multi-tenant SaaS, the system shifts away from an "all-in-one" container (which bundled Postgres, Redis, frontend, API, and workers) toward a **decoupled, stateless 3-tier cloud architecture**.

---

## 2. Current State vs. Target Commercial Architecture

### 2.1 Current State Issues
- **Single-Container Overload**: Database, Redis, Nginx, FastAPI, and Celery running under `supervisord` inside one container.
- **Build Bottleneck**: Heavy packages in `requirements.txt` (`unstructured`, `mlflow`, `litellm`, `langchain`) stall container builds.
- **Unmounted API Routes**: The master router (`apps/api/routers/__init__.py`) is not yet attached to `apps/api/main.py`.
- **UI Gap**: Frontend contains marketing landing pages but lacks the internal authenticated CRM application portal.

### 2.2 Target Commercial Architecture

```
[ End Users & Browsers ]
          │
          ├──► CDN / Edge Layer (Cloudflare Pages / Vercel)
          │    • Serves React 19 + TypeScript SPA
          │    • Sub-50ms global asset caching, SSL, DDoS protection
          │    • Routes: / (Marketing), /app/* (Internal CRM Portal)
          │
          └──► Application API Layer (Render / AWS ECS / GCP Cloud Run)
               • Stateless FastAPI Docker container (auto-scaling)
               • Handles Auth, Multi-tenant RBAC, REST endpoints
               │
               ├──► Managed Database: PostgreSQL (Supabase / Neon / AWS RDS)
               │    • Tenant isolation via tenant_id + Row Level Security (RLS)
               │    • Automated daily backups, PITR, connection pooling
               │
               ├──► Managed Cache & Queue: Redis (Upstash / AWS ElastiCache)
               │    • Session cache & Celery message broker
               │
               ├──► Background AI & Ingestion Worker: Celery Worker
               │    • Dedicated container for document parsing and embedding
               │    • Never degrades user-facing API response times
               │
               └──► Vector Database: Qdrant Cloud
                    • Stores chunked document vectors for vertical RAG
```

---

## 3. Detailed Component Breakdown

### 3.1 Frontend (`apps/web`)
- **Framework**: React 19, TypeScript, Vite, TailwindCSS / modern CSS modules.
- **Hosting**: Vercel or Cloudflare Pages.
- **Structure**:
  - `apps/web/src/pages/marketing/`: Public landing and vertical feature pages.
  - `apps/web/src/pages/app/`: Authenticated CRM portal (Dashboard, Pipelines, Contacts, Vertical Workflows).
  - `apps/web/src/services/api.ts`: Centralized Axios/Fetch client with JWT interceptors.

### 3.2 Backend API (`apps/api`)
- **Framework**: FastAPI with Pydantic v2 validation.
- **Multi-Tenancy**: `tenant_id` context injection via FastAPI dependencies; tenant boundary validation on every query.
- **Deployment**: Stateless Docker container running Uvicorn with Gunicorn workers.

### 3.3 Data Layer
- **PostgreSQL**: Stores relational models (`core/models/crm.py`, `core/models/auth.py`, vertical models).
- **Redis**: Queue broker for Celery and short-lived caching.
- **Qdrant**: Vector storage for unstructured document retrieval (RFQs, protocols, shipping docs).

---

## 4. Phased Execution Roadmap

### Phase 1: Dependency Optimization & Fast Docker Builds
- [ ] Split `requirements.txt` into:
  - `requirements-core.txt`: Minimal runtime dependencies (`fastapi`, `uvicorn`, `sqlalchemy`, `psycopg2-binary`, `pydantic`, `redis`, `celery`).
  - `requirements-ai.txt`: Heavy AI libraries (`qdrant-client`, `openai`, `anthropic`, `litellm`) installed only where required.
- [ ] Create a lightweight `infra/Dockerfile.api` producing a lean, production-ready backend image in under 2 minutes.
- [ ] Initialize git baseline and create initial commit.

### Phase 2: Core API & Database Integration
- [ ] Wire `app_router` from `apps/api/routers/__init__.py` into `apps/api/main.py`.
- [ ] Implement database session management using environment variables (`DATABASE_URL`, `REDIS_URL`).
- [ ] Create database migration scripts using Alembic for core tables (Tenants, Users, CRM entities, Vertical tables).
- [ ] Replace mock router responses in `apps/api/routers/auth.py` and `crm.py` with real database queries.

### Phase 3: Authenticated CRM Portal (`apps/web`)
- [ ] Configure React Router for two distinct layout modes:
  - Public Marketing Layout (`/`, `/vertical/*`).
  - Authenticated CRM Dashboard Layout (`/app/dashboard`, `/app/leads`, `/app/vertical/*`).
- [ ] Implement JWT auth state management (login, logout, token persistence, protected route guards).
- [ ] Build core CRM views:
  - Lead / Deal Kanban Pipeline.
  - Account & Contact Management Table.
  - Vertical modules tabs (Construction RFQs, Clinical Protocols, Maritime Shipments).

### Phase 4: Asynchronous Processing & AI/RAG Engine
- [ ] Configure Celery worker in `workers/ingestion.py` to run as an independent background container.
- [ ] Connect document upload endpoint (`/api/v1/ai/upload`) to trigger async parsing and chunking.
- [ ] Integrate Qdrant vector storage and LiteLLM gateway for tenant-isolated document Q&A.

### Phase 5: Production Deployment & CI/CD
- [ ] Setup `docker-compose.dev.yml` for unified local development (Postgres, Redis, API, Web).
- [ ] Setup production Dockerfiles:
  - `infra/Dockerfile.api`: Backend API.
  - `infra/Dockerfile.worker`: Celery background worker.
- [ ] Add GitHub Actions CI workflow for linting, testing, and automated deployment.

---

## 5. Security & Multi-Tenancy Rules

1. **Strict Tenant Isolation**:
   - Every tenant data table must include `tenant_id: UUID`.
   - All repository queries must enforce `.filter(Model.tenant_id == current_user.tenant_id)`.
2. **Secrets & Credentials**:
   - Zero hardcoded secrets in codebase. All secrets managed via environment variables and secret stores.
3. **Role-Based Access Control (RBAC)**:
   - System Roles: `SUPER_ADMIN`, `TENANT_ADMIN`, `MANAGER`, `USER`, `READ_ONLY`.

---

## 6. Estimated Infrastructure Cost (Commercial MVP)

| Tier | Component | Provider | Monthly Cost |
| :--- | :--- | :--- | :--- |
| **Frontend** | Static SPA CDN | Cloudflare Pages / Vercel | \$0 (Hobby / Pro \$20) |
| **Backend API** | Stateless Container | Render / AWS App Runner | \$7 – \$25 |
| **Worker** | Background Worker | Render Worker / AWS Fargate | \$7 – \$15 |
| **Database** | Managed PostgreSQL | Supabase / Neon | \$0 – \$25 |
| **Cache** | Serverless Redis | Upstash | \$0 – \$5 |
| **Vector DB** | Qdrant Cloud | Qdrant Managed Free Tier | \$0 – \$25 |
| **Total Estimated MVP Cost** | | | **\$14 – \$95 / month** |

