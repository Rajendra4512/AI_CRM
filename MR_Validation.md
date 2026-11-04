# AI_CRM – Market Research Validation and Implementation Readiness

Review all 29 documents in docs/market-research and the existing AI_CRM repository.

Objective: Convert competitor research into an evidence-based, commercially prioritized implementation backlog.

Do not modify application source code, database schemas, Docker configuration or existing tests.

## Task 1: Audit research credibility

For every major market claim:
- Identify its exact source URL and date.
- Distinguish verified facts, assumptions and unsupported claims.
- Flag unverified customer quotations.
- Flag unsupported TAM/SAM/SOM estimates.
- Flag questionable competitor feature comparisons.
- Flag unsupported performance, compliance and revenue claims.

Do not invent sources.

## Task 2: Reconcile recommendations with the codebase

For every proposed feature:
- Identify existing frontend components.
- Identify backend APIs and service logic.
- Identify database entities and persistence.
- Identify existing tests.
- Classify as Functional, Partial, Mock, Missing or Unverified.
- Identify reusable code.
- Identify the smallest necessary implementation change.

Do not claim production readiness based solely on unit tests or visible UI controls.

## Task 3: Create a prioritized implementation backlog

For every backlog item include:
- Unique requirement ID.
- Industry and target persona.
- Customer problem and supporting evidence.
- Current implementation status.
- Proposed improvement.
- Expected measurable business outcome.
- API and database dependencies.
- Security and compliance considerations.
- Complexity and risk.
- Priority P0/P1/P2/P3.
- Acceptance criteria.
- Focused test cases.

## Task 4: Identify market validation requirements

For each suite define:
- Ideal customer profile.
- Five most important interview questions.
- Three customer workflows to demonstrate.
- Pricing hypotheses to test.
- Evidence required before commercial launch.
- Criteria for proceeding, revising or rejecting the opportunity.

## Task 5: Recommend launch sequencing

Compare Construction, Maritime and Clinical using:
- Evidence-backed demand.
- Competitive differentiation.
- Existing code readiness.
- Implementation effort.
- Integration dependencies.
- Compliance burden.
- Time to first paying customer.

Provide a reasoned recommendation without inventing market evidence.

## Deliverables

Create:

docs/product-readiness/
- 01-research-evidence-audit.md
- 02-existing-code-gap-matrix.md
- 03-construction-implementation-backlog.md
- 04-maritime-implementation-backlog.md
- 05-clinical-implementation-backlog.md
- 06-customer-validation-plan.md
- 07-launch-readiness-and-sequencing.md

## Restrictions

- Documentation and analysis only.
- Preserve the existing modular monolith and single-container deployment approach.
- Preserve the marketing website and industry-selection workflow.
- Do not introduce new frameworks or services without demonstrated need.
- Do not replace functional code.
- Do not run broad test suites.
- Do not begin feature implementation without approval.

Start by identifying contradictions between the research documents and the actual repository. Then generate the deliverables.