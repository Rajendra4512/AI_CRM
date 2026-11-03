from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.models.auth import User, Tenant
from pydantic import BaseModel, EmailStr

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    company_name: str

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    return {"message": "Login endpoint", "token": "demo-token"}

@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    return {"message": "Registration endpoint", "tenant_id": "demo"}

@router.get("/me")
def me():
    return {"user": "demo", "tenant": "demo"}
