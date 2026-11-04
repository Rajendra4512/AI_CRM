# Product Readiness: Commercial Launch Sequencing & Comparative Feasibility

**Document ID:** `07-launch-readiness-and-sequencing.md`  
**Date:** 2026-11-03  
**Objective:** Compare the three industry suites across 7 commercial and technical dimensions to determine the optimal, evidence-backed launch sequence.  

---

## 1. Multi-Dimensional Suite Comparison Matrix

Each industry suite is evaluated on a standard 1 to 5 scale (where **5 is most favorable** for rapid, profitable commercial launch):

| Dimension | Suite 1: Construction Trades | Suite 2: Clinical Trials | Suite 3: Maritime Logistics | Analytical Basis & Grounded Evidence |
| :--- | :---: | :---: | :---: | :--- |
| **Evidence-Backed Demand** | **5 / 5** | 4 / 5 | **5 / 5** | Construction trades and ocean freight brokers experience acute, daily transactional pain (spec addenda review & volatile fuel surcharges) that directly impacts profit margins. |
| **Competitive Differentiation** | 4 / 5 | **5 / 5** | 4 / 5 | Clinical trials has the strongest unserved niche (site-level AI protocol eligibility), but Construction and Maritime offer immediate displacement opportunities against Procore and Magaya. |
| **Existing Code Readiness** | **5 / 5** | 4 / 5 | **5 / 5** | Construction SOV engine and Maritime multi-factor quote engine are mathematically complete and verified by Pytest and Playwright tests in the codebase. |
| **Implementation Effort (P0)** | **5 / 5** (Low: ~2 weeks) | 3 / 5 (Medium: ~4 weeks) | **5 / 5** (Low: ~2 weeks) | Construction and Maritime only require database table binding and regex/tabular parsing. Clinical requires complex eligibility logic and HIPAA scrubbing. |
| **Integration Dependencies** | **5 / 5** (Self-contained) | 3 / 5 (IRB / EDC friction) | 4 / 5 (Tariff self-serve) | Construction SOV and Maritime spot quoting can function 100% standalone on day one without mandatory external API hookups. |
| **Compliance & Legal Burden** | **5 / 5** (Standard B2B terms)| 1 / 5 (FDA / HIPAA / 21 CFR) | 4 / 5 (Commercial maritime) | Clinical carries high regulatory liability (HIPAA BAAs, FDA 21 CFR Part 11 audit validation, IRB review constraints), creating substantial sales friction. |
| **Time to First Paying Customer** | **5 / 5** (30 to 45 Days) | 2 / 5 (90 to 180 Days) | **5 / 5** (30 to 45 Days) | Commercial trade contractors and freight brokers have short, self-serve owner-operator sales cycles. Clinical trial sites have committee-based approval cycles. |
| **Composite Readiness Score** | **34 / 35 (97%)** | **22 / 35 (63%)** | **32 / 35 (91%)** | **Construction & Maritime emerge as clear early commercial frontrunners.** |

---

## 2. Detailed Comparative Analysis

### 2.1 The Case for Suite 1 (Construction Trades) as Wave 1 Launch
- **Market Timing:** Specialty trade subcontractors are actively rebelling against Procore's high pricing and GC-centric architecture. They want their own independent, subcontractor-friendly system.
- **Code Readiness:** The core mathematical primitive (Schedule of Values billing with 10% retainage) is already built and tested in `modules/construction/service.py` and rendered in `VerticalHub.tsx`.
- **Low Regulatory Friction:** No healthcare compliance audits or international maritime treaties; standard B2B SaaS terms and conditions are sufficient.
- **Fast Monetization:** Trade business owners can swipe a credit card for $249/month without corporate procurement committee approvals.

### 2.2 The Case for Suite 3 (Maritime Freight Brokerage) as Wave 1 Parallel / Rapid Wave 2
- **Extreme Velocity on Spot Quoting:** Spot freight quoting is an urgent, transactional need. The multi-factor rating engine (`Base + BAF + THC + PSS`) is already functional in `modules/maritime/service.py`.
- **High ROI Proof:** A freight broker who wins just two extra 40HC container bookings per month through faster quoting recoups their entire annual software cost in the first 30 days.

### 2.3 Why Suite 2 (Clinical Trials) Should Follow in Wave 3
- **Regulatory Overhead:** Clinical trials is an exceptionally high-value market, but enterprise customers will not deploy unvalidated software without formal 21 CFR Part 11 compliance packages, SOC 2 Type II certification, and signed HIPAA Business Associate Agreements (BAAs).
- **Long Sales Cycles:** Academic medical centers and research site networks require 3 to 6 months of institutional review before signing software agreements.
- **Recommendation:** Keep the clinical code and consent guardrail active in the multi-tenant platform, but conduct customer discovery interviews (per `06-customer-validation-plan.md`) while scaling Construction and Maritime revenue.

---

## 3. Recommended Phased Commercial Sequencing

```
┌─────────────────────────────────────────────────────────────────────────┐
│ WAVE 1: COMMERCIAL LAUNCH (Months 1 - 3)                                │
│ Focus: Commercial Subcontractor & Trade CRM                             │
│ • Persist SOV billing applications to PostgreSQL.                       │
│ • Deploy CSI MasterFormat Division Spec Extractor.                      │
│ • Target: 20 paying specialty trade contractors ($249/mo = $5K MRR).    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ WAVE 2: RAPID EXPANSION (Months 3 - 6)                                  │
│ Focus: Maritime Logistics & Freight Brokerage                           │
│ • Persist freight quote records and carrier rate tables.                │
│ • Deploy Carrier PDF Rate Sheet Ingestion Engine.                       │
│ • Target: 25 paying freight brokerages ($299/mo = $7.5K MRR).           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ WAVE 3: ENTERPRISE LIFE SCIENCES LAUNCH (Months 6 - 9)                  │
│ Focus: Clinical Trials & Patient Recruitment CTMS                       │
│ • Implement HIPAA Safe Harbor PHI scrubber & 21 CFR Part 11 audit log.   │
│ • Finalize Protocol Inclusion/Exclusion AI extraction surveys.          │
│ • Target: 10 dedicated clinical research sites ($499/mo = $5K MRR).     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Key Takeaways & Strategic Summary

1. **Dual Focus for Early Revenue:** Focus immediate engineering and sales attention on **Commercial Construction Trades** and **Maritime Freight Brokerage**, where product readiness is highest and compliance barriers are lowest.
2. **Preserve Shared Core Architecture:** Keep the backend modular monolith and shared RAG engine intact. Both Wave 1 suites benefit immediately from the shared PDF extraction and CRM pipeline infrastructure.
3. **Evidence-Based Success Metric:** Achieve **$15,000 in Monthly Recurring Revenue (MRR)** across Construction and Maritime before committing heavy capital to Clinical compliance audits.

