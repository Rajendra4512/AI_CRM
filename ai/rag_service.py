import re
import uuid
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from ai.models import Document, DocumentChunk


class RAGService:
    """
    Tenant-isolated document indexing and semantic retrieval service.
    Persists Document and DocumentChunk rows when a DB session is provided and
    synchronizes an in-memory tenant index with prompt-injection sanitization.
    """
    _vector_store: Dict[str, List[Dict[str, Any]]] = {}

    _INJECTION_PATTERNS = [
        re.compile(r"ignore\s+(?:all\s+)?previous\s+instructions[^.;\n]*[.;]?", re.IGNORECASE),
        re.compile(r"system\s*prompt\s*:\s*[^.;\n]*[.;]?", re.IGNORECASE),
        re.compile(r"<\|\s*im_(?:start|end)\s*\|>", re.IGNORECASE),
        re.compile(r"(?:reveal|dump|exfiltrate)\s+(?:all\s+)?(?:tenant\s+)?(?:database\s+)?(?:secrets|credentials|keys)[^.;\n]*[.;]?", re.IGNORECASE),
        re.compile(r"bypass\s+(?:tenant|industry|authorization)\s+[^\n.;]*[.;]?", re.IGNORECASE),
    ]

    @classmethod
    def sanitize_prompt_injection(cls, text: str) -> Tuple[str, bool]:
        if not text:
            return "", False
        sanitized = text
        flagged = False
        for pattern in cls._INJECTION_PATTERNS:
            if pattern.search(sanitized):
                flagged = True
                sanitized = pattern.sub(" ", sanitized)
        sanitized = re.sub(r"\s+", " ", sanitized).strip()
        return sanitized, flagged

    @classmethod
    def chunk_text(cls, text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> List[str]:
        cleaned = re.sub(r'\s+', ' ', text).strip()
        if not cleaned:
            return []
        chunks = []
        start = 0
        step = max(1, chunk_size - chunk_overlap)
        while start < len(cleaned):
            end = start + chunk_size
            chunks.append(cleaned[start:end])
            start += step
        return chunks

    @classmethod
    def index_document(
        cls,
        tenant_id: str,
        document_id: str,
        filename: str,
        text: str,
        db: Optional[Session] = None,
        uploaded_by: Optional[uuid.UUID] = None,
        mime_type: Optional[str] = "text/plain",
    ) -> int:
        sanitized_text, _ = cls.sanitize_prompt_injection(text)
        chunks = cls.chunk_text(sanitized_text)
        if tenant_id not in cls._vector_store:
            cls._vector_store[tenant_id] = []

        cls._vector_store[tenant_id] = [
            item for item in cls._vector_store[tenant_id]
            if item["document_id"] != document_id
        ]

        for idx, chunk in enumerate(chunks):
            cls._vector_store[tenant_id].append({
                "chunk_id": f"{document_id}_{idx}",
                "document_id": document_id,
                "filename": filename,
                "chunk_index": idx,
                "text": chunk,
            })

        if db is not None:
            t_uuid = uuid.UUID(str(tenant_id))
            d_uuid = uuid.UUID(str(document_id))
            doc = db.query(Document).filter(Document.id == d_uuid, Document.tenant_id == t_uuid).first()
            if not doc:
                doc = Document(
                    id=d_uuid,
                    tenant_id=t_uuid,
                    filename=filename,
                    mime_type=mime_type,
                    status="indexed",
                    uploaded_by=uploaded_by,
                )
                db.add(doc)
                db.flush()
            else:
                db.query(DocumentChunk).filter(DocumentChunk.document_id == d_uuid).delete()
                doc.status = "indexed"

            for idx, chunk in enumerate(chunks):
                db.add(DocumentChunk(
                    id=uuid.uuid4(),
                    document_id=d_uuid,
                    tenant_id=t_uuid,
                    chunk_text=chunk,
                    chunk_index=idx,
                ))
            db.commit()

        return len(chunks)

    @classmethod
    def _load_tenant_chunks(cls, tenant_id: str, db: Optional[Session] = None) -> List[Dict[str, Any]]:
        mem_chunks = cls._vector_store.get(tenant_id, [])
        if mem_chunks or db is None:
            return mem_chunks

        t_uuid = uuid.UUID(str(tenant_id))
        rows = (
            db.query(DocumentChunk, Document)
            .join(Document, DocumentChunk.document_id == Document.id)
            .filter(DocumentChunk.tenant_id == t_uuid, Document.tenant_id == t_uuid)
            .order_by(DocumentChunk.chunk_index.asc())
            .all()
        )
        hydrated = [
            {
                "chunk_id": f"{doc.id}_{chunk.chunk_index}",
                "document_id": str(doc.id),
                "filename": doc.filename,
                "chunk_index": chunk.chunk_index,
                "text": chunk.chunk_text or "",
            }
            for chunk, doc in rows
        ]
        if hydrated:
            cls._vector_store[tenant_id] = hydrated
        return hydrated

    @classmethod
    def get_document_for_tenant(
        cls,
        tenant_id: str,
        document_id: str,
        db: Optional[Session] = None,
    ) -> Optional[Dict[str, Any]]:
        if db is not None:
            try:
                t_uuid = uuid.UUID(str(tenant_id))
                d_uuid = uuid.UUID(str(document_id))
                doc = db.query(Document).filter(Document.id == d_uuid, Document.tenant_id == t_uuid).first()
                if doc:
                    chunk_count = db.query(DocumentChunk).filter(
                        DocumentChunk.document_id == d_uuid,
                        DocumentChunk.tenant_id == t_uuid,
                    ).count()
                    return {
                        "document_id": str(doc.id),
                        "filename": doc.filename,
                        "status": doc.status,
                        "chunks_count": chunk_count,
                    }
            except ValueError:
                return None

        mem_chunks = [c for c in cls._vector_store.get(tenant_id, []) if c["document_id"] == document_id]
        if not mem_chunks:
            return None
        return {
            "document_id": document_id,
            "filename": mem_chunks[0]["filename"],
            "status": "indexed",
            "chunks_count": len(mem_chunks),
        }

    @classmethod
    def query(
        cls,
        tenant_id: str,
        query_text: str,
        top_k: int = 3,
        db: Optional[Session] = None,
    ) -> Dict[str, Any]:
        sanitized_query, injection_filtered = cls.sanitize_prompt_injection(query_text)
        effective_query = sanitized_query or query_text
        tenant_chunks = cls._load_tenant_chunks(tenant_id, db=db)
        if not tenant_chunks:
            return {
                "query": query_text,
                "answer": "No indexed documents found for your organization. Please upload an RFQ specification, trial protocol, or cargo manifest to query.",
                "citations": [],
                "prompt_injection_filtered": injection_filtered,
            }

        query_terms = [t.lower() for t in re.findall(r'\w+', effective_query) if len(t) > 2]
        scored_chunks = []
        for item in tenant_chunks:
            text_lower = item["text"].lower()
            score = sum(1 for term in query_terms if term in text_lower)
            if score > 0 or not query_terms:
                scored_chunks.append((score, item))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top_results = [item for _, item in scored_chunks[:top_k]]
        if not top_results and tenant_chunks:
            top_results = tenant_chunks[:top_k]

        citations = [
            {
                "chunk_id": r["chunk_id"],
                "document_id": r["document_id"],
                "filename": r["filename"],
                "snippet": r["text"][:200] + ("..." if len(r["text"]) > 200 else ""),
            }
            for r in top_results
        ]

        context_summary = " ".join([r["text"] for r in top_results])[:300]
        answer = f"Based on '{top_results[0]['filename']}': {context_summary}" if top_results else "No relevant context found."

        return {
            "query": query_text,
            "answer": answer,
            "citations": citations,
            "prompt_injection_filtered": injection_filtered,
        }
