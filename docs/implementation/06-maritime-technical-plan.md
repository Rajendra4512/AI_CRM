# 06 - Maritime Logistics Suite Technical Implementation Plan

## 1. Domain Requirements
- **REQ-MAR-01**: Dynamic carrier rate cards, freight quotation, and multi-surcharge calculation (BAF, THC, PSS, security fees).
- **REQ-MAR-02**: Rate sheet ingestion & tariff normalizer with human review gate.
- **REQ-MAR-03**: Real-time shipment milestone timeline with Demurrage/Detention Last Free Day (LFD) alerts.
- **REQ-MAR-04**: House Bill of Lading (HBL) generation and document audit.
- **REQ-MAR-05**: Carrier tracking API connector architecture.

---

## 2. Database Models (`modules/maritime/models.py`)

### 2.1 `RateCard`
- `id`: UUID (Primary Key)
- `tenant_id`: UUID (FK to `tenants.id`, non-nullable)
- `carrier_name`: String (e.g. "Maersk", "MSC", "CMA CGM", "Hapag-Lloyd")
- `trade_lane`: String (e.g. "ASIA-USWC", "ASIA-USEC", "EUR-ASIA", "TRANSATLANTIC")
- `container_type`: String (`20GP`, `40GP`, `40HC`, `45HC`, `REEFER`)
- `base_ocean_freight`: Numeric(15, 2)
- `baf_fuel_surcharge`: Numeric(15, 2)
- `terminal_handling_charge`: Numeric(15, 2)
- `peak_season_surcharge`: Numeric(15, 2)
- `currency`: String (default "USD")
- `valid_from`: DateTime
- `valid_to`: DateTime
- `status`: String (`pending_approval`, `active`, `expired`)

### 2.2 `MilestoneEvent`
- `id`: UUID (Primary Key)
- `tenant_id`: UUID (FK to `tenants.id`, non-nullable)
- `shipment_id`: UUID (FK to `shipments.id`, ondelete="CASCADE")
- `milestone_code`: String (`GATE_IN`, `VESSEL_LOADED`, `IN_TRANSIT`, `DISCHARGED`, `CUSTOMS_CLEARED`, `DELIVERY_OUTBOUND`)
- `port_or_location`: String
- `event_timestamp`: DateTime
- `status`: String (`completed`, `in_progress`, `pending`, `delayed`)
- `demurrage_free_days_remaining`: Integer (nullable)
- `detention_alert`: Boolean (default False)

### 2.3 `HouseBillOfLading`
- `id`: UUID (Primary Key)
- `tenant_id`: UUID (FK to `tenants.id`)
- `shipment_id`: UUID (FK to `shipments.id`)
- `hbl_number`: String (Unique)
- `shipper_name`: String
- `consignee_name`: String
- `notify_party`: String
- `vessel_voyage`: String
- `port_of_loading`: String
- `port_of_discharge`: String
- `container_numbers`: Text (comma separated or JSON)
- `gross_weight_kg`: Numeric(12, 2)
- `measurement_cbm`: Numeric(12, 2)
- `status`: String (`draft`, `issued`, `surrendered`)

---

## 3. Service Layer Enhancements (`modules/maritime/service.py`)
- Replace hardcoded `TRADE_LANE_BASE_RATES` and `_SHIPMENT_TIMELINES` with live database operations.
- Provide `calculate_live_quotation(...)` querying active rate cards for the tenant.
- Provide `record_milestone_event(...)` and calculate remaining free time against port discharge timestamp, raising automated detention warnings if days <= 2.

