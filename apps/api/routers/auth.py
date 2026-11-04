from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import re
import uuid

from core.database import get_db
from core.models.auth import User, Tenant
from core.services.audit_service import AuditService
from core.services.auth_service import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_or_create_default_tenant,
    get_current_user,
    get_current_tenant
)

router = APIRouter()

VALID_INDUSTRIES = {"construction", "clinical", "maritime"}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    company_name: str
    industry: Optional[str] = "construction"  # Validated vertical entitlement


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    normalized_email = request.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == normalized_email).first()

    superadmin_email = os.getenv("SUPERADMIN_EMAIL", "superadmin@salesfortis.com").strip().lower()
    superadmin_password = os.getenv("SUPERADMIN_PASSWORD", "SuperAdmin@2026!")

    # Provision Platform Superadmin account when matching bootstrap credentials
    if user is None and normalized_email == superadmin_email and request.password == superadmin_password:
        ops_tenant = db.query(Tenant).filter(Tenant.slug == "salesfortis-platform-ops").first()
        if not ops_tenant:
            ops_tenant = Tenant(
                id=uuid.uuid4(),
                name="SalesFortis Platform Ops",
                slug="salesfortis-platform-ops",
                industry="all",
                subscription_tier="enterprise",
                status="active",
            )
            db.add(ops_tenant)
            db.flush()
        user = User(
            id=uuid.uuid4(),
            tenant_id=ops_tenant.id,
            email=superadmin_email,
            hashed_password=get_password_hash(superadmin_password),
            first_name="Platform",
            last_name="SuperAdmin",
            status="active",
            is_superadmin=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Provision single-vertical demo accounts when matching vertical demo credentials
    vertical_demo_map = {
        "construction.demo@salesfortis.com": ("construction", "Apex Construction Demo", "apex-construction-demo"),
        "clinical.demo@salesfortis.com": ("clinical", "BioTrial Clinical Research", "biotrial-clinical-demo"),
        "maritime.demo@salesfortis.com": ("maritime", "Pacific Ocean Freight", "pacific-maritime-demo"),
    }
    if user is None and normalized_email in vertical_demo_map and request.password == "demopassword":
        v_ind, v_name, v_slug = vertical_demo_map[normalized_email]
        v_tenant = db.query(Tenant).filter(Tenant.slug == v_slug).first()
        if not v_tenant:
            v_tenant = Tenant(
                id=uuid.uuid4(),
                name=v_name,
                slug=v_slug,
                industry=v_ind,
                subscription_tier="trial",
                status="active",
            )
            db.add(v_tenant)
            db.flush()
        user = User(
            id=uuid.uuid4(),
            tenant_id=v_tenant.id,
            email=normalized_email,
            hashed_password=get_password_hash("demopassword"),
            first_name=v_ind.title(),
            last_name="Coordinator",
            status="active",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Seed multi-vertical showcase demo account only when it does not exist yet AND demo credentials match
    if (
        user is None
        and normalized_email in ("admin@salesfortis.com", "demo@salesfortis.com")
        and request.password == "demopassword"
    ):
        tenant = get_or_create_default_tenant(db)
        user = User(
            id=uuid.uuid4(),
            tenant_id=tenant.id,
            email=normalized_email,
            hashed_password=get_password_hash(request.password),
            first_name="Admin",
            last_name="Director",
            status="active"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    if not tenant or tenant.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Active tenant association required"
        )

    AuditService.record(
        db=db,
        tenant_id=tenant.id,
        user_id=user.id,
        action="auth.user.login",
        resource_type="user",
        resource_id=str(user.id),
        details={"email": user.email, "industry": tenant.industry}
    )
    db.commit()

    token = create_access_token({
        "sub": user.email,
        "tenant_id": str(user.tenant_id),
        "industry": tenant.industry
    })
    return {
        "access_token": token,
        "token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_superadmin": user.is_superadmin
        },
        "tenant": {
            "id": str(tenant.id),
            "name": tenant.name,
            "industry": tenant.industry,
            "subscription_tier": tenant.subscription_tier
        }
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    normalized_email = request.email.strip().lower()
    company_name = request.company_name.strip()
    if not company_name:
        raise HTTPException(status_code=400, detail="Company name is required")
    if len(request.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    existing = db.query(User).filter(func.lower(User.email) == normalized_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    chosen_industry = (request.industry or "construction").strip().lower()
    if chosen_industry not in VALID_INDUSTRIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid industry '{request.industry}'. Allowed industries: {sorted(VALID_INDUSTRIES)}"
        )

    # Prevent cross-tenant registration hijacking: reject already-registered organization names
    existing_tenant = db.query(Tenant).filter(func.lower(Tenant.name) == company_name.lower()).first()
    if existing_tenant:
        raise HTTPException(
            status_code=400,
            detail="Organization name already registered. Contact your workspace administrator for an invitation."
        )

    base_slug = re.sub(r"[^a-z0-9]+", "-", company_name.lower()).strip("-") or "org"
    tenant = Tenant(
        id=uuid.uuid4(),
        name=company_name,
        slug=f"{base_slug}-{uuid.uuid4().hex[:6]}",
        industry=chosen_industry,
        subscription_tier="trial",
        status="active"
    )
    user = User(
        id=uuid.uuid4(),
        tenant_id=tenant.id,
        email=normalized_email,
        hashed_password=get_password_hash(request.password),
        first_name=request.first_name.strip(),
        last_name=request.last_name.strip(),
        status="active"
    )
    db.add(tenant)
    db.add(user)
    db.flush()

    AuditService.record(
        db=db,
        tenant_id=tenant.id,
        user_id=user.id,
        action="auth.tenant.registered",
        resource_type="tenant",
        resource_id=str(tenant.id),
        details={"company_name": tenant.name, "industry": tenant.industry, "email": user.email}
    )
    db.commit()
    db.refresh(tenant)
    db.refresh(user)

    token = create_access_token({
        "sub": user.email,
        "tenant_id": str(tenant.id),
        "industry": tenant.industry
    })
    return {
        "message": "User registered successfully",
        "access_token": token,
        "token": token,
        "tenant_id": str(tenant.id),
        "industry": tenant.industry,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_superadmin": user.is_superadmin
        },
        "tenant": {
            "id": str(tenant.id),
            "name": tenant.name,
            "industry": tenant.industry,
            "subscription_tier": tenant.subscription_tier
        }
    }


@router.post("/logout")
def logout(
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    AuditService.record(
        db=db,
        tenant_id=tenant.id,
        user_id=current_user.id,
        action="auth.user.logout",
        resource_type="user",
        resource_id=str(current_user.id),
        details={"email": current_user.email}
    )
    db.commit()
    return {
        "status": "logged_out",
        "message": "Session terminated successfully"
    }


@router.get("/me")
def me(
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant)
):
    return {
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "is_superadmin": current_user.is_superadmin
        },
        "tenant": {
            "id": str(tenant.id),
            "name": tenant.name,
            "industry": tenant.industry,
            "subscription_tier": tenant.subscription_tier
        }
    }
