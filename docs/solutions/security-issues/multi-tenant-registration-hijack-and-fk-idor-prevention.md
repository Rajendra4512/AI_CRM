---
module: auth_and_tenant_isolation
date: 2026-11-04
problem_type: security_issue
component: authentication
severity: critical
symptoms:
  - "Registering with an existing Tenant.name silently attached an unauthenticated user to that tenant and issued a valid JWT"
  - "Submitting an incorrect password for an already-seeded demo account triggered SQLAlchemy IntegrityError (HTTP 500) on users.email"
  - "Catch-all route returned HTTP 200 JSON on nonexistent /api/* GET paths, masking broken vertical endpoint paths during tests"
  - "Isolated vertical test suites failed with NoReferencedTableError when cross-module foreign keys (rfqs.account_id -> accounts.id) lacked explicit model imports"
root_cause: missing_validation
resolution_type: code_fix
---

# Multi-Tenant Registration Hijack, Catch-All Masking, and Cross-Module FK Isolation Fixes

## Context

During Phases 2–5 of the SalesFortis Multi-Vertical AI CRM execution, Compound Engineering proof-first testing (`ce-work`) and adversarial security review (`ce-code-review`) uncovered four subtle defects across authentication, routing, and SQLAlchemy metadata registration.

## Findings & Root Causes

1. **Cross-Tenant Registration Hijacking (`apps/api/routers/auth.py`)**:
   - `register()` queried `Tenant.name == request.company_name` and reused the existing `Tenant` record if found, allowing any unauthenticated caller who knew a customer's organization name to provision an active `User` inside that tenant.
2. **Demo Seeding IntegrityError (`apps/api/routers/auth.py`)**:
   - `login()` checked `if not user or not verify_password(...)` and entered the demo-user creation branch even when `demo@salesfortis.com` already existed, causing a duplicate-key `IntegrityError` (`HTTP 500`) instead of `HTTP 401`.
3. **API Catch-All Status Masking (`apps/api/main.py`)**:
   - `catch_all("/{full_path:path}")` returned a plain dict `{"error": "API route not found"}` with HTTP `200 OK` on unmatched `/api/*` `GET` routes instead of raising `HTTPException(status_code=404)`.
4. **Cross-Tenant Foreign-Key IDOR & Isolated Metadata Order (`core/services/crm_service.py`, `modules/construction/models.py`)**:
   - `create_opportunity` accepted `account_id` without verifying `Account.tenant_id == tenant_id`, and `modules/construction/models.py` referenced `ForeignKey("accounts.id")` without importing `core.models.crm`.

## Resolution

- **Fail-Closed Organization Provisioning**: `register()` now performs a case-insensitive check on `Tenant.name` and rejects collisions with `HTTP 400`, creating `Tenant`, `User`, and `AuditLog("auth.tenant.registered")` in a single transaction.
- **Guarded Demo Seeding**: Demo account seeding executes only when `user is None` and demo credentials match; invalid passwords deterministically return `HTTP 401`.
- **True HTTP 404 on Unknown API Paths**: `catch_all` raises `HTTPException(status_code=404)` for any unmatched `api/*` path.
- **Explicit Tenant FK Ownership & Model Registration**: Every cross-entity reference (`project_id`, `study_id`, `account_id`, `document_id`) validates `tenant_id` ownership before insert/read/export, and `apps/api/main.py` + `modules/construction/models.py` explicitly import core models before `Base.metadata.create_all()`.

## Prevention Checklist

- Never attach unauthenticated self-service registrations to an existing `Tenant`; require signed admin invitations for existing workspaces.
- Always assert negative cross-tenant read/write/delete/export and cross-FK linking in `tests/test_security_boundaries.py`.
- Never return plain dictionaries from FastAPI fallback handlers for `/api/*` prefixes; raise `HTTPException(status_code=404)`.

