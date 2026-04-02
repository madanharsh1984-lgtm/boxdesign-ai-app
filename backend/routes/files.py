# backend/routes/files.py — File Delivery Routes
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from datetime import datetime
import os
import urllib.parse

from utils.db import get_db
from utils.auth_utils import get_current_user
from models.user import User
from models.order import Order, OrderStatus

router = APIRouter()


def _file_url(path: str | None, base_url: str = "http://localhost:8000") -> str | None:
    """Convert local file path to a served URL (dev mode). In prod, use S3 presigned URL."""
    if not path or not os.path.exists(path):
        return None
    filename = os.path.basename(path)
    order_folder = os.path.basename(os.path.dirname(path))
    return f"{base_url}/v1/files/download/{order_folder}/{filename}"


@router.get("/{order_id}/links", summary="Get download URLs for delivered files")
async def get_file_links(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if order.files_expire_at and order.files_expire_at < datetime.utcnow():
        raise HTTPException(
            status_code=410,
            detail="Files have expired. Please re-order to get fresh files."
        )
    if order.status not in (OrderStatus.DELIVERED, OrderStatus.GENERATING):
        raise HTTPException(status_code=404, detail="Files not yet available for this order")

    return {
        "order_id": order_id,
        "status": order.status.value,
        "pdf_url": _file_url(order.pdf_url),
        "png_url": _file_url(order.png_url),
        "svg_url": _file_url(order.cdr_url),
        "cdr_url": _file_url(order.cdr_url),
        "invoice_url": f"http://localhost:8000/v1/files/{order_id}/invoice" if order.invoice_url else None,
        "expires_at": order.files_expire_at.isoformat() if order.files_expire_at else None,
    }


@router.get("/{order_id}/invoice", response_class=HTMLResponse, summary="Download GST invoice HTML")
async def get_invoice(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if not order.invoice_url or not os.path.exists(order.invoice_url):
        raise HTTPException(status_code=404, detail="Invoice not yet generated")
    with open(order.invoice_url, encoding="utf-8") as f:
        html = f.read()
    return HTMLResponse(content=html)


@router.get("/{order_id}/share-whatsapp", summary="Get WhatsApp share deep link")
async def share_whatsapp(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    tier = order.pricing_tier.value if order.pricing_tier else "standard"
    total = order.total_amount_inr or 0
    msg = (
        f"BoxDesign AI Order #{order_id[-8:]}\n"
        f"Plan: {tier.capitalize()} | Total: ₹{total}\n"
        f"Status: {order.status.value}\n"
        f"Download: http://localhost:8000/v1/files/{order_id}/links"
    )
    wa_url = f"https://wa.me/?text={urllib.parse.quote(msg)}"
    return {"whatsapp_url": wa_url, "message": msg}


@router.get("/{order_id}/share-email", summary="Get mailto share link")
async def share_email(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    subject = urllib.parse.quote(f"BoxDesign AI - Order #{order_id[-8:]} Files Ready")
    body = urllib.parse.quote(
        f"Your packaging design files are ready.\n\n"
        f"Order: #{order_id[-8:]}\nTier: {order.pricing_tier.value if order.pricing_tier else 'standard'}\n"
        f"Total: ₹{order.total_amount_inr or 0}\n\n"
        f"Download: http://localhost:8000/v1/files/{order_id}/links"
    )
    mailto_url = f"mailto:?subject={subject}&body={body}"
    return {"mailto_url": mailto_url}


@router.get("/download/{order_folder}/{filename}", summary="Serve a generated file (dev only)")
async def download_file(order_folder: str, filename: str):
    """Dev-mode file serving. In production, redirect to S3 presigned URL."""
    import mimetypes
    from fastapi.responses import FileResponse
    path = os.path.join("generated_files", order_folder, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    mime, _ = mimetypes.guess_type(filename)
    return FileResponse(path, media_type=mime or "application/octet-stream", filename=filename)


@router.post("/{order_id}/regenerate-links", summary="Regenerate expiring download links")
async def regenerate_links(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    # In prod: extend S3 presigned URL expiry. Here just return existing links.
    return {
        "order_id": order_id,
        "pdf_url": _file_url(order.pdf_url),
        "png_url": _file_url(order.png_url),
        "svg_url": _file_url(order.cdr_url),
        "message": "Links refreshed"
    }
