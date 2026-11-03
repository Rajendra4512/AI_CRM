from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Numeric, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from core.database import Base

class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    company_name = Column(String)
    email = Column(String)
    phone = Column(String)
    source = Column(String)  # website, angileads, referral
    status = Column(String, default="new")
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Opportunity(Base):
    __tablename__ = "opportunities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"))
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"))
    name = Column(String, nullable=False)
    estimated_value = Column(Numeric(15, 2))
    probability = Column(String)
    stage = Column(String, default="qualification")
    expected_close_date = Column(DateTime)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class Estimate(Base):
    __tablename__ = "estimates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id"))
    estimate_number = Column(String)
    title = Column(String)
    status = Column(String, default="draft")
    subtotal = Column(Numeric(15, 2))
    tax = Column(Numeric(15, 2))
    total = Column(Numeric(15, 2))
    markup_percent = Column(String)
    valid_until = Column(DateTime)
    approved_at = Column(DateTime)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class EstimateLineItem(Base):
    __tablename__ = "estimate_line_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    estimate_id = Column(UUID(as_uuid=True), ForeignKey("estimates.id"))
    cost_code = Column(String)
    description = Column(Text)
    quantity = Column(String)
    unit = Column(String)
    unit_cost = Column(Numeric(15, 2))
    unit_price = Column(Numeric(15, 2))
    line_total = Column(Numeric(15, 2))
    item_type = Column(String)  # labor, material, equipment, subcontract
    created_at = Column(DateTime, default=datetime.utcnow)

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    po_number = Column(String)
    vendor_id = Column(UUID(as_uuid=True))
    status = Column(String, default="draft")
    total_amount = Column(Numeric(15, 2))
    created_at = Column(DateTime, default=datetime.utcnow)

class Subcontract(Base):
    __tablename__ = "subcontracts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    subcontract_number = Column(String)
    subcontractor_id = Column(UUID(as_uuid=True))
    status = Column(String, default="draft")
    retainage_percent = Column(String)
    start_date = Column(DateTime)
    estimated_completion_date = Column(DateTime)
    total_amount = Column(Numeric(15, 2))
    created_at = Column(DateTime, default=datetime.utcnow)

class RFI(Base):
    __tablename__ = "rfis"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    rfi_number = Column(String)
    subject = Column(String)
    question = Column(Text)
    answer = Column(Text)
    status = Column(String, default="open")
    due_date = Column(DateTime)
    requested_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class Submittal(Base):
    __tablename__ = "submittals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    submittal_number = Column(String)
    title = Column(String)
    spec_section = Column(String)
    status = Column(String, default="pending")
    due_date = Column(DateTime)
    submitted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
