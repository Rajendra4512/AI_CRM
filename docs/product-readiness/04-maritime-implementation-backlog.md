# Implementation Backlog: Maritime Logistics & Freight Brokerage CRM

**Document ID:** `04-maritime-implementation-backlog.md`  
**Date:** 2026-11-03  
**Suite:** Suite 3 - Maritime Logistics & Freight Brokerage CRM  

---

## 1. Backlog Summary

| Requirement ID | Title | Priority | Complexity | Risk | Current Status |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **REQ-MAR-01** | Database Persistence for Rate Quotes & Trade Lane Tariffs | **P0** | Low | Low | Partial (Math formula tested; hardcoded dictionary) |
| **REQ-MAR-02** | Ocean Carrier PDF/Excel Rate Sheet Ingestion Engine | **P0** | Medium | Medium | Missing (Generic text extractor only) |
| **REQ-MAR-03** | Shipment Milestone Event Tracking & Port Dwell Alerting | **P1** | Medium | Low | Partial (Hardcoded milestone array) |
| **REQ-MAR-04** | House Bill of Lading (HBL) PDF Generation | **P2** | Medium | Low | Not Implemented |
| **REQ-MAR-05** | Live Ocean Carrier EDI / AIS Vessel Tracking API Integration | **P3** | High | High | Not Implemented |

---

## 2. Detailed Requirement Specifications

### REQ-MAR-01: Database Persistence for Rate Quotes & Trade Lane Tariffs
- **Industry & Target Persona:** Independent Freight Forwarders & Ocean Freight Brokers; Freight Sales Representative.
- **Customer Problem & Evidence:** Shippers request spot freight quotes from 3 to 5 forwarders simultaneously. If a broker takes over 1 hour to manually calculate fuel and terminal surcharges, deal win rates plummet from 65% to under 20% (verified by freight forwarding industry studies).
- **Current Status:** `MaritimeFreightService` in `modules/maritime/service.py` calculates multi-factor quotes (`Base + BAF + THC + PSS`) accurately in unit tests (`test_maritime_freight_quote_engine`), but lane base rates are hardcoded in a static dictionary `TRADE_LANE_BASE_RATES`, and quotes are not saved to the database.
- **Proposed Improvement:** Persist trade lane rate cards and generated spot quotes to the `quotations` and `enquiries` database tables.
- **Expected Measurable Business Outcome:** Enables instant sub-30-second quote generation and allows brokers to track quote-to-booking conversion rates.
- **API & Database Dependencies:** `POST /api/v1/verticals/maritime/rates/quote`; `quotations` and `enquiries` tables in `modules/maritime/models.py`.
- **Security & Compliance Considerations:** Tenant isolation; forwarder proprietary margin markups and carrier buy rates must never leak between competing freight forwarder tenants.
- **Complexity & Risk:** Low complexity; Low risk.
- **Priority:** **P0** (Essential launch requirement).
- **Acceptance Criteria:**
  1. User can generate and save a formal freight quote from `VerticalHub.tsx`.
  2. Quote records include trade lane, container count, surcharge breakdown, total price, and expiry date in PostgreSQL.
- **Focused Test Cases:**
  - `test_quote_persists_to_database`: Verify quote record in `quotations` table.
  - `test_tenant_rate_isolation`: Ensure forwarder A cannot see forwarder B's negotiated carrier rates.

---

### REQ-MAR-02: Ocean Carrier PDF/Excel Rate Sheet Ingestion Engine
- **Industry & Target Persona:** Forwarder Operations Director & Pricing Manager.
- **Customer Problem & Evidence:** Ocean carriers (MSC, Maersk, CMA CGM, Hapag-Lloyd) email hundreds of weekly PDF/Excel rate advisories with volatile fuel surcharges (BAF) and peak season surcharges (PSS). Pricing teams spend 8–15 hours weekly manually keying rates into spreadsheets or TMS systems.
- **Current Status:** `workers/ingestion.py` extracts raw text from PDF and DOCX, but lacks tabular tariff extraction logic for carrier pricing sheets.
- **Proposed Improvement:** Enhance `workers/ingestion.py` using `openpyxl` and `pypdf` to parse origin/destination port pairs, container types (20GP, 40HC), base ocean freight, and surcharges directly into the rate card database.
- **Expected Measurable Business Outcome:** Eliminates 10+ hours per week of manual data entry; prevents costly quote errors on outdated surcharge rates.
- **API & Database Dependencies:** `POST /api/v1/ai/upload`; `rate_cards` table in `modules/maritime/models_enhanced.py`.
- **Security & Compliance Considerations:** Strictly isolated to the uploading freight forwarder tenant.
- **Complexity & Risk:** Medium complexity; Medium risk.
- **Priority:** **P0** (High-impact AI differentiator against Logitude and Magaya).
- **Acceptance Criteria:**
  1. Uploading a carrier rate sheet parses trade lane rows, valid dates, and rate totals.
  2. Rates are automatically available in the spot quote generator.
- **Focused Test Cases:**
  - `test_carrier_rate_sheet_parsing`: Ingest mock carrier tariff sheet and assert port pairs and base rates are correctly extracted.

---

### REQ-MAR-03: Shipment Milestone Event Tracking & Port Dwell Alerting
- **Industry & Target Persona:** Logistics Operations Specialist & Customer Service Agent.
- **Customer Problem & Evidence:** Port congestion and unmonitored container dwell times lead to unexpected detention and demurrage fees averaging $250–$500 per container per day. Forwarders often find out about container holds days after free time has expired.
- **Current Status:** `modules/maritime/router.py` returns a hardcoded list of milestone events for `BL-MAEU-9821`.
- **Proposed Improvement:** Connect the milestone tracking endpoint to query the `shipments` database table, with status events (`GATE_IN`, `VESSEL_LOADED`, `IN_TRANSIT`, `DISCHARGED`, `CUSTOMS_CLEARED`, `DELIVERED`) and a calculated "Last Free Day" countdown alert.
- **Expected Measurable Business Outcome:** Reduces client demurrage penalty claims by an estimated 80%.
- **API & Database Dependencies:** `GET /api/v1/verticals/maritime/shipments/{bl}/timeline`; `shipments` table in `modules/maritime/models.py`.
- **Security & Compliance Considerations:** Bill of Lading numbers and commercial cargo manifests must be tenant-isolated.
- **Complexity & Risk:** Medium complexity; Low risk.
- **Priority:** **P1** (High-value customer retention feature).
- **Acceptance Criteria:**
  1. Querying shipment timeline returns live database milestone records.
  2. Shipments exceeding 4 days in port dwell time display an amber warning badge.
- **Focused Test Cases:**
  - `test_shipment_milestone_query`: Verify live database query for B/L milestones.

