# ClinicalComplianceService

> God node · 20 connections · `modules/clinical/service.py`

**Community:** [Community 6](Community_6.md)

## Connections by Relation

### contains
- clinical/service.py `EXTRACTED`

### imports
- clinical/router.py `EXTRACTED`
- test_clinical_suite.py `EXTRACTED`

### method
- .get_or_create_demo_study() `EXTRACTED`
- .verify_and_randomize() `EXTRACTED`
- .get_funnel_metrics() `EXTRACTED`
- .list_referrals() `EXTRACTED`
- .record_consent_evidence() `EXTRACTED`

### rationale_for
- CTMS Funnel tracking and electronic consent (21 CFR Part 50 / GCP) compliance… `EXTRACTED`

### references
- REQ-CLN-01: Database Persistence for Subject Funnel & 21 CFR Part 50 Consent Ledger `INFERRED`

### uses
- Referral `INFERRED`
- ConsentEvidence `INFERRED`
- test_clinical_consent_guardrail_and_persistence() `INFERRED`
- create_referral() `INFERRED`
- verify_consent() `INFERRED`
- Study `INFERRED`
- get_metrics() `INFERRED`
- list_referrals() `INFERRED`
- Site `INFERRED`
- test_clinical_tenant_isolation() `INFERRED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*