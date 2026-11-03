from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from core.database import Base

class Enquiry(Base):
    __tablename__ = "enquiries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    origin = Column(String)
    destination = Column(String)
    commodity = Column(String)
    status = Column(String, default="new")
    created_at = Column(DateTime, default=datetime.utcnow)

class Quotation(Base):
    __tablename__ = "quotations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    enquiry_id = Column(UUID(as_uuid=True), ForeignKey("enquiries.id"))
    quote_number = Column(String, nullable=False)
    total_amount = Column(Numeric(15, 2))
    validity_date = Column(DateTime)
    status = Column(String, default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)

class Shipment(Base):
    __tablename__ = "shipments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    booking_number = Column(String, nullable=False)
    vessel = Column(String)
    voyage = Column(String)
    status = Column(String, default="booked")
    eta = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
