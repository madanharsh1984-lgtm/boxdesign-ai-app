"""
BoxDesign AI — Backend Test Suite
Run: python run_tests.py
"""
import sys, os, json, time, tempfile, urllib.request, urllib.error

BASE = "http://localhost:8000"
results = []


TOKEN = None

def get(path, token=None):
    try:
        req = urllib.request.Request(BASE + path)
        if token or TOKEN:
            req.add_header("Authorization", f"Bearer {token or TOKEN}")
        r = urllib.request.urlopen(req, timeout=8)
        return json.loads(r.read()), r.status
    except urllib.error.HTTPError as e:
        try:
            return json.loads(e.read()), e.code
        except Exception:
            return {"error": str(e)}, e.code
    except Exception as e:
        return {"error": str(e)}, 0


def post(path, data, token=None):
    try:
        body = json.dumps(data).encode()
        req = urllib.request.Request(
            BASE + path, data=body,
            headers={"Content-Type": "application/json"}, method="POST"
        )
        if token or TOKEN:
            req.add_header("Authorization", f"Bearer {token or TOKEN}")
        r = urllib.request.urlopen(req, timeout=15)
        return json.loads(r.read()), r.status
    except urllib.error.HTTPError as e:
        try:
            return json.loads(e.read()), e.code
        except Exception:
            return {"error": str(e)}, e.code
    except Exception as e:
        return {"error": str(e)}, 0


def chk(name, status, ok, detail=""):
    results.append((name, status, ok))
    icon = "PASS" if ok else "FAIL"
    detail_str = f"  => {detail}" if detail else ""
    print(f"  [{icon}] {name} (HTTP {status}){detail_str}")


def put(path, data, token=None):
    try:
        body = json.dumps(data).encode()
        req = urllib.request.Request(
            BASE + path, data=body,
            headers={"Content-Type": "application/json"}, method="PUT"
        )
        if token or TOKEN:
            req.add_header("Authorization", f"Bearer {token or TOKEN}")
        r = urllib.request.urlopen(req, timeout=15)
        return json.loads(r.read()), r.status
    except urllib.error.HTTPError as e:
        try:
            return json.loads(e.read()), e.code
        except Exception:
            return {"error": str(e)}, e.code
    except Exception as e:
        return {"error": str(e)}, 0


print("=" * 65)
print("  BoxDesign AI — Backend Test Suite")
print("=" * 65)

# ── 0. Auth ───────────────────────────────────────────────────────────
print("\n[0] Authentication")
r, s = post("/v1/auth/send-otp", {"phone": "+919667964756"})
chk("POST /auth/send-otp", s, s == 200 and r.get("success"))

r, s = post("/v1/auth/verify-otp", {"phone": "+919667964756", "otp": "123456"})
chk("POST /auth/verify-otp -> returns token", s, s == 200 and "access_token" in r)
TOKEN = r.get("access_token")

r, s = get("/v1/auth/profile")
chk("GET /auth/profile", s, s == 200 and r.get("phone") == "+919667964756",
    f"phone={r.get('phone')}")

r, s = put("/v1/auth/profile", {"company_name": "TestCo", "city": "Noida"})
chk("PUT /auth/profile", s, s == 200 and r.get("success"))

# ── 1. Health checks ────────────────────────────────────────────────
print("\n[1] Health Checks")
r, s = get("/")
chk("GET /  (root health)", s, r.get("status") == "running", r.get("status"))

r, s = get("/v1/health")
chk("GET /v1/health", s, r.get("status") == "ok")

# ── 2. Pricing API ──────────────────────────────────────────────────
print("\n[2] Pricing & Promo Codes")

r, s = post("/v1/design/calculate-price", {"tier": "basic"})
# 299 base, 0 disc, GST=round(299*0.18)=54, total=353
chk("Basic Rs.299 (no promo)", s, s == 200 and r.get("total_inr") == 353,
    f"base={r.get('base_inr')} gst={r.get('gst_inr')} total={r.get('total_inr')} INR")

r, s = post("/v1/design/calculate-price", {"tier": "standard", "promo_code": "FIRST50"})
# 799, 50% capped @200 => disc=200, taxable=599, gst=round(107.82)=108, total=707
chk("Standard Rs.799 + FIRST50 (disc=Rs.200)", s,
    s == 200 and r.get("discount_inr") == 200,
    f"base={r.get('base_inr')} disc={r.get('discount_inr')} total={r.get('total_inr')}")

r, s = post("/v1/design/calculate-price", {"tier": "premium", "promo_code": "LAUNCH100"})
# 1499, disc=100, taxable=1399, gst=252, total=1651
chk("Premium Rs.1499 + LAUNCH100 (disc=Rs.100)", s,
    s == 200 and r.get("discount_inr") == 100,
    f"disc={r.get('discount_inr')} total={r.get('total_inr')}")

r, s = post("/v1/design/calculate-price", {"tier": "gold"})
chk("Invalid tier -> 400 error", s, s == 400)

# ── 3. Design Generation ────────────────────────────────────────────
print("\n[3] Design Generation Pipeline")

r, s = post("/v1/design/generate", {
    "length_mm": 300, "width_mm": 200, "height_mm": 150,
    "brand_name": "AgroBest", "product_name": "Organic Wheat",
    "category": "Food", "tagline": "Naturally Pure",
    "prompt": "Green and earthy tones", "use_web_research": False
})
chk("POST /generate -> returns job_id", s, s == 200 and "job_id" in r,
    r.get("job_id", "MISSING")[:12])
job_id = r.get("job_id", "no-id")

time.sleep(0.5)
r, s = get(f"/v1/design/status/{job_id}")
chk("GET /status (immediate)", s,
    s == 200 and r.get("status") in ("queued", "processing", "complete"),
    f"status={r.get('status')} progress={r.get('progress')}%")

# Wait for mock generation (no API key -> uses SVG mocks, should be fast)
print("  [INFO] Waiting for mock generation to complete (up to 20s)...")
done = False
for _ in range(20):
    time.sleep(1)
    r, s = get(f"/v1/design/status/{job_id}")
    if r.get("status") == "complete":
        done = True
        break

chk("GET /status -> complete", s, r.get("status") == "complete",
    f"status={r.get('status')} progress={r.get('progress')}%")

r2, s2 = get(f"/v1/design/result/{job_id}")
designs = r2.get("designs", [])
chk("GET /result -> 10 designs", s2, s2 == 200 and len(designs) == 10,
    f"{len(designs)} designs")

if designs:
    themes_returned = [d.get("theme") for d in designs]
    expected_themes = ["Minimalist", "Bold", "Premium", "Earthy", "Industrial",
                       "Playful", "Monochrome", "Gradient", "Pattern", "Brand-matched"]
    all_ok = all(t in themes_returned for t in expected_themes)
    chk("All 10 themes in result", 200, all_ok,
        ", ".join(themes_returned[:5]) + "...")
    all_svg = all("data:image/svg+xml" in (d.get("image_url", "")) for d in designs)
    chk("All designs have SVG image_url (mock)", 200, all_svg)

# ── 4. Web Research ─────────────────────────────────────────────────
print("\n[4] Web Research Service")

r, s = post("/v1/design/research", {
    "product_name": "Organic Honey", "category": "Food", "brand_name": "PureFarm"
})
chk("POST /research -> competitor_images + product_info", s,
    s == 200 and "competitor_images" in r and "product_info" in r,
    f"images={len(r.get('competitor_images', []))} "
    f"taglines={r.get('product_info', {}).get('taglines', [])[:1]}")

chk("Research -> certifications present", s,
    bool(r.get("product_info", {}).get("certifications")),
    str(r.get("product_info", {}).get("certifications")))

r2, s2 = post("/v1/design/research", {
    "product_name": "Circuit Board", "category": "Electronics", "brand_name": "TechCo"
})
chk("POST /research Electronics category", s2, s2 == 200,
    str(r2.get("product_info", {}).get("taglines", [])[:1]))

# ── 5. Unit Tests ───────────────────────────────────────────────────
print("\n[5] Unit Tests (no HTTP)")

# build_design_prompt
from services.design_generator import build_design_prompt, generate_mock_design, THEME_PROMPTS

prompt = build_design_prompt("Minimalist", {
    "brand_name": "AgroBest", "product_name": "Honey",
    "category": "Food", "tagline": "Pure Gold"
})
chk("build_design_prompt - contains brand_name", 200, "AgroBest" in prompt)
chk("build_design_prompt - contains CMYK", 200, "CMYK" in prompt)
chk("build_design_prompt - contains 300 DPI", 200, "300 DPI" in prompt)

chk("THEME_PROMPTS has all 10 themes", 200, len(THEME_PROMPTS) == 10,
    str(list(THEME_PROMPTS.keys())))

for theme in THEME_PROMPTS:
    mock = generate_mock_design(theme)
    if not (mock.get("status") == "success" and "data:image/svg+xml" in mock.get("image_url", "")):
        chk(f"generate_mock_design({theme})", 200, False)
        break
else:
    chk("generate_mock_design - all 10 themes OK", 200, True)

# assess_quality
from PIL import Image as PILImage
from services.photo_enhance import assess_quality, enhance_image

tmp_img = tempfile.mktemp(suffix=".jpg")
PILImage.new("RGB", (800, 600), color=(180, 180, 180)).save(tmp_img)
qa = assess_quality(tmp_img)
chk("assess_quality - 800x600 grey image (low_res expected)", 200,
    "score" in qa and "issues" in qa and "low_res" in qa["issues"],
    f"score={qa.get('score')} issues={qa.get('issues')}")

tmp_img_hd = tempfile.mktemp(suffix=".png")
PILImage.new("RGB", (1200, 1000), color=(120, 120, 120)).save(tmp_img_hd)
qa2 = assess_quality(tmp_img_hd)
chk("assess_quality - 1200x1000 (>=1MP, not low_res)", 200,
    "low_res" not in qa2.get("issues", []),
    f"score={qa2.get('score')} issues={qa2.get('issues')}")

# enhance_image
out_path = tempfile.mktemp(suffix=".png")
result = enhance_image(tmp_img, out_path)
chk("enhance_image - upscale + sharpen", 200, os.path.exists(result),
    f"output={os.path.getsize(result)} bytes")

os.unlink(tmp_img)
os.unlink(tmp_img_hd)
try: os.unlink(out_path)
except: pass

# payment_service
from services.payment_service import calculate_order_amount, verify_payment_signature, generate_gst_invoice

amt = calculate_order_amount("standard", "LAUNCH100")
chk("calculate_order_amount standard+LAUNCH100", 200,
    amt["discount_inr"] == 100 and amt["total_inr"] > 0, str(amt))

ok_verify = verify_payment_signature("order_abc", "pay_xyz", "badsig")
chk("verify_payment_signature (dev mode, no secret -> True)", 200, ok_verify is True)

invoice = generate_gst_invoice(
    {"id": "abc123def", "pricing_tier": "standard", "base_inr": 799, "gst_inr": 144, "total_inr": 943},
    {"company_name": "TestCo", "gstin": "27ABCDE1234F1Z5", "city": "Mumbai"}
)
chk("generate_gst_invoice - invoice number format", 200,
    invoice.get("invoice_number", "").startswith("BDAI-"),
    invoice.get("invoice_number"))
chk("generate_gst_invoice - HSN code 998314", 200,
    invoice["line_items"][0]["hsn"] == "998314")

# CDR generator
from services.cdr_generator import generate_svg, generate_all_files

svg = generate_svg(
    {"brand_name": "AgroBest", "product_name": "Wheat", "tagline": "Pure", "barcode_number": "8901234567890",
     "length_mm": 300, "width_mm": 200, "height_mm": 150},
    {"primary_colour": "#1A3C6E", "font": "Arial"}
)
chk("generate_svg - returns SVG string", 200,
    svg.startswith("<svg") and "AgroBest" in svg and len(svg) > 200,
    f"{len(svg)} chars")

# ── 6. Orders ───────────────────────────────────────────────────────
print("\n[6] Orders & Payments")

r, s = post("/v1/orders/", {
    "design_request_id": job_id,
    "pricing_tier": "standard",
    "approved_by_name": "Test User",
    "promo_code": "FIRST50"
})
chk("POST /v1/orders/ -> creates order", s, s == 200 and "order_id" in r,
    f"order_id={r.get('order_id', 'MISSING')[:12]} rzp_id={r.get('razorpay_order_id')}")
order_id = r.get("order_id")

r, s = get("/v1/orders/")
chk("GET /v1/orders/ -> list", s, s == 200 and r.get("total") >= 1,
    f"total={r.get('total')}")

r, s = get(f"/v1/orders/{order_id}")
chk("GET /v1/orders/{id} -> detail", s, s == 200 and r.get("order_id") == order_id,
    f"status={r.get('status')}")
print()
print("=" * 65)
print("  FINAL RESULTS")
print("=" * 65)
passed = sum(1 for _, _, ok in results if ok)
failed = sum(1 for _, _, ok in results if not ok)
for name, s, ok in results:
    print(f"  {'PASS' if ok else 'FAIL'}  {name}")
print("=" * 65)
print(f"  {passed} PASSED  |  {failed} FAILED  |  {len(results)} TOTAL")
print("=" * 65)

sys.exit(0 if failed == 0 else 1)
