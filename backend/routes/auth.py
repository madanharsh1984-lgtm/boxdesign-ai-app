# backend/routes/auth.py
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from utils.db import get_db
from utils.auth_utils import create_access_token, get_current_user
from models.user import User
import uuid
import re, time

router = APIRouter()

DEV_MODE = True  # Set False in production; any 6-digit OTP accepted
_OTP_LAST_SENT: dict[str, float] = {}
OTP_COOLDOWN_SECONDS = 30


class SendOTPRequest(BaseModel):
    phone: str


class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    is_new_user: bool


class UpdateProfileRequest(BaseModel):
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    gstin: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    logo_url: Optional[str] = None
    brand_colours: Optional[list] = None
    brand_pattern_url: Optional[str] = None


class UserProfileResponse(BaseModel):
    id: str
    phone: str
    company_name: Optional[str]
    contact_name: Optional[str]
    gstin: Optional[str]
    city: Optional[str]
    state: Optional[str]
    logo_url: Optional[str]
    brand_colours: Optional[list]
    brand_pattern_url: Optional[str]


@router.post("/send-otp", summary="Send OTP to phone number")
async def send_otp(req: SendOTPRequest):
    if not re.match(r'^\+[1-9]\d{6,14}$', req.phone):
        raise HTTPException(status_code=400, detail="Invalid phone format. Use E.164 e.g. +919876543210")
    now = time.time()
    last = _OTP_LAST_SENT.get(req.phone, 0)
    if now - last < OTP_COOLDOWN_SECONDS:
        wait = int(OTP_COOLDOWN_SECONDS - (now - last))
        raise HTTPException(status_code=429, detail=f"Please wait {wait}s before requesting another OTP")
    _OTP_LAST_SENT[req.phone] = now
    # In production: Firebase Admin SDK / Twilio
    return {"message": f"OTP sent to {req.phone}", "success": True}


@router.post("/verify-otp", response_model=TokenResponse, summary="Verify OTP and return JWT")
async def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    # Dev mode: accept any 6-digit OTP
    if DEV_MODE:
        if len(req.otp) != 6 or not req.otp.isdigit():
            raise HTTPException(status_code=400, detail="OTP must be 6 digits")
    else:
        # TODO: Firebase Admin SDK verification
        raise HTTPException(status_code=501, detail="Firebase OTP verification not configured")

    # Upsert user
    user = db.query(User).filter(User.phone == req.phone).first()
    is_new_user = user is None
    if is_new_user:
        user = User(id=str(uuid.uuid4()), phone=req.phone)
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user_id=user.id, is_new_user=is_new_user)


@router.post("/google", response_model=TokenResponse, summary="Google SSO login")
async def google_login(id_token: str, db: Session = Depends(get_db)):
    # TODO: Verify Google ID token with google-auth-library
    raise HTTPException(status_code=501, detail="Google SSO not yet configured — use OTP login")


@router.get("/profile", response_model=UserProfileResponse, summary="Get current user profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    return UserProfileResponse(
        id=current_user.id,
        phone=current_user.phone,
        company_name=current_user.company_name,
        contact_name=current_user.contact_name,
        gstin=current_user.gstin,
        city=current_user.city,
        state=current_user.state,
        logo_url=current_user.logo_url,
        brand_colours=current_user.brand_colours,
        brand_pattern_url=current_user.brand_pattern_url,
    )


@router.put("/profile", summary="Update user profile")
async def update_profile(
    req: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    for field, value in req.dict(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return {"success": True, "message": "Profile updated"}


@router.post("/logout", summary="Logout (client-side token discard)")
async def logout():
    return {"success": True, "message": "Logged out — discard token on client"}


@router.post("/upload-logo", summary="Upload company logo")
async def upload_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    import shutil, os
    
    logos_dir = os.path.join("generated_files", "logos")
    os.makedirs(logos_dir, exist_ok=True)
    
    ext = os.path.splitext(file.filename or "logo.jpg")[1] or ".jpg"
    filename = f"{current_user.id}{ext}"
    dest = os.path.join(logos_dir, filename)
    
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    logo_url = f"http://localhost:8000/v1/files/download/logos/{filename}"
    current_user.logo_url = logo_url
    db.commit()
    
    return {"success": True, "logo_url": logo_url}
