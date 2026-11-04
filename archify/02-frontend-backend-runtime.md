# 02 — Frontend-to-Backend Runtime Architecture

## 1. Runtime Execution & Request Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Estimator / Coordinator
    participant Web as React 19 Frontend (Port 5001)
    participant Proxy as Vite Dev Proxy / NGINX (:80)
    participant Auth as Auth Dependency Layer
    participant API as FastAPI Router
    participant Service as Domain Service Layer
    participant DB as PostgreSQL Database

    User->>Web: Clicks Action (e.g. Save SOV Application or Verify Consent)
    Web->>Web: Validates client inputs & displays optimistic UI
    Web->>Proxy: POST /api/v1/verticals/{vertical}/{action} [Bearer Token]
    Proxy->>API: Forwards request to FastAPI (Port 8001)
    
    API->>Auth: get_current_user(token)
    Auth->>DB: Query User record by email claim
    DB-->>Auth: Return User entity
    
    API->>Auth: get_current_tenant(user)
    Auth->>DB: Query Tenant by user.tenant_id
    DB-->>Auth: Return Tenant entity (with tenant.industry)
    
    API->>Auth: require_industry_entitlement(vertical)
    alt Tenant is NOT entitled to requested vertical
        Auth-->>Web: HTTP 403 Forbidden ("Access denied: Tenant not entitled")
        Web-->>User: Display Entitlement Error Toast
    else Tenant is authorized
        Auth-->>API: Authorized Tenant & User Context
        API->>Service: Call domain method (e.g. persist_sov_application)
        Service->>DB: Transactional insert/update with tenant_id foreign key
        DB-->>Service: Commit confirmed
        Service-->>API: Domain result payload
        API-->>Web: HTTP 200 OK (JSON payload)
        Web-->>User: Update UI state & show success confirmation
    end
```

---

## 2. Frontend Component Hierarchy (`apps/web/src`)

```mermaid
flowchart TD
    MAIN["main.tsx (Root Render)"]
    APP["App.tsx (Routing & Navigation State)"]
    
    subgraph SharedDesignSystem["Shared Enterprise Design System (components/)"]
        ICONS["Icons.tsx<br/>- Vector SVG Domain & Action Icons<br/>- BrandMark"]
        EW["EnterpriseWorkbench.tsx<br/>- KpiTelemetryStrip<br/>- SubModuleNav (ARIA tablist)<br/>- LifecycleStepper<br/>- EnterpriseFilterableTable"]
    end

    subgraph PublicViews["Public Executive Views (localhost:5000)"]
        LANDING["Welcome.tsx<br/>- Interactive Hero Workbench Preview<br/>- 3 Vertical Edition Cards"]
        VERT_CONST["ConstructionMarketing.tsx<br/>- AIA G702/G703 & PCO Preview<br/>- /register?industry=construction"]
        VERT_CLIN["ClinicalMarketing.tsx<br/>- 21 CFR 50/11 & Safe Harbor Preview<br/>- /register?industry=clinical"]
        VERT_MAR["MaritimeMarketing.tsx<br/>- Tariff, HBL & LFD Control Preview<br/>- /register?industry=maritime"]
    end

    subgraph AuthViews["Authentication & Sandbox Provisioning (/login, /register)"]
        LOGIN["Login.tsx<br/>- Split-Screen Enterprise Auth<br/>- Tenant Registration & 1-Click Isolated Sandboxes"]
    end

    subgraph AppViews["Authenticated Workspace Portal (localhost:5001)"]
        LAYOUT["AppLayout.tsx<br/>- Authoritative /auth/me Sync & Sub-Module Nav<br/>- Slide-Over Tenant Document RAG Copilot<br/>- Audited Session Logout Guard"]
        DASH["Dashboard.tsx<br/>- Live API Telemetry Sync<br/>- Domain Workbench Launchpad"]
        PIPELINE["LeadsPipeline.tsx<br/>- Dual Kanban + Tabular Register<br/>- /api/v1/crm/opportunities Sync"]
        ADMIN["AdminConsole.tsx<br/>- Superadmin Governance & Audit"]
        
        subgraph VerticalHubComponent["VerticalHub.tsx (?vertical=...&sub=...)"]
            V_SWITCH["Strict Entitlement Gate<br/>(Zero Cross-Vertical Leakage)"]
            V_CON_WB["workbenches/ConstructionWorkbench.tsx<br/>- Multi-Line G703 SOV & CSV Export<br/>- PCO State Machine & Field T&M<br/>- CSI MasterFormat Spec Delta AI"]
            V_CLN_WB["workbenches/ClinicalWorkbench.tsx<br/>- 21 CFR 50 eICF & Revocation<br/>- Safe Harbor PHI 422 Referral Guard<br/>- Coordinator Queue & Protocol CRC AI"]
            V_MAR_WB["workbenches/MaritimeWorkbench.tsx<br/>- BAF/THC/PSS Ocean Quoter<br/>- Container Milestones, LFD & DCSA<br/>- Tariff AI Approval & HBL Desk"]
        end
    end

    MAIN --> APP
    APP --> PublicViews
    APP --> AuthViews
    APP --> AppViews
    
    LAYOUT --> DASH
    LAYOUT --> PIPELINE
    LAYOUT --> ADMIN
    LAYOUT --> VerticalHubComponent
    
    VerticalHubComponent --> V_SWITCH
    V_SWITCH --> V_CON_WB
    V_SWITCH --> V_CLN_WB
    V_SWITCH --> V_MAR_WB
    EW --> V_CON_WB
    EW --> V_CLN_WB
    EW --> V_MAR_WB
    ICONS --> LAYOUT
    ICONS --> PublicViews
```

---

## 3. Implementation Status: Existing vs. Planned

| Layer | Existing Implementation | Planned Architecture |
| :--- | :--- | :--- |
| **Vite / Nginx Proxy** | Configured in `apps/web/vite.config.ts` (`:5001` / `:4173`) and `infra/nginx.conf` (`:5000` / `:5001` in Docker): `/api` forwards to FastAPI (`:8001`). | Production multi-domain DNS resolution (`www.salesfortis.com` / `app.salesfortis.com`) with automated TLS. |
| **State Management** | React 19 hooks (`useState`, `useEffect`, `useSearchParams`) synced with live FastAPI/PostgreSQL endpoints plus resilient preview fallback. | Optimistic cache invalidation and real-time WebSocket event push. |
| **Design System & Workbenches** | Original SalesFortis enterprise design tokens (`Inter` + `JetBrains Mono` tabular numerals), vector `Icons.tsx`, reusable `EnterpriseWorkbench.tsx` primitives (ARIA `tablist`, searchable/filterable data tables, lifecycle steppers), and 3 deep isolated workbenches verified via REA (`ev_fe2e126d...`) and 16 Playwright E2E tests. | Tenant-customizable white-label theme tokens and printable AIA G702/G703 & HBL PDF export templates. |

