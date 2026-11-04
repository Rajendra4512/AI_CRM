# 04 - Construction Suite Technical Implementation Plan

## 1. Domain Requirements
- **REQ-CON-01**: Schedule of Values (SOV) persistence and AIA G702/G703 billing.
- **REQ-CON-02**: AI Specification Analysis (CSI MasterFormat divisions).
- **REQ-CON-03**: Change Events and Potential Change Orders (PCOs).
- **REQ-CON-04**: Field Time & Materials (T&M) capture.
- **REQ-CON-05**: Accounting export readiness.

---

## 2. Database Models (`modules/construction/models.py`)

### 2.1 `SOVApplication`
- `id`: UUID (Primary Key)
- `tenant_id`: UUID (FK to `tenants.id`, non-nullable)
- `project_id`: UUID (FK to `projects.id`, non-nullable)
- `application_number`: Integer (e.g., 1, 2, 3...)
- `period_to`: DateTime
- `retainage_rate_pct`: Numeric(5, 2) (default 10.0)
- `total_contract_value`: Numeric(15, 2)
- `total_completed_stored`: Numeric(15, 2)
- `total_retainage`: Numeric(15, 2)
- `net_payment_due`: Numeric(15, 2)
- `status`: String (`draft`, `submitted`, `approved`, `rejected`)
- `created_at`: DateTime
- Compound Unique Constraint: `(project_id, application_number)` (Idempotency)

### 2.2 `SOVLineItem`
- `id`: UUID (Primary Key)
- `application_id`: UUID (FK to `sov_applications.id`, ondelete="CASCADE")
- `line_item_code`: String (e.g. "03-3000", "09-2200")
- `description`: String
- `scheduled_value`: Numeric(15, 2)
- `work_previous`: Numeric(15, 2)
- `work_current`: Numeric(15, 2)
- `stored_materials`: Numeric(15, 2)
- `total_completed_stored`: Numeric(15, 2)
- `retainage_amount`: Numeric(15, 2)
- `current_due`: Numeric(15, 2)
- `balance_to_finish`: Numeric(15, 2)

### 2.3 `ChangeEvent`
- `id`: UUID (Primary Key)
- `tenant_id`: UUID (FK to `tenants.id`)
- `project_id`: UUID (FK to `projects.id`)
- `event_number`: String (e.g. "CE-012")
- `title`: String
- `trade_scope`: String
- `estimated_cost`: Numeric(15, 2)
- `status`: String (`draft`, `rfq_issued`, `pco_submitted`, `pco_approved`, `rejected`)
- `actor_id`: UUID (User who executed the transition)
- `created_at`: DateTime
- `updated_at`: DateTime

### 2.4 `FieldTimeMaterial`
- `id`: UUID (Primary Key)
- `tenant_id`: UUID (FK to `tenants.id`)
- `project_id`: UUID (FK to `projects.id`)
- `change_event_id`: UUID (FK to `change_events.id`, nullable)
- `date`: DateTime
- `trade`: String
- `worker_name`: String
- `hours_worked`: Numeric(5, 2)
- `materials_cost`: Numeric(12, 2)
- `equipment_cost`: Numeric(12, 2)
- `supervisor_approved`: Boolean (default False)

---

## 3. Service Layer Enhancements (`modules/construction/service.py`)
- Implement `submit_sov_application(...)` ensuring transactional atomicity for application header + line items.
- Calculate cumulative previous billings automatically by querying application `N - 1`.
- Implement `transition_change_event_status(...)` with validation state machine:
  `draft` ➔ `rfq_issued` ➔ `pco_submitted` ➔ `pco_approved`.
- Disallow modification of `approved` SOVs or Change Orders.

