# BoxDesign AI — Order Model
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship
from models.user import Base
from datetime import datetime
import uuid
import enum

class OrderStatus(str, enum.Enum):
    DRAFT = "draft"
    APPROVED = "approved"
    PAID = "paid"
    GENERATING = "generating"
    DELIVERED = "delivered"
    FAILED = "failed"

class PricingTier(str, enum.Enum):
    BASIC = "basic"
    STANDARD = "standard"
    PREMIUM = "premium"

class Order(Base):
    """
    Tracks customer orders, payments, and the delivery status of final production files.
    """
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    design_request_id = Column(String, nullable=True)
    selected_design_id = Column(String, nullable=True)
    
    # Tier and Status
    pricing_tier = Column(Enum(PricingTier), default=PricingTier.STANDARD)
    status = Column(Enum(OrderStatus), default=OrderStatus.DRAFT)
    
    # Pricing Details (in Paise or Rupees, usually Integer for precision)
    base_amount_inr = Column(Integer, nullable=False)
    gst_amount_inr = Column(Integer, nullable=False)
    total_amount_inr = Column(Integer, nullable=False)
    promo_code = Column(String(50), nullable=True)
    discount_inr = Column(Integer, default=0)
    
    # Payment Tracking
    razorpay_order_id = Column(String(255), nullable=True)
    razorpay_payment_id = Column(String(255), nullable=True)
    
    # Approvals
    approved_by_name = Column(String(100), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    # Final Asset URLs
    pdf_url = Column(String(500), nullable=True)
    png_url = Column(String(500), nullable=True)
    cdr_url = Column(String(500), nullable=True) # Source CDR or high-res SVG
    invoice_url = Column(String(500), nullable=True)
    files_expire_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="orders")
