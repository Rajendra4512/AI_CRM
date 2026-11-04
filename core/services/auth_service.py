from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
import bcrypt
import os
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import uuid

from core.database import get_db
from core.models.auth import User, Tenant

SECRET_KEY = os.getenv("SECRET_KEY", "salesfortis-super-secret-key-change-in-production-long-random")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

security = HTTPBearer(auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password[:72].encode("utf-8")
    hash_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(pwd_bytes, hash_bytes)

def get_password_hash(password: str) -> str:
    pwd_bytes = password[:72].encode("utf-8")
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_or_create_default_tenant(db: Session) -> Tenant:
    tenant = db.query(Tenant).filter(Tenant.slug == "apex-enterprise").first()
    if not tenant:
        tenant = Tenant(
            id=uuid.uuid4(),
            name="Apex Enterprise LLC",
            slug="apex-enterprise",
            industry="construction,clinical,maritime",  # Explicit multi-vertical showcase entitlement for Enterprise Demo tenant only
            subscription_tier="enterprise",
            status="active"
        )
        db.add(tenant)
        db.commit()
        db.refresh(tenant)
    elif tenant.industry in (None, "", "construction"):
        tenant.industry = "construction,clinical,maritime"
        db.commit()
        db.refresh(tenant)
    return tenant

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        # Fallback to demo user for seamless local DX if no token provided
        tenant = get_or_create_default_tenant(db)
        user = db.query(User).filter(User.email == "demo@salesfortis.com").first()
        if not user:
            user = User(
                id=uuid.uuid4(),
                tenant_id=tenant.id,
                email="demo@salesfortis.com",
                hashed_password=get_password_hash("demopassword"),
                first_name="Demo",
                last_name="Director",
                status="active"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.status != "active":
        raise HTTPException(status_code=403, detail="User account is inactive")
    return user

def get_current_tenant(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Tenant:
    """
    Authoritative server-side tenant resolution from authenticated user's DB record.
    Never trusts browser-supplied tenant headers or forged IDs.
    """
    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    if not tenant or tenant.status != "active":
        raise HTTPException(status_code=403, detail="Active tenant association required")
    return tenant

def require_industry_entitlement(required_industry: str):
    """
    Triple-boundary enforcement dependency: verifies authoritative database entitlement
    for the active tenant before allowing access to domain vertical router.
    Fail-closed: unassigned or mismatched industry yields HTTP 403 Forbidden.
    """
    def dependency(
        tenant: Tenant = Depends(get_current_tenant),
        user: User = Depends(get_current_user)
    ) -> Tenant:
        if user.is_superadmin:
            return tenant

        raw = tenant.industry or ""
        entitlements = [i.strip().lower() for i in raw.split(",") if i.strip()]

        if "all" not in entitlements and required_industry.lower() not in entitlements:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Tenant '{tenant.name}' is not entitled to the '{required_industry}' industry suite."
            )
        return tenant

    return dependency

def require_superadmin(
    user: User = Depends(get_current_user)
) -> User:
    """
    Enforces platform-level administration privileges.
    Tenant administrators cannot perform Superadmin operations.
    """
    if not user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superadmin privileges required"
        )
    return user
