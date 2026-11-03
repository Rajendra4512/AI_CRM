from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from core.database import Base

class Account(Base):
    __tablename__ = "accounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    name = Column(String, nullable=False)
    account_type = Column(String)
    industry = Column(String)
    website = Column(String)
    phone = Column(String)
    email = Column(String)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    contacts = relationship("Contact", back_populates="account")
    opportunities = relationship("Opportunity", back_populates="account")

class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"))
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String)
    phone = Column(String)
    title = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    account = relationship("Account", back_populates="contacts")

class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    company = Column(String)
    email = Column(String)
    phone = Column(String)
    source = Column(String)
    status = Column(String, default="new")
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Opportunity(Base):
    __tablename__ = "opportunities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"))
    name = Column(String, nullable=False)
    amount = Column(Numeric(15, 2))
    stage = Column(String, default="prospecting")
    probability = Column(String)
    close_date = Column(DateTime)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    account = relationship("Account", back_populates="opportunities")
