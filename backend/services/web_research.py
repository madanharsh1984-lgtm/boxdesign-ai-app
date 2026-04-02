"""
BoxDesign AI — Web Research Backend Service

This service provides functions for competitor packaging search, product information 
generation using LLMs, and brand color extraction from websites.
"""

import os
import re
import asyncio
import json
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

import httpx
try:
    from openai import AsyncOpenAI
except ImportError:
    AsyncOpenAI = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CATEGORY_DEFAULTS = {
    "Food": {
        "taglines": ["Freshly Sourced", "Deliciously Natural", "Taste the Quality"],
        "bullet_points": ["100% Organic ingredients", "No artificial preservatives", "Rich in essential nutrients", "Eco-friendly packaging"],
        "certifications": ["FSSAI", "ISO 22000"],
        "warnings": ["Contains allergens (nuts)", "Store in a cool, dry place"]
    },
    "Electronics": {
        "taglines": ["Innovation Redefined", "Power Your Life", "Smart Tech, Simple Living"],
        "bullet_points": ["High-performance processor", "Long-lasting battery life", "Sleek and ergonomic design", "1-year warranty included"],
        "certifications": ["CE", "RoHS"],
        "warnings": ["Keep away from water", "Do not dispose of in household waste"]
    },
    "FMCG": {
        "taglines": ["Daily Essentials", "Quality You Can Trust", "Better Every Day"],
        "bullet_points": ["Gentle on skin", "Value for money", "Scientifically tested", "Recyclable container"],
        "certifications": ["ISO 9001", "Cruelty-Free"],
        "warnings": ["For external use only", "Keep out of reach of children"]
    },
    "Pharma": {
        "taglines": ["Trusted Healthcare", "Relief You Need", "Healing Simplified"],
        "bullet_points": ["Clinically proven formula", "Fast-acting relief", "Recommended by doctors", "Tamper-evident seal"],
        "certifications": ["GMP", "ISO 13485"],
        "warnings": ["Consult a doctor before use", "Schedule H drug - Warning"]
    },
    "E-commerce": {
        "taglines": ["Delivered with Care", "Shop Your Best", "Quality at Your Doorstep"],
        "bullet_points": ["Premium quality check", "Securely packaged", "Easy returns", "Customer favorite"],
        "certifications": ["Safe to Ship", "Standardized Packaging"],
        "warnings": ["Fragile - Handle with care", "Do not use blade to open"]
    },
    "Industrial": {
        "taglines": ["Built to Last", "Heavy Duty Performance", "Precision Engineering"],
        "bullet_points": ["Industrial grade materials", "High durability", "Safety compliant", "Easy to install"],
        "certifications": ["ISO 9001", "ANSI/ASME"],
        "warnings": ["Use protective gear", "High voltage risk"]
    },
    "Other": {
        "taglines": ["Premium Product", "Designed for Excellence", "Your Perfect Choice"],
        "bullet_points": ["High quality standards", "Unique design features", "Multipurpose use", "Durable construction"],
        "certifications": ["Quality Certified", "Standard Compliant"],
        "warnings": ["Read manual before use", "Handle with care"]
    }
}

async def search_competitor_packaging(product_name: str, category: str, serpapi_key: str) -> List[Dict[str, Any]]:
    """
    Search for competitor packaging images using SerpAPI.
    """
    if not serpapi_key:
        logger.warning("SerpAPI key missing. Returning placeholders.")
        return [
            {"title": "Sample Food Packaging", "original": "https://images.unsplash.com/photo-1500915001467-99a64294d30c", "thumbnail": "https://images.unsplash.com/photo-1500915001467-99a64294d30c?w=200", "source": "Unsplash"},
            {"title": "Product Box Design", "original": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f", "thumbnail": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200", "source": "Unsplash"},
            {"title": "Retail Packaging", "original": "https://images.unsplash.com/photo-1544441893-675973e31985", "thumbnail": "https://images.unsplash.com/photo-1544441893-675973e31985?w=200", "source": "Unsplash"}
        ]

    url = f"https://serpapi.com/search?engine=google_images&q={product_name}+{category}+packaging+design&api_key={serpapi_key}&num=10"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            images = data.get("images_results", [])
            results = []
            for img in images[:5]:
                results.append({
                    "title": img.get("title", ""),
                    "original": img.get("original", ""),
                    "thumbnail": img.get("thumbnail", ""),
                    "source": img.get("source", "")
                })
            return results
    except Exception as e:
        logger.error(f"Error in SerpAPI search: {e}")
        return [
            {"title": "Sample Food Packaging", "original": "https://images.unsplash.com/photo-1500915001467-99a64294d30c", "thumbnail": "https://images.unsplash.com/photo-1500915001467-99a64294d30c?w=200", "source": "Unsplash"},
            {"title": "Product Box Design", "original": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f", "thumbnail": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200", "source": "Unsplash"},
            {"title": "Retail Packaging", "original": "https://images.unsplash.com/photo-1544441893-675973e31985", "thumbnail": "https://images.unsplash.com/photo-1544441893-675973e31985?w=200", "source": "Unsplash"}
        ]

async def fetch_product_information(product_name: str, category: str, openai_key: str) -> Dict[str, Any]:
    """
    Generate product marketing and compliance information using OpenAI GPT-4o.
    """
    if not openai_key or not AsyncOpenAI:
        logger.warning("OpenAI key missing or client not available. Returning defaults.")
        return CATEGORY_DEFAULTS.get(category, CATEGORY_DEFAULTS["Other"])

    client = AsyncOpenAI(api_key=openai_key)
    prompt = (
        f"You are a packaging label copywriter. For a {category} product called '{product_name}', "
        "generate: 3 marketing taglines (short, punchy), 4 bullet points for back-of-box (benefits/features), "
        "2 relevant certifications (e.g. ISO, FSSAI, BIS), 2 mandatory warnings if applicable. "
        "Return as JSON with keys: taglines, bullet_points, certifications, warnings."
    )

    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        logger.error(f"Error in OpenAI fetch: {e}")
        return CATEGORY_DEFAULTS.get(category, CATEGORY_DEFAULTS["Other"])

async def extract_brand_colours(website_url: str) -> List[str]:
    """
    Fetch a website and extract the top 3 hex color codes found in CSS/style tags.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(website_url, timeout=10.0, follow_redirects=True)
            response.raise_for_status()
            html = response.text
            
            # Find all hex color codes
            hex_pattern = r'#[0-9A-Fa-f]{6}'
            found_colors = re.findall(hex_pattern, html)
            
            if not found_colors:
                return []
            
            # Count frequency
            color_counts = {}
            for color in found_colors:
                color = color.upper()
                color_counts[color] = color_counts.get(color, 0) + 1
            
            # Sort by frequency and return top 3
            sorted_colors = sorted(color_counts.items(), key=lambda x: x[1], reverse=True)
            return [color for color, count in sorted_colors[:3]]
    except Exception as e:
        logger.error(f"Error extracting brand colors: {e}")
        return []

async def run_full_research(product_name: str, category: str, brand_name: str, serpapi_key: str, openai_key: str) -> Dict[str, Any]:
    """
    Orchestrate full research by calling SerpAPI and OpenAI concurrently.
    """
    tasks = [
        search_competitor_packaging(product_name, category, serpapi_key),
        fetch_product_information(product_name, category, openai_key)
    ]
    
    competitor_images, product_info = await asyncio.gather(*tasks)
    
    return {
        "competitor_images": competitor_images,
        "product_info": product_info,
        "research_completed": True,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
