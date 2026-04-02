import urllib.request, json, time

BASE = "http://localhost:8000"

def post(path, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(BASE + path, data=body, headers={"Content-Type": "application/json"}, method="POST")
    return json.loads(urllib.request.urlopen(req, timeout=10).read())

def get(path):
    return json.loads(urllib.request.urlopen(BASE + path, timeout=8).read())

r = post("/v1/design/generate", {"length_mm": 100, "width_mm": 100, "height_mm": 100,
                                  "brand_name": "TestBrand", "product_name": "Widget", "category": "Other"})
job_id = r["job_id"]
print("job_id:", job_id)

for i in range(10):
    time.sleep(1)
    s = get(f"/v1/design/status/{job_id}")
    stat = s.get("status")
    pct = s.get("progress")
    step = s.get("current_step")
    print(f"t+{i+1}s: status={stat} progress={pct}% step={step}")
    if stat in ("complete", "failed"):
        break

r2 = get(f"/v1/design/result/{job_id}")
designs = r2.get("designs", [])
print(f"\nTotal designs returned: {len(designs)}")
for d in designs[:3]:
    print(f"  theme={d.get('theme')} status={d.get('status')} has_image={('image_url' in d)} error={d.get('error', '-')[:60] if d.get('error') else '-'}")
