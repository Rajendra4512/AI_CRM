from fastapi import APIRouter

router = APIRouter()

@router.get("/studies")
def list_studies():
    return {"studies": []}

@router.post("/studies")
def create_study():
    return {"message": "Study created"}

@router.get("/sites")
def list_sites():
    return {"sites": []}

@router.get("/referrals")
def list_referrals():
    return {"referrals": []}
