# backend/routes/orders.py
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid
import os
import asyncio

from utils.db import get_db, SessionLocal
from utils.auth_utils import get_current_user
from models.user import User
from models.order import Order, OrderStatus, PricingTier
from services import cdr_generator
from services.payment_service import create_razorpay_order, verify_payment_signature, calculate_order_amount, generate_gst_invoice

router = APIRouter()

def _generate_and_deliver_files(order_id: str):
    db = SessionLocal()
    try:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return
        
        # Get user for invoice
        user = db.query(User).filter(User.id == order.user_id).first()
        
        order.status = OrderStatus.GENERATING
        db.commit()
        
        request_data = {
            "length_mm": 300, "width_mm": 200, "height_mm": 150,
            "brand_name": order.approved_by_name or "Brand",
            "product_name": "Product", "tagline": "Quality Packaging",
            "order_id": order.id, "barcode_number": "000000000000"
        }
        design_data = {"colors": {"background": "#FDFDFD"}, "fonts": {"main": "Arial"}}
        output_dir = os.path.join("generated_files", order.id)
        
        result = cdr_generator.generate_all_files(request_data, design_data, order.id, output_dir)
        
        # Generate GST Invoice
        order_dict = {
            "id": order.id,
            "pricing_tier": order.pricing_tier.value,
            "base_inr": order.base_amount_inr,
            "gst_inr": order.gst_amount_inr,
            "total_inr": order.total_amount_inr
        }
        user_dict = {
            "company_name": user.company_name if user else "Customer",
            "gstin": user.gstin if user else "",
            "city": user.city if user else "India"
        }
        invoice_data = generate_gst_invoice(order_dict, user_dict)
        
        # Write invoice as HTML
        invoice_filename = f"{order.id}_invoice.html"
        invoice_path = os.path.join(output_dir, invoice_filename)
        
        # Simple HTML template for invoice
        invoice_html = f"""
        <html>
        <head><title>Invoice {invoice_data['invoice_number']}</title></head>
        <body>
            <h1>Invoice: {invoice_data['invoice_number']}</h1>
            <p>Date: {invoice_data['date']}</p>
            <p>Buyer: {invoice_data['buyer']['name']} ({invoice_data['buyer']['city']})</p>
            <p>GSTIN: {invoice_data['buyer']['gstin']}</p>
            <hr/>
            <table border="1">
                <tr><th>Description</th><th>Rate</th><th>GST</th><th>Total</th></tr>
                <tr>
                    <td>{invoice_data['line_items'][0]['description']}</td>
                    <td>{invoice_data['line_items'][0]['rate']}</td>
                    <td>{invoice_data['line_items'][0]['gst_amount']}</td>
                    <td>{invoice_data['line_items'][0]['total']}</td>
                </tr>
            </table>
            <p><b>Grand Total: {invoice_data['totals']['grand_total']} INR</b></p>
        </body>
        </html>
        """
        with open(invoice_path, "w", encoding="utf-8") as f:
            f.write(invoice_html)

        order.pdf_url = result.get("pdf")
        order.png_url = result.get("png")
        order.cdr_url = result.get("svg")   # Use SVG as CDR equivalent (Inkscape not guaranteed)
        order.invoice_url = invoice_path
        order.status = OrderStatus.DELIVERED
        order.files_expire_at = datetime.utcnow() + timedelta(days=90)
        db.commit()
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"File generation failed for order {order_id}: {e}")
        try:
            order.status = OrderStatus.FAILED
            db.commit()
        except Exception:
            pass
    finally:
        db.close()


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
    invoice_url: Optional[str]


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
    background_tasks: BackgroundTasks,
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

    # Trigger CDR/PDF/PNG generation via background task
    background_tasks.add_task(_generate_and_deliver_files, req.order_id)

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
                "invoice_url": o.invoice_url,
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
        "invoice_url": order.invoice_url,
        "files_expire_at": order.files_expire_at.isoformat() if order.files_expire_at else None,
        "created_at": order.created_at.isoformat(),
    }
