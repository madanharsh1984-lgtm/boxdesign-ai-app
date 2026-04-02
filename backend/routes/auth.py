# ─── BoxDesign AI — Auth Routes ──────────────────────────────────────────────
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class SendOTPRequest(BaseModel):
    phone: str          # e.g. "+919667964756"


class VerifyOTPRequest(BaseModel):
    phone: str
    otp:   str


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user_id:      str
    is_new_user:  bool


@router.post("/send-otp", summary="Send OTP to phone number")
async def send_otp(req: SendOTPRequest):
    """
    Trigger Firebase Auth to send OTP SMS to the given phone number.
    In production: integrate Firebase Admin SDK / Twilio.
    """
    # TODO: Firebase Admin SDK — send OTP
    return {"message": f"OTP sent to {req.phone}", "success": True}


@router.post("/verify-otp", response_model=TokenResponse, summary="Verify OTP and return JWT")
async def verify_otp(req: VerifyOTPRequest):
    """
    Verify OTP with Firebase, create/fetch user record, return JWT.
    """
    # TODO: Firebase verify + DB upsert + JWT generation
    raise HTTPException(status_code=501, detail="Firebase OTP verification — implement with Firebase Admin SDK")


@router.post("/google", response_model=TokenResponse, summary="Google SSO login")
async def google_login(id_token: str):
    """Accept Google ID token from mobile client, verify, return JWT."""
    # TODO: Verify Google ID token, upsert user
    raise HTTPException(status_code=501, detail="Google SSO — implement with google-auth-library")
