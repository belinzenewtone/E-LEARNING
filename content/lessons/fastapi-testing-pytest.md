# FastAPI: Testing with Pytest

## 🎯 By End of This Lesson You Will:
- Write unit tests for FastAPI endpoints
- Use TestClient for HTTP-level testing
- Mock database sessions for isolated tests
- Run tests with pytest

## 🌍 Real-World Analogy First

Testing is like a safety net under a trapeze artist. You practice the routine (write code), but the net catches you if you fall (failing tests). Without the net, one mistake means disaster. With it, you can try bold moves knowing you'll catch problems before they reach the audience.

## 📖 Start From Zero

```bash
pip install pytest httpx
```

```python
# test_main.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, Learning OS!"}
```

```bash
pytest test_main.py -v
```

## 🔨 Level Up

### Testing with a Database

```python
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from main import app, get_db

# ── Test database ───────────────────────────────
TEST_DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/test_db"
test_engine = create_async_engine(TEST_DATABASE_URL)

async def override_get_db():
    async with AsyncSession(test_engine) as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

# ── Fixture: setup/teardown ─────────────────────
@pytest.fixture(autouse=True)
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

# ── Tests ───────────────────────────────────────
def test_create_user():
    response = client.post("/users", json={"name": "Alice", "email": "a@b.com"})
    assert response.status_code == 200
    assert response.json()["name"] == "Alice"

def test_get_user_not_found():
    response = client.get("/users/999")
    assert response.status_code == 404
```

### Testing Auth Endpoints

```python
def test_protected_endpoint():
    # Without token
    response = client.get("/me")
    assert response.status_code == 401

    # With token
    token = client.post("/login", data={"username": "admin", "password": "secret"})
    headers = {"Authorization": f"Bearer {token.json()['access_token']}"}
    response = client.get("/me", headers=headers)
    assert response.status_code == 200
```

## 🧪 Practice — Try Each Step

1. Write a test for your root endpoint.
2. Test a POST endpoint — send valid JSON and check the response.
3. Test validation — send invalid data and assert 422 status.
4. Create a test database and override the dependency.
5. Write a test for a protected endpoint (with and without auth).
6. Run `pytest -v` and see all tests pass.
7. Deliberately break an endpoint and watch the test catch it.

## ⚠️ Common Mistakes — Catch These Early

| Mistake | What You See | The Fix |
|---|---|---|
| Test DB not cleaned between runs | Tests pass once, fail next run | Use fixtures with setup/teardown |
| Tests depend on test order | Flaky tests | Each test should be independent |
| Not overriding dependencies | Tests hit production database | Use `app.dependency_overrides` |
| Asserting loosely | Bug slips through | Assert exact status codes, field values, and types |

## 🧠 Mental Model — One Sentence

Pytest runs your FastAPI endpoints through TestClient — each test sends a request, checks the response, and cleans up — all in isolation, no real server needed.

## 📝 Check Your Understanding

- **Define**: What does `app.dependency_overrides` do?
- **Predict**: What happens if two tests create the same user with the same email?
- **Find the bug**: Test passes but doesn't assert anything meaningful.
- **Write it**: Write 5 tests for a CRUD API.
- **Apply it**: Add a test for a validator that rejects invalid data.
- **Reflect**: How does pytest compare to Playwright for testing?

## 🚀 What This Unlocks

Confidence to refactor. With tests, you can change code knowing you'll catch breaks immediately.
