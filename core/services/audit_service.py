import uuid
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from core.models.admin import AuditLog


class AuditService:
    """Authoritative audit trail writer for security, compliance, and financial transitions."""

    @staticmethod
    def record(
        db: Session,
        action: str,
        tenant_id: Optional[uuid.UUID] = None,
        user_id: Optional[uuid.UUID] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        commit: bool = False,
    ) -> AuditLog:
        entry = AuditLog(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id is not None else None,
            ip_address=ip_address,
            details=details or {},
        )
        db.add(entry)
        if commit:
            db.commit()
            db.refresh(entry)
        return entry

