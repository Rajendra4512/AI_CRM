from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Integer
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
    title = Column(String, nullable=True)
    phase = Column(String)  # Phase I, Phase II, Phase III, Phase IV
    status = Column(String, default="planning")
    target_enrollment = Column(Integer, default=100)
    current_enrolled = Column(Integer, default=0)
    sponsor_id = Column(UUID(as_uuid=True), nullable=True)
    jurisdiction = Column(String, default="US-FDA")
    created_at = Column(DateTime, default=datetime.utcnow)

class Site(Base):
    __tablename__ = "sites"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"))
    site_name = Column(String, nullable=False)
    site_number = Column(String, nullable=True)
    pi_name = Column(String)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

class Referral(Base):
    __tablename__ = "referrals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"))
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=True)
    pseudonymous_id = Column(String, nullable=False)
    stage = Column(String, default="identified")  # identified, prescreened, consented, randomized, completed, lost
    consent_status = Column(String, default="pending")  # pending, verified, revoked
    referral_source = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ConsentEvidence(Base):
    __tablename__ = "consent_evidences"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    referral_id = Column(UUID(as_uuid=True), ForeignKey("referrals.id"), nullable=False)
    icf_document_version = Column(String, nullable=False)
    signature_timestamp = Column(DateTime, default=datetime.utcnow)
    signature_type = Column(String, default="electronic")  # electronic, wet_ink_scanned
    verified_by = Column(UUID(as_uuid=True), nullable=True)
    audit_hash = Column(String, nullable=False)
    is_valid = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class EligibilityCriteria(Base):
    __tablename__ = "eligibility_criteria"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    criterion_type = Column(String, nullable=False)  # inclusion, exclusion
    description = Column(Text, nullable=False)
    clinical_threshold = Column(String, nullable=True)
    protocol_section = Column(String, nullable=True)
    human_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class FollowUpTask(Base):
    __tablename__ = "clinical_followup_tasks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    referral_id = Column(UUID(as_uuid=True), ForeignKey("referrals.id"), nullable=False)
    task_type = Column(String, default="prescreen_call")  # prescreen_call, consent_review, visit_reminder
    scheduled_for = Column(DateTime, nullable=False)
    status = Column(String, default="pending")  # pending, completed, cancelled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
