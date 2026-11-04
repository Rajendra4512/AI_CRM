# 01 — Competitive UX Research & REA Evidence: Pipedrive & Followup CRM

## 1.REA Verification & Controlled Capture Ledger

Per `SALESFORTIS _CONSTRUCTION_CRM_plan.md` (Phase A), we verified the installed **Reverse Engineer Anything (`rea-agents@6.7.0`, Skill v42)** engine and executed **10 controlled headless Chromium (`157.0.8103.38`) `capture-browser-scenario` runs** across Desktop (`1440x900`) and Mobile (`390x844`) viewports on publicly accessible pages only. Zero authentication walls, paywalls, or private tenant screens were accessed or bypassed.

| Target | URL | Viewport | REA `evidence_id` | DOM Bytes | DOM `sha256` (Prefix) | A11y Bytes | Net Events | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Pipedrive Home** | `https://www.pipedrive.com/` | `1440x900` | `ev_c6531dd77c582a37ce15ab8ec48024b7864bee1bc1f2b0d394d58d5218d2c863` | `636,756` | `28e65da844b82279` | `17,350` | `619` | `200 OK` |
| **Pipedrive Home** | `https://www.pipedrive.com/` | `390x844` | `ev_0845a9dd750b50ff680338b92f0809112ea97d97c4d4d997511ce7dd1d6695f8` | `657,939` | `fee9e9e0b7524921` | `15,833` | `708` | `200 OK` |
| **Pipedrive Construction** | `https://www.pipedrive.com/en/industries/crm-for-construction` | `1440x900` | `ev_5306984c6c397de7bd496e5661e58decf426a7560466b20a5c8d32c09d94d087` | `454,609` | `216aac4d82d2d86a` | `19,176` | `629` | `200 OK` |
| **Pipedrive Construction** | `https://www.pipedrive.com/en/industries/crm-for-construction` | `390x844` | `ev_1241aa2684f13d2703fa1775e6c240c8d5cc13368282cf6359cafc97a636509f` | `478,886` | `8370d5d5cfddc50b` | `18,417` | `594` | `200 OK` |
| **Pipedrive Features** | `https://www.pipedrive.com/en/crm/features` | `1440x900` | `ev_1febd437c43800feaf7e6f79c848664d453d08c19af99b4db3d94a5f4b4fc3b5` | `394,033` | `1cfc2628d0d0ce4c` | `16,755` | `581` | `200 OK` |
| **Pipedrive Features** | `https://www.pipedrive.com/en/crm/features` | `390x844` | `ev_70665c53a748c331d6978445e9de58fbb5aa81798da6b194636e1e2f120c85ec` | `398,093` | `e2d4fc11f7469841` | `11,023` | `461` | `200 OK` |
| **Pipedrive Support KB** | `https://support.pipedrive.com/` | `1440x900` | `ev_3e17b64951d05cf2491fcc7f4409844ac7c521bbe7c6f282631d30fee734a232` | `625,807` | `ad22651a188cecaf` | `11,255` | `176` | `200 OK` |
| **Pipedrive Support KB** | `https://support.pipedrive.com/` | `390x844` | `ev_5f91130119c07313c264ec49ae66ddd7676a2f1e4ac326f26d3b138d2c381432` | `622,576` | `b40933b18a0819fc` | `10,271` | `187` | `200 OK` |
| **Followup CRM** | `https://www.followupcrm.com/` | `1440x900` | `ev_bd36f079b527e7f21b5da58ffc970e659bebc205eceba2c67eb5617598c243f1` | `176,944` | `c9686db8acd0bedd` | `7,223` | `364` | `200 OK` |
| **Followup CRM** | `https://www.followupcrm.com/` | `390x844` | `ev_8c1e40f276da46c183db87c5e0cd35092abdccff837b0bd7dd0d57c02b587e4d` | `176,936` | `25dd8a18d6bc5dd6` | `8,055` | `367` | `200 OK` |

Secondary construction terminology & post-award handoff references from prior REA session: Procore (`ev_18509c05...`) and Contractor Foreman (`ev_030301e4...`).

---

## 2. Systematic 17-Capability Analysis

Each capability below explicitly separates **(A) Directly Observed Public DOM/A11y**, **(B) Confirmed via Official Knowledge Base (`support.pipedrive.com`)**, **(C) Unverifiable Without Authenticated Login**, and **(D) Original Design Lessons for SalesFortis Construction CRM**.

### 1. Leads Inbox & Lead Qualification
- **Observed**: Pipedrive Home (`ev_c6531dd7...`) highlights *"Capture every lead, chase the right ones first"* and `LeadBooster`; Followup CRM (`ev_bd36f079...`) centers on *"Track Leads, Bids and Customers"*.
- **Confirmed by Official Docs**: `support.pipedrive.com` (`ev_3e17b649...`) documents a dedicated pre-pipeline **Leads Inbox** so unqualified inquiries (ITBs, plan-room invites, web inquiries) do not clutter active revenue pipelines until qualified and converted into Deals + Contacts + Organizations.
- **Unverifiable Private Detail**: Exact internal LeadBooster chatbot rule builder modals.
- **SalesFortis Lesson**: Separate **Leads Inbox** from the active **Bid Pipeline**; provide 1-click **"Qualify → Opportunity & RFQ"** conversion that creates/links the General Contractor `Account`, estimator `Contact`, `Opportunity`, and `RFQ`.

### 2. People, Organizations & Contact Management
- **Observed**: Pipedrive Support KB (`Organizing your data`, `ev_3e17b649...`) separates `People` and `Organizations` with cross-linked deals and activities.
- **Confirmed by Official Docs**: Organizations hold multiple People and multiple Deals with rolled-up value and relationship timelines.
- **Unverifiable Private Detail**: Proprietary duplicate-merge heuristics.
- **SalesFortis Lesson**: Implement a dedicated **Companies & Contacts** workspace (`/app/contacts`) supporting construction relationship types: **General Contractor (GC)**, **Owner / Developer**, **Specialty Subcontractor**, **Material Supplier**, and **Architect / Engineer**, showing GC bid history and linked contacts.

### 3. Deals, Opportunities & Customizable Pipelines
- **Observed**: Pipedrive Construction (`ev_5306984c...`) highlights stage-based bid tracking; Followup CRM (`ev_bd36f079...`) emphasizes *"Completely Customizable"* construction bid stages.
- **Confirmed by Official Docs**: Pipelines support customizable stage names, win probabilities per stage, weighted deal values, and expected close dates.
- **Unverifiable Private Detail**: Multi-currency corporate FX sync internals.
- **SalesFortis Lesson**: Support configurable Construction pipeline stages (defaulting to: `Qualified Lead` → `RFQ / ITB Received` → `Estimating & Takeoff` → `Bid Submitted` → `GC Negotiation` → `Contract Awarded` / `Lost`) persisted per-tenant in `system_config` while keeping stage probabilities and weighted value rollups visible in every column header.

### 4. Drag-and-Drop Pipeline Interactions
- **Observed**: Visual Kanban column previews across `pipedrive.com` (`ev_c6531dd7...`) with 5 interactive ARIA `role="tab"` product showcases.
- **Confirmed by Official Docs**: Deals drag across stage columns with instant column count/value recalculation plus quick Won / Lost drop actions.
- **Unverifiable Private Detail**: Internal pointer physics easing constants.
- **SalesFortis Lesson**: Add native HTML5 drag-and-drop (`draggable`, drop-zone highlight, keyboard/button fallback) synced immediately with `PATCH /api/v1/crm/opportunities/{id}/stage` so stage changes survive full page reloads.

### 5. Deal Details, Activity Timelines, Notes & Attachments
- **Observed**: Pipedrive Home (`ev_c6531dd7...`) showcases *"Meeting intelligence built into every deal"* and unified deal context; Construction page (`ev_5306984c...`) highlights document + follow-up centralization.
- **Confirmed by Official Docs**: Deal detail view pairs a left summary sidebar (value, probability, close date, organization, contact, trade metadata) with a chronological right-pane composer for **Notes**, **Activities**, **Changelog**, and **Files**.
- **Unverifiable Private Detail**: Proprietary cloud storage S3 bucket layout.
- **SalesFortis Lesson**: Clicking any Opportunity card or row opens a rich **Opportunity Detail Slide-Over Workspace** displaying linked GC Account, Primary Contact, Bid/RFQ summary, chronological Activity & Note timeline, and quick-add composers backed by PostgreSQL.

### 6. Tasks, Calls, Meetings & Calendar Scheduling
- **Observed**: Pipedrive Construction (`ev_5306984c...`): *"Schedule your site visits and follow-ups in one place"* and *"Coordinate your crews and clients straight from your phone"*.
- **Confirmed by Official Docs**: Activity types (`Call`, `Meeting`, `Task`, `Deadline`, `Email`, `Lunch`) have due dates, completion checkboxes, and overdue indicators on deal cards (activity-based selling).
- **Unverifiable Private Detail**: Two-way OAuth calendar webhook internals.
- **SalesFortis Lesson**: Support construction-ready activity types (`Call`, `Site Walk / Jobsite Visit`, `Pre-Bid Meeting`, `Bid Follow-Up`, `Estimating Task`) with due dates, overdue/today badges, and 1-click completion persisted in PostgreSQL.

### 7. Email Integration, Templates & Communication Tracking
- **Observed**: Pipedrive Support KB (`Email`, `Campaigns`, `ev_3e17b649...`) and Followup CRM (`Outlook Integration`, `ev_bd36f079...`).
- **Confirmed by Official Docs**: Reusable sales email templates with merge placeholders (`{{contact_name}}`, `{{deal_title}}`, `{{bid_amount}}`) logged directly to the deal timeline.
- **Unverifiable Private Detail**: Live IMAP/SMTP sync daemon implementation.
- **SalesFortis Lesson**: Provide built-in **Construction Bid Email Templates** (*ITB Receipt Confirmation*, *RFI Clarification Request*, *Scope Proposal Transmittal*, *GC Post-Bid Follow-Up*) that merge live deal/GC fields and log outbound communication events to the deal timeline (honestly documenting external SMTP/Outlook OAuth as an optional integration).

### 8. Sales Workflow Automation & Follow-Up Reminders
- **Observed**: Pipedrive Home (`ev_c6531dd7...`): *"Automate the busywork, focus on selling"*.
- **Confirmed by Official Docs**: Stage-transition triggers automatically schedule follow-up tasks (e.g., moving a deal to *Bid Submitted* schedules a +3 day GC follow-up call).
- **Unverifiable Private Detail**: Multi-branch visual automation canvas internals.
- **SalesFortis Lesson**: Implement real backend **Stage-Driven Follow-Up Automation**: when a Construction deal moves to `proposal` / `bid_submitted`, automatically create a scheduled +3 day *GC Bid Follow-Up Call* task; when moved to `won`, create a *Project Handover & SOV Kickoff* task!

### 9. Deal Aging, Inactivity Alerts & Prioritization
- **Observed**: Pipedrive Support KB (`Pulse`, `ev_3e17b649...`) and Home (`chase the right ones first`, `ev_c6531dd7...`).
- **Confirmed by Official Docs**: "Rotting deals" highlight opportunities that sit idle past a stage threshold without updated activity, plus missing-next-activity warnings.
- **Unverifiable Private Detail**: Internal Pulse ML ranking weights.
- **SalesFortis Lesson**: Compute real `days_in_stage` from PostgreSQL `opportunities.updated_at` and surface **Stale / Idle Bid Alerts** (`> 7 days` idle) and **Next Action Required** indicators directly on Kanban cards and the Dashboard!

### 10. Custom Fields, Filters, Search & Saved Views
- **Observed**: Pipedrive Support KB (`Organizing your data`, `ev_3e17b649...`) and Followup CRM (`Completely Customizable`, `ev_bd36f079...`).
- **Confirmed by Official Docs**: Instant keyword search, owner/stage/status filters, and 1-click saved filter presets.
- **Unverifiable Private Detail**: Schema EAV indexing internals.
- **SalesFortis Lesson**: Add instant search + **Saved Construction Views** (*All Active Bids*, *Due This Week*, *High-Value > \$250k*, *Stale / Needs Follow-Up*, *Awarded Backlog*) across Pipeline, Leads, Contacts, and RFQs.

### 11. Dashboards, Reports, Goals & Revenue Forecasting
- **Observed**: Pipedrive Construction (`ev_5306984c...`): *"Forecast your construction pipeline with visual reports"*; Followup CRM (`ev_bd36f079...`): *"Win the bids that build a profitable backlog"* & *"Reporting and Dashboards"*.
- **Confirmed by Official Docs**: Weighted pipeline forecast by expected close month, stage conversion funnel, win/loss reasons, and monthly/quarterly quota progress bars.
- **Unverifiable Private Detail**: Custom BI SQL cube engine.
- **SalesFortis Lesson**: Replace static dashboard strings with **real PostgreSQL tenant aggregations**: Total Pipeline Value, Weighted Forecast, Bid-Hit Ratio (Won vs Lost), Estimated vs Awarded Value, Monthly Quota Goal Progress, and Stage Breakdown!

### 12. Product Catalogs, Quotations & Sales Documents
- **Observed**: Pipedrive Construction (`ev_5306984c...`): *"Create and sign construction documents without leaving..."* and `Smart Docs` (`ev_c6531dd7...`).
- **Confirmed by Official Docs**: Structured line-item quotes/estimates attached to deals with version tracking.
- **Unverifiable Private Detail**: Embedded e-signature cryptographic broker.
- **SalesFortis Lesson**: Connect CRM Opportunities directly to **Construction RFQs & Multi-Version Estimates (`v1.0`, `v2.0`)** backed by PostgreSQL `rfqs` and `estimates` tables, including Bid/No-Bid scoring and scope proposal summary generation.

### 13. Team Collaboration, Ownership & Permissions
- **Observed**: Pipedrive Home (`ev_c6531dd7...`): *"Enterprise-grade security and robust account controls"*; Construction (`ev_5306984c...`): *"Unite your team and eliminate project delays"*.
- **Confirmed by Official Docs**: Every lead, deal, account, and activity carries an explicit `owner_id`, role-based visibility, and audit trail.
- **Unverifiable Private Detail**: Enterprise SSO SAML attribute mapping UI.
- **SalesFortis Lesson**: Display estimator/sales owner assignment on Deals and Leads, enforce strict `tenant_id` + `require_industry_entitlement("construction")` server-side, and log mutations via `AuditService`.

### 14. Import/Export, Integrations & Onboarding
- **Observed**: Both Pipedrive (`Over 500+ integrations`, `ev_5306984c...`) and Followup CRM (`Integrates with your ERP`, `ev_bd36f079...`) emphasize CSV import/export and ERP handoff.
- **Confirmed by Official Docs**: CSV export of pipeline/contacts and guided sample-data onboarding with clear demo badges.
- **Unverifiable Private Detail**: Marketplace OAuth app review pipeline.
- **SalesFortis Lesson**: Provide 1-click **CSV Export** for Opportunities/Bids and SOV schedules, quick CSV/bulk Lead import helper, and explicit **Demo Seed Badge** whenever sample records are displayed.

### 15. AI Assistance, Lead Scoring & Sales Recommendations
- **Observed**: Followup CRM (`ev_bd36f079...`): *"Talk to your CRM. AI enters the data."*; Pipedrive KB (`Pipedrive AI`, `ev_3e17b649...`).
- **Confirmed by Official Docs**: AI summarizes deal history, suggests next best sales actions, and extracts structured requirements from uploaded files.
- **Unverifiable Private Detail**: Proprietary LLM prompt weights.
- **SalesFortis Lesson**: Integrate **AI RFQ Document Extraction** (CSI divisions + scope delta), **AI Bid/No-Bid & Next-Action Recommendations**, and **Tenant-Grounded RAG Q&A** — always separating verified source citations from model-generated recommendations.

### 16. Responsive Layouts, Accessibility & Interaction Quality
- **Observed**: Across all 10 REA desktop (`1440x900`) and mobile (`390x844`) captures, navigation collapses cleanly to accessible drawers, ARIA `role="tab"` and `role="dialog"` semantics are preserved, and primary CTAs remain above the fold.
- **SalesFortis Lesson**: Maintain strict keyboard focus, ARIA labels/roles, responsive Kanban horizontal scroll + compact mobile table cards, and zero console/page errors.

### 17. Marketing Site Hierarchy, Messaging, Storytelling, Pricing & Conversion
- **Observed**: Pipedrive Construction (`ev_5306984c...`) and Followup CRM (`ev_bd36f079...`) follow a high-converting B2B SaaS arc:
  1. Outcome-driven Construction CRM headline (*winning profitable bids & forecasting backlog*)
  2. Interactive UI preview (Pipeline + Bid Calendar + Forecast)
  3. End-to-end Lead-to-Handover workflow strip
  4. Deep CRM + Construction Bid Desk feature showcases
  5. AI & ERP/Document handoff proof
  6. Transparent tiered pricing + Request Demo / Start Free Trial CTAs
  7. Construction-specific FAQs (6+ buyer questions) without mentioning competitors inappropriately.

