from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Numeric, Integer, Boolean
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
    enquiry_id = Column(UUID(as_uuid=True), ForeignKey("enquiries.id"), nullable=True)
    quote_number = Column(String, nullable=False)
    trade_lane = Column(String, nullable=True)
    container_type = Column(String, default="40HC")
    container_count = Column(Integer, default=1)
    base_rate = Column(Numeric(15, 2), default=0.0)
    total_surcharges = Column(Numeric(15, 2), default=0.0)
    total_amount = Column(Numeric(15, 2), default=0.0)
    validity_date = Column(DateTime)
    status = Column(String, default="draft")  # draft, sent, accepted, rejected, expired
    created_at = Column(DateTime, default=datetime.utcnow)

class Shipment(Base):
    __tablename__ = "shipments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    quotation_id = Column(UUID(as_uuid=True), ForeignKey("quotations.id"), nullable=True)
    booking_number = Column(String, nullable=False)
    bl_number = Column(String, nullable=True)
    vessel = Column(String)
    voyage = Column(String)
    origin_port = Column(String, nullable=True)
    destination_port = Column(String, nullable=True)
    status = Column(String, default="booked")  # booked, in_transit, discharged, customs_cleared, delivered
    eta = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class RateCard(Base):
    __tablename__ = "rate_cards"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    carrier_name = Column(String, nullable=False)
    trade_lane = Column(String, nullable=False)
    container_type = Column(String, default="40HC")  # 20GP, 40HC, 45HC, REEFER
    base_rate = Column(Numeric(15, 2), nullable=False)
    baf_surcharge = Column(Numeric(15, 2), default=0.0)
    thc_surcharge = Column(Numeric(15, 2), default=0.0)
    pss_surcharge = Column(Numeric(15, 2), default=0.0)
    currency = Column(String, default="USD")
    valid_from = Column(DateTime, default=datetime.utcnow)
    valid_to = Column(DateTime)
    status = Column(String, default="active")  # pending_approval, active, expired
    created_at = Column(DateTime, default=datetime.utcnow)

class MilestoneEvent(Base):
    __tablename__ = "milestone_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    shipment_id = Column(UUID(as_uuid=True), ForeignKey("shipments.id", ondelete="CASCADE"), nullable=False)
    milestone_code = Column(String, nullable=False)  # GATE_IN, VESSEL_LOADED, IN_TRANSIT, DISCHARGED, CUSTOMS_CLEARED, DELIVERY_OUTBOUND
    port_or_location = Column(String, nullable=False)
    event_timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="completed")  # completed, in_progress, pending, delayed
    demurrage_free_days_remaining = Column(Integer, nullable=True)
    detention_alert = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class HouseBillOfLading(Base):
    __tablename__ = "house_bills_of_lading"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    shipment_id = Column(UUID(as_uuid=True), ForeignKey("shipments.id"), nullable=True)
    hbl_number = Column(String, unique=True, nullable=False)
    shipper_name = Column(String, nullable=False)
    consignee_name = Column(String, nullable=False)
    notify_party = Column(String, nullable=True)
    vessel_voyage = Column(String, nullable=False)
    port_of_loading = Column(String, nullable=False)
    port_of_discharge = Column(String, nullable=False)
    container_numbers = Column(Text, nullable=True)
    gross_weight_kg = Column(Numeric(12, 2), default=0.0)
    measurement_cbm = Column(Numeric(12, 2), default=0.0)
    status = Column(String, default="draft")  # draft, issued, surrendered
    created_at = Column(DateTime, default=datetime.utcnow)
