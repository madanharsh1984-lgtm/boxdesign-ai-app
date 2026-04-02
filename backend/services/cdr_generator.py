"""
BoxDesign AI — CDR/PDF/PNG Generation Service
This module handles the creation of box dielines (SVG), conversion to production formats (PDF, PNG),
and generation of print specification sheets for corrugated box manufacturing.
"""

import os
import subprocess
import pathlib
import logging
import datetime
import tempfile
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# RSC Box SVG Template
# Placeholders: {total_width}, {total_height}, {brand_name}, {product_name}, {tagline}, {barcode_placeholder}, {bg_color}, {font_family}
SVG_TEMPLATE = """<svg width="{total_width}mm" height="{total_height}mm" viewBox="0 0 {total_width} {total_height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .dieline-cut {{ stroke: #FF0000; stroke-width: 0.5; fill: none; }}
            .dieline-score {{ stroke: #0000FF; stroke-width: 0.5; stroke-dasharray: 2,1; fill: none; }}
            .design-area {{ fill: {bg_color}; }}
            .text-main {{ font-family: {font_family}, sans-serif; fill: #333333; }}
            .brand-name {{ font-size: 12px; font-weight: bold; }}
            .product-name {{ font-size: 10px; }}
            .tagline {{ font-size: 6px; font-style: italic; }}
        </style>
    </defs>
    
    <!-- Background Design Area -->
    <rect x="0" y="0" width="{total_width}" height="{total_height}" class="design-area" />

    <!-- Dieline - RSC Style -->
    <!-- Joint (35mm) -->
    <path d="M 0 35 L 35 35 L 35 {h_plus_flap_offset} L 0 {h_plus_flap_offset} Z" class="dieline-cut" />
    
    <!-- Main Panels and Flaps -->
    <!-- Assuming order: Joint | Side(W) | Front(L) | Side(W) | Back(L) -->
    
    <!-- Panel 1: Side (W) -->
    <rect x="35" y="{flap_height}" width="{W}" height="{H}" class="dieline-score" />
    <rect x="35" y="0" width="{W}" height="{flap_height}" class="dieline-cut" /> <!-- Top Flap -->
    <rect x="35" y="{h_plus_flap}" width="{W}" height="{flap_height}" class="dieline-cut" /> <!-- Bottom Flap -->

    <!-- Panel 2: Front (L) - Primary Design Area -->
    <rect x="{x2}" y="{flap_height}" width="{L}" height="{H}" class="dieline-score" />
    <rect x="{x2}" y="0" width="{L}" height="{flap_height}" class="dieline-cut" />
    <rect x="{x2}" y="{h_plus_flap}" width="{L}" height="{flap_height}" class="dieline-cut" />
    
    <!-- Brand Elements on Front Panel -->
    <text x="{front_center_x}" y="{front_y_brand}" text-anchor="middle" class="text-main brand-name">{brand_name}</text>
    <text x="{front_center_x}" y="{front_y_product}" text-anchor="middle" class="text-main product-name">{product_name}</text>
    <text x="{front_center_x}" y="{front_y_tagline}" text-anchor="middle" class="text-main tagline">{tagline}</text>
    
    <!-- Panel 3: Side (W) -->
    <rect x="{x3}" y="{flap_height}" width="{W}" height="{H}" class="dieline-score" />
    <rect x="{x3}" y="0" width="{W}" height="{flap_height}" class="dieline-cut" />
    <rect x="{x3}" y="{h_plus_flap}" width="{W}" height="{flap_height}" class="dieline-cut" />

    <!-- Panel 4: Back (L) -->
    <rect x="{x4}" y="{flap_height}" width="{L}" height="{H}" class="dieline-score" />
    <rect x="{x4}" y="0" width="{L}" height="{flap_height}" class="dieline-cut" />
    <rect x="{x4}" y="{h_plus_flap}" width="{L}" height="{flap_height}" class="dieline-cut" />
    
    <!-- Barcode Placeholder -->
    <rect x="{barcode_x}" y="{barcode_y}" width="40" height="20" fill="#FFFFFF" stroke="#000000" stroke-width="0.5" />
    <text x="{barcode_text_x}" y="{barcode_text_y}" font-size="4" text-anchor="middle" font-family="monospace">{barcode_placeholder}</text>

    <!-- Outer Boundary (Cut) -->
    <rect x="0" y="0" width="{total_width}" height="{total_height}" fill="none" stroke="#FF0000" stroke-width="0.2" />
</svg>
"""

def generate_svg(request: Dict[str, Any], design_theme: Dict[str, Any]) -> str:
    """Calculates dimensions and populates the SVG template."""
    L = float(request.get('length_mm', 100))
    W = float(request.get('width_mm', 100))
    H = float(request.get('height_mm', 100))
    
    # RSC Formula provided by user
    total_width = 2 * (L + W) + 35
    total_height = H + W + 25
    
    flap_height = (W / 2) + 12.5 # Distributed the +25mm
    
    # Coordinates
    x2 = 35 + W
    x3 = x2 + L
    x4 = x3 + W
    
    h_plus_flap = H + flap_height
    
    # Design positioning (Front Panel - Panel 2)
    front_center_x = x2 + (L / 2)
    front_y_brand = flap_height + (H / 3)
    front_y_product = front_y_brand + 15
    front_y_tagline = front_y_product + 10
    
    # Barcode on Back Panel (Panel 4)
    barcode_x = x4 + (L / 2) - 20
    barcode_y = h_plus_flap - 30
    
    svg_content = SVG_TEMPLATE.format(
        total_width=total_width,
        total_height=total_height,
        L=L, W=W, H=H,
        x2=x2, x3=x3, x4=x4,
        flap_height=flap_height,
        h_plus_flap=h_plus_flap,
        h_plus_flap_offset=h_plus_flap,
        brand_name=request.get('brand_name', 'Brand Name'),
        product_name=request.get('product_name', 'Product Name'),
        tagline=request.get('tagline', 'Quality Packaging'),
        barcode_placeholder=request.get('barcode_number', '123456789012'),
        bg_color=design_theme.get('colors', {}).get('background', '#FDFDFD'),
        font_family=design_theme.get('fonts', {}).get('main', 'Arial'),
        front_center_x=front_center_x,
        front_y_brand=front_y_brand,
        front_y_product=front_y_product,
        front_y_tagline=front_y_tagline,
        barcode_x=barcode_x,
        barcode_y=barcode_y,
        barcode_text_x=barcode_x + 20,
        barcode_text_y=barcode_y + 25
    )
    return svg_content

def svg_to_pdf(svg_content: str, output_path: str) -> str:
    """Converts SVG to PDF using Inkscape or ReportLab fallback."""
    with tempfile.NamedTemporaryFile(suffix=".svg", delete=False) as tmp:
        tmp.write(svg_content.encode('utf-8'))
        tmp_path = tmp.name

    try:
        # Try Inkscape CLI
        subprocess.run(['inkscape', '--export-filename=' + output_path, tmp_path], check=True, capture_output=True)
        logger.info(f"PDF generated using Inkscape: {output_path}")
    except (subprocess.CalledProcessError, FileNotFoundError):
        logger.warning("Inkscape not found or failed. Using ReportLab fallback.")
        try:
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import A4
            c = canvas.Canvas(output_path, pagesize=A4)
            c.drawString(100, 750, "BoxDesign AI - PDF Fallback")
            c.drawString(100, 730, "Production PDF requires Inkscape installation on server.")
            c.save()
        except ImportError:
            logger.error("ReportLab not installed. Cannot generate fallback PDF.")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
    
    return output_path

def svg_to_png(svg_content: str, output_path: str, dpi: int = 300) -> str:
    """Converts SVG to PNG using Inkscape or Pillow fallback."""
    with tempfile.NamedTemporaryFile(suffix=".svg", delete=False) as tmp:
        tmp.write(svg_content.encode('utf-8'))
        tmp_path = tmp.name

    try:
        # Try Inkscape CLI
        subprocess.run(['inkscape', f'--export-dpi={dpi}', '--export-filename=' + output_path, tmp_path], check=True, capture_output=True)
        logger.info(f"PNG generated using Inkscape: {output_path}")
    except (subprocess.CalledProcessError, FileNotFoundError):
        logger.warning("Inkscape not found or failed. Using Pillow fallback.")
        try:
            from PIL import Image, ImageDraw
            img = Image.new('RGB', (800, 600), color='white')
            d = ImageDraw.Draw(img)
            d.text((10, 10), "BoxDesign AI - PNG Fallback (Inkscape missing)", fill=(0,0,0))
            img.save(output_path)
        except ImportError:
            logger.error("Pillow not installed. Cannot generate fallback PNG.")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
            
    return output_path

def generate_print_spec_sheet(request: Dict[str, Any], sheet_size: Dict[str, Any]) -> str:
    """Generates an HTML/SVG based specification sheet for printers."""
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 40px; border: 2px solid #333;">
        <h1 style="color: #2c3e50;">Print Specification Sheet</h1>
        <p><strong>Generated By:</strong> BoxDesign AI</p>
        <p><strong>Date:</strong> {now}</p>
        <hr/>
        <h3>Product Information</h3>
        <table>
            <tr><td><strong>Brand Name:</strong></td><td>{request.get('brand_name', 'N/A')}</td></tr>
            <tr><td><strong>Product:</strong></td><td>{request.get('product_name', 'N/A')}</td></tr>
            <tr><td><strong>Order ID:</strong></td><td>{request.get('order_id', 'PROTOTYPE')}</td></tr>
        </table>
        
        <h3>Box Dimensions (Internal)</h3>
        <p>{request.get('length_mm')}mm (L) x {request.get('width_mm')}mm (W) x {request.get('height_mm')}mm (H)</p>
        
        <h3>Material & Production Specs</h3>
        <ul>
            <li><strong>Sheet Size:</strong> {sheet_size.get('width', 'Auto')} x {sheet_size.get('height', 'Auto')} mm</li>
            <li><strong>GSM Recommendation:</strong> {sheet_size.get('gsm', '180-250')}</li>
            <li><strong>Flute Type:</strong> {sheet_size.get('flute', 'B-Flute')}</li>
            <li><strong>Colour Mode:</strong> CMYK</li>
            <li><strong>Resolution:</strong> 300 DPI Minimum</li>
            <li><strong>Bleed:</strong> 3.0 mm</li>
            <li><strong>Safe Zone:</strong> 5.0 mm</li>
        </ul>
        <div style="margin-top: 20px; font-size: 10px; color: #7f8c8d;">
            Confidential. Property of {request.get('brand_name')}. Generated via BoxDesign AI Engine.
        </div>
    </div>
    """
    return html

def generate_all_files(request: Dict[str, Any], design: Dict[str, Any], job_id: str, output_dir: str) -> Dict[str, str]:
    """Orchestrates the generation of all production assets."""
    pathlib.Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    svg_str = generate_svg(request, design)
    
    svg_path = os.path.join(output_dir, f"{job_id}.svg")
    pdf_path = os.path.join(output_dir, f"{job_id}.pdf")
    png_path = os.path.join(output_dir, f"{job_id}.png")
    spec_path = os.path.join(output_dir, f"{job_id}_spec.html")
    
    # Save SVG
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg_str)
        
    # Generate conversions
    svg_to_pdf(svg_str, pdf_path)
    svg_to_png(svg_str, png_path)
    
    # Generate Spec Sheet
    spec_html = generate_print_spec_sheet(request, {"width": 1200, "height": 800, "gsm": 230, "flute": "E"})
    with open(spec_path, 'w', encoding='utf-8') as f:
        f.write(spec_html)
        
    return {
        "svg": svg_path,
        "pdf": pdf_path,
        "png": png_path,
        "spec_sheet": spec_path,
        "job_id": job_id
    }
