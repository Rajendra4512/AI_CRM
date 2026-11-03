from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from core.database import Base

class Protocol(Base):
    __tablename__ = "protocols"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    protocol_number = Column(String, nullable=False)
    title = Column(String)
    phase = Column(String)
    therapeutic_area = Column(String)
    status = Column(String, default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)

class PrescreeningQuestion(Base):
    __tablename__ = "prescreening_questions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"))
    question_text = Column(Text)
    question_type = Column(String)
    required = Column(Boolean, default=True)
    order = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class PrescreeningResponse(Base):
    __tablename__ = "prescreening_responses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    referral_id = Column(UUID(as_uuid=True), ForeignKey("referrals.id"))
    responses = Column(Text)  # JSON
    eligible = Column(Boolean)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    reviewed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class ConsentForm(Base):
    __tablename__ = "consent_forms"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"))
    version = Column(String)
    form_content = Column(Text)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

class ConsentRecord(Base):
    __tablename__ = "consent_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    participant_id = Column(UUID(as_uuid=True))
    consent_form_id = Column(UUID(as_uuid=True), ForeignKey("consent_forms.id"))
    signed_at = Column(DateTime)
    signed_by = Column(UUID(as_uuid=True))
    ip_address = Column(String)
    witness_id = Column(UUID(as_uuid=True))
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
