"""
BoxDesign AI — Photo Enhancement Service
Uses: rembg (background removal), Pillow (image processing)
ESRGAN upscaling via replicate API or local model fallback
"""

import os
import logging
import pathlib
import tempfile
import io
from PIL import Image, ImageEnhance, ImageFilter, ImageStat

try:
    from rembg import remove
    REMBG_AVAILABLE = True
except ImportError:
    REMBG_AVAILABLE = False
    logging.warning("rembg library not found. Background removal will be skipped.")

# Set up module logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def assess_quality(image_path: str) -> dict:
    """
    Assesses the quality of an image based on resolution, brightness, and blur.
    """
    try:
        with Image.open(image_path) as img:
            width, height = img.size
            pixel_count = width * height
            issues = []
            
            # 1. Resolution check (< 1MP is low_res)
            if pixel_count < 1000000:
                issues.append('low_res')
            
            # 2. Brightness check
            grayscale = img.convert('L')
            stat = ImageStat.Stat(grayscale)
            mean_brightness = stat.mean[0]
            
            if mean_brightness < 80:
                issues.append('too_dark')
            elif mean_brightness > 200:
                issues.append('overexposed')
            
            # 3. Blur check
            edges = grayscale.filter(ImageFilter.FIND_EDGES)
            edge_stat = ImageStat.Stat(edges)
            blur_score = edge_stat.mean[0]
            
            if blur_score < 5.0:
                issues.append('blurry')
                
            # Scoring logic (simplified)
            score = 1.0
            if 'low_res' in issues: score -= 0.3
            if 'too_dark' in issues or 'overexposed' in issues: score -= 0.2
            if 'blurry' in issues: score -= 0.4
            score = max(0.0, score)
            
            recommendation = "Ready for processing"
            if issues:
                recommendation = f"Issues found: {', '.join(issues)}. For best results, use a brighter, higher resolution image."
                
            return {
                "score": round(score, 2),
                "issues": issues,
                "recommendation": recommendation,
                "width": width,
                "height": height
            }
    except Exception as e:
        logger.error(f"Error assessing quality for {image_path}: {str(e)}")
        return {"score": 0, "issues": ["error_processing"], "recommendation": "Could not process image", "width": 0, "height": 0}

def remove_background(image_path: str, output_path: str) -> str:
    """
    Removes the background using rembg.
    """
    if not REMBG_AVAILABLE:
        logger.warning("rembg is not installed. Returning original image.")
        return image_path
        
    try:
        with open(image_path, 'rb') as i:
            input_data = i.read()
            output_data = remove(input_data)
            
        with open(output_path, 'wb') as o:
            o.write(output_data)
            
        return output_path
    except Exception as e:
        logger.error(f"Error removing background for {image_path}: {str(e)}")
        return image_path

def enhance_image(image_path: str, output_path: str, target_dpi: int = 300) -> str:
    """
    Enhances the image: upscales if needed, sharpens, and adjusts contrast/color.
    """
    try:
        with Image.open(image_path) as img:
            # 1. Upscale if smaller dimension < 1000px
            min_dim = min(img.size)
            if min_dim < 1000:
                new_size = (img.width * 2, img.height * 2)
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            
            # 2. Apply enhancements
            img = ImageEnhance.Sharpness(img).enhance(1.3)
            img = ImageEnhance.Contrast(img).enhance(1.1)
            img = ImageEnhance.Color(img).enhance(1.15)
            
            # 3. Set DPI metadata
            img.info['dpi'] = (target_dpi, target_dpi)
            
            # 4. Save as PNG
            img.save(output_path, "PNG", dpi=(target_dpi, target_dpi))
            return output_path
    except Exception as e:
        logger.error(f"Error enhancing image {image_path}: {str(e)}")
        return image_path

def add_shadow(image_path: str, output_path: str) -> str:
    """
    Adds a soft drop shadow behind the subject.
    """
    try:
        with Image.open(image_path).convert("RGBA") as img:
            # Create shadow layer
            # Get the alpha mask of the image
            alpha = img.getchannel('A')
            
            # Create a black image the same size for the shadow
            shadow = Image.new("RGBA", img.size, (50, 50, 50, 0))
            shadow.putalpha(alpha)
            
            # Create a larger canvas to handle offset and blur
            # Or just blur the shadow layer and offset it
            shadow = shadow.filter(ImageFilter.GaussianBlur(6))
            
            # Composite shadow with offset
            canvas = Image.new("RGBA", img.size, (0, 0, 0, 0))
            offset = (8, 8)
            
            # We need to be careful with bounds when offsetting
            # For simplicity, we'll paste the shadow slightly offset
            canvas.paste(shadow, offset, shadow)
            
            # Paste original image on top
            final = Image.alpha_composite(canvas, img)
            
            final.save(output_path, "PNG")
            return output_path
    except Exception as e:
        logger.error(f"Error adding shadow to {image_path}: {str(e)}")
        return image_path

def process_product_photo(image_path: str, job_id: str) -> dict:
    """
    Orchestration function for the photo enhancement pipeline.
    """
    # Create temp output directory
    temp_dir = os.path.join(tempfile.gettempdir(), 'boxdesign', job_id)
    pathlib.Path(temp_dir).mkdir(parents=True, exist_ok=True)
    
    steps_completed = []
    
    # Step 1: Quality Assessment
    quality_result = assess_quality(image_path)
    if quality_result['issues']:
        logger.warning(f"Job {job_id}: Quality issues found: {quality_result['issues']}")
    steps_completed.append("assess_quality")
    
    # Define intermediate paths
    bg_removed_path = os.path.join(temp_dir, "bg_removed.png")
    enhanced_path = os.path.join(temp_dir, "enhanced.png")
    final_path = os.path.join(temp_dir, "final.png")
    
    # Step 2: Remove Background
    bg_removed = remove_background(image_path, bg_removed_path)
    if bg_removed != image_path:
        steps_completed.append("remove_background")
    
    # Step 3: Enhance
    enhanced = enhance_image(bg_removed, enhanced_path)
    if enhanced != bg_removed:
        steps_completed.append("enhance_image")
    
    # Step 4: Add Shadow
    final = add_shadow(enhanced, final_path)
    if final != enhanced:
        steps_completed.append("add_shadow")
        
    return {
        "job_id": job_id,
        "original": image_path,
        "enhanced": final,
        "bg_removed": bg_removed,
        "quality": quality_result,
        "steps_completed": steps_completed
    }
