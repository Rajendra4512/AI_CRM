# 03 - Coordinated Three-Industry Implementation Plan (Strong Isolation & Extraction Ready)

## 1. Executive Mandate
In strict accordance with the master engineering plan and architectural amendment:
**ALL THREE INDUSTRY SUITES MUST BE DEVELOPED TOGETHER.**
No vertical is deferred or omitted.

The system enforces:
1. **Strong Multi-Tenant Isolation**: Tenant A cannot access Tenant B's data under any circumstance.
2. **Strict Industry-Vertical Authorization**: Construction, Clinical, and Maritime modules cannot be cross-accessed without verified entitlement.
3. **Decoupled Module Ownership**: Clean service interfaces preparing each vertical for future microservice extraction.

```
+----------------------------------------------------------------------------------------------------+
|                                    COORDINATED PHASE ROADMAP                                       |
+----------------------------------------------------------------------------------------------------+
| Phase 0: Plan Reconciliation & Strong Isolation Architecture (AMENDMENT COMPLETED)                 |
|   - Reconcile customer journey (5000 marketing -> 5001 authenticated CRM)                         |
|   - Define triple authorization boundaries (Tenant, Industry Entitlement, RBAC/Superadmin)         |
|   - Define decoupled module ownership and extraction readiness criteria                            |
+----------------------------------------------------------------------------------------------------+
| Phase 1: Security Foundation & Strong Isolation Enforcement (NEXT IMPLEMENTATION SPRINT)           |
|   - Add non-destructive `industry` column to `Tenant` model via Alembic                            |
|   - Implement `require_industry_entitlement` backend dependency in `auth_service.py`               |
|   - Guard vertical API routers with server-side industry entitlement checks                         |
|   - Industry-aware registration and transactional tenant provisioning                               |
|   - Cross-tenant & cross-industry negative security tests (`test_industry_isolation.py`)            |
|   - Industry-scoped frontend navigation on app.localhost:5001                                      |
+----------------------------------------------------------------------------------------------------+
| Phase 2: Domain Intelligence & Document Extraction                                                 |
|   - CSI MasterFormat specification parsing (Construction)                                         |
|   - Protocol eligibility criteria extraction (Clinical)                                            |
|   - Ocean carrier tariff sheet normalization (Maritime)                                            |
|   - Document retrieval scoped strictly to authenticated tenant context                             |
+----------------------------------------------------------------------------------------------------+
| Phase 3: Operational Controls & Audit Guardrails                                                   |
|   - Potential Change Order (PCO) formal approval workflow                                         |
|   - 21 CFR Part 50 / GCP electronic consent audit trail verification                              |
|   - Demurrage / Detention Last Free Day automated alerting                                         |
+----------------------------------------------------------------------------------------------------+
| Phase 4: Multi-Host Deployment & Commercial Flow                                                   |
|   - Marketing host on localhost:5000 (industry solutions, pricing, trial initiation)              |
|   - Application host on app.localhost:5001 (authenticated vertical dashboard)                     |
|   - Dual-host CORS, session validation, and redirects                                              |
+----------------------------------------------------------------------------------------------------+
| Phase 5: Verification & Production Readiness Gate                                                  |
|   - Security verification matrix (cross-tenant, cross-industry, IDOR, forged claims)               |
|   - Clean Docker build & service health verification                                               |
|   - Independent GO/NO-GO release assessment for each suite                                         |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Microservices Extraction Boundaries per Vertical

### 2.1 Construction Module (`modules/construction/`)
- **Owned Tables**: `projects`, `rfqs`, `estimates`, `sov_applications`, `sov_line_items`, `change_events`, `field_time_materials`.
- **API Boundary**: `/api/v1/verticals/construction/*`
- **Future Extraction Path**: Can be isolated into a standalone container communicating with the core platform via REST/gRPC using tenant-scoped JWT tokens.

### 2.2 Clinical Module (`modules/clinical/`)
- **Owned Tables**: `studies`, `sites`, `referrals`, `consent_evidences`, `eligibility_criteria`, `clinical_followup_tasks`.
- **API Boundary**: `/api/v1/verticals/clinical/*`
- **Future Extraction Path**: High-compliance microservice running in an isolated VPC or database schema for strict HIPAA / 21 CFR Part 11 isolation.

### 2.3 Maritime Module (`modules/maritime/`)
- **Owned Tables**: `enquiries`, `quotations`, `shipments`, `rate_cards`, `milestone_events`, `house_bills_of_lading`.
- **API Boundary**: `/api/v1/verticals/maritime/*`
- **Future Extraction Path**: Independent rate calculator & tracking webhook ingestion service.
