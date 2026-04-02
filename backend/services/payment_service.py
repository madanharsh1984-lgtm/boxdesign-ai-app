"""
BoxDesign AI — Payment Service (Razorpay)
Docs: https://razorpay.com/docs/api/
"""

import os
import hmac
import hashlib
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants / Config
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
GST_RATE = 0.18
TIER_PRICES = {"basic": 299, "standard": 799, "premium": 1499}

def calculate_order_amount(tier: str, promo_code: str = None) -> dict:
    """
    Calculate the order amount, discounts, and GST.
    
    Args:
        tier (str): The pricing tier ('basic', 'standard', 'premium').
        promo_code (str, optional): The promo code for discounts.
        
    Returns:
        dict: Breakdown of the order amount.
    """
    base_inr = TIER_PRICES.get(tier.lower(), 0)
    if base_inr == 0:
        logger.error(f"Invalid tier provided: {tier}")
        raise ValueError(f"Invalid tier: {tier}")

    discount_inr = 0
    if promo_code == "FIRST50":
        # 50% off base (max ₹200 off)
        discount_inr = min(int(base_inr * 0.5), 200)
    elif promo_code == "LAUNCH100":
        # ₹100 off
        discount_inr = 100
    
    # Ensure discount doesn't exceed base price
    discount_inr = min(discount_inr, base_inr)
    
    taxable_amount = base_inr - discount_inr
    gst_inr = round(taxable_amount * GST_RATE)
    total_inr = taxable_amount + gst_inr
    total_paise = int(total_inr * 100)

    result = {
        "tier": tier,
        "base_inr": base_inr,
        "discount_inr": discount_inr,
        "gst_inr": gst_inr,
        "total_inr": total_inr,
        "total_paise": total_paise
    }
    
    logger.info(f"Calculated amount for tier {tier} with promo {promo_code}: {total_inr} INR")
    return result

def create_razorpay_order(tier: str, order_id: str, promo_code: str = None) -> dict:
    """
    Create a Razorpay order or return a mock response if keys/library are missing.
    
    Args:
        tier (str): Pricing tier.
        order_id (str): Application internal order ID.
        promo_code (str, optional): Promo code.
        
    Returns:
        dict: Razorpay order details.
    """
    # Calculate amount
    amounts = calculate_order_amount(tier, promo_code)
    total_paise = amounts["total_paise"]

    # Try importing razorpay and creating client
    try:
        import razorpay
        if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
            raise ValueError("Razorpay keys are missing")
            
        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        
        order_data = {
            "amount": total_paise,
            "currency": "INR",
            "receipt": order_id,
            "notes": {
                "tier": tier,
                "app": "BoxDesign AI"
            }
        }
        
        rz_order = client.order.create(data=order_data)
        logger.info(f"Razorpay order created: {rz_order['id']}")
        
        return {
            "razorpay_order_id": rz_order["id"],
            "amount_paise": total_paise,
            "currency": "INR",
            "key_id": RAZORPAY_KEY_ID
        }
        
    except (ImportError, Exception) as e:
        logger.warning(f"Using mock Razorpay order. Error: {str(e)}")
        return {
            "razorpay_order_id": f"mock_order_{order_id[:8]}",
            "amount_paise": total_paise,
            "currency": "INR",
            "key_id": "rzp_test_mock",
            "is_mock": True
        }

def verify_payment_signature(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
    """
    Verify the authenticity of a Razorpay payment signature.
    
    Args:
        razorpay_order_id (str): Order ID from Razorpay.
        razorpay_payment_id (str): Payment ID from Razorpay.
        razorpay_signature (str): Signature received from frontend/webhook.
        
    Returns:
        bool: True if signature is valid.
    """
    if not RAZORPAY_KEY_SECRET:
        logger.warning("RAZORPAY_KEY_SECRET not found. Bypassing signature verification (Dev Mode).")
        return True
        
    try:
        msg = f"{razorpay_order_id}|{razorpay_payment_id}"
        expected = hmac.new(
            RAZORPAY_KEY_SECRET.encode(),
            msg.encode(),
            hashlib.sha256
        ).hexdigest()
        
        is_valid = hmac.compare_digest(expected, razorpay_signature)
        if not is_valid:
            logger.error("Razorpay signature verification failed!")
        return is_valid
    except Exception as e:
        logger.error(f"Error during signature verification: {str(e)}")
        return False

def generate_gst_invoice(order: dict, user: dict) -> dict:
    """
    Generate structured GST invoice data.
    
    Args:
        order (dict): Order details (id, pricing_tier, amounts).
        user (dict): User details (company_name, gstin, city).
        
    Returns:
        dict: Full invoice data ready for PDF generation.
    """
    # Assuming order dict contains the pre-calculated amounts for convenience
    # If not, we re-calculate or extract from order object
    base_inr = order.get("base_inr", 0)
    gst_inr = order.get("gst_inr", 0)
    total_inr = order.get("total_inr", 0)
    
    invoice_data = {
        "invoice_number": f"BDAI-{datetime.now().strftime('%Y%m')}-{order['id'][:6].upper()}",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "seller": {
            "name": "BoxDesign AI",
            "gstin": "PENDING_REGISTRATION",
            "address": "India"
        },
        "buyer": {
            "name": user.get("company_name", "Anonymous User"),
            "gstin": user.get("gstin", ""),
            "city": user.get("city", "Unknown")
        },
        "line_items": [
            {
                "description": f"{order.get('pricing_tier', 'standard').title()} Design Package",
                "hsn": "998314",
                "qty": 1,
                "rate": base_inr,
                "gst_rate": 18,
                "gst_amount": gst_inr,
                "total": total_inr
            }
        ],
        "totals": {
            "subtotal": base_inr,
            "gst_total": gst_inr,
            "grand_total": total_inr
        }
    }
    
    logger.info(f"Generated invoice data for {invoice_data['invoice_number']}")
    return invoice_data
