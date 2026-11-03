from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from core.database import Base

class Study(Base):
    __tablename__ = "studies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    protocol_number = Column(String, nullable=False)
    phase = Column(String)
    status = Column(String, default="planning")
    sponsor_id = Column(UUID(as_uuid=True))
    jurisdiction = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Site(Base):
    __tablename__ = "sites"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"))
    site_name = Column(String, nullable=False)
    pi_name = Column(String)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

class Referral(Base):
    __tablename__ = "referrals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"))
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"))
    pseudonymous_id = Column(String, nullable=False)
    status = Column(String, default="referred")
    consent_status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
