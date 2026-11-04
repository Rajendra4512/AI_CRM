# Implementation Backlog: Commercial Subcontractor & Trade CRM

**Document ID:** `03-construction-implementation-backlog.md`  
**Date:** 2026-11-03  
**Suite:** Suite 1 - Commercial Subcontractor & Trade CRM  

---

## 1. Backlog Summary

| Requirement ID | Title | Priority | Complexity | Risk | Current Status |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **REQ-CON-01** | Database Persistence for Schedule of Values (SOV) Billing Applications | **P0** | Low | Low | Partial (Math tested, DB persistence missing) |
| **REQ-CON-02** | CSI MasterFormat Division Extractor for Construction Spec PDFs | **P0** | Medium | Medium | Missing (Generic text chunker only) |
| **REQ-CON-03** | Change Event to Potential Change Order (PCO) Workflow Persistence | **P1** | Medium | Low | Partial (In-memory list `_CHANGE_EVENTS`) |
| **REQ-CON-04** | Field T&M Ticket Mobile Capture & Photo Attachment | **P2** | Medium | Medium | Missing |
| **REQ-CON-05** | QuickBooks Online / Desktop Progress Billing Sync | **P2** | High | High | Not Implemented |

---

## 2. Detailed Requirement Specifications

### REQ-CON-01: Database Persistence for Schedule of Values (SOV) Billing Applications
- **Industry & Target Persona:** Commercial Specialty Trade Subcontractors (Electrical, Glazing, Mechanical, Drywall); Project Accountant & Operations Manager.
- **Customer Problem & Evidence:** Trade subcontractors waste 4 to 8 hours monthly manually compiling AIA G702/G703 progress billing spreadsheets. Calculation errors in stored materials or retainage deductions delay GC payment disbursements by up to 30 days (verified across Capterra & G2 user reviews).
- **Current Status:** `ConstructionSOVService` in `modules/construction/service.py` performs correct retainage (10%), work completed, and balance-to-finish calculations, verified by `test_vertical_workflows.py`. However, submitted SOV applications are not persisted to database tables.
- **Proposed Improvement:** Connect the SOV calculation endpoint to persist line-item applications into the `estimates` and `projects` tables with foreign-keyed `sov_line_items`.
- **Expected Measurable Business Outcome:** Cuts billing application preparation time from 6 hours to under 15 minutes; reduces GC invoice rejection rate to near zero.
- **API & Database Dependencies:** `POST /api/v1/verticals/construction/sov/calculate` and `POST /api/v1/verticals/construction/sov/submit`; dependencies on `projects` and `estimates` tables in `core/models/crm.py` and `modules/construction/models.py`.
- **Security & Compliance Considerations:** Tenant isolation required (`tenant_id`); retainage rates must be capped and validated against prime contract terms (0%–20%).
- **Complexity & Risk:** Low complexity; Low risk. Math engine is already implemented.
- **Priority:** **P0** (Essential for commercial launch).
- **Acceptance Criteria:**
  1. User can submit a multi-line SOV application from `VerticalHub.tsx`.
  2. Line items, retainage, and balance to finish are stored in PostgreSQL with `tenant_id`.
  3. Subsequent visits to the project display the historical payment applications and cumulative retainage ledger.
- **Focused Test Cases:**
  - `test_sov_persistence_creates_records_in_db`: Verify rows created in database.
  - `test_sov_tenant_isolation`: Verify Tenant B cannot view or modify Tenant A's SOV billing applications.

---

### REQ-CON-02: CSI MasterFormat Division Extractor for Construction Spec PDFs
- **Industry & Target Persona:** Chief Estimator & Preconstruction Manager.
- **Customer Problem & Evidence:** Estimators spend 15–25 hours per bid reviewing 500+ page architectural specification PDFs to identify trade-specific scope (e.g. Division 08 for glazing, Division 26 for electrical). Missed spec clauses cost trade subs $10,000–$50,000 in unbudgeted materials.
- **Current Status:** `ai/rag_service.py` chunks text into 500-char windows but has no awareness of CSI MasterFormat 6-digit section codes (e.g., `08 44 00`, `22 10 00`).
- **Proposed Improvement:** Add a regex-based CSI MasterFormat section splitter in `ai/rag_service.py` that tags chunks with CSI division numbers and section titles upon PDF upload.
- **Expected Measurable Business Outcome:** Reduces spec review time by 75%; allows estimators to filter search queries specifically within their trade division.
- **API & Database Dependencies:** `POST /api/v1/ai/upload`; `document_chunks` table metadata column.
- **Security & Compliance Considerations:** Proprietary architectural bid documents must remain strictly tenant-isolated.
- **Complexity & Risk:** Medium complexity; Medium risk.
- **Priority:** **P0** (Primary AI differentiator against Procore and Contractor Foreman).
- **Acceptance Criteria:**
  1. Uploading a specification PDF automatically detects and indexes CSI section headers.
  2. Querying `/api/v1/ai/query` with `division=08` filters results strictly to Division 08 Glazing & Windows.
- **Focused Test Cases:**
  - `test_csi_division_parsing`: Ingest mock CSI spec text and assert division tags are correctly populated.

---

### REQ-CON-03: Change Event to Potential Change Order (PCO) Workflow Persistence
- **Industry & Target Persona:** Field Superintendent & Project Manager.
- **Customer Problem & Evidence:** Trade subs lose 3%–7% of gross margin annually due to unbilled verbal field directives from GCs. Field supervisors perform out-of-scope work without creating formal written notices before completing the task.
- **Current Status:** `modules/construction/router.py` exposes `POST /change-events` but appends to an in-memory list `_CHANGE_EVENTS`.
- **Proposed Improvement:** Persist Change Events to PostgreSQL and add a state transition action (`Draft` ➔ `RFQ Sent` ➔ `PCO Submitted` ➔ `Approved CCO`).
- **Expected Measurable Business Outcome:** Recaptures an estimated $25,000 to $80,000 in unbilled trade modifications per project annually.
- **API & Database Dependencies:** `POST /api/v1/verticals/construction/change-events` and `PATCH /api/v1/verticals/construction/change-events/{id}/status`.
- **Security & Compliance Considerations:** Timestamped audit trail required for change order dispute resolution with GCs.
- **Complexity & Risk:** Medium complexity; Low risk.
- **Priority:** **P1** (High-value differentiation).
- **Acceptance Criteria:**
  1. Creating a change event persists to the database with title, trade scope, estimated cost, and status.
  2. Advancing status to `pco_approved` updates the contract billing baseline.
- **Focused Test Cases:**
  - `test_change_event_db_persistence`: Verify status progression and database row creation.

