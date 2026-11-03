from fastapi import APIRouter

router = APIRouter()

@router.post("/upload")
def upload_document():
    return {"message": "Document upload endpoint", "status": "processing"}

@router.get("/")
def list_documents():
    return {"documents": []}

@router.post("/query")
def rag_query():
    return {"answer": "", "citations": [], "message": "RAG endpoint"}
