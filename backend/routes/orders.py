# backend/routes/orders.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from utils.db import get_db
from utils.auth_utils import get_current_user
from models.user import User
from models.order import Order, OrderStatus, PricingTier
from services.payment_service import create_razorpay_order, verify_payment_signature, calculate_order_amount

router = APIRouter()


class CreateOrderRequest(BaseModel):
    design_request_id: str
    selected_design_id: Optional[str] = None
    pricing_tier: str       # basic | standard | premium
    approved_by_name: str
    promo_code: Optional[str] = None


class OrderResponse(BaseModel):
    order_id: str
    status: str
    base_amount_inr: int
    gst_amount_inr: int
    total_amount_inr: int
    discount_inr: int
    razorpay_order_id: str
    razorpay_key_id: str
    is_mock: bool = False


class PaymentConfirmRequest(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class OrderListItem(BaseModel):
    order_id: str
    status: str
    pricing_tier: str
    total_amount_inr: int
    created_at: str
    pdf_url: Optional[str]
    png_url: Optional[str]
    cdr_url: Optional[str]


@router.post("/", response_model=OrderResponse, summary="Create order & Razorpay order")
async def create_order(
    req: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        tier = PricingTier(req.pricing_tier.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid tier: {req.pricing_tier}. Use basic/standard/premium")

    # Calculate amounts
    amounts = calculate_order_amount(req.pricing_tier, req.promo_code)
    order_id = str(uuid.uuid4())

    # Create Razorpay order (or mock)
    rz = create_razorpay_order(req.pricing_tier, order_id, req.promo_code)

    # Persist to DB
    order = Order(
        id=order_id,
        user_id=current_user.id,
        design_request_id=req.design_request_id,
        selected_design_id=req.selected_design_id,
        pricing_tier=tier,
        status=OrderStatus.APPROVED,
        base_amount_inr=amounts["base_inr"],
        gst_amount_inr=amounts["gst_inr"],
        total_amount_inr=amounts["total_inr"],
        discount_inr=amounts["discount_inr"],
        promo_code=req.promo_code,
        razorpay_order_id=rz["razorpay_order_id"],
        approved_by_name=req.approved_by_name,
        approved_at=datetime.utcnow(),
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    return OrderResponse(
        order_id=order_id,
        status=order.status.value,
        base_amount_inr=amounts["base_inr"],
        gst_amount_inr=amounts["gst_inr"],
        total_amount_inr=amounts["total_inr"],
        discount_inr=amounts["discount_inr"],
        razorpay_order_id=rz["razorpay_order_id"],
        razorpay_key_id=rz.get("key_id", "rzp_test_mock"),
        is_mock=rz.get("is_mock", False),
    )


@router.post("/confirm-payment", summary="Confirm Razorpay payment & trigger file delivery")
async def confirm_payment(
    req: PaymentConfirmRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(
        Order.id == req.order_id,
        Order.user_id == current_user.id,
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Verify Razorpay signature (bypassed in dev if no secret key)
    sig_valid = verify_payment_signature(
        req.razorpay_order_id,
        req.razorpay_payment_id,
        req.razorpay_signature,
    )
    if not sig_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Update order status
    order.status = OrderStatus.PAID
    order.razorpay_payment_id = req.razorpay_payment_id
    order.updated_at = datetime.utcnow()
    db.commit()

    # TODO: Phase 4 — trigger CDR/PDF/PNG generation via cdr_generator.py
    # TODO: Phase 4 — send download links via email/WhatsApp

    return {
        "status": "success",
        "message": "Payment confirmed. Files are being generated and will be ready shortly.",
        "order_id": req.order_id,
    }


@router.get("/", summary="List user orders")
async def list_orders(
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    offset = (page - 1) * page_size
    total = db.query(Order).filter(Order.user_id == current_user.id).count()
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )
    return {
        "items": [
            {
                "order_id": o.id,
                "status": o.status.value,
                "pricing_tier": o.pricing_tier.value,
                "total_amount_inr": o.total_amount_inr,
                "created_at": o.created_at.isoformat(),
                "pdf_url": o.pdf_url,
                "png_url": o.png_url,
                "cdr_url": o.cdr_url,
            }
            for o in orders
        ],
        "total": total,
        "page": page,
        "has_more": (offset + page_size) < total,
    }


@router.get("/{order_id}", summary="Get single order detail")
async def get_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id,
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {
        "order_id": order.id,
        "status": order.status.value,
        "pricing_tier": order.pricing_tier.value,
        "base_amount_inr": order.base_amount_inr,
        "gst_amount_inr": order.gst_amount_inr,
        "total_amount_inr": order.total_amount_inr,
        "discount_inr": order.discount_inr,
        "promo_code": order.promo_code,
        "razorpay_order_id": order.razorpay_order_id,
        "razorpay_payment_id": order.razorpay_payment_id,
        "approved_by_name": order.approved_by_name,
        "approved_at": order.approved_at.isoformat() if order.approved_at else None,
        "pdf_url": order.pdf_url,
        "png_url": order.png_url,
        "cdr_url": order.cdr_url,
        "files_expire_at": order.files_expire_at.isoformat() if order.files_expire_at else None,
        "created_at": order.created_at.isoformat(),
    }
