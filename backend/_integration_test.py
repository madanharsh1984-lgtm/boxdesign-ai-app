"""
BoxDesign AI — Integration Test (in-process, no external server needed)
Run: venv\Scripts\python.exe _integration_test.py
"""
import sys, os, json, asyncio

# MUST set DATABASE_URL before ANY app imports so SQLAlchemy picks it up
TEST_DB = "sqlite:///./test_integration.db"
os.environ["DATABASE_URL"] = TEST_DB          # force-override any shell env var

# Remove stale DB from a previous failed run so schema is always fresh
if os.path.exists("test_integration.db"):
    os.remove("test_integration.db")

sys.path.insert(0, '.')

from fastapi.testclient import TestClient
from main import app
from utils.db import create_tables

# Ensure tables exist before tests run (startup event doesn't always fire in TestClient)
create_tables()

client = TestClient(app, raise_server_exceptions=False)

results = []

def chk(name, ok, detail=""):
    results.append((name, ok))
    icon = "PASS" if ok else "FAIL"
    detail_str = f"  => {detail}" if detail else ""
    print(f"  [{icon}] {name}{detail_str}")

TOKEN = None

print("=" * 65)
print("  BoxDesign AI -- Integration Test Suite")
print("=" * 65)

# ── 0. Auth ─────────────────────────────────────────────────────────
print("\n[0] Authentication")

r = client.post("/v1/auth/send-otp", json={"phone": "+919667964756"})
chk("POST /auth/send-otp -> 200", r.status_code == 200 and r.json().get("success"))

r = client.post("/v1/auth/verify-otp", json={"phone": "+919667964756", "otp": "123456"})
chk("POST /auth/verify-otp -> token", r.status_code == 200 and "access_token" in r.json(),
    f"status={r.status_code} body={str(r.json())[:80]}")
TOKEN = r.json().get("access_token")

headers = {"Authorization": f"Bearer {TOKEN}"} if TOKEN else {}

r = client.get("/v1/auth/profile", headers=headers)
chk("GET /auth/profile -> 200", r.status_code == 200, f"phone={r.json().get('phone')}")

r = client.put("/v1/auth/profile", json={"company_name": "TestCo", "city": "Noida"}, headers=headers)
chk("PUT /auth/profile -> 200", r.status_code == 200 and r.json().get("success"))

# ── 1. Health ────────────────────────────────────────────────────────
print("\n[1] Health Checks")
r = client.get("/")
chk("GET / (root health)", r.json().get("status") == "running", r.json().get("status"))

r = client.get("/v1/health")
chk("GET /v1/health", r.json().get("status") == "ok")

# ── 2. Pricing ───────────────────────────────────────────────────────
print("\n[2] Pricing & Promo Codes")

r = client.post("/v1/design/calculate-price", json={"tier": "basic"})
chk("Basic Rs.299 (no promo) -> total=353",
    r.status_code == 200 and r.json().get("total_inr") == 353,
    f"total={r.json().get('total_inr')}")

r = client.post("/v1/design/calculate-price", json={"tier": "standard", "promo_code": "FIRST50"})
chk("Standard + FIRST50 -> disc=200",
    r.status_code == 200 and r.json().get("discount_inr") == 200,
    f"disc={r.json().get('discount_inr')}")

r = client.post("/v1/design/calculate-price", json={"tier": "premium", "promo_code": "LAUNCH100"})
chk("Premium + LAUNCH100 -> disc=100",
    r.status_code == 200 and r.json().get("discount_inr") == 100)

r = client.post("/v1/design/calculate-price", json={"tier": "gold"})
chk("Invalid tier -> 400", r.status_code == 400)

# ── 3. Design Generation ────────────────────────────────────────────
print("\n[3] Design Generation Pipeline")

r = client.post("/v1/design/generate", json={
    "length_mm": 300, "width_mm": 200, "height_mm": 150,
    "brand_name": "AgroBest", "product_name": "Organic Wheat",
    "category": "Food", "tagline": "Naturally Pure",
    "prompt": "Green and earthy tones", "use_web_research": False
}, headers=headers)
chk("POST /generate -> job_id", r.status_code == 200 and "job_id" in r.json(),
    r.json().get("job_id", "MISSING")[:12] if r.status_code == 200 else str(r.status_code))
job_id = r.json().get("job_id", "no-id")

import time; time.sleep(0.5)
r = client.get(f"/v1/design/status/{job_id}")
chk("GET /design/status/{job_id} -> queued/processing",
    r.status_code == 200 and r.json().get("status") in ("queued", "processing", "complete"),
    r.json().get("status"))

time.sleep(3)
r = client.get(f"/v1/design/status/{job_id}")
chk("GET /design/status (after 3s) -> has progress",
    r.status_code == 200 and r.json().get("progress", 0) >= 0)

# ── 4. Orders ───────────────────────────────────────────────────────
print("\n[4] Orders API")

r = client.post("/v1/orders/", json={
    "design_request_id": "mock-design-001",
    "selected_design_id": "mock-design-001",
    "pricing_tier": "standard",
    "approved_by_name": "Test User",
    "promo_code": "LAUNCH100"
}, headers=headers)
chk("POST /orders/ -> order created",
    r.status_code == 200 and "order_id" in r.json(),
    f"status={r.status_code} body={str(r.json())[:100]}")

order_id = r.json().get("order_id")
razorpay_order_id = r.json().get("razorpay_order_id", "mock_order")

if order_id:
    r = client.post("/v1/orders/confirm-payment", json={
        "order_id": order_id,
        "razorpay_order_id": razorpay_order_id,
        "razorpay_payment_id": "mock_pay_123",
        "razorpay_signature": "mock_sig",
    }, headers=headers)
    chk("POST /orders/confirm-payment -> success",
        r.status_code == 200 and r.json().get("status") == "success",
        f"status={r.status_code}")

    r = client.get("/v1/orders/", headers=headers)
    chk("GET /orders/ -> list includes our order",
        r.status_code == 200 and len(r.json().get("items", [])) > 0,
        f"count={len(r.json().get('items', []))}")

    r = client.get(f"/v1/orders/{order_id}", headers=headers)
    chk("GET /orders/{id} -> order detail",
        r.status_code == 200 and r.json().get("order_id") == order_id)

# ── 5. Auth edge cases ──────────────────────────────────────────────
print("\n[5] Auth Edge Cases")

r = client.post("/v1/auth/verify-otp", json={"phone": "+919667964756", "otp": "12345"})
chk("verify-otp with 5-digit OTP -> 400", r.status_code == 400)

r = client.post("/v1/auth/verify-otp", json={"phone": "+919667964756", "otp": "abc123"})
chk("verify-otp with non-numeric OTP -> 400", r.status_code == 400)

r = client.get("/v1/auth/profile")  # No token
chk("GET /auth/profile without token -> 401/403", r.status_code in (401, 403))

r = client.get("/v1/auth/profile", headers={"Authorization": "Bearer bad-token"})
chk("GET /auth/profile with bad token -> 401", r.status_code == 401)

# ── Summary ─────────────────────────────────────────────────────────
print("\n" + "=" * 65)
passed = sum(1 for _, ok in results if ok)
failed = sum(1 for _, ok in results if not ok)
print(f"  RESULTS: {passed} PASSED / {failed} FAILED / {len(results)} TOTAL")
print("=" * 65)

# Cleanup test DB — dispose engine first so SQLite file is unlocked on Windows
try:
    from utils.db import engine as _engine
    _engine.dispose()
except Exception:
    pass
import os as _os, time as _time
for _ in range(3):
    try:
        if _os.path.exists("test_integration.db"):
            _os.remove("test_integration.db")
        break
    except PermissionError:
        _time.sleep(0.5)

sys.exit(0 if failed == 0 else 1)
