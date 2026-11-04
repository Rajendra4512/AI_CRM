# 10 - Focused Test Strategy (Security & Isolation Matrix)

## 1. Testing Philosophy
In alignment with project performance guidelines on resource-constrained environments:
- Target specific modified modules and workflows.
- Avoid running unneeded full test suites repeatedly.
- Use lightweight fixtures and SQLite/in-memory test databases for unit tests, followed by focused Playwright E2E verification.
- **Mandatory Negative Testing**: Explicitly test denial of unauthorized requests, forged tokens, and cross-boundary access.

---

## 2. Comprehensive Security Test Matrix (`tests/test_industry_isolation.py`)

| Test Identifier | Category | Test Scenario | Expected Outcome |
| :--- | :--- | :--- | :--- |
| `SEC-TEST-01` | Cross-Tenant Read | Tenant B attempts to read Tenant A's SOV application by ID. | HTTP 404 / 403 (Denial) |
| `SEC-TEST-02` | Cross-Tenant Write | Tenant B attempts to update Tenant A's change event status. | HTTP 404 / 403 (Denial) |
| `SEC-TEST-03` | Cross-Tenant Delete | Tenant B attempts to delete Tenant A's customer account. | HTTP 404 / 403 (Denial) |
| `SEC-TEST-04` | Forged Tenant ID | Request injects `X-Tenant-ID` header of Tenant A while authenticated as Tenant B. | Header ignored; server-side token takes precedence (Isolation preserved) |
| `SEC-TEST-05` | Cross-Industry Read | Tenant with `industry="construction"` calls `/api/v1/verticals/clinical/metrics`. | HTTP 403 Forbidden |
| `SEC-TEST-06` | Cross-Industry Write | Tenant with `industry="clinical"` calls `/api/v1/verticals/construction/sov/applications`. | HTTP 403 Forbidden |
| `SEC-TEST-07` | Cross-Industry Maritime | Tenant with `industry="maritime"` calls `/api/v1/verticals/construction/change-events`. | HTTP 403 Forbidden |
| `SEC-TEST-08` | Full Entitlement Access | Tenant with `industry="all"` calls Construction, Clinical, and Maritime APIs. | HTTP 200 OK across all suites |
| `SEC-TEST-09` | Cross-Tenant AI Isolation | Tenant B queries RAG engine for keywords contained only in Tenant A's documents. | Zero chunks returned (0 results) |
| `SEC-TEST-10` | Role Privilege Escalation | Standard user attempts to call Superadmin configuration endpoints. | HTTP 403 Forbidden |
| `SEC-TEST-11` | Consent Guardrail Denial | User attempts to advance clinical referral to `randomized` with `consent_signed=False`. | HTTP 422 Unprocessable Entity |
| `SEC-TEST-12` | Approved SOV Tamper Lock | User attempts to modify line items on an `approved` SOV billing application. | HTTP 400 Bad Request (Locked) |

---

## 3. End-to-End Suite (`apps/web/e2e/crm_flow.spec.ts`)
1. Public marketing landing page & industry cards (`localhost:5000`).
2. Authentication redirect flow to authenticated application (`app.localhost:5001`).
3. Leads Kanban board interactions.
4. Vertical Hub live calculator & consent interactions.
5. Industry-scoped navigation visibility (hiding non-entitled vertical tabs).
