from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from core.database import Base

class SystemConfig(Base):
    __tablename__ = "system_config"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String, unique=True, nullable=False)
    value = Column(Text)
    category = Column(String)
    encrypted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    action = Column(String, nullable=False)
    resource_type = Column(String)
    resource_id = Column(String)
    ip_address = Column(String)
    user_agent = Column(Text)
    details = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class MarketingPlan(Base):
    __tablename__ = "marketing_plans"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    plan_type = Column(String)
    features = Column(JSON)
    pricing = Column(JSON)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ComboPack(Base):
    __tablename__ = "combo_packs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    marketing_plan_id = Column(UUID(as_uuid=True), ForeignKey("marketing_plans.id"))
    name = Column(String, nullable=False)
    items = Column(JSON)
    discount_percentage = Column(String)
    price = Column(String)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
