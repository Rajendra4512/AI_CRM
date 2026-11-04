# Implementation Backlog: Clinical Trials & Patient Recruitment CRM

**Document ID:** `05-clinical-implementation-backlog.md`  
**Date:** 2026-11-03  
**Suite:** Suite 2 - Clinical Trials & Patient Recruitment CRM  

---

## 1. Backlog Summary

| Requirement ID | Title | Priority | Complexity | Risk | Current Status |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **REQ-CLN-01** | Database Persistence for Subject Funnel & 21 CFR Part 50 Consent Ledger | **P0** | Low | High (Compliance) | Partial (Logic verified in unit tests; in-memory storage) |
| **REQ-CLN-02** | Protocol Inclusion/Exclusion Criteria Extractor & Survey Generator | **P0** | Medium | Medium | Missing (Generic RAG chunker only) |
| **REQ-CLN-03** | Patient De-Identification & HIPAA PHI Masking Middleware | **P1** | Medium | High (Legal/HIPAA) | Not Implemented |
| **REQ-CLN-04** | Site Enrollment Velocity & Accrual Quota Forecasting | **P2** | Low | Low | Partial (UI static chart) |
| **REQ-CLN-05** | Two-Way SMS Appointment Reminders & Visit Window Tracking | **P2** | Medium | Medium | Not Implemented |

---

## 2. Detailed Requirement Specifications

### REQ-CLN-01: Database Persistence for Subject Funnel & 21 CFR Part 50 Consent Ledger
- **Industry & Target Persona:** Clinical Research Coordinators (CRCs), Principal Investigators (PIs), and Site Operations Directors.
- **Customer Problem & Evidence:** Accidental subject randomization prior to documented Informed Consent Form (ICF) execution constitutes a major GCP violation and FDA Form 483 inspection finding. In high-turnover clinical sites, coordinators relying on paper checklists risk regulatory protocol disqualification.
- **Current Status:** `ClinicalComplianceService` in `modules/clinical/service.py` enforces a strict guardrail: attempting to randomize an unconsented patient returns an HTTP 400 rejection (`test_clinical_consent_compliance_enforcement`). However, patient state is stored in an in-memory list `_PATIENTS_DATABASE`.
- **Proposed Improvement:** Persist patient subjects, referral sources, screening stages (`Identified`, `Prescreened`, `Consented`, `Randomized`), and cryptographically timestamped consent records to the `referrals` and `studies` database tables.
- **Expected Measurable Business Outcome:** Guarantees 100% regulatory audit compliance for subject randomization; eliminates paper checklist errors.
- **API & Database Dependencies:** `POST /api/v1/verticals/clinical/consent/verify` and `GET /api/v1/verticals/clinical/funnel/{study_id}`; `studies` and `referrals` tables in `modules/clinical/models.py`.
- **Security & Compliance Considerations:** FDA 21 CFR Part 11 immutable audit trail; every consent status change must record user ID, timestamp, and IP address.
- **Complexity & Risk:** Low complexity; High regulatory sensitivity.
- **Priority:** **P0** (Essential launch requirement).
- **Acceptance Criteria:**
  1. Attempting to randomize an unconsented subject returns HTTP 400 error.
  2. Verified consent transitions subject to `randomized` and writes timestamped entry in PostgreSQL.
- **Focused Test Cases:**
  - `test_consent_guardrail_db_persistence`: Verify state transitions and database rows.
  - `test_unconsented_randomization_rejected`: Confirm HTTP 400 is raised without consent.

---

### REQ-CLN-02: Protocol Inclusion/Exclusion Criteria Extractor & Survey Generator
- **Industry & Target Persona:** Clinical Trial Project Manager & Patient Recruitment Specialist.
- **Customer Problem & Evidence:** Trial launch is notoriously slow: translating a 150-page protocol PDF into public recruitment advertisements and digital prescreening surveys takes coordinators 2 to 4 weeks per study. Up to 70% of referred patients fail on-site screening due to poorly framed prescreening questions.
- **Current Status:** `ai/rag_service.py` performs sliding-window chunking, but lacks clinical entity recognition (e.g. identifying age ranges, HbA1c lab thresholds, prior medication washouts).
- **Proposed Improvement:** Enhance `ai/rag_service.py` with a clinical protocol section extractor that isolates Section 4/5 (Eligibility Criteria) and outputs a structured pre-screening questionnaire with disqualification logic.
- **Expected Measurable Business Outcome:** Reduces prescreening survey creation time from 3 weeks to under 30 minutes; cuts on-site screening failure rates by an estimated 25%.
- **API & Database Dependencies:** `POST /api/v1/ai/upload`; `studies` table in `modules/clinical/models.py`.
- **Security & Compliance Considerations:** AI must assist in drafting questions; Principal Investigator must review and approve questions before publishing to comply with IRB rules.
- **Complexity & Risk:** Medium complexity; Medium risk.
- **Priority:** **P0** (High-value differentiator against RealTime CTMS and TrialX).
- **Acceptance Criteria:**
  1. Uploading a clinical protocol PDF extracts age limits, gender, diagnostic criteria, and exclusion medications.
  2. Generates preview questionnaire for coordinator review.
- **Focused Test Cases:**
  - `test_protocol_criteria_extraction`: Ingest mock protocol text and verify extracted inclusion/exclusion parameters.

---

### REQ-CLN-03: Patient De-Identification & HIPAA PHI Masking Middleware
- **Industry & Target Persona:** Clinical Site Privacy Officer & IT Compliance Director.
- **Customer Problem & Evidence:** Under HIPAA and GDPR regulations, transmitting unencrypted Protected Health Information (PHI) such as patient names, phone numbers, and medical record numbers into cloud AI endpoints carries penalties up to $50,000 per violation.
- **Current Status:** Not implemented. Documents uploaded to `POST /api/v1/ai/upload` are indexed directly.
- **Proposed Improvement:** Implement a regex-based PHI scrubber in `ai/rag_service.py` before text chunking (masking SSNs, phone numbers, email addresses, and date-of-birth fields into anonymous tokens `[PHI_DATE]`, `[PHI_NAME]`).
- **Expected Measurable Business Outcome:** 100% HIPAA Safe Harbor compliance for AI document processing.
- **API & Database Dependencies:** Middleware before `RAGService.index_document`.
- **Security & Compliance Considerations:** Essential for life sciences legal sign-off.
- **Complexity & Risk:** Medium complexity; High legal risk if omitted.
- **Priority:** **P1** (Required before handling real patient medical records).
- **Acceptance Criteria:**
  1. Uploaded patient documents have names, phone numbers, and dates masked before vector storage.
- **Focused Test Cases:**
  - `test_phi_masking_scrubber`: Verify text containing synthetic patient records is scrubbed of identifying tokens.

