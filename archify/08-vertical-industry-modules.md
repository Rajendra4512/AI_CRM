# 08 — Industry Vertical Modules Architecture

## 1. Commercial Subcontractor Construction Module

### 1.1 Architecture & Workflow
```mermaid
stateDiagram-v2
    [*] --> DraftSOV: Estimator imports CSI Divisions
    DraftSOV --> SubmittedSOV: Calculate scheduled value & retainage
    SubmittedSOV --> ApprovedSOV: GC approval received
    ApprovedSOV --> LockedSOV: Billing application locked for payment
    
    [*] --> ChangeEventIdentified: Field discovery / scope change
    ChangeEventIdentified --> UnderReview: Attached Field T&M tickets
    UnderReview --> ApprovedCE: GC approves PCO
    ApprovedCE --> UpdatedSOV: Transferred to SOV line items
```

### 1.2 Math Formulas Implemented (`modules/construction/service.py`)
- **Total Completed & Stored**:
  $$\text{Total Completed} = \text{Work Previous} + \text{Work Current} + \text{Stored Materials}$$
- **Retainage Calculation**:
  $$\text{Total Retainage} = \text{Total Completed} \times \left(\frac{\text{Retainage Rate \%}}{100}\right)$$
- **Net Payment Due**:
  $$\text{Net Due} = \text{Total Completed} - \text{Total Retainage} - \text{Previous Certificates for Payment}$$
- **Balance to Finish**:
  $$\text{Balance} = \text{Scheduled Value} - \text{Total Completed} + \text{Total Retainage}$$

---

## 2. Clinical Trials CTMS Module

### 2.1 Funnel Architecture & Consent Enforcement Guardrail
```mermaid
flowchart TD
    IDENT["Identified Patient (Pre-screen inquiry)"]
    PRE["Prescreened (Eligibility questions passed)"]
    CONSENT_CHECK{"21 CFR Part 50 eICF Signed?"}
    CONSENTED["Consented (Electronic signature & hash stored)"]
    RANDOMIZED["Randomized to Active Trial Arm"]
    WITHDRAWN["Withdrawn / Discontinued"]

    IDENT --> PRE
    PRE --> CONSENT_CHECK
    CONSENT_CHECK -->|No| WITHDRAWN
    CONSENT_CHECK -->|No / Forged| BLOCK["FAIL-CLOSED: HTTP 422 Unprocessable<br/>'COMPLIANCE_ERROR: Valid signed consent required'"]
    CONSENT_CHECK -->|Yes| CONSENTED
    CONSENTED --> RANDOMIZED
```

### 2.2 Key Invariants Implemented (`modules/clinical/service.py`)
- **Consent Hard-Lock**: Attempting to advance a referral stage to `randomized` without `consent_signed=True` raises `HTTP 422 Unprocessable Content`.
- **Pseudonymization**: Patients tracked via synthetic identifiers (`PT-401-01`), never raw Personally Identifiable Information (PII) or Protected Health Information (PHI).

---

## 3. Maritime Freight Forwarding Module

### 3.1 Rate Calculation & Demurrage Timeline Architecture
```mermaid
flowchart TD
    subgraph RatingEngine["Ocean Freight Quotation Engine"]
        BASE["Base Ocean Rate (e.g. $3,950 for 40HC)"]
        BAF["Bunker Adjustment Factor (BAF Surcharge)"]
        THC["Terminal Handling Charges (THC)"]
        PSS["Peak Season Surcharge (PSS)"]
        TOTAL_RATE["Total Rate Per Unit = Base + BAF + THC + PSS"]
        TOTAL_QUOTE["Total Freight Quote = Rate Per Unit x Container Count"]
    end

    subgraph ShipmentTracking["Container Milestone & Demurrage Timeline"]
        GATE_IN["Gate In at Origin Port"]
        LOADED["Loaded on Vessel (Vessel Departure)"]
        TRANSIT["In Ocean Transit"]
        DISCHARGE["Discharged at Destination Port"]
        LFD_CHECK{"Current Date > Last Free Day (LFD)?"}
        DETENTION_ALERT["FLAG: Detention & Demurrage Accrual Alert"]
        GATE_OUT["Gate Out (Delivered to Consignee)"]
    end

    BASE --> TOTAL_RATE
    BAF --> TOTAL_RATE
    THC --> TOTAL_RATE
    PSS --> TOTAL_RATE
    TOTAL_RATE --> TOTAL_QUOTE

    GATE_IN --> LOADED
    LOADED --> TRANSIT
    TRANSIT --> DISCHARGE
    DISCHARGE --> LFD_CHECK
    LFD_CHECK -->|Yes| DETENTION_ALERT
    LFD_CHECK -->|No| GATE_OUT
```

---

## 4. Implementation Status: Existing vs. Planned

| Domain Feature | Existing Implementation | Planned Architecture |
| :--- | :--- | :--- |
| **Construction** | Database-backed SOV persistence, automatic `N-1` billing carry-forward, SOV approval locks, AIA G702/G703 CSV accounting export, change events state machine, field T&M logging. | Signed PDF rendering of AIA Document G702 / G703 Application and Certificate for Payment. |
| **Clinical** | Study recruitment funnel tracking, SHA-256 eICF verification, consent revocation (`POST /revoke-consent`), Safe Harbor PHI pseudonymization check, coordinator follow-up scheduling (`FollowUpTask`). | EDC direct data sync, GCP audit export packages, e-signature biometric verification. |
| **Maritime** | Staged rate cards with broker approval (`POST /rate-cards/{id}/approve`), multi-surcharge quote engine, dynamic milestone recording with LFD demurrage estimates, HBL creation, DCSA v2.2 tracking contract stub. | Live EDI 315 / carrier webhook ingestion with production carrier credentials. |

