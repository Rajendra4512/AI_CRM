# Product Readiness: Customer Validation & Discovery Plan

**Document ID:** `06-customer-validation-plan.md`  
**Date:** 2026-11-03  
**Objective:** Define a structured, evidence-based customer interview and workflow demonstration protocol across all three suites to validate willingness-to-pay and product-market fit before commercial launch.  

---

## 1. Suite 1: Commercial Subcontractor & Trade CRM

### 1.1 Ideal Customer Profile (ICP)
- **Target Company:** Commercial Specialty Trade Subcontractor (Glazing, Electrical, Mechanical/HVAC, Drywall/Acoustical).
- **Size:** 10 to 75 employees, $3M to $25M annual volume.
- **Key Decision Makers:** Owner/President, Chief Estimator, Senior Project Manager.

### 1.2 Five Most Important Interview Questions
1. *"When you receive a 500-page architectural specification packet for a new bid, what is your exact step-by-step process to find your trade's scope and identify addenda changes?"*
2. *"How do you currently compile your monthly AIA G702/G703 progress billing applications, and how frequently do GCs contest your retainage or stored material calculations?"*
3. *"How many different General Contractor software portals (Procore, BuildingConnected, PlanGrid) do your project managers log into weekly, and how do you aggregate that data internally?"*
4. *"When your field foremen receive a verbal change directive from a GC superintendent on site, what percentage of that work gets converted into an approved paid change order versus eaten as margin loss?"*
5. *"If you had a software platform that automatically pulled your trade's spec requirements from PDFs and built your progress billing in minutes, would you pay $250/month for it? Why or why not?"*

### 1.3 Three Customer Workflows to Demonstrate
1. **Workflow A: Instant AI Spec Chunking:** Ingest a real 400-page institutional hospital spec and immediately query Division 08 glazing acoustic ratings and submittal deadlines.
2. **Workflow B: Live Schedule of Values (SOV) Recalculation:** Demonstrate dynamic 10% retainage math, stored materials line items, and net payment due calculations in `VerticalHub.tsx`.
3. **Workflow C: Subcontractor-First Opportunity Kanban:** Move a bid from `Qualified` to `Proposal` to `Closed Won` and show seamless contract creation.

### 1.4 Pricing Hypotheses to Test
- **Hypothesis 1:** Trades will willingly pay **$249/month** (flat for up to 10 users) to eliminate 15 hours of manual spec review and Excel billing headaches per month.
- **Hypothesis 2:** Volume-based pricing (Procore model) is deeply resented by trade subcontractors; transparent flat pricing is a massive competitive magnet.

### 1.5 Evidence Required Before Commercial Launch
- At least **5 independent trade estimators** successfully test the AI spec parser on their own project PDFs and rate the extracted scope as "accurate and bid-ready".
- At least **3 project accountants** confirm the SOV output satisfies their general contractors' payment application format.

---

## 2. Suite 2: Clinical Trials & Patient Recruitment CRM

### 2.1 Ideal Customer Profile (ICP)
- **Target Company:** Independent Clinical Research Site, Site Management Organization (SMO), or Phase I-III Academic Medical Center trial unit.
- **Size:** 5 to 30 clinical coordinators, managing 5 to 25 active concurrent protocols.
- **Key Decision Makers:** Site Director, Clinical Operations Manager, Lead Clinical Research Coordinator (CRC).

### 2.2 Five Most Important Interview Questions
1. *"How much time does your team spend translating a new protocol PDF into patient-facing digital prescreening surveys and coordinator screening checklists?"*
2. *"What percentage of prospective patient referrals fail your initial phone screen or on-site screening visit, and where in the recruitment funnel do you experience the greatest drop-off?"*
3. *"What software or manual checklists do you use today to guarantee that a patient is never randomized into a trial before their electronic consent form (ICF) is legally executed?"*
4. *"What do you dislike most about your current CTMS (e.g. RealTime, CRIO, or spreadsheets), and what tasks feel most repetitive to your coordinators?"*
5. *"Would your site pay $499/month for a modern recruitment CRM that drafts inclusion/exclusion surveys automatically from protocols and prevents unconsented randomizations?"*

### 2.3 Three Customer Workflows to Demonstrate
1. **Workflow A: Protocol PDF Eligibility Extractor:** Ingest an oncology/cardiology protocol and extract structured inclusion/exclusion criteria.
2. **Workflow B: 21 CFR Part 50 Randomization Guardrail:** Attempt to randomize an unconsented subject, observe the compliance error, check the consent box, and verify instant audit-logged randomization.
3. **Workflow C: Patient Recruitment Funnel Kanban:** Track a cohort moving from `Identified` to `Prescreened` to `Consented` with live site recruitment velocity metrics.

### 2.4 Pricing Hypotheses to Test
- **Hypothesis 1:** Clinical research sites will pay **$499/month** (up to 10 active protocols) if it demonstrably cuts trial startup time by two weeks.
- **Hypothesis 2:** Trial sponsors/biotechs are willing to sponsor the software cost for their investigative sites to gain live recruitment funnel transparency.

### 2.5 Evidence Required Before Commercial Launch
- Approval from at least **2 clinical trial regulatory/compliance officers** that the consent guardrail meets GCP and 21 CFR Part 11 audit trail expectations.
- Demonstration that the protocol extractor achieves >95% precision on standard inclusion/exclusion section parsing.

---

## 3. Suite 3: Maritime Logistics & Freight Brokerage CRM

### 3.1 Ideal Customer Profile (ICP)
- **Target Company:** Independent Ocean Freight Forwarder, NVOCC, or Freight Brokerage.
- **Size:** 5 to 40 operators/brokers, handling 100 to 1,500 TEUs monthly.
- **Key Decision Makers:** Managing Director, Head of Ocean Freight, Pricing & Procurement Manager.

### 3.2 Five Most Important Interview Questions
1. *"When a shipper asks for a spot container quote from Shanghai to Los Angeles, how many separate systems or carrier PDFs do you check before issuing a rate?"*
2. *"How long does it typically take your brokerage to return a verified freight quote to a prospective shipper, and what percentage of deals do you lose due to quote delays?"*
3. *"How do you currently track fuel surcharges (BAF), terminal handling (THC), and peak season surcharges (PSS) to ensure your margin markup isn't wiped out?"*
4. *"How many hours per week does your pricing team spend manually typing ocean carrier rate sheets into spreadsheets or your TMS?"*
5. *"Would your brokerage pay $299/month for a tool that extracts carrier rate sheets automatically and generates client quotes with verified surcharges in 30 seconds?"*

### 3.3 Three Customer Workflows to Demonstrate
1. **Workflow A: 30-Second Multi-Factor Spot Quoting:** Select trade lane (e.g. `ASIA-USEC`), container type, and quantity, and show automated calculation of Base + BAF + THC + PSS with transparent margin markup.
2. **Workflow B: Carrier Rate Sheet PDF Ingestion:** Upload an ocean carrier rate circular and show immediate conversion into active trade lane rate cards.
3. **Workflow C: Container Milestone & Demurrage Alerting:** Demonstrate container tracking timeline with an automated amber alert on port dwell time exceeding 4 days.

### 3.4 Pricing Hypotheses to Test
- **Hypothesis 1:** Freight forwarders will pay **$299/month** per branch office because winning 2 additional container bookings per month easily covers the entire annual software cost.
- **Hypothesis 2:** Forwarders refuse to replace their core accounting/customs software, but eagerly adopt a modern "front-end" sales quoting CRM that feeds their existing operations.

### 3.5 Evidence Required Before Commercial Launch
- Validation from at least **5 freight forwarding brokers** that the spot quote calculations match real carrier tariff structures across major ocean trade lanes.

---

## 4. Opportunity Decision Governance Matrix (Proceed / Pivot / Kill)

| Decision Criteria | PROCEED Criteria | PIVOT Criteria | KILL Criteria |
| :--- | :--- | :--- | :--- |
| **Customer Problem Severity** | >80% of interviewed target personas rank the problem as a "Top 3 operational headache". | Customers acknowledge the problem but rate it as minor compared to other daily fires. | Customers solve the problem adequately with existing free tools and report minimal friction. |
| **Willingness to Pay (WTP)** | >40% of qualified interviewees express readiness to sign a Letter of Intent (LOI) or start a paid pilot at target pricing. | Customers love the software but will only pay 50% of target pricing; requires lower-tier self-serve packaging. | Customers refuse to pay any recurring software fee; demand free access funded by other parties. |
| **Technical Feasibility** | The core workflow can be delivered via our existing modular monolith with <30 days of targeted engineering. | The workflow requires heavy third-party integrations (e.g. complex carrier EDI or hospital EHR sync) extending delivery. | The capability requires custom regulatory certifications or on-premise hardware outside SaaS scope. |

