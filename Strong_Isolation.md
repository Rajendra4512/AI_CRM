# SalesFortis — Strong Isolation and Microservices-Ready Architecture Amendment

## OBJECTIVE

Update the existing SalesFortis Master Composite Engineering Plan to establish:

1. Strong multi-tenant isolation.
2. Strict industry-vertical authorization.
3. Defense-in-depth security.
4. Independently owned industry modules.
5. Future microservices extraction readiness.
6. Continued single-container modular monolith deployment.

Do not restart Phase 0.

Do not rewrite the application.

Do not migrate to microservices now.

Preserve existing architecture and working functionality.

## 1. MANDATORY ISOLATION MODEL

Implement three distinct authorization dimensions:

- Tenant identity
- Industry entitlement
- User/role/object permissions

All three must be validated by the backend.

The authenticated request context must establish the user's identity, active tenant and authorized industry entitlements.

Never accept a browser-supplied tenant_id as authoritative.

For users belonging to multiple tenants, validate membership on every tenant switch and clear tenant-specific frontend state.

## 2. DATABASE SECURITY

Inspect existing PostgreSQL models, SQLAlchemy sessions and queries.

Require:

- Tenant ownership for all tenant-owned records.
- Tenant-scoped read/write operations.
- Tenant-aware foreign-key relationships.
- Prevention of cross-tenant record associations.
- Authorization before updates, deletes and exports.
- Safe transaction handling.
- Auditable privileged operations.

Evaluate PostgreSQL Row-Level Security as an additional enforcement layer.

If RLS is appropriate, design:

- Restricted application database role.
- Default-deny tenant policies.
- Transaction-scoped tenant context.
- Safe handling of connection pooling.
- Separate migration and administrative roles.
- Tests demonstrating cross-tenant denial.

Do not enable RLS blindly or use an application role that bypasses policies.

Consider stronger isolation options, such as separate databases, for future high-compliance or enterprise requirements. Do not introduce that complexity now without a demonstrated need.

## 3. INDUSTRY MODULE OWNERSHIP

Define clear boundaries for:

- Construction
- Clinical
- Maritime
- Shared CRM
- Identity and Tenancy
- Billing
- AI and Document Intelligence

Each module should own:

- Business rules
- API contracts
- Service interfaces
- Persistence access
- Validation
- Authorization requirements
- Focused tests

Avoid direct access to another industry's internal database models or repositories.

Cross-module interaction should occur through explicit interfaces.

Do not create network calls between modules that currently run in the same process.

## 4. MICROSERVICES EXTRACTION READINESS

Design module boundaries so that future extraction is feasible.

Requirements:

- Clear API contracts
- Explicit module dependencies
- No circular imports
- Minimal shared mutable state
- No reliance on process-local dictionaries for business persistence
- No direct cross-module database writes
- Versioned integration contracts where needed
- Clear ownership of business data
- Structured logs and correlation IDs
- Explicit transaction boundaries
- Idempotent business operations where required

Document which modules could be extracted independently.

Do not introduce Kafka, RabbitMQ, service meshes, Kubernetes or distributed orchestration merely for future readiness.

For cross-module events, first evaluate lightweight in-process events or a transactional outbox pattern when reliable delivery is actually required.

Do not introduce asynchronous processing without a concrete use case.

## 5. SHARED PLATFORM SECURITY

Identity, tenant management, billing and platform administration must have clearly defined ownership.

All industry modules must use the same trusted authorization infrastructure.

Never duplicate authentication or tenant provisioning logic in each vertical.

Superadmin operations must be separately authorized and audited.

Avoid unrestricted platform administrator access to tenant-sensitive data.

## 6. FILES, AI AND RAG ISOLATION

Enforce tenant and industry authorization across:

- File upload
- Document storage
- Document parsing
- Vector indexing
- Search and retrieval
- AI context construction
- AI responses
- Document downloads
- Exports
- Deletion

Every retrieval operation must be scoped to authorized tenant and resource ownership.

Treat uploaded documents as untrusted input.

Do not allow document instructions to override system authorization rules.

## 7. BACKGROUND TASKS AND CACHING

Inspect existing background processing and cache mechanisms.

Ensure:

- Explicit tenant context
- Verified task authorization
- Tenant-scoped cache keys
- Safe retry behaviour
- No cross-tenant task execution
- Idempotency where required
- No reliance on in-memory state for critical business records

Do not introduce new infrastructure unless required.

## 8. SECURITY TEST REQUIREMENTS

Add focused tests covering:

- Cross-tenant reads
- Cross-tenant writes
- Cross-tenant deletes
- Cross-tenant file access
- Cross-tenant AI retrieval
- Cross-industry API access
- Unauthorized role escalation
- Tenant switching
- Forged tenant IDs
- Forged industry entitlements
- Background task isolation
- Billing entitlement manipulation
- Privileged administrator operations

Test negative cases, not just successful authorized requests.

## 9. ARCHITECTURE DOCUMENTATION

Update existing:

docs/implementation/02-shared-platform-dependency-matrix.md

docs/implementation/03-three-industry-implementation-plan.md

docs/implementation/08-database-and-migration-plan.md

docs/implementation/09-security-and-tenant-isolation-plan.md

docs/implementation/10-focused-test-strategy.md

docs/implementation/12-implementation-progress-tracker.md

Add a dedicated section describing future service extraction.

Document:

- Module ownership
- Dependencies
- Data ownership
- API contracts
- Transaction boundaries
- Potential extraction order
- Migration risks
- Security implications

Do not create duplicate documentation unnecessarily.

## 10. PHASE 1 IMPLEMENTATION PRIORITIES

After plan approval, implement in this order:

1. Trusted tenant and authorization context.
2. Cross-tenant and cross-industry security verification.
3. Database isolation and ownership constraints.
4. Industry module boundaries.
5. Tenant-aware document and AI isolation.
6. Secure tenant provisioning and billing entitlements.
7. Coordinated Construction, Clinical and Maritime feature persistence.
8. Local Docker deployment verification.

Maintain development progress across all three verticals.

Do not postpone a vertical indefinitely.

## 11. ACCEPTANCE CRITERIA

The architecture is acceptable only when:

- Tenant A cannot access Tenant B data.
- Industry access is enforced server-side.
- Unauthorized cross-module access is denied.
- Shared services maintain clear ownership.
- Industry modules do not directly modify each other's internal data.
- Critical records are persisted.
- Cross-tenant security tests pass.
- Docker deployment remains compatible.
- Future service extraction boundaries are documented.
- No unnecessary distributed infrastructure is introduced.

Do not claim that the application is fully secure based solely on passing automated tests.

## FINAL EXECUTION INSTRUCTION

This is a targeted architectural amendment to the completed Phase 0 plan.

Update the existing planning documents and identify any required implementation changes.

Do not modify application source code or database schemas yet.

Present the revised Phase 1 plan for approval.

Maintain a strong, secure modular monolith today while making future microservices extraction practical.