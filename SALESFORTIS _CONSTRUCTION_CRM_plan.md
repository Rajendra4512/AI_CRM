# SALESFORTIS — CONSTRUCTION CRM FIRST: PIPEDRIVE BENCHMARKING, REDESIGN AND IMPLEMENTATION

## MISSION

Transform the existing SalesFortis Construction marketing website and CRM application into a professional, commercially credible, AI-powered Construction & Specialty Subcontractor CRM.

Use https://www.pipedrive.com/ as the PRIMARY reference for CRM user experience, product maturity, sales workflows, usability, information architecture and marketing presentation.

Also examine:
- https://www.pipedrive.com/en/industries/crm-for-construction
- https://www.pipedrive.com/en/crm/features
- https://support.pipedrive.com/
- https://www.followupcrm.com/ for construction-specific sales requirements.

Use Procore and Contractor Foreman only as secondary references for construction-domain terminology and operational handoffs, not as primary CRM design benchmarks.

**Work on CONSTRUCTION FIRST. Do not redesign Clinical or Maritime yet.**

## PHASE A — RESEARCH AND REVERSE ENGINEERING

Verify and use the installed REA tool, following its actual documentation and supported capabilities.

Analyze publicly accessible Pipedrive marketing pages, feature documentation, product demonstrations, screenshots and observable interactions.

Study the following capabilities systematically:

1. Leads inbox and lead qualification.
2. People, organizations and contact management.
3. Deals, opportunities and customizable pipelines.
4. Drag-and-drop pipeline interactions.
5. Deal details, activity timelines, notes and attachments.
6. Tasks, calls, meetings and calendar scheduling.
7. Email integration, templates and communication tracking.
8. Sales workflow automation and follow-up reminders.
9. Deal aging, inactivity alerts and prioritization.
10. Custom fields, filters, search and saved views.
11. Dashboards, reports, goals and revenue forecasting.
12. Product catalogs, quotations and sales documents.
13. Team collaboration, ownership and permissions.
14. Import/export, integrations and onboarding.
15. AI assistance, lead scoring and sales recommendations.
16. Responsive layouts, accessibility and interaction quality.
17. Marketing site hierarchy, messaging, product storytelling, pricing presentation and conversion journeys.

For each capability, distinguish:
- Directly observed functionality.
- Functionality confirmed by official documentation.
- Functionality that cannot be verified without authenticated access.
- Design lessons relevant to SalesFortis.

Do not claim to have inspected private Pipedrive application screens without authorized access.

Do not bypass authentication, copy source code or reproduce proprietary assets, branding, distinctive layouts or marketing content.

## PHASE B — CONSTRUCTION CRM GAP ANALYSIS

Inspect the actual SalesFortis repository, running Docker application, database models, APIs, frontend routes and existing implementation documents.

Compare the existing Construction CRM against the verified Pipedrive capability inventory and SalesFortis requirements.

Create a gap matrix containing:

Feature | Reference evidence | Current implementation | Backend status | UX quality | Missing functionality | Priority | Implementation effort | Acceptance criteria.

Classify each SalesFortis capability as:
- Fully functional and verified.
- Implemented but needing UX improvement.
- Partially integrated.
- Frontend-only/mock.
- Missing.
- Blocked or requiring approval.

Do not assume a feature is working merely because a screen exists.

Identify reusable components and APIs before proposing new ones.

## PHASE C — PREPARE THE IMPLEMENTATION PLAN

Before making major changes, create:

`docs/implementation/construction-crm-transformation/`

Include:

1. Competitive UX research and evidence.
2. Existing implementation gap assessment.
3. Construction CRM feature inventory.
4. Proposed marketing website information architecture.
5. CRM navigation and screen specifications.
6. User journeys and workflow diagrams.
7. Reusable component and design-system plan.
8. Backend/API/database integration matrix.
9. Prioritized implementation backlog.
10. Playwright and backend test plan.
11. Security and tenant-isolation requirements.
12. Checkpoint-based implementation and verification plan.

Use Archify to document architecture and Graphifyy to understand existing dependencies.

The plan must be actionable, with file-level implementation targets, dependencies, risks and testable acceptance criteria.

**Do not stop after writing the plan. Continue into implementation after recording the baseline, unless an existing approval gate is triggered.**

## PHASE D — REDESIGN THE CONSTRUCTION MARKETING WEBSITE

Create an original, professional Construction & Specialty Subcontractor CRM marketing experience.

Customer journey:

SalesFortis Corporate Website
→ Construction Industry Selection
→ Construction CRM Marketing Website
→ Trial / Request Demo
→ Registration
→ Construction CRM Workspace.

The construction marketing experience must include:

- Strong construction-specific hero and positioning.
- Professional product navigation.
- Clear value propositions for contractors and subcontractors.
- Lead-to-contract workflow explanation.
- CRM feature demonstrations.
- Real application screenshots or explicitly labeled previews.
- AI-assisted sales and document capabilities.
- Industry-specific use cases.
- Reporting and forecasting capabilities.
- Security and integration information.
- Pricing or contact-sales journey.
- FAQs and clear calls to action.

Avoid generic AI-generated marketing phrases, emojis, oversized cards and empty decorative sections.

Remove competitor brand names from inappropriate public-facing marketing copy.

Use the Pipedrive research to understand professional SaaS storytelling, but create an original SalesFortis identity.

## PHASE E — IMPLEMENT A PROFESSIONAL CONSTRUCTION CRM

Build a coherent, efficient workspace focused on the complete construction sales lifecycle.

### Primary workflow

Lead → Qualification → Opportunity → RFQ / Tender → Estimate → Bid Submission → Negotiation → Award / Lost → Project Handover → Customer Follow-up.

Support configurable pipeline stages rather than forcing every customer into a rigid process.

### CRM foundation

Implement or improve, reusing existing functionality:

- Construction-focused dashboard.
- Lead inbox and lead qualification.
- Companies and contacts.
- General contractors, subcontractors, owners and suppliers as relationship types.
- Opportunities and bid pipeline.
- Drag-and-drop pipeline board.
- Opportunity detail workspace.
- Tasks, calls, meetings and follow-ups.
- Notes, attachments and activity history.
- Advanced search, filters and saved views.
- Customer relationship timeline.
- Team assignments and collaboration.
- Sales forecasts and reporting.
- Notifications and workflow automation.

### Construction specialization

Implement or improve:

- RFQ/tender intake.
- Bid invitations and bid deadlines.
- Estimate preparation and revision history.
- Bid/no-bid decision support.
- Bid submission tracking.
- General contractor relationship management.
- Bid-hit ratio and win/loss analysis.
- Estimated versus awarded contract value.
- Project award and handover.
- Customer follow-up after award.

Keep the initial product CRM-centered. Do not expand into a full construction ERP or duplicate comprehensive Procore-style project management.

### AI capabilities

Where supported by the existing architecture, provide:

- RFQ document extraction.
- Opportunity summaries.
- Bid qualification assistance.
- Follow-up recommendations.
- Document-grounded question answering.
- Sales pipeline insights.

AI outputs must respect tenant permissions and distinguish verified source information from model-generated recommendations.

## PHASE F — PROFESSIONAL UX AND DESIGN SYSTEM

Create a cohesive, reusable enterprise design system.

Pay special attention to:

- Sidebar navigation and information hierarchy.
- Dense but readable data tables.
- Fast lead and opportunity creation.
- Consistent detail panels and forms.
- Kanban drag-and-drop usability.
- Keyboard accessibility.
- Search and filtering.
- Meaningful empty states.
- Loading and error states.
- Mobile and tablet responsiveness.
- Clear primary and secondary actions.
- Efficient multi-step workflows.
- Consistent typography, icons and spacing.

A user should be able to understand the next action without reading lengthy instructions.

Do not prioritize visual similarity to Pipedrive over usability, originality or construction-specific needs.

## PHASE G — REAL BACKEND FUNCTIONALITY

For every key workflow, verify:

Frontend → API → Authorization → Business Logic → PostgreSQL → Response → Updated UI.

Ensure that:

- Data is persisted correctly.
- Tenant isolation is enforced server-side.
- Industry entitlements are checked.
- Object-level permissions are validated.
- Calculated dashboard metrics use actual tenant data.
- Demo data is explicitly labeled.
- Pipeline changes persist after refresh.
- Failed operations display meaningful errors.
- Audit records exist for relevant changes.

Do not use fabricated metrics or simulated API success responses in customer-facing production flows.

## PHASE H — IMPLEMENTATION ORDER

Execute in these checkpoints:

1. Research and evidence collection.
2. Existing code and functionality audit.
3. Gap matrix and implementation plan.
4. Shared enterprise UI foundation.
5. Construction marketing website.
6. Construction CRM navigation and dashboard.
7. Leads, contacts and opportunities.
8. Pipeline, activities and follow-ups.
9. RFQ, estimating and bid workflows.
10. Reporting, forecasting and AI integration.
11. Backend integration and security verification.
12. Playwright browser verification and visual refinement.
13. Docker verification and final acceptance assessment.

Implement the highest-value functional CRM foundation before lower-priority enhancements.

Reuse working code and avoid unnecessary rewrites.

## PHASE I — ENGINEERING SKILLS AND VERIFICATION

Use the installed skills when applicable:

- REA: reference website and UX analysis.
- Archify: architecture diagrams.
- Graphifyy: codebase dependency and memory graph.
- Compound Engineering: implementation, review and debugging.
- Playwright: browser and end-to-end testing.

Verify each skill's availability before use.

Use Playwright to test:

- Construction marketing navigation.
- Trial/signup journey.
- Login and tenant workspace access.
- Lead creation and qualification.
- Opportunity creation and editing.
- Pipeline stage changes and persistence.
- RFQ and bid workflows.
- Dashboard calculations.
- Role and tenant restrictions.
- Responsive layouts and error states.

Use focused automated tests and inspect the rendered UI, not merely build output.

## PHASE J — EXECUTION AND REPORTING

Preserve the existing SalesFortis architecture, database volumes, Docker configuration and unrelated projects.

Maintain:
- Marketing port 5000.
- CRM frontend port 5001.
- FastAPI backend port 8001.

Update the existing execution state, progress tracker, change manifest, test results and architecture artifacts after each checkpoint.

Do not mark a checkpoint complete without implementation evidence and relevant verification.

Stop for approval only at previously established safety gates, including destructive migrations, production deployment, paid services or breaking security-sensitive changes.

## FINAL ACCEPTANCE

The Construction CRM transformation is complete only when:

- The marketing website looks and functions like a credible commercial SaaS product.
- The construction customer journey works end-to-end.
- The CRM is substantially more capable and usable than the existing prototype.
- Core CRM workflows are genuinely operational.
- Construction-specific bid management is integrated with the CRM.
- Dashboards use real tenant data.
- Industry and tenant isolation are verified.
- Important workflows pass focused Playwright and backend tests.
- Docker deployment is operational.
- No unrelated application or vertical is damaged.
- Remaining gaps and limitations are explicitly documented.

**Start with evidence-based Pipedrive research, prepare the implementation plan, then execute the Construction CRM transformation. Do not begin Clinical or Maritime redesign until the Construction reference experience is verified.**