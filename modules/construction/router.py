from fastapi import APIRouter

router = APIRouter()

@router.get("/rfqs")
def list_rfqs():
    return {"rfqs": []}

@router.post("/rfqs")
def create_rfq():
    return {"message": "RFQ created"}

@router.get("/estimates")
def list_estimates():
    return {"estimates": []}

@router.get("/projects")
def list_projects():
    return {"projects": []}
