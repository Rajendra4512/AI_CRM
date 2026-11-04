# SalesFortis — Codebase Knowledge & Memory Graph (`graphify/`)

## 1. Overview & Tooling Verification
- **Skill / Tool**: `graphifyy` (Version `0.9.100`), CLI executable `graphify.exe` located at `C:\Users\raj45\.local\bin\graphify.exe`.
- **Primary Function**: Multi-language AST-based static code extraction (Python, TypeScript, React, SQL, Markdown) and semantic graph compilation for persistent AI agent memory.
- **Graph Metrics**:
  - **Total Extracted Nodes**: 1,390
  - **Total Dependency Edges**: 2,171
  - **Community Clusters**: 124
  - **Generated Wiki Articles**: 134 in [`graphify/wiki/`](file:///c:/Users/raj45/OneDrive/Desktop/AI_CRM/graphify/wiki/index.md)
  - **Visual Callflow Topology**: [`graphify/AI_CRM-callflow.html`](file:///c:/Users/raj45/OneDrive/Desktop/AI_CRM/graphify/AI_CRM-callflow.html)
  - **Interactive Knowledge Graph Viewer**: [`graphify/graph.html`](file:///c:/Users/raj45/OneDrive/Desktop/AI_CRM/graphify/graph.html)

---

## 2. Artifact Index

| File / Folder | Role | Update Frequency |
| :--- | :--- | :--- |
| [`graph.json`](file:///c:/Users/raj45/OneDrive/Desktop/AI_CRM/graphify/graph.json) | Raw directed graph representation of all nodes, edges, types, and community IDs. | After code modification (`graphify update .`) |
| [`GRAPH_REPORT.md`](file:///c:/Users/raj45/OneDrive/Desktop/AI_CRM/graphify/GRAPH_REPORT.md) | High-level summary of node density, community partitions, and key central nodes. | Automatic on rebuild |
| [`manifest.json`](file:///c:/Users/raj45/OneDrive/Desktop/AI_CRM/graphify/manifest.json) | Hash manifest of tracked files and AST timestamps. | Incremental build cache |
| [`wiki/`](file:///c:/Users/raj45/OneDrive/Desktop/AI_CRM/graphify/wiki/) | 134 modular Markdown articles detailing individual modules, services, and classes. | On export (`graphify export wiki`) |
| [`AI_CRM-callflow.html`](file:///c:/Users/raj45/OneDrive/Desktop/AI_CRM/graphify/AI_CRM-callflow.html) | Interactive call-flow graphs with Mermaid diagrams and symbol tables. | On export (`graphify export callflow-html`) |
| [`CODEBASE_GRAPH.md`](file:///c:/Users/raj45/OneDrive/Desktop/AI_CRM/graphify/CODEBASE_GRAPH.md) | Structured persistent memory graph separating implemented vs. planned architecture. | Updated after each checkpoint |

---

## 3. Autonomous Execution & Maintenance Protocol
1. **Consultation Before Modification**:
   - Before modifying a domain module, query the graph via:
     ```bash
     graphify query "<feature or symbol name>"
     graphify path "<source_symbol>" "<target_symbol>"
     graphify explain "<module or class>"
     ```
2. **Incremental AST Synchronization**:
   - After modifying or creating files during Phases 1–5:
     ```bash
     graphify update .
     graphify export wiki
     graphify export callflow-html
     Copy-Item -Path "graphify-out\*" -Destination "graphify\" -Recurse -Force
     ```
3. **Preservation**: Never overwrite working logic or introduce circular imports.

