# Tenant

> God node · 65 connections · `core/models/auth.py`

**Community:** [Community 8](Community_8.md)

## Connections by Relation

### calls
- test_clinical_consent_guardrail_and_persistence() `EXTRACTED`
- test_change_event_status_transitions_and_isolation() `EXTRACTED`
- test_sov_persistence_and_idempotency() `EXTRACTED`
- get_or_create_default_tenant() `EXTRACTED`
- test_clinical_tenant_isolation() `EXTRACTED`
- test_maritime_quotation_persistence_and_math() `EXTRACTED`
- test_house_bill_of_lading_generation() `EXTRACTED`
- test_shipment_timeline_and_detention_alert() `EXTRACTED`

### contains
- models/auth.py `EXTRACTED`

### imports
- auth_service.py `EXTRACTED`
- construction/router.py `EXTRACTED`
- ai/router.py `EXTRACTED`
- routers/crm.py `EXTRACTED`
- clinical/router.py `EXTRACTED`
- routers/auth.py `EXTRACTED`
- test_industry_isolation.py `EXTRACTED`
- maritime/router.py `EXTRACTED`
- test_api_endpoints.py `EXTRACTED`
- test_construction_suite.py `EXTRACTED`
- test_maritime_suite.py `EXTRACTED`
- test_vertical_workflows.py `EXTRACTED`
- test_clinical_suite.py `EXTRACTED`
- crm_service.py `EXTRACTED`

### inherits
- Base `EXTRACTED`

### references
- 2. Shared Platform Baseline `INFERRED`
- SalesFortis — Checkpoint Register `INFERRED`
- 2. Backend Security & Service Layer `INFERRED`
- 4. Targeted Gap Assessment (Finalized Product Requirements) `INFERRED`
- 4.1 `Tenant` Model Enhancement (`core/models/auth.py`) `INFERRED`

### uses
- [get_current_tenant()](get_current_tenant.md) `INFERRED`
- require_industry_entitlement() `INFERRED`
- update_change_event_status() `INFERRED`
- register() `INFERRED`
- upload_document() `INFERRED`
- update_opportunity_stage() `INFERRED`
- create_referral() `INFERRED`
- verify_consent() `INFERRED`
- create_change_event() `INFERRED`
- create_sov_application() `INFERRED`
- list_change_events() `INFERRED`
- index_text() `INFERRED`
- create_account() `INFERRED`
- create_lead() `INFERRED`
- create_opportunity() `INFERRED`
- get_metrics() `INFERRED`
- list_referrals() `INFERRED`
- create_field_tm() `INFERRED`
- list_sov_applications() `INFERRED`
- create_hbl() `INFERRED`
- *…and 16 more `uses` connection(s) not listed (lowest-degree first to go)*

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*