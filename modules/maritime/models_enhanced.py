from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Numeric, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from core.database import Base

class RateCard(Base):
    __tablename__ = "rate_cards"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    carrier_name = Column(String)
    pol = Column(String)  # Port of Loading
    pod = Column(String)  # Port of Discharge
    container_type = Column(String)
    rate = Column(Numeric(15, 2))
    currency = Column(String, default="USD")
    valid_from = Column(DateTime)
    valid_to = Column(DateTime)
    transit_days = Column(String)
    surcharges = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    quotation_id = Column(UUID(as_uuid=True), ForeignKey("quotations.id"))
    booking_number = Column(String, nullable=False)
    vessel = Column(String)
    voyage = Column(String)
    carrier_booking_ref = Column(String)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

class ShipmentMilestone(Base):
    __tablename__ = "shipment_milestones"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    shipment_id = Column(UUID(as_uuid=True), ForeignKey("shipments.id"))
    milestone_type = Column(String)  # booked, loaded, departed, arrived, delivered
    location = Column(String)
    event_time = Column(DateTime)
    vessel_voyage = Column(String)
    source = Column(String)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class BillOfLading(Base):
    __tablename__ = "bills_of_lading"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    shipment_id = Column(UUID(as_uuid=True), ForeignKey("shipments.id"))
    bl_number = Column(String, nullable=False)
    bl_type = Column(String)  # House BL, Master BL
    shipper = Column(Text)
    consignee = Column(Text)
    notify_party = Column(Text)
    goods_description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
