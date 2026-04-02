"""
BoxDesign AI - Design Generation Service (Backend)
--------------------------------------------------
This service manages the AI-driven packaging design generation process,
mapping design themes to specific AI prompts and handling both real DALL-E 3
API calls and mock fallbacks for development.

Author: BoxDesign AI Engineering
Date: 2026-04-02
"""

import os
import asyncio
import concurrent.futures
import base64
import json
import logging
import time
from typing import Dict, List, Any, Optional

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory job store
JOBS: Dict[str, Any] = {}

# Theme Prompt Mapping
THEME_PROMPTS = {
    "Minimalist": (
        "Clean minimalist corrugated box packaging design for {brand_name} {product_name}. "
        "White background with thin {brand_name} wordmark in sans-serif font, single accent line in navy blue. "
        "Flat lay product photography style, 300 DPI print ready, CMYK colour space."
    ),
    "Bold": (
        "High-contrast bold packaging design for {brand_name} {product_name}. "
        "Vibrant primary colors, thick heavy typography, and large geometric shapes. "
        "Energetic and eye-catching layout suitable for {category}. {tagline} featured prominently."
    ),
    "Premium": (
        "Luxury premium box design for {brand_name} {product_name}. "
        "Matte black finish with gold foil embossed {brand_name} logo and elegant serif lettering. "
        "Sophisticated minimalist aesthetic for high-end {category} market."
    ),
    "Earthy": (
        "Natural earthy packaging for {brand_name} {product_name}. "
        "Kraft paper texture background with organic hand-drawn botanical illustrations in forest green and terracotta. "
        "Eco-friendly aesthetic emphasizing {tagline}."
    ),
    "Industrial": (
        "Raw industrial style box for {brand_name} {product_name}. "
        "Concrete textures, stencil-style typography, and technical stamp details in black ink on raw cardboard. "
        "Rugged utility look for {category} hardware."
    ),
    "Playful": (
        "Fun playful packaging for {brand_name} {product_name}. "
        "Bright pastel palette with bubbly hand-drawn doodles and friendly character art. "
        "Whimsical typography for {brand_name} reflecting a sense of joy."
    ),
    "Monochrome": (
        "Elegant monochrome design for {brand_name} {product_name}. "
        "Various shades of a single deep charcoal color, using texture and shadows to create depth. "
        "Sleek professional look with {brand_name} logo integrated subtly."
    ),
    "Gradient": (
        "Modern gradient-focused box for {brand_name} {product_name}. "
        "Soft futuristic mesh gradients in neon violet and cyan. "
        "Minimalist layout with glowing {brand_name} typography and glassmorphism elements."
    ),
    "Pattern": (
        "Seamless pattern-based design for {brand_name} {product_name}. "
        "Repeating intricate geometric pattern across all faces of the box. "
        "Consistent brand colors for {brand_name} with a central white label area for product details."
    ),
    "Brand-matched": (
        "Corporate brand-centric packaging for {brand_name} {product_name}. "
        "Strict adherence to brand guidelines using {preferred_colours}. "
        "Professional logo placement and clean information hierarchy for {category}."
    )
}

def build_design_prompt(theme: str, request: Dict[str, str]) -> str:
    """
    Constructs a detailed AI prompt based on theme and user request data.

    Args:
        theme: The selected design theme name.
        request: Dictionary containing brand_name, product_name, category, 
                 tagline, preferred_colours, and optional custom prompt.

    Returns:
        A formatted prompt string for image generation.
    """
    template = THEME_PROMPTS.get(theme, THEME_PROMPTS["Minimalist"])
    
    # Format the template with request values, handling missing keys
    formatted_prompt = template.format(
        brand_name=request.get("brand_name", "Brand"),
        product_name=request.get("product_name", "Product"),
        category=request.get("category", "General"),
        tagline=request.get("tagline", "Quality Packaging"),
        preferred_colours=request.get("preferred_colours", "standard brand colors")
    )

    # Append custom prompt if provided
    if request.get("prompt"):
        formatted_prompt += f" Additional user request: {request['prompt']}"

    # Append technical requirements
    formatted_prompt += " Print-ready packaging design. CMYK colour space. 300 DPI. Corrugated box dieline flat view."
    
    return formatted_prompt

def generate_mock_design(theme: str) -> Dict[str, str]:
    """
    Generates a placeholder SVG design for development when API keys are missing.

    Args:
        theme: The design theme name to determine the placeholder color.

    Returns:
        A dictionary containing the theme and a base64 encoded SVG string.
    """
    colors = {
        "Minimalist": "#F5F5F5", "Bold": "#FF4500", "Premium": "#1A1A1A",
        "Earthy": "#8B4513", "Industrial": "#708090", "Playful": "#FFD700",
        "Monochrome": "#333333", "Gradient": "#8A2BE2", "Pattern": "#FF1493",
        "Brand-matched": "#0000FF"
    }
    color = colors.get(theme, "#CCCCCC")
    
    svg = f"""
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="{color}"/>
        <text x="50%" y="45%" font-family="Arial" font-size="60" fill="white" text-anchor="middle">{theme} Design</text>
        <text x="50%" y="55%" font-family="Arial" font-size="30" fill="white" text-anchor="middle">BoxDesign AI Mockup (No API Key)</text>
        <rect x="256" y="256" width="512" height="512" fill="none" stroke="white" stroke-width="2" stroke-dasharray="10,10"/>
    </svg>
    """
    b64_svg = base64.b64encode(svg.encode('utf-8')).decode('utf-8')
    return {
        "theme": theme,
        "image_url": f"data:image/svg+xml;base64,{b64_svg}",
        "revised_prompt": "Mock generation used (SVG placeholder).",
        "status": "success"
    }

def generate_single_design(theme: str, request: Dict[str, str], api_key: str) -> Dict[str, Any]:
    """
    Triggers a single design generation using OpenAI DALL-E 3 or mock fallback.

    Args:
        theme: The design theme to generate.
        request: The user's design request parameters.
        api_key: The OpenAI API key.

    Returns:
        A dictionary containing the generation result or error information.
    """
    is_placeholder = not api_key or OpenAI is None or api_key.startswith("sk-YOUR") or len(api_key) < 20
    if is_placeholder:
        logger.warning(f"Using mock fallback for theme: {theme} (no valid API key)")
        return generate_mock_design(theme)

    try:
        client = OpenAI(api_key=api_key)
        prompt = build_design_prompt(theme, request)
        
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1
        )
        
        return {
            "theme": theme,
            "image_url": response.data[0].url,
            "revised_prompt": response.data[0].revised_prompt,
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Error generating design for theme {theme}: {str(e)}")
        return {
            "theme": theme,
            "status": "error",
            "error": str(e)
        }

async def generate_all_designs(request: Dict[str, Any], api_key: str, job_id: str) -> List[Dict[str, Any]]:
    """
    Orchestrates the generation of all 10 design themes concurrently.

    Args:
        request: The design request parameters.
        api_key: OpenAI API key.
        job_id: Unique identifier for the current generation job.

    Returns:
        A list of result dictionaries for all themes.
    """
    themes = list(THEME_PROMPTS.keys())
    results = []
    
    # Initialize job status
    JOBS[job_id] = {
        "status": "processing",
        "progress": 0,
        "current_step": "Initializing generators...",
        "designs": []
    }

    # Max 5 concurrent generations as requested
    loop = asyncio.get_event_loop()
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = {
            executor.submit(generate_single_design, theme, request, api_key): theme 
            for theme in themes
        }
        
        completed = 0
        for future in concurrent.futures.as_completed(futures):
            theme = futures[future]
            try:
                result = future.result()
                results.append(result)
            except Exception as exc:
                logger.error(f"Theme {theme} generated an exception: {exc}")
                results.append({"theme": theme, "status": "error", "error": str(exc)})
            
            completed += 1
            progress = int((completed / len(themes)) * 100)
            
            # Update job status in shared memory
            JOBS[job_id].update({
                "progress": progress,
                "current_step": f"Generated {completed} of {len(themes)} designs...",
                "designs": results
            })
            
            logger.info(f"Job {job_id}: {progress}% complete.")

    JOBS[job_id]["status"] = "complete"
    JOBS[job_id]["current_step"] = "Generation finished."
    return results

def get_job_status(job_id: str) -> Dict[str, Any]:
    """
    Retrieves the current status and results of a generation job.

    Args:
        job_id: The ID of the job to check.

    Returns:
        Status dictionary from the JOBS store.
    """
    return JOBS.get(job_id, {"status": "not_found"})
