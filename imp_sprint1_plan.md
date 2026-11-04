# AI_CRM – Construction Suite: Controlled Implementation Sprint 1

## Objective

Strengthen the existing Construction Subcontractor CRM without changing the approved architecture.

Implement and verify:
- REQ-CON-01: Schedule of Values billing persistence.
- REQ-CON-03: Change Event and Potential Change Order persistence.

Use the existing implementation backlogs in docs/product-readiness as requirements.

## Mandatory pre-implementation inspection

1. Inspect the actual existing React components, FastAPI routes, service logic, SQLAlchemy models, Alembic migrations and focused tests.
2. Verify which functionality is already implemented.
3. Identify existing reusable models, repositories, services and UI components.
4. Compare the implementation with the documented backlog.
5. Identify contradictions and report them before editing.
6. Inspect the current Git working tree and preserve unrelated changes.

Do not assume the research reports perfectly reflect the current repository.

## Implementation requirements

### A. Schedule of Values

- Persist SOV billing applications and line items in PostgreSQL.
- Preserve existing calculation logic where correct.
- Support configurable contract-defined retainage.
- Support historical billing applications and cumulative totals.
- Prevent duplicate submissions using idempotency controls.
- Prevent unauthorized changes to approved applications.
- Ensure tenant and project isolation.
- Connect existing UI to the actual API.
- Provide meaningful loading, validation and error states.

### B. Change Events

- Replace in-memory event storage with PostgreSQL persistence.
- Preserve existing business rules.
- Support controlled status transitions.
- Record actor, timestamp and status history.
- Prevent unauthorized approval.
- Link approved change orders to the appropriate project and contract.
- Do not automatically modify financial baselines without an explicit authorized approval workflow.
- Connect existing UI to persisted records.

## Security and data integrity

- Derive tenant identity from authenticated server-side context.
- Never trust browser-supplied tenant identifiers.
- Enforce object-level authorization.
- Use transactional database writes.
- Add focused cross-tenant access tests.
- Preserve existing audit behaviour.
- Avoid destructive migrations.

## Architecture restrictions

- Preserve React + TypeScript.
- Preserve FastAPI.
- Preserve PostgreSQL.
- Preserve the modular monolith.
- Preserve the existing Docker deployment.
- Do not introduce microservices.
- Do not add unnecessary dependencies.
- Do not change the marketing website.
- Do not alter Clinical or Maritime modules.

## Testing

Run only focused tests relevant to modified components.

Verify:
1. SOV creation and retrieval.
2. Historical billing calculations.
3. Retainage correctness.
4. Duplicate submission protection.
5. Change event persistence.
6. Valid and invalid status transitions.
7. Tenant isolation.
8. Authorization.
9. Existing construction workflow compatibility.

Do not run the entire test suite unless required by a specific dependency or explicitly approved.

## Execution control

First provide:
- Existing implementation findings.
- Exact files proposed for modification.
- Required migration changes.
- Potential risks.
- Focused test plan.
Do autonomous execution only take permission in case you are confused and don't do any destructive action 

After implement incrementally and report changed files, tests and remaining issues.

Do not claim completion without verifying the relevant functionality.