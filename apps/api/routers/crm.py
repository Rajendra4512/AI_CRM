from fastapi import APIRouter

router = APIRouter()

@router.get("/accounts")
def list_accounts():
    return {"accounts": []}

@router.post("/accounts")
def create_account():
    return {"message": "Account created"}

@router.get("/contacts")
def list_contacts():
    return {"contacts": []}

@router.get("/leads")
def list_leads():
    return {"leads": []}

@router.get("/opportunities")
def list_opportunities():
    return {"opportunities": []}
