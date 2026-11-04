# 02 - Shared Platform Dependency Matrix & Microservices-Ready Module Boundaries

## 1. Overview
The SalesFortis platform is architectured as a clean modular monolith deploying inside a single container topology today, while enforcing strict domain isolation and decoupled database ownership so that individual modules can be extracted into independent microservices in the future without architectural redesign.

```
+----------------------------------------------------------------------------------------------------+
|                                    SALESFORTIS MODULAR MONOLITH                                    |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   +--------------------------------------------------------------------------------------------+   |
|   |                      Module 1: Identity, Tenancy & Platform Administration                |   |
|   |  - Owns: `tenants`, `users`, `roles`, `system_config` tables                                |   |
|   |  - Responsibilities: JWT authentication, tenant provisioning, industry entitlement tokens |   |
|   |  - Public Service Contract: `auth_service.py`, `require_industry_entitlement(...)`          |   |
|   +--------------------------------------------------------------------------------------------+   |
|            |                                    |                                    |             |
|            v                                    v                                    v             |
|   +------------------+                 +------------------+                 +------------------+   |
|   |    Module 2:     |                 |    Module 3:     |                 |    Module 4:     |   |
|   |   Construction   |                 | Clinical Trials  |                 |     Maritime     |   |
|   |  Subcontractor   |                 |       CTMS       |                 | Freight Brokerage|   |
|   |                  |                 |                  |                 |                  |   |
|   | - Owns:          |                 | - Owns:          |                 | - Owns:          |   |
|   |   `projects`     |                 |   `studies`      |                 |   `rate_cards`   |   |
|   |   `rfqs`         |                 |   `sites`        |                 |   `quotations`   |   |
|   |   `estimates`    |                 |   `referrals`    |                 |   `shipments`    |   |
|   |   `sov_apps`     |                 |   `consent_evid` |                 |   `milestones`   |   |
|   |   `change_events`|                 |   `elig_criteria`|                 |   `hbl_docs`     |   |
|   |   `field_tm`     |                 |   `followup_task`|                 |                  |   |
|   |                  |                 |                  |                 |                  |   |
|   | - Contract:      |                 | - Contract:      |                 | - Contract:      |   |
|   |   SOV Service    |                 |   Clinical Serv. |                 |   Maritime Serv. |   |
|   |   Router:        |                 |   Router:        |                 |   Router:        |   |
|   |   /construction  |                 |   /clinical      |                 |   /maritime      |   |
|   +------------------+                 +------------------+                 +------------------+   |
|            \                                    |                                    /             |
|             +-----------------------------------+-----------------------------------+              |
|                                                 |                                                  |
|                                                 v                                                  |
|   +--------------------------------------------------------------------------------------------+   |
|   |                      Module 5: Shared Document Intelligence & AI Engine                    |   |
|   |  - Owns: `documents`, `document_chunks`, Qdrant Vector Collections                         |   |
|   |  - Responsibilities: Multi-tenant vector retrieval, PDF ingestion, LiteLLM embeddings      |   |
|   |  - Contract: `RAGService.index_document()`, `RAGService.query()`                           |   |
|   +--------------------------------------------------------------------------------------------+   |
|                                                                                                    |
|   +--------------------------------------------------------------------------------------------+   |
|   |                      Module 6: Core CRM Persistence & Shared Pipelines                     |   |
|   |  - Owns: `accounts`, `contacts`, `leads`, `opportunities`, `audit_logs`                    |   |
|   |  - Responsibilities: Standard CRM sales pipelines, activities, customer entity records    |   |
|   |  - Contract: `crm_service.py`, `/api/v1/crm/*`                                             |   |
|   +--------------------------------------------------------------------------------------------+   |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Microservices Extraction Readiness Analysis

To ensure future service extraction is practical without rewriting code:

| Module | Data Ownership | External Dependencies | Extraction Order | Extraction Complexity | Communications Pattern |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Module 5: AI & RAG Engine** | `documents`, `document_chunks`, Vector Store | Identity (tenant context only) | **1st** (Earliest) | Low | Asynchronous gRPC / REST worker consuming document ingestion jobs. |
| **Module 2: Construction Subcontractor** | `sov_*`, `change_events`, `field_tm`, `projects`, `rfqs` | Identity, Core CRM (Account FKs) | **2nd** | Medium | REST / OpenAPI microservice using JWT claims for auth. |
| **Module 4: Maritime Logistics** | `rate_cards`, `quotations`, `shipments`, `milestone_events`, `house_bills_of_lading` | Identity, Core CRM | **3rd** | Medium | Independent container with ocean tracking webhook listeners. |
| **Module 3: Clinical Trials CTMS** | `studies`, `sites`, `referrals`, `consent_evidences`, `eligibility_criteria` | Identity (Strict 21 CFR Part 50 isolation) | **4th** | High (Regulatory audit trail required) | Dedicated high-compliance microservice with isolated database. |
| **Module 1: Identity & Tenancy** | `tenants`, `users`, `roles` | None (Foundation) | **5th** (Core Service) | High | Central OAuth2 / OIDC Auth Provider (Keycloak / Custom). |
| **Module 6: Core CRM** | `accounts`, `contacts`, `leads`, `opportunities` | Identity | Core Monolith Kernel | Medium | Shared enterprise data graph. |

---

## 3. Strict Inter-Module Communication Invariants

1. **Zero Cross-Module Direct DB Writes**:
   - `modules/construction` NEVER directly inserts or modifies rows in `studies` or `rate_cards`.
   - `modules/clinical` NEVER queries `sov_applications` directly.
   - Any shared entity interaction must pass through public service contracts (`core/services/` or public domain interfaces).
2. **Explicit Transaction Boundaries**:
   - Every domain transaction executes in its own session block. No distributed 2-phase commits across modules.
3. **Correlation IDs & Audit Logging**:
   - Privileged operations across all modules record `actor_id`, `tenant_id`, and `timestamp` in `audit_logs`.
4. **No Process-Local Mutable Dictionaries for Business Data**:
   - All critical domain records persist strictly to the relational database.
