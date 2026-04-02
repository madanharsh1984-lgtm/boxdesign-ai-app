# ─── BoxDesign AI — Orders Routes ────────────────────────────────────────────
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter()


class CreateOrderRequest(BaseModel):
    design_request_id: str
    selected_design_id: str
    pricing_tier:       str   # basic | standard | premium
    approved_by_name:   str
    promo_code:         Optional[str] = None


class OrderResponse(BaseModel):
    order_id:        str
    status:          str
    amount_inr:      int
    gst_inr:         int
    razorpay_order_id: str


class PaymentConfirmRequest(BaseModel):
    order_id:             str
    razorpay_payment_id:  str
    razorpay_signature:   str


TIER_PRICES = {"basic": 299, "standard": 799, "premium": 1499}
GST_RATE    = 0.18


@router.post("/", response_model=OrderResponse, summary="Create order & Razorpay order")
async def create_order(req: CreateOrderRequest):
    """
    1. Validate design approval
    2. Calculate price + GST
    3. Create Razorpay order
    4. Return order details for payment screen
    """
    base_price = TIER_PRICES.get(req.pricing_tier, 799)
    gst_amount = round(base_price * GST_RATE)
    total      = base_price + gst_amount
    order_id   = str(uuid.uuid4())

    # TODO: create Razorpay order via services/payment_service.py
    # TODO: save to DB
    return OrderResponse(
        order_id=order_id,
        status="pending_payment",
        amount_inr=total,
        gst_inr=gst_amount,
        razorpay_order_id=f"order_{order_id[:8]}",
    )


@router.post("/confirm-payment", summary="Confirm Razorpay payment & trigger file delivery")
async def confirm_payment(req: PaymentConfirmRequest):
    """
    1. Verify Razorpay signature
    2. Update order status to 'paid'
    3. Trigger CDR/PDF/PNG generation
    4. Send delivery email
    """
    # TODO: razorpay.utility.verify_payment_signature(...)
    return {"status": "success", "message": "Payment confirmed. Files being generated."}


@router.get("/", summary="List user's orders")
async def list_orders(page: int = 1, page_size: int = 20):
    """Return paginated list of orders for the authenticated user."""
    # TODO: DB query with auth user context
    return {"items": [], "total": 0, "page": page, "has_more": False}


@router.get("/{order_id}", summary="Get single order detail")
async def get_order(order_id: str):
    """Return full order detail including delivered file URLs."""
    # TODO: DB fetch
    raise HTTPException(status_code=404, detail="Order not found")
