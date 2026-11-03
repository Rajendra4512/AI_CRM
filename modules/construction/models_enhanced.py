from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Numeric, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from core.database import Base

class ChangeEvent(Base):
    __tablename__ = "change_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    change_event_number = Column(String)
    title = Column(String, nullable=False)
    description = Column(Text)
    change_reason = Column(String)  # Client Request, Design Development, etc
    status = Column(String, default="open")
    private = Column(Boolean, default=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class RFQ(Base):
    __tablename__ = "rfqs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    change_event_id = Column(UUID(as_uuid=True), ForeignKey("change_events.id"))
    rfq_number = Column(String)
    title = Column(String)
    due_date = Column(DateTime)
    status = Column(String, default="draft")  # draft, sent, responded, revised, pending_approval
    request_details = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RFQResponse(Base):
    __tablename__ = "rfq_responses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rfq_id = Column(UUID(as_uuid=True), ForeignKey("rfqs.id"))
    contract_company_id = Column(UUID(as_uuid=True))
    quote_amount = Column(Numeric(15, 2))
    schedule_impact_days = Column(String)
    comments = Column(Text)
    status = Column(String, default="submitted")
    responded_at = Column(DateTime, default=datetime.utcnow)

class CommitmentPCO(Base):
    __tablename__ = "commitment_pcos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    change_event_id = Column(UUID(as_uuid=True), ForeignKey("change_events.id"))
    pco_number = Column(String)
    contract_id = Column(UUID(as_uuid=True))
    status = Column(String, default="pending_in_review")
    schedule_impact_days = Column(String)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class CommitmentCO(Base):
    __tablename__ = "commitment_cos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    pco_id = Column(UUID(as_uuid=True), ForeignKey("commitment_pcos.id"))
    co_number = Column(String)
    revision = Column(String, default="0")
    status = Column(String, default="pending_in_review")
    executed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
