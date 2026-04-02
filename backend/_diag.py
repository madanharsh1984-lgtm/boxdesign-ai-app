import sys, traceback
sys.path.insert(0, '.')

print("=== DB + Model Diagnostics ===")

try:
    from utils.db import create_tables, SessionLocal
    create_tables()
    print("[OK] create_tables()")
except Exception as e:
    print("[ERR] create_tables:", e)
    traceback.print_exc()

try:
    from models.user import User
    db = SessionLocal()
    u = db.query(User).filter(User.phone == '+91test').first()
    print("[OK] User query OK, result:", u)
    db.close()
except Exception as e:
    print("[ERR] User query:", e)
    traceback.print_exc()

try:
    from utils.auth_utils import create_access_token
    t = create_access_token("test-user-id")
    print("[OK] create_access_token:", t[:40], "...")
except Exception as e:
    print("[ERR] auth_utils:", e)
    traceback.print_exc()

try:
    import uuid
    from models.user import User
    db = SessionLocal()
    u = User(id=str(uuid.uuid4()), phone='+91diag999')
    db.add(u)
    db.commit()
    db.refresh(u)
    print("[OK] User insert OK, id:", u.id)
    db.delete(u)
    db.commit()
    db.close()
except Exception as e:
    print("[ERR] User insert:", e)
    traceback.print_exc()

print("=== Done ===")
