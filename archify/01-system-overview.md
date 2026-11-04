# 01 — System Architecture Overview

## 1. High-Level System Architecture Diagram

```mermaid
flowchart TD
    subgraph Clients["User Access & Client Layer"]
        MKT_CLI["Public Prospect Browser<br/>(http://localhost:5000)"]
        APP_CLI["Authenticated Tenant User<br/>(http://app.localhost:5001)"]
    end

    subgraph WebHosts["Web Tier (NGINX Reverse Proxy)"]
        WEB_MKT["Marketing Web Host (:5000)<br/>- Landing Page<br/>- Industry Solutions<br/>- Registration Intent"]
        WEB_APP["Authenticated App Host (:5001)<br/>- CRM Dashboard & Kanban<br/>- Vertical Industry Hub<br/>- Entitlement Badges"]
    end

    subgraph CoreBackend["Application & API Tier (:8001)"]
        API_GATEWAY["FastAPI Modular Monolith Engine<br/>(Uvicorn on Port 8001:8001)"]
        
        subgraph AuthSecurity["Triple Authorization Boundary"]
            AUTH_RESOLVER["get_current_tenant<br/>(Authoritative DB Resolution)"]
            IND_GUARD["require_industry_entitlement<br/>(Fail-Closed Tenant Check)"]
            ADMIN_GUARD["require_superadmin<br/>(Platform Separation)"]
        end

        subgraph CoreRouters["API Router Tree (/api/v1)"]
            R_AUTH["/auth (JWT, Registration, Me)"]
            R_CRM["/crm (Accounts, Leads, Pipeline)"]
            R_ADMIN["/admin (Superadmin Ops, MLOps, LLMOps)"]
            R_AI["/ai (RAG, CSI/Protocol/Tariff Analyzers)"]
        end

        subgraph VerticalRouters["Industry Vertical Modules"]
            R_CONST["/verticals/construction<br/>(SOV Calculator, Change Events, T&M)"]
            R_CLIN["/verticals/clinical<br/>(CTMS Funnel, 21 CFR 50 Consent)"]
            R_MAR["/verticals/maritime<br/>(Ocean Freight Tariffs, Timeline, HBL)"]
        end
    end

    subgraph WorkersAsync["Asynchronous Background Tier"]
        CELERY_WORKER["Celery Ingestion Worker<br/>(workers/ingestion.py)"]
    end

    subgraph DataStorage["Data & State Persistence Tier"]
        PG_DB[("PostgreSQL 16 (:5432)<br/>salesfortis DB<br/>33 Relational Tables")]
        REDIS_CACHE[("Redis 7 (:6379)<br/>Celery Broker & Caching")]
    end

    MKT_CLI -->|HTTP Requests| WEB_MKT
    APP_CLI -->|HTTP Requests| WEB_APP

    WEB_MKT -->|API Calls / Trial Signup| API_GATEWAY
    WEB_APP -->|Vite Proxy /api/v1| API_GATEWAY

    API_GATEWAY --> AUTH_RESOLVER
    AUTH_RESOLVER --> CoreRouters
    AUTH_RESOLVER --> IND_GUARD
    IND_GUARD --> VerticalRouters
    AUTH_RESOLVER --> ADMIN_GUARD
    ADMIN_GUARD --> R_ADMIN

    API_GATEWAY -->|SQLAlchemy ORM| PG_DB
    API_GATEWAY -->|Task Enqueue| REDIS_CACHE
    REDIS_CACHE -->|Consume Tasks| CELERY_WORKER
    CELERY_WORKER -->|Status & Embeddings| PG_DB
```

---

## 2. Implementation Status: Existing vs. Planned

| Subsystem | Existing Implementation | Planned Architecture |
| :--- | :--- | :--- |
| **Port Routing** | FastAPI running on `8001:8001`. Web running on `5000:80` (Marketing) and `5001:80` (CRM App). | Production domain routing (`www.salesfortis.com` and `app.salesfortis.com`) via Cloudflare. |
| **Authentication** | JWT Bearer tokens with server-side authoritative tenant extraction. No spoofing possible. | Enterprise SAML 2.0 / Okta SSO, OAuth2 Social Providers. |
| **Vertical Modules** | Fully mounted routers under `/api/v1/verticals/{construction,clinical,maritime}` protected by fail-closed dependency injection. | Industry-specific webhook receivers and external partner API integrations. |
| **Background Processing** | Celery worker with synchronous mock fallback during development/testing. | Dedicated queue isolation: `ingestion_queue`, `llm_scoring_queue`, `notification_queue`. |

