# 06 — AI & Document RAG Pipeline Architecture

## 1. Document Ingestion & Retrieval Pipeline

```mermaid
flowchart LR
    subgraph InputFiles["Multi-Format Ingestion"]
        PDF["PDF Spec / Protocol"]
        TXT["Raw Text Specification"]
        SHEET["Ocean Rate Spreadsheet"]
    end

    subgraph Preprocessing["Text Extraction & Chunking"]
        EXTRACT["extract_text_from_bytes()<br/>(workers/ingestion.py)"]
        CHUNKER["chunk_text(size=500, overlap=50)<br/>(ai/rag_service.py)"]
    end

    subgraph Store["Tenant-Isolated In-Memory Vector Store"]
        INDEX["RAGService._vector_store[tenant_id]<br/>- chunk_id<br/>- document_id<br/>- filename<br/>- text"]
    end

    subgraph QueryPipeline["Semantic Query & Retrieval"]
        Q_IN["User Prompt / Query"]
        SCORER["TF / Keyword Match Scorer"]
        TOP_K["Top K Chunks Selection"]
        CITATIONS["Citation Builder<br/>(Filename, Chunk Index, Snippet)"]
        ANSWER["Synthesized Grounded Answer"]
    end

    PDF --> EXTRACT
    TXT --> EXTRACT
    SHEET --> EXTRACT
    EXTRACT --> CHUNKER
    CHUNKER --> INDEX

    Q_IN --> SCORER
    INDEX --> SCORER
    SCORER --> TOP_K
    TOP_K --> CITATIONS
    TOP_K --> ANSWER
```

---

## 2. Specialized Vertical AI Processors (`ai/router.py`)

```mermaid
sequenceDiagram
    autonumber
    actor Client as User / Estimator / Broker
    participant Router as /api/v1/ai Router
    participant SpecAI as CSI MasterFormat Analyzer
    participant ClinAI as Protocol Intelligence Engine
    participant RateAI as Maritime Tariff Normalizer

    rect rgb(240, 248, 255)
    Note over Client, SpecAI: REQ-CON-02: Construction RFQ Analysis
    Client->>Router: POST /api/v1/ai/analyze-spec {spec_text}
    Router->>SpecAI: Parse divisions (e.g. 03 Concrete, 09 Finishes, 26 Electrical)
    SpecAI-->>Router: Detected trade scopes, estimator checklist, human_review_required=True
    Router-->>Client: Returns division breakdown & subcontractor review flag
    end

    rect rgb(255, 240, 245)
    Note over Client, ClinAI: REQ-CLN-02: Clinical Protocol Intelligence
    Client->>Router: POST /api/v1/ai/analyze-protocol {protocol_text}
    Router->>ClinAI: Extract inclusion/exclusion criteria & citations
    ClinAI-->>Router: Criteria list + 21 CFR Part 50 regulatory safeguard notice
    Router-->>Client: Return draft screening criteria with protocol section citations
    end

    rect rgb(245, 255, 240)
    Note over Client, RateAI: REQ-MAR-02: Maritime Rate Sheet Normalization
    Client->>Router: POST /api/v1/ai/extract-rate-sheet {carrier_name, rate_sheet_text}
    Router->>RateAI: Normalize trade lanes, container sizes (40HC), and surcharges (BAF, THC, PSS)
    RateAI-->>Router: Normalized rates + approval_status="pending_broker_approval"
    Router-->>Client: Return structured rate card ready for broker sign-off
    end
```

---

## 3. Implementation Status: Existing vs. Planned

| Feature | Existing Implementation | Planned Architecture |
| :--- | :--- | :--- |
| **Indexing Engine** | SQLAlchemy `Document` + `DocumentChunk` persistence synchronized with tenant-isolated in-memory TF scorer and strict `GET /documents/{id}` tenant authorization. | PGVector or Qdrant vector database with HNSW indexes and multi-tenant partitioning. |
| **Prompt Injection & Guardrails** | Regex prompt-injection sanitizer (`sanitize_prompt_injection`) + Triple-boundary `require_industry_entitlement` on all 3 vertical AI endpoints. | LLM-based input/output classifier sidecar + LiteLLM embedding proxy. |
| **Human-in-the-Loop** | CSI addendum comparison (`previous_spec_text`), persisted draft `EligibilityCriteria` (`PATCH /criteria/{id}/verify`), and staged `RateCard` (`POST /rate-cards/{id}/approve`) before live quoting. | Multi-step interactive review wizard with differential PDF highlighting. |

