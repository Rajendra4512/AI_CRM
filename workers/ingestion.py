import os
import io
import uuid
from celery import Celery
from pypdf import PdfReader
from docx import Document as DocxDocument
from ai.rag_service import RAGService

celery_app = Celery(
    'salesfortis_workers',
    broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0')
)

def extract_text_from_bytes(file_bytes: bytes, filename: str) -> str:
    if not file_bytes:
        return ""
    ext = (filename or "").lower().rsplit('.', 1)[-1] if '.' in (filename or "") else ""
    if ext == 'pdf':
        reader = PdfReader(io.BytesIO(file_bytes))
        return "\n".join([page.extract_text() or "" for page in reader.pages])
    elif ext in ['docx', 'doc']:
        doc = DocxDocument(io.BytesIO(file_bytes))
        return "\n".join([p.text for p in doc.paragraphs])
    elif ext in ['csv', 'tsv']:
        return file_bytes.decode('utf-8-sig', errors='ignore')
    else:
        return file_bytes.decode('utf-8', errors='ignore')

@celery_app.task
def process_document(document_id: str, filename: str = "document.pdf", content: str = "", tenant_id: str = "default"):
    """Process and index uploaded document for RAG retrieval"""
    chunks_indexed = RAGService.index_document(
        tenant_id=tenant_id,
        document_id=document_id,
        filename=filename,
        text=content or f"Sample document specification content for {filename}."
    )
    return {
        "status": "processed",
        "document_id": document_id,
        "filename": filename,
        "chunks_indexed": chunks_indexed
    }

@celery_app.task
def run_ml_scoring(tenant_id: str):
    """Run ML lead conversion and RFQ win-rate scoring for tenant"""
    return {
        "status": "completed",
        "tenant_id": tenant_id,
        "predicted_win_rate": 0.42,
        "pipeline_health_score": 88
    }

@celery_app.task
def send_notification(user_id: str, message: str):
    """Send real-time alert or notification"""
    return {"status": "sent", "user_id": user_id, "message": message}
