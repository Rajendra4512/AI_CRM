from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from core.database import Base

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
