# 07 - Shared AI, RAG & Document Intelligence Enhancement Plan

## 1. Unified Multi-Tenant RAG Pipeline
All three industry suites leverage the central AI pipeline in `ai/` rather than creating separate fragmented implementations.

```
                      +-----------------------------+
                      | Raw Document Ingestion      |
                      | (PDF / Excel / Scan)        |
                      +-----------------------------+
                                     |
                                     v
                      +-----------------------------+
                      | Multi-Tenant Security Check |
                      | File Validation & Type Det. |
                      +-----------------------------+
                                     |
              +----------------------+----------------------+
              |                      |                      |
              v                      v                      v
     [Construction CSI]      [Clinical Protocol]     [Maritime Tariff]
      MasterFormat parser     Inclusion/Exclusion     Ocean rate table
      Division 00 - 48        criteria extractor      normalizer
              |                      |                      |
              +----------------------+----------------------+
                                     |
                                     v
                      +-----------------------------+
                      | Text Chunking & Embeddings  |
                      | Qdrant Tenant-Isolated Index|
                      +-----------------------------+
                                     |
                                     v
                      +-----------------------------+
                      | Grounded Answer Synthesis   |
                      | Strict Source Citations     |
                      | Human Approval Guardrail    |
                      +-----------------------------+
```

---

## 2. Industry Processors

1. **Construction (CSI MasterFormat Specification Analyzer)**:
   - Identifies CSI divisions (e.g. Division 03 Concrete, Division 09 Finishes, Division 26 Electrical).
   - Extracts trade scopes and compares addenda revisions.
   - Guardrail: Flag uncertain scope interpretations for estimator confirmation.

2. **Clinical (Protocol Intelligence & Eligibility Parser)**:
   - Extracts structured inclusion/exclusion criteria from clinical trial protocols.
   - Extracts mandatory laboratory thresholds (e.g., ALT/AST, platelet counts, age bounds).
   - Guardrail: Autonomous medical eligibility decisions strictly prohibited; marked as draft for principal investigator / coordinator verification.

3. **Maritime (Carrier Rate Sheet & Tariff Normalizer)**:
   - Parses multi-column ocean carrier rate spreadsheets and PDF quotation circulars.
   - Normalizes currency, container types (20GP, 40HC, Reefer), and surcharges (BAF, THC, PSS).
   - Guardrail: Mandates forwarder approval before publishing rates to active quoting engine.

