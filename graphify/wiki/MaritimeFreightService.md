# MaritimeFreightService

> God node · 21 connections · `modules/maritime/service.py`

**Community:** [Community 4](Community_4.md)

## Connections by Relation

### contains
- maritime/service.py `EXTRACTED`

### imports
- maritime/router.py `EXTRACTED`
- test_maritime_suite.py `EXTRACTED`

### method
- .calculate_freight_quote() `EXTRACTED`
- .get_shipment_timeline() `EXTRACTED`
- .get_or_create_demo_shipment() `EXTRACTED`
- .create_house_bill_of_lading() `EXTRACTED`
- .seed_rate_cards_if_empty() `EXTRACTED`

### rationale_for
- Maritime logistics quote engine, rate card manager, and container milestone… `EXTRACTED`

### references
- REQ-MAR-01: Database Persistence for Rate Quotes & Trade Lane Tariffs `INFERRED`

### uses
- MilestoneEvent `INFERRED`
- create_hbl() `INFERRED`
- quote_freight() `INFERRED`
- HouseBillOfLading `INFERRED`
- Quotation `INFERRED`
- test_maritime_quotation_persistence_and_math() `INFERRED`
- get_shipment_timeline() `INFERRED`
- Shipment `INFERRED`
- RateCard `INFERRED`
- test_house_bill_of_lading_generation() `INFERRED`
- test_shipment_timeline_and_detention_alert() `INFERRED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*