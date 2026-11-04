# SalesFortis — Phase 0 Plan Reconciliation and Phase 1 Readiness

You have already completed Phase 0 of the AI_CRM Master Composite Engineering Plan.

Do not repeat Phase 0 or recreate the implementation documents from scratch.

Your next task is to UPDATE the existing implementation plan to reflect finalized product architecture decisions.

## 1. Final Product Architecture

The product brand is SalesFortis.

SalesFortis is one SaaS CRM platform offering three industry-specific solutions:

1. Construction CRM
2. Clinical Trials CRM
3. Maritime Logistics CRM

All three verticals must be developed together within the existing React, FastAPI, PostgreSQL and Docker modular monolith.

Preserve all existing functionality.

## 2. Final Customer Journey

Production:

www.salesfortis.com
→ Select Industry
→ Industry-Specific Marketing Website
→ Industry-Specific Features and Pricing
→ Free Trial or Paid Subscription
→ Registration
→ Tenant Provisioning
→ app.salesfortis.com
→ Industry-Specific CRM

Local Docker:

http://localhost:5000

http://app.localhost:5001

The main SalesFortis website must retain shared branding while providing industry-specific marketing experiences.

The authenticated application must display only the features authorized for the tenant's selected industry and subscription.

## 3. Mandatory Security Architecture

Implement and verify three separate authorization boundaries:

### Tenant isolation

Tenant A cannot access Tenant B's records, documents, AI retrieval results, billing information or administrative resources.

### Industry isolation

Construction tenants cannot access Clinical or Maritime functionality without explicit entitlement.

Clinical tenants cannot access Construction or Maritime functionality without explicit entitlement.

Maritime tenants cannot access Construction or Clinical functionality without explicit entitlement.

### User authorization

Enforce tenant-specific RBAC, object-level permissions and separate platform Superadmin privileges.

Authorization must be enforced by backend APIs and appropriate database controls, not frontend navigation alone.

## 4. Industry-Aware Registration and Billing

The selected industry must flow securely through:

Marketing → Pricing → Registration → Trial/Payment → Tenant Creation → Application Onboarding.

Implement or verify:

- Industry-specific pricing plans
- Industry-specific free trials
- Backend-validated industry entitlements
- Subscription feature limits
- Secure payment processing
- Trial expiry
- Seat limits
- Registration abuse protection
- Transactional or recoverable tenant provisioning
- Prevention of duplicate tenant creation

Never trust browser-supplied entitlement values.

## 5. Deployment Architecture

Prepare the existing application for local Docker deployment.

Required URLs:

Marketing: http://localhost:5000

CRM Application: http://app.localhost:5001

Preserve the existing modular monolith.

Verify frontend routing, backend API access, authentication redirects, PostgreSQL connectivity, Docker networking, persistent storage and resource usage.

Do not introduce unnecessary containers or services.

Do not deploy to the public internet.

## 6. Reconcile Existing Phase 0 Documents

Read all existing files under:

docs/implementation/

Do not discard previous findings.

Update the following documents where necessary:

- 01-current-codebase-verification.md
- 02-shared-platform-dependency-matrix.md
- 03-three-industry-implementation-plan.md
- 04-construction-technical-plan.md
- 05-clinical-technical-plan.md
- 06-maritime-technical-plan.md
- 07-shared-ai-rag-enhancement-plan.md
- 08-database-and-migration-plan.md
- 09-security-and-tenant-isolation-plan.md
- 10-focused-test-strategy.md
- 11-commercial-readiness-checklist.md
- 12-implementation-progress-tracker.md

Add the finalized SalesFortis customer journey, security boundaries and deployment requirements to the relevant existing documents.

Avoid unnecessary duplicate documentation.

If a dedicated deployment document is needed, create it under docs/deployment/.

## 7. Perform a Targeted Gap Assessment

Inspect only the code relevant to the newly finalized requirements.

Determine whether the following are:

IMPLEMENTED / PARTIAL / MISSING / BLOCKED

- SalesFortis branding
- Industry-specific marketing
- Industry-specific pricing
- Trial registration
- Tenant provisioning
- Industry entitlement persistence
- Industry-specific frontend navigation
- Backend industry authorization
- Cross-tenant data isolation
- Cross-tenant document and AI isolation
- Superadmin separation
- Docker port routing
- Production frontend build
- PostgreSQL persistence
- Authentication redirects

Record actual file references and supporting evidence.

Do not mark features implemented merely because a UI exists.

## 8. Update Implementation Dependencies

Integrate the new requirements into the existing Phase 1–5 plan.

Prioritize security-sensitive shared foundations before exposing industry workflows.

Continue implementation across all three verticals in coordinated phases.

Do not defer Clinical or Maritime merely to accelerate Construction.

Identify database migrations and shared-file dependencies.

Do not perform destructive migrations.

## 9. Update Production Readiness Criteria

Add mandatory verification of:

- Marketing and application URLs
- Industry selection and registration flow
- Tenant provisioning
- Tenant isolation
- Industry entitlement enforcement
- Authentication and RBAC
- Billing and trial entitlements
- AI/RAG document isolation
- PostgreSQL persistence
- Docker build and startup
- Three industry-specific end-to-end workflows
- Applicable clinical privacy and regulatory safeguards

Maintain separate GO/NO-GO decisions for the shared platform and all three industry suites.

## 10. Execution Restrictions

This task is PLAN RECONCILIATION ONLY.

You may update implementation and deployment documentation.

Do not modify application source code.

Do not modify database schemas.

Do not run migrations.

Do not modify Docker configuration yet.

Do not install dependencies.

Do not perform unrelated refactoring.

Preserve all existing Phase 0 findings.

## 11. Required Output

After updating the plan, provide:

1. List of documents updated.
2. Newly identified requirements.
3. Existing functionality that can be reused.
4. Missing or partially implemented capabilities.
5. Proposed Phase 1 implementation sequence.
6. Exact source files likely to change.
7. Proposed database migrations.
8. Security risks.
9. Docker deployment dependencies.
10. Approval requirements.

Then STOP and wait for explicit approval before implementation.

## FINAL INSTRUCTION

Update the existing SalesFortis/AI_CRM master implementation plan using the completed Phase 0 findings.

Do not restart the project.

Do not duplicate previous analysis.

Do not modify application code.

Prepare a coordinated, security-first Phase 1 implementation plan covering Construction, Clinical and Maritime together.