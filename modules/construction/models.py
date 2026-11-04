from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Numeric, Integer, Boolean, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from core.database import Base
import core.models.crm  # noqa: F401 - register accounts table for rfqs.account_id FK

class RFQ(Base):
    __tablename__ = "rfqs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"))
    project_name = Column(String, nullable=False)
    due_date = Column(DateTime)
    status = Column(String, default="open")
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Estimate(Base):
    __tablename__ = "estimates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    rfq_id = Column(UUID(as_uuid=True), ForeignKey("rfqs.id"))
    version = Column(String, default="1.0")
    total_amount = Column(Numeric(15, 2))
    status = Column(String, default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    project_name = Column(String, nullable=False)
    start_date = Column(DateTime)
    status = Column(String, default="active")
    budget = Column(Numeric(15, 2))
    created_at = Column(DateTime, default=datetime.utcnow)

class SOVApplication(Base):
    __tablename__ = "sov_applications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    application_number = Column(Integer, nullable=False)
    period_to = Column(DateTime, default=datetime.utcnow)
    retainage_rate_pct = Column(Numeric(5, 2), default=10.0)
    total_contract_value = Column(Numeric(15, 2), default=0.0)
    total_completed_stored = Column(Numeric(15, 2), default=0.0)
    total_retainage = Column(Numeric(15, 2), default=0.0)
    net_payment_due = Column(Numeric(15, 2), default=0.0)
    status = Column(String, default="draft")  # draft, submitted, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('project_id', 'application_number', name='uix_sov_project_app_num'),
    )
    
    line_items = relationship("SOVLineItem", back_populates="application", cascade="all, delete-orphan")

class SOVLineItem(Base):
    __tablename__ = "sov_line_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("sov_applications.id", ondelete="CASCADE"), nullable=False)
    line_item_code = Column(String, nullable=False)
    description = Column(String, nullable=False)
    scheduled_value = Column(Numeric(15, 2), default=0.0)
    work_previous = Column(Numeric(15, 2), default=0.0)
    work_current = Column(Numeric(15, 2), default=0.0)
    stored_materials = Column(Numeric(15, 2), default=0.0)
    total_completed_stored = Column(Numeric(15, 2), default=0.0)
    retainage_amount = Column(Numeric(15, 2), default=0.0)
    current_due = Column(Numeric(15, 2), default=0.0)
    balance_to_finish = Column(Numeric(15, 2), default=0.0)
    
    application = relationship("SOVApplication", back_populates="line_items")

class ChangeEvent(Base):
    __tablename__ = "change_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True)
    event_number = Column(String, nullable=False)
    title = Column(String, nullable=False)
    trade_scope = Column(String, nullable=False)
    estimated_cost = Column(Numeric(15, 2), default=0.0)
    status = Column(String, default="draft")  # draft, rfq_issued, pco_submitted, pco_approved, rejected
    actor_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FieldTimeMaterial(Base):
    __tablename__ = "field_time_materials"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True)
    change_event_id = Column(UUID(as_uuid=True), ForeignKey("change_events.id"), nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    trade = Column(String, nullable=False)
    worker_name = Column(String, nullable=False)
    hours_worked = Column(Numeric(5, 2), default=0.0)
    materials_cost = Column(Numeric(12, 2), default=0.0)
    equipment_cost = Column(Numeric(12, 2), default=0.0)
    supervisor_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
