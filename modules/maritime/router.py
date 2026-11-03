from fastapi import APIRouter

router = APIRouter()

@router.get("/enquiries")
def list_enquiries():
    return {"enquiries": []}

@router.post("/enquiries")
def create_enquiry():
    return {"message": "Enquiry created"}

@router.get("/quotations")
def list_quotations():
    return {"quotations": []}

@router.get("/shipments")
def list_shipments():
    return {"shipments": []}
