# ConstructionSOVService

> God node · 30 connections · `modules/construction/service.py`

**Community:** [Community 1](Community_1.md)

## Connections by Relation

### contains
- construction/service.py `EXTRACTED`

### imports
- construction/router.py `EXTRACTED`
- test_construction_suite.py `EXTRACTED`

### method
- .persist_sov_application() `EXTRACTED`
- .get_or_create_demo_project() `EXTRACTED`
- .create_change_event() `EXTRACTED`
- .transition_change_event() `EXTRACTED`
- .calculate_sov_application() `EXTRACTED`
- .list_sov_applications() `EXTRACTED`
- .list_change_events() `EXTRACTED`
- .record_field_tm() `EXTRACTED`
- .calculate_sov_line() `EXTRACTED`

### references
- 1. Component Reconciliation & Code Readiness Matrix `INFERRED`
- REQ-CON-01: Database Persistence for Schedule of Values (SOV) Billing Applications `INFERRED`

### uses
- SOVApplication `INFERRED`
- update_change_event_status() `INFERRED`
- ChangeEvent `INFERRED`
- create_change_event() `INFERRED`
- create_sov_application() `INFERRED`
- list_change_events() `INFERRED`
- SOVLineItem `INFERRED`
- test_change_event_status_transitions_and_isolation() `INFERRED`
- test_sov_persistence_and_idempotency() `INFERRED`
- create_field_tm() `INFERRED`
- list_sov_applications() `INFERRED`
- FieldTimeMaterial `INFERRED`
- Project `INFERRED`
- list_projects() `INFERRED`
- calculate_sov() `INFERRED`
- test_sov_calculation_math() `INFERRED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*