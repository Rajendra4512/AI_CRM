from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TenantBase(BaseModel):
    name: str
    slug: str

class UserBase(BaseModel):
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class ApiResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None
    data: Optional[dict] = None
