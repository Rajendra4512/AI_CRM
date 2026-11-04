# 04 — API & Service Layer Architecture

## 1. FastAPI Route Hierarchy & Dependencies

```mermaid
flowchart TD
    APP["FastAPI Application (apps/api/main.py)<br/>Port: 8001"]
    
    subgraph Middlewares["Middleware Stack"]
        CORS["CORSMiddleware (Allow localhost:5000, 5001)"]
        ERR["Global Exception & Validation Handler"]
    end

    subgraph AuthDependencies["Dependency Injection Chain"]
        GET_DB["get_db -> Session"]
        GET_USER["get_current_user -> User (Validates JWT)"]
        GET_TENANT["get_current_tenant -> Tenant (Authoritative DB lookup)"]
        REQ_SUPER["require_superadmin -> User (is_superadmin == True)"]
        REQ_IND["require_industry_entitlement(industry) -> Tenant (Fail-closed check)"]
    end

    subgraph PublicRouters["Public / Core Endpoints"]
        R_HEALTH["GET /api/health"]
        R_AUTH["POST /api/v1/auth/login<br/>POST /api/v1/auth/register<br/>POST /api/v1/auth/logout<br/>GET /api/v1/auth/me"]
    end

    subgraph CRMRouters["CRM Endpoints (/api/v1/crm)"]
        R_LEADS["GET/POST /leads, DELETE /leads/{id}"]
        R_ACCOUNTS["GET/POST /accounts"]
        R_OPPS["GET/POST /opportunities, PATCH /opportunities/{id}/stage"]
    end

    subgraph AdminRouters["Platform Administration (/api/v1/admin)"]
        R_ADMIN_DASH["GET /dashboard"]
        R_TENANTS["GET /tenants (DB-backed)"]
        R_AUDIT["GET /audit-logs (DB-backed)"]
        R_LLMOPS["GET /llmops/providers"]
        R_MLOPS["GET /mlops/models"]
    end

    subgraph AIRouters["AI & RAG Endpoints (/api/v1/ai)"]
        R_RAG_UP["POST /upload, GET /documents, GET /documents/{id}"]
        R_RAG_TXT["POST /index-text"]
        R_RAG_QRY["POST /query (Prompt-Injection Sanitized)"]
        R_CSI["POST /analyze-spec (construction)"]
        R_CLN_AI["POST /analyze-protocol (clinical)"]
        R_MAR_AI["POST /extract-rate-sheet & /upload-tariff (maritime)"]
    end

    subgraph VerticalRouters["Industry Vertical Endpoints (/api/v1/verticals)"]
        subgraph ConRouter["/construction (require_industry_entitlement('construction'))"]
            R_SOV_CALC["POST /sov/calculate"]
            R_SOV_APPS["GET/POST /sov/applications, PATCH /{id}/approve, GET /{id}/export"]
            R_CE["GET/POST /change-events, PATCH /{id}/status"]
            R_TM["POST /field-tm"]
        end

        subgraph ClinRouter["/clinical (require_industry_entitlement('clinical'))"]
            R_CLN_MET["GET /metrics"]
            R_CLN_REF["GET/POST /referrals (Safe Harbor PHI Guard)"]
            R_CLN_CON["POST /verify-consent & POST /revoke-consent"]
            R_CLN_CRIT["PATCH /criteria/{id}/verify"]
            R_CLN_TSK["GET/POST /follow-ups"]
        end

        subgraph MarRouter["/maritime (require_industry_entitlement('maritime'))"]
            R_MAR_QUOTE["POST /quote"]
            R_MAR_TIME["GET/POST /shipments/{bl_number}/timeline & /milestones"]
            R_MAR_HBL["POST /hbl"]
            R_MAR_TAR["GET /rate-cards & POST /rate-cards/{id}/approve"]
            R_MAR_TRK["GET /tracking/{bl_number} (contract_stub)"]
        end
    end

    APP --> Middlewares
    Middlewares --> AuthDependencies
    AuthDependencies --> PublicRouters
    AuthDependencies --> CRMRouters
    REQ_SUPER --> AdminRouters
    AuthDependencies --> AIRouters
    REQ_IND --> VerticalRouters
```

---

## 2. Service Layer Class Diagram

```mermaid
classDiagram
    class ConstructionSOVService {
        +calculate_sov_application(lines, retainage_rate_pct) Dict
        +persist_sov_application(db, tenant_id, project_id, ...) SOVApplication
        +list_sov_applications(db, tenant_id, project_id) List
        +create_change_event(db, tenant_id, ...) ChangeEvent
        +update_change_event_status(db, tenant_id, id, status) ChangeEvent
        +log_field_tm(db, tenant_id, ...) FieldTimeMaterial
    }

    class ClinicalComplianceService {
        +get_or_create_demo_study(db, tenant_id) Study
        +get_funnel_metrics(db, tenant_id, study_id) Dict
        +list_referrals(db, tenant_id, study_id) List
        +verify_and_randomize(db, tenant_id, patient_id, consent_signed, user_id) Dict
        +create_followup_task(db, tenant_id, ...) FollowUpTask
    }

    class MaritimeFreightService {
        +calculate_freight_quote(db, tenant_id, trade_lane, ...) Dict
        +get_shipment_timeline(db, tenant_id, bl_number) Dict
        +generate_house_bill_of_lading(db, tenant_id, ...) HouseBillOfLading
        +check_demurrage_risk(db, tenant_id, bl_number) Dict
    }

    class RAGService {
        -_vector_store: Dict
        +chunk_text(text, chunk_size, chunk_overlap) List~str~
        +index_document(tenant_id, document_id, filename, text) int
        +query(tenant_id, query_text, top_k) Dict
    }
```

---

## 3. Implementation Status: Existing vs. Planned

| Component | Existing Implementation | Planned Architecture |
| :--- | :--- | :--- |
| **Dependency Injection** | Strict hierarchy: `get_current_tenant` authoritatively verifies tenant before router execution. | Scoped request context carrying audit correlation IDs and execution spans. |
| **Service Layer Pattern** | Modular service classes in `modules/*/service.py` decoupling business logic from HTTP handlers. | Domain Event Bus broadcasting asynchronous change events to Celery / Webhooks. |
| **API Versioning** | Standard prefix `/api/v1/`. | API rate-limiting per subscription tier via Redis token bucket. |

