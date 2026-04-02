"""
BoxDesign AI — File Storage Service
Supports: Cloudflare R2 (primary), AWS S3 (fallback), local filesystem (dev)
"""

import os
import boto3
import logging
import mimetypes
import shutil
from pathlib import Path
from botocore.exceptions import ClientError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Config
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "boxdesign-ai-files")
R2_ENDPOINT_URL = os.getenv("R2_ENDPOINT_URL", "")   # For Cloudflare R2
USE_LOCAL_STORAGE = os.getenv("USE_LOCAL_STORAGE", "true").lower() == "true"
LOCAL_STORAGE_DIR = Path(os.getenv("LOCAL_STORAGE_DIR", "./local_files"))

# Global client cache
_s3_client = None

def get_s3_client():
    """
    Initialize and return an S3/R2 client.
    """
    global _s3_client
    if _s3_client is not None:
        return _s3_client

    session_kwargs = {
        "aws_access_key_id": AWS_ACCESS_KEY_ID,
        "aws_secret_access_key": AWS_SECRET_ACCESS_KEY,
        "region_name": AWS_REGION
    }

    if R2_ENDPOINT_URL:
        logger.info(f"Using Cloudflare R2 endpoint: {R2_ENDPOINT_URL}")
        _s3_client = boto3.client(
            "s3",
            endpoint_url=R2_ENDPOINT_URL,
            **session_kwargs
        )
    else:
        logger.info("Using standard AWS S3 client")
        _s3_client = boto3.client("s3", **session_kwargs)
        
    return _s3_client

def upload_file(local_path: str, remote_key: str, content_type: str = None) -> str:
    """
    Upload a file to the configured storage.
    
    Args:
        local_path (str): Path to the local file to upload.
        remote_key (str): Destination key in storage.
        content_type (str, optional): MIME type of the file.
        
    Returns:
        str: Public URL or local path.
    """
    if not os.path.exists(local_path):
        logger.error(f"Local file not found: {local_path}")
        raise FileNotFoundError(f"File not found: {local_path}")

    if USE_LOCAL_STORAGE:
        try:
            dest_path = LOCAL_STORAGE_DIR / remote_key
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(local_path, dest_path)
            logger.info(f"File stored locally: {dest_path}")
            return f"/local_files/{remote_key}"
        except Exception as e:
            logger.error(f"Failed to store file locally: {str(e)}")
            raise

    # Remote Upload (S3/R2)
    s3 = get_s3_client()
    if not content_type:
        content_type, _ = mimetypes.guess_type(local_path)
        content_type = content_type or "application/octet-stream"

    try:
        extra_args = {
            "ContentType": content_type,
            "ACL": "public-read"
        }
        s3.upload_file(local_path, S3_BUCKET_NAME, remote_key, ExtraArgs=extra_args)
        
        # Construct URL
        if R2_ENDPOINT_URL:
            # R2 custom domains are usually handled via R2_PUBLIC_URL env var if available
            # Otherwise return a generic representation
            public_base = os.getenv("R2_PUBLIC_URL", R2_ENDPOINT_URL.replace(".r2.cloudflarestorage.com", ""))
            url = f"{public_base}/{remote_key}"
        else:
            url = f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{remote_key}"
            
        logger.info(f"File uploaded to remote storage: {url}")
        return url
        
    except ClientError as e:
        logger.error(f"S3/R2 upload failed: {e}")
        raise

def generate_presigned_url(remote_key: str, expiry_seconds: int = 7776000) -> str:
    """
    Generate a presigned URL for a file.
    
    Args:
        remote_key (str): The key of the file in storage.
        expiry_seconds (int): URL expiration time in seconds (default 90 days).
        
    Returns:
        str: Presigned URL or local path.
    """
    if USE_LOCAL_STORAGE:
        return f"/local_files/{remote_key}"

    s3 = get_s3_client()
    try:
        url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET_NAME, 'Key': remote_key},
            ExpiresIn=expiry_seconds
        )
        return url
    except ClientError as e:
        logger.error(f"Failed to generate presigned URL: {e}")
        return ""

def delete_file(remote_key: str) -> bool:
    """
    Delete a file from storage.
    
    Args:
        remote_key (str): Key of the file to delete.
        
    Returns:
        bool: True if deleted successfully, False otherwise.
    """
    if USE_LOCAL_STORAGE:
        try:
            local_path = LOCAL_STORAGE_DIR / remote_key
            if local_path.exists():
                local_path.unlink()
                logger.info(f"Local file deleted: {local_path}")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to delete local file: {e}")
            return False

    s3 = get_s3_client()
    try:
        s3.delete_object(Bucket=S3_BUCKET_NAME, Key=remote_key)
        logger.info(f"Remote file deleted: {remote_key}")
        return True
    except ClientError as e:
        logger.error(f"Failed to delete remote file: {e}")
        return False

def file_exists(remote_key: str) -> bool:
    """
    Check if a file exists in storage.
    """
    if USE_LOCAL_STORAGE:
        return (LOCAL_STORAGE_DIR / remote_key).exists()

    s3 = get_s3_client()
    try:
        s3.head_object(Bucket=S3_BUCKET_NAME, Key=remote_key)
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == "404":
            return False
        logger.error(f"Error checking file existence: {e}")
        return False
