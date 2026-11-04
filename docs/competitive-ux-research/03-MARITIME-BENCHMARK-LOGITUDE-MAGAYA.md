# 03 — Maritime & Freight UX Benchmark: Logitude World & Magaya

## 1. Evidence References
- **Logitude World (`https://www.logitudeworld.com/freight-forwarding-crm/`)**:
  - Desktop (`1440x900`): `ev_bd435445206d6e619ecd37959268a54d1447cf80185dea2f2472d495c7d93e81` (`174,663` DOM bytes, `141` network events, `11,266` a11y bytes)
  - Mobile (`390x844`): `ev_4543fcfff093a812981ba609a482edba6ed7e6ba907c2b8a5ef766d1b6706b1c` (`174,705` DOM bytes, `141` network events, `7,282` a11y bytes)
- **Magaya (`https://www.magaya.com/`)**:
  - Desktop (`1440x900`): `ev_248bede5eaafc95890f22f76251ed6aa87949cba4dc4dd00528cd8f2b35507e8` (`384,989` DOM bytes, `469` network events, `14,618` a11y bytes)
  - Mobile (`390x844`): `ev_8c008823d88635fbbcd2fe689b433d368052e88ac1704fe0dd2e26cc4b37124d` (`380,469` DOM bytes, `461` network events, `13,247` a11y bytes)

---

## 2. Logitude World (`/freight-forwarding-crm/`) — Observed Structure & UX Patterns

### 2.1 Information Architecture & Navigation (Observed)
- **Freight-Native Navigation Hierarchy**:
  - `Solutions`: *Freight Forwarding Software, e-AWB for Freight Forwarders, CRM for Freight Forwarders*.
  - `Features` (with `"Newest"` capability badges): *Logitude AI, Shipments, Quotes, Invoices and Payments, Digital Portal, Container Tracking, Dashboard, Automation, Security Features*.
  - Direct top-level `Pricing`, `Resources`, `Support`, `Login`, and language selector.
- **23 Structured `<section>` Blocks Telling the Sales-to-Ops Story**:
  - `H1`: *"Logistics CRM Software"* → `H2`: *"Designed for Freight Forwarders"*.
  - Core Forwarding CRM Pillars (`H3` nodes observed):
    1. **Opportunity Management**
    2. **Sales Funnel**
    3. **Quote Management**
    4. **Activity Tracking**
    5. **The Power of Dashboard**
  - Pain-Point Storytelling (`H3` nodes): *"The costs of using more than one platform"*, *"Repetitive Tasks"*, *"Managing sales teams in different locations"*—emphasizing unified Sales + Operations + Finance in a single cloud database.

### 2.2 Responsive Behavior (Observed)
- Clean Bootstrap/custom responsive collapse at `390x844`: desktop nested `menu` lists collapse behind `button "Toggle navigation"`, shrinking the accessibility tree from `11,266` bytes to `7,282` bytes while keeping hero `H1`/`H2` copy immediately above the fold.

---

## 3. Magaya (`/`) — Observed Structure & UX Patterns

### 3.1 Information Architecture & Modular Ecosystem (Observed)
- **Executive Positioning (`H1`)**: *"The #1 Freight Management Platform for Freight Forwarders and Customs Brokers"*.
- **Sub-Segment Industry Matrix (`Industries` menu observed)**:
  - *Freight Forwarding, Export, Import, 3PL, NVOCC, Warehouse, Courier, Customs Brokerage*.
- **5-Pillar Modular Platform Presentation (`H2` + `H3` pairing observed)**:
  1. **MAGAYA SUPPLY CHAIN** — *Freight Forwarding & Warehouse Management Software*
  2. **MAGAYA CUSTOMS COMPLIANCE** — *Customs Compliance Software (ABI)*
  3. **MAGAYA WMS** — *Warehouse Management Software*
  4. **MAGAYA RATE MANAGEMENT** — *Freight Rates and Quotes Software*
  5. **MAGAYA DIGITAL FREIGHT PORTAL** — *Digital Customer Experience Software*
- **Outcome & Velocity Metrics**: Highlights `300%` documentation/shipment turnaround improvement and `2,300+ customers in 100+ countries`, paired with action CTAs (`SEE IT IN ACTION`, `EXPLORE THE PLATFORM`, `SCHEDULE A DEMO`).

---

## 4. Access Limitations & Epistemic Notes
- Both Logitude World and Magaya public websites rendered cleanly (`HTTP 200`) across desktop and mobile viewports.
- Authenticated customer portals / cloud forwarding consoles were **not** accessed, preserving strict security boundaries.

---

## 5. Actionable Design & Engineering Lessons Applied to SalesFortis Maritime Suite

1. **Unified Sales CRM → Rate Management → Shipment Execution**: Combining Logitude's integrated *Opportunity → Quote → Shipment* CRM flow with Magaya's modular *Rate Management + Supply Chain Documentation + Digital Freight Portal* taxonomy, SalesFortis Maritime unifies shipper tenders (`LeadsPipeline.tsx`) with four dedicated operational desks in `MaritimeWorkbench.tsx`:
   - *Multimodal Spot & Contract Ocean Quoting* (`20GP` / `40GP` / `40HC` / `REEFER` with `BAF` + `THC` + `PSS` surcharges via `POST /quote`)
   - *Container Milestone Timeline & Last Free Day (LFD) Demurrage Control* (`GET/POST /shipments/{bl}/milestones` + `GET /tracking/{bl}`)
   - *Carrier Tariff CSV/Text AI Normalization & Pricing Manager Approval Gate* (`POST /ai/extract-rate-sheet`, `POST /ai/upload-tariff`, `GET /rate-cards`, `POST /rate-cards/{id}/approve`)
   - *Digital NVOCC House Bill of Lading (HBL) Desk* (`POST /hbl`)
2. **High-Contrast Ocean Control-Tower Aesthetics**: Deep maritime slate + cyan/ocean blue (`#0284c7`) palette with monospace container numbers, UN/LOCODE port references, Master/House B/L identifiers, and high-visibility red detention alert pills when terminal free days drop to `<= 2`.

