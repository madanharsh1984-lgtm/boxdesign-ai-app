# BoxDesign AI — User Model
from sqlalchemy import Column, String, DateTime, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    """
    Stores user account information, including brand assets and business details.
    """
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    phone = Column(String(15), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True)
    firebase_uid = Column(String(128), unique=True, nullable=True)
    
    # Business Details
    company_name = Column(String(255), nullable=True)
    contact_name = Column(String(255), nullable=True)
    gstin = Column(String(15), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    
    # Brand Assets
    logo_url = Column(String(500), nullable=True)
    brand_colours = Column(JSON, nullable=True)
    brand_pattern_url = Column(String(500), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<User(phone={self.phone}, company={self.company_name})>"
