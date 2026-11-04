# 01 — Construction UX Benchmark: Procore & Contractor Foreman

## 1. Evidence References
- **Procore (`https://www.procore.com/en-sg`)**:
  - Desktop (`1440x900`): `ev_18509c052e496448a7a2983e201200c7268bfe178a864fe5da365dd6b89e40d6` (`630,658` DOM bytes, `491` network events, `13,081` a11y bytes)
  - Mobile (`390x844`): `ev_9c893c690c449c324d3f47586f279d5b5aa31b714c255f81419c0bdfac05163b` (`629,876` DOM bytes, `476` network events, `11,347` a11y bytes)
- **Contractor Foreman (`https://contractorforeman.com/plans/`)**:
  - Desktop (`1440x900`): `ev_030301e4e4fed1b0f862f08fa32b7422a59f5dfadaa450e52caa00c8dce86f40` (`1,494,978` DOM bytes, `798` network events, `54,188` a11y bytes)
  - Mobile (`390x844`): `ev_cec46ab87d1d56c64360847b79bff86ef8bb12178f6c6600c5d184dafc6bb465` (`1,507,868` DOM bytes, `735` network events, `35,904` a11y bytes)

---

## 2. Procore (`/en-sg`) — Observed Structure & UX Patterns

### 2.1 Information Architecture & Page Hierarchy (Observed)
- **Top Announcement Status Bar**: Dismissible product intelligence banner (`role="status"`) above primary header.
- **Primary Header (`banner` + `navigation "Primary Navigation"`)**:
  - Grouped mega-menu dropdown buttons (`Solutions`, `Who We Serve`, `Why Procore`, `Resources`, `Support`) + `Search`, regional selector (`Singapore (English)`), `Login` (`login.procore.com`), and high-contrast `Request a demo` CTA.
- **Section Progression (`14` `<section>` blocks observed)**:
  1. `H1`: *"Construction Project Management Software"* paired with Wistia hero product walkthrough media (`1920x810`).
  2. Stakeholder Persona Split (`H3` cards): **Main Contractors**, **Owners**, **Subcontractors** — routing each construction stakeholder into role-specific workflows rather than a one-size-fits-all pitch.
  3. Construction AI Pillar (`H2`: *"AI architected for construction"*, CTA: `Explore Procore AI`).
  4. End-to-End Platform Proof (`H2`: *"The #1 end-to-end construction management solution"*, scale metric `3 million+ global projects`).
  5. Social Proof & Case Studies (GC + Subcontractor alignment testimonials) + Buyer's Guide / ROI Report lead-capture resources.

### 2.2 Visual Design & Responsive Behavior (Observed)
- **Palette & Typography**: High-contrast industrial safety orange accent (`theme-color: #FF5200` observed in `<meta name="theme-color">`) paired with deep charcoal/black (`#000000` / slate) and crisp white content bands.
- **Responsive Transition (`1440px` → `390px`)**: Desktop mega-menu groups collapse cleanly into a single `button "Toggle navigation"` (`Hamburger`) while keeping `Request a demo` persistently visible in the mobile banner (`a11y_bytes` compresses from `13,081` to `11,347`).

---

## 3. Contractor Foreman (`/plans/`) — Observed Structure & UX Patterns

### 3.1 Information Architecture & Navigation (Observed)
- **Domain-Grouped Mega Navigation**: Explicitly categorizes tools by operational department rather than abstract software terms:
  - **Project Management**: *Scheduling, Daily Logs, Work Orders, Punchlists, Inspections, To-Do's*.
  - **Financials**: *AI Estimator, Takeoffs, Invoices, Online Payments*.
  - **People & CRM**: *Leads Manager, Time Cards, Team Chat, Incidents, Calendar*.
  - **Documents & Integrations**: Accounting sync (*QuickBooks, Xero*).
- **Transparent Tiered Capability Architecture**:
  - Tier cards (`\$49`, `\$105`, `\$166`, `\$221`, `\$332` billed annually / `\$139`–`\$399` monthly equivalents observed in `H3` nodes) paired with `Try for Free` and `See Details` CTAs.
  - **3 Full HTML Comparison Tables (`<table>` count = `3`)** under `H2: "Compare features"` allowing trade contractors to verify exact module inclusion row-by-row.
  - Structured buyer-objection FAQ (`H2: "Frequently Asked Questions"`) directly answering subcontractor vs. GC fit, project limits, and accounting integration.

### 3.2 Responsive Behavior (Observed)
- At `390x844` (`ev_cec46ab87d1d56c64360847b79bff86ef8bb12178f6c6600c5d184dafc6bb465`), the multi-item `Main Menu` list collapses into `button "Navigation Menu": Menu` (`16` accordion/toggle triggers across menu and FAQ items), reducing rendered accessibility tree size from `54,188` bytes to `35,904` bytes while keeping plan comparison tables scrollable.

---

## 4. Access Limitations & Epistemic Notes
- Public pages of both Procore and Contractor Foreman rendered completely (`HTTP 200`).
- Post-login authenticated Procore / Contractor Foreman project portals (`login.procore.com`) were **not** probed, per strict non-intrusion rules.

---

## 5. Actionable Design & Engineering Lessons Applied to SalesFortis Construction Suite

1. **Industrial Visual Authority**: Adopted a high-contrast industrial safety-orange (`#ea580c`) + slate-950 (`#090e1a`) accent hierarchy with zero toy emojis, monospace CSI MasterFormat codes (`03-3000`, `05-1200`, `26-0500`), and tabular financial alignment.
2. **Departmental Sub-Navigation (Field vs. Office Financials)**: Structured both `AppLayout.tsx` and `ConstructionWorkbench.tsx` around real contractor departments:
   - *Preconstruction & ITB Pipeline* (`LeadsPipeline.tsx`)
   - *AIA G702/G703 SOV Progress Billing & ERP CSV Export*
   - *Change Events (CE) → RFQ → PCO Approval State Machine*
   - *Field Time & Material (T&M) Crew Tickets*
   - *CSI MasterFormat Specification & Addendum Delta AI*
3. **Searchable & Status-Filtered Operational Registers**: Added `EnterpriseFilterableTable` with instant text search (`CE#`, trade scope) and PCO state pills (`Draft`, `RFQ Issued`, `PCO Submitted`, `Approved`) plus 1-click state advancement wired to `PATCH /api/v1/verticals/construction/change-events/{id}/status`.
4. **Transparent Capability Matrix on Marketing**: Built an original SalesFortis Construction workspace comparison table on `/vertical/construction` clearly mapping capabilities across evaluation and enterprise tiers without unauthorized payment processing.

