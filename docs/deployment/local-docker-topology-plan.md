# SalesFortis — Local Docker Deployment Topology & Multi-Host Routing

## 1. Architecture Overview

SalesFortis operates as a modular monolith serving two distinct user access points:
1. **Public Marketing Experience**: `http://localhost:5000` (mapped to `www.salesfortis.com` in production)
2. **Authenticated SaaS CRM Application**: `http://app.localhost:5001` (mapped to `app.salesfortis.com` in production)
3. **Core API & Service Layer**: `http://localhost:8001` (`/api/v1`)

```
                          [ Client Browser ]
                                  |
         +------------------------+------------------------+
         |                                                 |
         v (Port 5000)                                     v (Port 5001)
+-----------------------+                         +-----------------------+
|  Marketing Web Host   |                         |  Authenticated App    |
| (www.salesfortis.com) |                         | (app.salesfortis.com) |
| - Landing Page        |                         | - Dashboard / Pipeline|
| - Vertical Solutions  |                         | - Industry CRM Hub    |
| - Pricing & Trials    |                         | - Multi-Tenant Admin  |
+-----------------------+                         +-----------------------+
         | (Registration / Trial Intent)                   | (API Calls / Auth)
         +------------------------+------------------------+
                                  |
                                  v (Port 8001)
                     +--------------------------+
                     |  FastAPI Backend Engine  |
                     | - Industry Entitlements  |
                     | - Multi-Tenant Auth      |
                     | - Domain Vertical APIs   |
                     +--------------------------+
                       /          |           \
                      v           v            v
               [ PostgreSQL ]  [ Redis ]   [ Celery Worker ]
                 (Port 5432)  (Port 6379)    (RAG / Async)
```

---

## 2. Customer Journey & Host Separation

### 2.1 Marketing Portal (`http://localhost:5000`)
- **Root Landing**: Industry selection cards for:
  1. Commercial Subcontractor CRM
  2. Clinical Trials CTMS
  3. Maritime Freight CRM
- **Industry Vertical Pages**:
  - `/vertical/construction`: CSI MasterFormat AI, AIA G702/G703 SOV billing, Change Orders.
  - `/vertical/clinical`: Protocol intelligence, 21 CFR Part 50 consent compliance, recruitment analytics.
  - `/vertical/maritime`: Carrier rate tariffs, multi-surcharge engine, container demurrage tracking.
- **Onboarding & Registration Intent**:
  - Submitting registration or starting a free trial records the selected `industry` and redirects the user with an authentication session token to `http://app.localhost:5001/login` or `http://app.localhost:5001/app/dashboard`.

### 2.2 Authenticated Application Portal (`http://app.localhost:5001`)
- **Tenant Context**: Derives tenant identity and authorized `industry` directly from the authenticated session token.
- **Industry Isolation**: Displays only the vertical hub, metrics, and workflows matching the tenant's entitled industry. Tenants without cross-industry entitlements cannot view or query non-entitled vertical features.

---

## 3. Docker Service Configuration Plan

| Container Name | Base Image / Dockerfile | Exposed Port | Role & Dependencies |
| :--- | :--- | :--- | :--- |
| `salesfortis-postgres` | `postgres:16-alpine` | `5432:5432` | Relational database (33 tables migrated via Alembic). |
| `salesfortis-redis` | `redis:7-alpine` | `6379:6379` | Cache & Celery task broker. |
| `salesfortis-api` | `infra/Dockerfile.api` | `8001:8001` | FastAPI backend application. Depends on `postgres` & `redis`. |
| `salesfortis-worker` | `infra/Dockerfile.worker` | - | Background task execution for PDF ingestion & LiteLLM embedding. |
| `salesfortis-marketing` | `infra/Dockerfile.web` | `5000:80` | NGINX serving static production build of marketing routes. |
| `salesfortis-app` | `infra/Dockerfile.web` | `5001:80` | NGINX serving static production build of authenticated `/app` routes. |

---

## 4. Resource & Laptop Constraint Safeguards
- Single combined web container or NGINX reverse-proxy configuration to keep memory consumption low.
- Healthcheck intervals set to 5s with 5 retries.
- Persistent volumes for `postgres_data` and `redis_data`.

