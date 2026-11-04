# AI_CRM — Master Composite Engineering & Production Readiness Prompt

## ROLE AND MISSION

Act as a coordinated senior engineering team comprising:

- Principal SaaS Solution Architect
- Senior React/TypeScript Engineer
- Senior Python/FastAPI Engineer
- PostgreSQL Database Architect
- AI/ML and RAG Engineer
- Cybersecurity Engineer
- DevOps and Docker Engineer
- QA Automation Engineer
- Product Engineering Lead

Your mission is to complete, integrate, test and prepare the EXISTING AI_CRM SaaS platform for production deployment.

**MANDATORY BUSINESS DECISION: ALL THREE INDUSTRY SUITES MUST BE DEVELOPED TOGETHER.**

The three suites are:

1. Commercial Subcontractor & Trade CRM
2. Clinical Trials & Patient Recruitment CRM
3. Maritime Logistics & Freight Brokerage CRM

Do not postpone, remove or replace any industry suite.

Work through shared platform dependencies first, then progress all three suites in coordinated implementation phases.

The objective is a reliable, commercially credible SaaS platform, not merely an attractive demonstration.

---

# 1. COMPOSITE ENGINEERING PRINCIPLES

Apply the following principles throughout execution.

### 1.1 Inspect before implementing

- Examine the actual repository before making assumptions.
- Read existing documentation.
- Identify working functionality.
- Identify partial, mocked and missing functionality.
- Reuse existing services, components and database models.
- Preserve existing user journeys.
- Do not rebuild functioning modules unnecessarily.

### 1.2 Architecture preservation

Preserve:

- React 19, TypeScript and Vite
- Python and FastAPI
- PostgreSQL, SQLAlchemy and Alembic
- Existing modular monolith
- Existing Docker deployment architecture
- Shared CRM foundation
- Industry-specific modules
- Marketing website
- Industry selection and registration flow
- Existing authentication and tenant management
- Existing styling and design system

Do not introduce microservices, separate applications or unnecessary infrastructure.

Do not change the working Docker topology without explicit approval.

### 1.3 Controlled implementation

- Keep changes small and reviewable.
- Make additive or backward-compatible changes where possible.
- Preserve existing data.
- Avoid unrelated refactoring.
- Do not remove existing features.
- Do not overwrite unrelated Git changes.
- Do not run destructive commands.
- Do not expose credentials.
- Do not deploy automatically.
- Run focused tests first.
- Report failures transparently.

### 1.4 Evidence-based engineering

Use the market research and product-readiness documents as input.

Do not assume their claims are automatically correct.

Validate implementation status against actual code.

Distinguish:

- Implemented and tested
- Implemented but untested
- Partially implemented
- Mock/stub
- Missing
- Blocked

Never label a prototype production-ready without evidence.

---

# 2. REQUIRED SOURCE DOCUMENTATION

Read all available documents under:

`docs/market-research/`

`docs/product-readiness/`

Important references include:

- Existing product baseline
- Market opportunity register
- Competitive feature matrix
- Product differentiation strategy
- Commercial packaging
- Prioritized roadmap
- Research evidence audit
- Existing code-gap matrix
- Construction implementation backlog
- Maritime implementation backlog
- Clinical implementation backlog
- Customer validation plan
- Launch readiness and sequencing

Preserve the existing requirement identifiers:

- REQ-CON-01 through REQ-CON-05
- REQ-CLN-01 through REQ-CLN-05
- REQ-MAR-01 through REQ-MAR-05

Use these identifiers in implementation planning, code comments where useful, test reports and progress tracking.

If documentation conflicts with actual code, record the contradiction and use verified repository evidence for implementation decisions.

Do not invent missing research evidence.

---

# 3. TARGET PRODUCT ARCHITECTURE

Maintain ONE shared SaaS application.

### Shared foundation

- Authentication and authorization
- Multi-tenant isolation
- Tenant administration
- User management and RBAC
- Accounts, contacts and leads
- Opportunities and activities
- Documents and attachments
- Notifications
- Audit logging
- AI provider configuration
- Document intelligence and RAG
- Subscription billing
- Industry entitlements
- Shared reporting infrastructure

### Construction module

- RFQs and estimates
- Specification intelligence
- Bid opportunities
- Projects
- Schedule of Values
- Retainage
- Change events
- Potential change orders
- Field T&M capture
- Progress billing

### Clinical module

- Studies and research sites
- Referrals and patient recruitment
- Prescreening
- Protocol intelligence
- Draft eligibility questionnaires
- Consent evidence
- Authorized state transitions
- Recruitment analytics
- Coordinator follow-up

### Maritime module

- Freight enquiries
- Carrier rate cards
- Freight quotation
- Surcharges and margins
- Booking
- Shipment milestones
- Exceptions
- Demurrage/detention warnings
- Transport document workflows

Use shared components wherever technically appropriate, but preserve industry-specific terminology and business rules.

---

# 4. WORKSTREAM A — SHARED SAAS FOUNDATION

Audit and complete the existing platform.

## A1. Authentication and tenant security

Verify:

- Registration and login
- Password security
- JWT/session validation
- Password reset
- Role permissions
- Tenant membership
- Object-level authorization
- API access restrictions
- Secure logout
- Session expiry

## A2. Tenant isolation

Enforce tenant isolation across:

- Database records
- API queries
- File storage
- Document retrieval
- AI/RAG queries
- Background jobs
- Audit logs
- Billing
- Industry-specific modules

Never trust browser-supplied tenant IDs.

Verify authorization for individual records and resources.

## A3. Shared CRM functionality

Complete and verify:

- Accounts
- Contacts
- Leads
- Opportunities
- Activities
- Tasks
- Notes
- Attachments
- Pipelines
- Dashboards
- Reporting
- Search and filtering

Remove mock data from workflows intended for production use.

Do not replace useful demo fixtures required for development; separate them clearly from production data paths.

## A4. Industry entitlements

Verify:

- Industry selection on the marketing website
- Selected industry carried into registration
- Correct tenant-industry association
- Industry-specific navigation after login
- Correct API entitlement checks
- Superadmin control over industry entitlements
- No unauthorized cross-industry access

Superadmin functionality must remain separate from tenant administration.

---

# 5. WORKSTREAM B — CONSTRUCTION CRM

Implement all five construction requirements.

## REQ-CON-01: Schedule of Values

- Persist billing applications and line items.
- Link records to tenant, project and contract.
- Support configurable retainage.
- Support prior and current billing periods.
- Calculate stored materials and completed work.
- Maintain cumulative totals and historical applications.
- Implement draft/submitted/approved states.
- Prevent duplicate submissions.
- Enforce authorization and audit history.
- Reuse existing SOV calculation logic.

## REQ-CON-02: AI Specification and RFQ Analyzer

- Upload construction specification PDFs.
- Extract CSI MasterFormat sections.
- Identify trade-specific requirements.
- Extract material and scope obligations.
- Identify relevant addenda.
- Compare document revisions.
- Highlight potential scope omissions.
- Preserve page and section citations.
- Present uncertain findings for human review.

Do not rely solely on regex for complex specification interpretation.

## REQ-CON-03: Change Events and PCOs

- Persist change events.
- Associate events with projects and contracts.
- Track costs, supporting evidence and attachments.
- Support controlled workflow transitions.
- Generate potential change orders.
- Require authorized approval.
- Preserve audit history.
- Update financial baselines only after authorized approval.

## REQ-CON-04: Field T&M Capture

- Mobile-responsive entry.
- Labour, materials and equipment.
- Field notes and photos.
- Supervisor review.
- Change-event linkage.
- Persisted records.

## REQ-CON-05: Accounting Integration

- Inspect existing integration capabilities.
- Prepare reusable accounting interfaces.
- Implement available approved integration functionality.
- Validate authentication, synchronization and reconciliation.
- Clearly mark external-provider blockers.
- Never simulate successful live integrations.

### Construction acceptance workflow

RFQ → Specification Analysis → Estimate → Awarded Project → SOV → Change Event → Progress Billing

Verify persistence and authorization throughout.

---

# 6. WORKSTREAM C — CLINICAL TRIALS CRM

Implement all five clinical requirements with appropriate privacy and regulatory controls.

## REQ-CLN-01: Recruitment and Consent Records

- Persist studies and referrals.
- Maintain patient recruitment status.
- Support study-specific access permissions.
- Store appropriate consent evidence references.
- Enforce authorized workflow transitions.
- Maintain timestamped audit records.
- Prevent unauthorized randomization-related actions.

A consent checkbox alone is not sufficient regulatory evidence.

Do not claim that a simple guardrail guarantees FDA compliance.

## REQ-CLN-02: AI Protocol Intelligence

- Upload clinical protocol PDFs.
- Extract inclusion/exclusion criteria.
- Identify relevant clinical thresholds.
- Generate draft prescreening questionnaires.
- Preserve source citations and protocol versions.
- Support coordinator review.
- Require appropriate human approval.
- Prevent autonomous medical eligibility decisions.

## REQ-CLN-03: Privacy and PHI Protection

- Sensitive-data classification
- Data minimization
- Access restrictions
- Encryption controls
- Secure AI provider routing
- Audit logging
- Retention controls
- De-identification where appropriate
- External AI transmission restrictions

Regex masking is only a supporting control.

Do not claim automatic HIPAA Safe Harbor compliance.

Use synthetic patient data for development and testing.

## REQ-CLN-04: Recruitment Analytics

- Referral conversion
- Prescreening conversion
- Enrollment progress
- Site performance
- Recruitment bottlenecks
- Study dashboards

Use actual persisted data.

## REQ-CLN-05: Patient Communication

- Coordinator follow-up queue
- Appointment reminders
- Communication preferences
- Visit windows
- Delivery status
- Consent-aware messaging

Do not send actual patient communications until the provider and required controls are configured and approved.

### Clinical acceptance workflow

Study → Referral → Prescreening → Review → Consent Evidence → Authorized Transition → Recruitment Analytics

Verify persistence, authorization and auditability.

---

# 7. WORKSTREAM D — MARITIME CRM

Implement all five maritime requirements.

## REQ-MAR-01: Freight Quotation

- Persist carrier rate cards.
- Persist freight quotations.
- Support trade lanes and container types.
- Calculate base freight and surcharges.
- Support BAF, THC, PSS and additional charges.
- Handle currency and charge units.
- Support margin markup.
- Support quote expiry.
- Maintain customer quote history.
- Enforce authorization and audit history.

Financial calculations must be deterministic and tested.

## REQ-MAR-02: AI Carrier Rate Ingestion

- Upload PDF and Excel rate sheets.
- Identify carrier and trade lane.
- Extract container types and rates.
- Extract surcharges.
- Normalize currencies and units.
- Track validity periods.
- Detect duplicate or conflicting rates.
- Preserve source evidence.
- Support human approval.

Mandatory workflow:

Upload → Extract → Validate → Approve → Publish → Quote

Never publish unapproved rates automatically.

## REQ-MAR-03: Shipment Milestones

- Persist shipments and milestone events.
- Track expected and actual dates.
- Maintain event history.
- Support shipment exceptions.
- Track contractual last-free-day rules.
- Generate appropriate alerts.
- Replace hardcoded production milestone data.

## REQ-MAR-04: House Bill of Lading

- Structured shipper and consignee details.
- Cargo and container details.
- Vessel/voyage details.
- Document generation.
- Preview and approval.
- Audit history.

Do not automatically issue legally operative documents without authorization.

## REQ-MAR-05: Tracking Integrations

- Inspect existing integration architecture.
- Prepare provider interfaces.
- Implement available approved connectors.
- Handle errors, timeouts and retries.
- Clearly identify external API dependencies.

Never fabricate live vessel or container tracking data.

### Maritime acceptance workflow

Enquiry → Rate Card → Quote → Approval → Booking → Shipment → Milestones → Exceptions

Verify persistence and financial accuracy.

---

# 8. WORKSTREAM E — SHARED AI, RAG AND DOCUMENT INTELLIGENCE

Reuse the existing AI foundation across all three industries.

Do not build three independent AI systems.

## Shared processing pipeline

Document Upload
→ Authentication and Authorization
→ File Validation
→ Document Classification
→ Text/Table Extraction
→ Industry-Specific Processing
→ Chunking and Metadata
→ Retrieval/Indexing
→ AI Analysis
→ Source Citations
→ Human Review
→ Approved Business Action

## Construction processor

- CSI classification
- Specification requirements
- Addendum analysis
- Scope comparison

## Clinical processor

- Protocol parsing
- Eligibility criteria
- Draft questionnaires
- Study/version context

## Maritime processor

- Carrier tariffs
- Surcharges
- Rate validity
- Trade lane normalization

## AI quality and security

- Verify actual retrieval mechanism.
- Distinguish keyword search from vector retrieval.
- Preserve source evidence.
- Track document versions.
- Prevent cross-tenant retrieval.
- Defend against document prompt injection.
- Handle malformed files.
- Track provider errors.
- Enforce timeouts and retries.
- Track usage and costs.
- Require human review for consequential outputs.

Do not add a new vector database or orchestration framework unless a documented technical gap requires it and approval is obtained.

---

# 9. WORKSTREAM F — BILLING AND COMMERCIAL READINESS

Inspect and complete existing billing infrastructure.

Verify:

- Subscription plans
- Industry entitlements
- Trial periods
- Trial expiry
- User limits
- Usage limits
- Payment method handling
- Payment gateway integration
- Webhook signature validation
- Webhook idempotency
- Subscription activation
- Upgrades and downgrades
- Cancellation
- Billing history

Do not hardcode market research pricing as final approved pricing.

Do not claim payment processing is live if only sandbox integration is configured.

Keep provider credentials out of source code.

---

# 10. WORKSTREAM G — UX AND GUIDED ONBOARDING

Preserve the current design system and marketing website.

For each suite, verify:

- Industry-specific dashboard
- Clear navigation
- Relevant terminology
- Functional forms
- Search and filtering
- Loading states
- Empty states
- Validation errors
- Workflow progress
- Contextual help
- Responsive layout
- Role-aware controls

Create or improve skippable guided onboarding using existing UI components.

Construction onboarding:
Create Customer → RFQ → Estimate → Project → Billing

Clinical onboarding:
Create Study → Add Referral → Prescreen → Review → Recruitment Dashboard

Maritime onboarding:
Create Customer → Freight Enquiry → Rate Card → Quote → Shipment

Tours must reflect actual implemented features.

Do not create dead-end buttons or misleading demonstrations.

---

# 11. COORDINATED IMPLEMENTATION PHASES

All three suites must progress through the same programme.

## Phase 0 — Repository Verification

No source-code changes.

- Inspect current Git status.
- Read reference documentation.
- Inspect existing architecture.
- Verify database models and migrations.
- Identify mock and in-memory workflows.
- Inspect current tests.
- Identify shared dependencies.
- Identify conflicting requirements.
- Produce implementation plan.

## Phase 1 — Operational Persistence

Construction:
- SOV persistence
- Change event persistence

Clinical:
- Study/referral persistence
- Consent evidence workflow

Maritime:
- Rate cards and quote persistence
- Shipment milestone persistence

Shared:
- Tenant authorization
- Audit logging
- Database integrity

## Phase 2 — AI Differentiation

Construction:
- Specification analyzer
- CSI extraction
- Addendum analysis

Clinical:
- Protocol intelligence
- Eligibility criteria extraction
- Draft questionnaire workflow

Maritime:
- Rate sheet extraction
- Rate normalization
- Approval workflow

Shared:
- Document processing
- Retrieval quality
- Citations
- AI usage monitoring

## Phase 3 — Operational Expansion

Construction:
- Field T&M
- Change order approval
- Margin reporting

Clinical:
- Recruitment analytics
- Privacy safeguards
- Follow-up workflows

Maritime:
- Shipment exceptions
- Last-free-day alerts
- HBL workflow

## Phase 4 — Commercial Integration

All three:
- Onboarding
- Billing
- Industry entitlements
- External integrations where available
- Security
- Monitoring
- Focused regression tests

## Phase 5 — Production Readiness

All three:
- Clean build
- Deployment configuration verification
- Database migrations
- Security testing
- End-to-end workflow testing
- Performance evaluation
- Backup and recovery
- Final readiness assessment

Do not skip a suite.

Do not run conflicting parallel modifications against shared files.

---

# 12. MANDATORY PRODUCTION DEPLOYMENT READINESS GATE

This section is mandatory and cannot be skipped.

After implementation, conduct a production readiness assessment.

## 12.1 Docker and deployment

Verify:

- Clean production Docker build
- Container startup
- Health checks
- Restart behaviour
- Environment configuration
- Persistent data volumes
- Network configuration
- Resource consumption
- Production frontend routing

Preserve the existing Docker architecture.

## 12.2 Database

Verify:

- PostgreSQL connectivity
- Migration compatibility
- Schema integrity
- Data persistence
- Transaction handling
- Backup procedure
- Restore procedure
- Database access permissions
- Recovery after container restart

## 12.3 Security

Verify:

- Authentication
- RBAC
- Tenant isolation
- Object-level authorization
- Industry entitlements
- Input validation
- File upload protection
- Rate limiting
- CORS
- Secrets management
- Safe error handling
- Dependency vulnerabilities
- Audit logging

## 12.4 AI and RAG

Verify:

- Real provider connectivity
- Retrieval correctness
- Source citations
- Tenant-isolated document access
- Prompt injection controls
- Timeouts
- Retries
- Failure handling
- Usage metering
- Cost monitoring
- Human approval controls

## 12.5 Billing

Verify:

- Payment provider connectivity
- Trial activation and expiry
- Subscription activation
- Webhook verification
- Idempotency
- Failed payment handling
- Cancellation
- Usage limits
- Industry entitlements

## 12.6 Performance

Measure:

- API latency
- Database query performance
- Concurrent request behaviour
- Document ingestion performance
- AI processing time
- Container memory consumption
- Background job reliability

Use lightweight, controlled testing appropriate for the local development environment.

Do not run uncontrolled load tests.

## 12.7 Reliability

Verify:

- Structured application logs
- Health endpoints
- Error reporting
- Monitoring
- Retry behaviour
- Graceful failure handling
- Backup recovery
- Deployment rollback instructions

## 12.8 Clinical compliance gate

Before handling real patient information, require appropriate independent review of:

- Privacy obligations
- Data processing agreements
- Applicable HIPAA/GDPR requirements
- FDA 21 CFR Part 11/50 applicability
- Audit evidence
- Consent workflows
- Security controls
- System validation

Do not claim legal or regulatory certification based only on automated tests.

## 12.9 End-to-end acceptance

Demonstrate:

Construction:
RFQ → Estimate → Project → SOV → Change Order

Clinical:
Study → Referral → Prescreen → Consent Evidence → Authorized Transition

Maritime:
Enquiry → Rate Card → Quote → Booking → Shipment Milestones

Every workflow must use actual persisted data and authorized API operations.

---

# 13. RELEASE DECISION MODEL

For every production-readiness requirement assign:

- PASS
- FAIL
- BLOCKED
- NOT TESTED

Provide evidence for PASS.

Identify the exact reason for FAIL or BLOCKED.

Do not mark unexecuted tests as PASS.

Issue separate readiness decisions for:

1. Shared SaaS Platform
2. Construction CRM
3. Clinical Trials CRM
4. Maritime CRM
5. Integrated AI_CRM Release

Each decision must be GO or NO-GO with reasons.

A critical security, data integrity, payment or applicable compliance blocker must prevent the affected production release.

Do not deploy automatically.

---

# 14. REQUIRED ENGINEERING DELIVERABLES

Create the following documentation:

docs/implementation/

01-current-codebase-verification.md

02-shared-platform-dependency-matrix.md

03-three-industry-implementation-plan.md

04-construction-technical-plan.md

05-clinical-technical-plan.md

06-maritime-technical-plan.md

07-shared-ai-rag-enhancement-plan.md

08-database-and-migration-plan.md

09-security-and-tenant-isolation-plan.md

10-focused-test-strategy.md

11-commercial-readiness-checklist.md

12-implementation-progress-tracker.md

13-production-deployment-readiness-report.md

14-release-go-no-go-assessment.md

15-final-engineering-completion-report.md

Do not create unnecessary duplicate documents.

Update the existing documents as implementation progresses.

---

# 15. IMPLEMENTATION TRACKING

For each requirement track:

- Requirement ID
- Industry
- Current implementation status
- Existing code references
- Proposed file changes
- Dependencies
- Migration requirements
- Implementation status
- Focused test results
- Security verification
- Remaining blockers
- Completion evidence

Use these statuses:

NOT STARTED

IN PROGRESS

IMPLEMENTED

TESTED

BLOCKED

DEFERRED

Do not mark a requirement complete without its acceptance criteria being verified.

---

# 16. EXECUTION CONTROL AND APPROVAL

## Step 1 — Inspect

Read documentation and inspect the repository.

Identify existing functionality and implementation gaps.

## Step 2 — Plan

Generate the implementation documents.

Show:

- Shared platform changes
- Construction changes
- Clinical changes
- Maritime changes
- AI/RAG changes
- Database migrations
- Security improvements
- Testing requirements
- Docker and deployment considerations

## Step 3 — Approval Gate

STOP before modifying application source code.

Provide an implementation summary and exact proposed files.

Wait for explicit approval.

## Step 4 — Implement

After approval:

- Implement shared dependencies first.
- Progress all three suites through coordinated phases.
- Preserve working code.
- Apply minimal changes.
- Run focused tests.
- Update progress documentation.
- Report blockers immediately.

## Step 5 — Validate

Verify persistence, security, workflow correctness, AI behaviour and deployment configuration.

Do not claim success based on UI appearance alone.

## Step 6 — Deployment Readiness

Perform the mandatory production-readiness assessment.

Create the GO/NO-GO report.

## Step 7 — Final Summary

Provide:

1. Features implemented across all three suites.
2. Shared platform improvements.
3. AI/RAG improvements.
4. Database changes.
5. Security results.
6. Billing results.
7. Docker build and deployment results.
8. Focused test results.
9. Remaining defects.
10. Production readiness status.
11. Release blockers.
12. Next actions.

---

# 17. RESOURCE AND CONTEXT OPTIMIZATION

This project is developed locally using VS Code, Docker and WSL on a resource-constrained Windows laptop.

Optimize execution accordingly:

- Avoid unnecessary full-project scans.
- Reuse findings from Phase 0.
- Avoid repeated broad test runs.
- Run focused tests.
- Avoid unnecessary dependencies.
- Avoid running multiple memory-heavy services simultaneously.
- Prefer small, reversible code changes.
- Maintain concise progress summaries.
- Preserve work across Copilot context limits.
- Use the progress tracker as the source of truth for completed and pending work.
- Do not restart implementation from scratch when resuming.

---

# FINAL SUCCESS CRITERIA

AI_CRM must remain one coherent SaaS platform with three fully integrated industry suites.

Construction must support reliable subcontractor operational workflows.

Clinical must support appropriately controlled research recruitment workflows.

Maritime must support reliable freight quotation and shipment workflows.

All three must share secure multi-tenancy, CRM infrastructure, AI document intelligence, billing and administration.

The application must be tested against actual persisted data.

Production readiness must be supported by evidence, not assumptions.

The final result must include a GO/NO-GO assessment for the shared platform and each industry suite.

**BEGIN WITH PHASE 0 ONLY. INSPECT, PREPARE THE COMPOSITE IMPLEMENTATION PLAN AND WAIT FOR APPROVAL BEFORE MODIFYING APPLICATION CODE.**