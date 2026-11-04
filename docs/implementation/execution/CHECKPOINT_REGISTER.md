# SalesFortis — Checkpoint Register

| Checkpoint ID | Phase | Description | Status | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **P1-C01** | Phase 1 | Baseline and Recovery Verification | **COMPLETE** | Inspected Git commit `080bf16`, recorded baseline state. |
| **P1-C02** | Phase 1 | Fail-Closed Industry Entitlement Model | **COMPLETE** | Added `industry` column to `tenants` (Alembic `c7f1a8e2d39b`). Fail-closed, no `"all"` default. |
| **P1-C03** | Phase 1 | Trusted Server-Side Authorization Context | **COMPLETE** | `get_current_tenant` derives tenant from authoritative DB record, not client headers. |
| **P1-C04** | Phase 1 | Backend Industry Isolation Router Guards | **COMPLETE** | Applied `require_industry_entitlement` to Construction, Clinical, and Maritime routers. |
| **P1-C05** | Phase 1 | Industry-Aware Registration & Provisioning | **COMPLETE** | `/api/v1/auth/register` validates and assigns `industry` transactionally to `Tenant`. |
| **P1-C06** | Phase 1 | Industry-Specific Frontend Navigation | **COMPLETE** | Scoped navigation in `VerticalHub` & `AppLayout` with entitlement badges. |
| **P1-C07** | Phase 1 | Superadmin & RBAC Privilege Separation | **COMPLETE** | Protected `apps/api/routers/admin.py` with `require_superadmin`. Standard users receive HTTP 403. |
| **P1-C08** | Phase 1 | Negative Security Test Suite | **COMPLETE** | Created `tests/test_industry_isolation.py` (5/5 negative security tests passing). |
| **P1-C09** | Phase 1 | Phase 1 Verification & Acceptance Gate | **COMPLETE** | 40/40 pytest tests passing, 8/8 Playwright E2E tests passing, port `8001` verified. |
| **P2-C01** | Phase 2 | Archify Blueprints & Graphifyy Memory Graph | **COMPLETE** | Generated `archify/01..08` and `graphify/` AST knowledge graph & callflow HTML. |
| **P2-C02** | Phase 2 | Domain Intelligence & Shared AI/RAG Pipeline | **COMPLETE** | DB-backed `Document`/`DocumentChunk`, prompt-injection guard, CSI diff, clinical verify, tariff staging (`12/12` pytest). |
| **P3-C01** | Phase 3 | Operational Controls & Audit Guardrails | **COMPLETE** | `AuditService`, SOV N-1 carry-forward + approval + CSV export, consent revocation + PHI guard, LFD demurrage (`17/17` pytest). |
| **P4-C01** | Phase 4 | Marketing, Auth Security, Customer Journey & Docker | **COMPLETE** | Closed registration hijack & demo 500 bug, added `/logout`, explicit CORS, loopback DB, **11/11** Playwright E2E + `playwright-cli` (`0` errors). |
| **P5-C01** | Phase 5 | Final Security Verification, Graph Sync & Release Gate | **COMPLETE** | Closed CRM `account_id` IDOR, added `test_security_boundaries.py`, **50/50** pytest, synced `graphify/` (`1,529` nodes) & `archify/`, updated docs `11`–`15`. |
