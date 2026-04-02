# ─── BoxDesign AI — File Delivery Routes ─────────────────────────────────────
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class FileLinksResponse(BaseModel):
    pdf_url: str | None = None
    png_url: str | None = None
    cdr_url: str | None = None
    expires_at: str


@router.get("/{order_id}", response_model=FileLinksResponse,
            summary="Get signed download URLs for delivered files")
async def get_file_links(order_id: str):
    """
    Returns pre-signed S3 / Cloudflare R2 URLs for the delivered design files.
    URLs expire after 90 days.
    Only accessible by the order owner.
    """
    # TODO: Verify order ownership, generate signed URLs via services/storage.py
    raise HTTPException(status_code=404, detail="Files not yet available for this order")


@router.post("/{order_id}/regenerate-links",
             summary="Regenerate expiring download links")
async def regenerate_links(order_id: str):
    """
    If original signed URLs have expired (< 7 days left),
    generate fresh signed URLs for files stored in R2/S3.
    Files are retained for FILE_EXPIRY_DAYS (90 days) from order date.
    """
    # TODO: Check order age < 90 days, regenerate signed URLs
    raise HTTPException(status_code=501, detail="Link regeneration — implement with boto3 presigned URLs")
