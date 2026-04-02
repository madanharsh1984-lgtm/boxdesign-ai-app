import sys, os, traceback
sys.path.insert(0, '.')
os.environ['DATABASE_URL'] = 'sqlite:///./test_verify.db'

from fastapi.testclient import TestClient
from main import app

client = TestClient(app, raise_server_exceptions=True)
try:
    r = client.post('/v1/auth/verify-otp', json={'phone': '+919667964756', 'otp': '123456'})
    print('STATUS:', r.status_code)
    print('BODY:', r.text[:500])
except Exception as e:
    tb = traceback.format_exc()
    # Print only the relevant lines
    for line in tb.split('\n'):
        skip = any(x in line for x in [
            'site-packages', 'venv\\Lib', 'starlette', 'httpx',
            'anyio', 'concurrent', 'fastapi\\routing', 'fastapi\\applications',
            'fastapi\\middleware', '_exception_handler', 'sqlalche'
        ])
        if line.strip() and not skip:
            print(line)
finally:
    try:
        os.remove('test_verify.db')
    except Exception:
        pass
