# FastAPI: Dependencies & Background Tasks

## 🎯 By End of This Lesson You Will:
- Use `Depends()` for dependency injection
- Share database connections across endpoints
- Run background tasks after returning a response
- Understand the dependency lifecycle

## 🌍 Real-World Analogy First

A dependency is like a waiter who brings you the same tools before every meal — silverware, napkin, menu. You don't fetch them yourself; they're just there when you need them. Background tasks are like asking the kitchen to package leftovers while you're already paying the bill — it happens after you leave the table.

## 📖 Start From Zero

### Basic Dependency

```python
from fastapi import FastAPI, Depends

app = FastAPI()

def get_api_version():
    return "1.0.0"

@app.get("/version")
def read_version(version: str = Depends(get_api_version)):
    return {"version": version}
```

Every request to `/version` calls `get_api_version()` and injects the result into `version`.

### Shared Database Connection

```python
from fastapi import FastAPI, Depends

def get_db():
    """Yield a database session and close it after the request."""
    db = connect_to_database()  # pseudocode
    try:
        yield db
    finally:
        db.close()

@app.get("/users")
def list_users(db = Depends(get_db)):
    return db.query("SELECT * FROM users")

@app.post("/users")
def create_user(name: str, db = Depends(get_db)):
    db.execute("INSERT INTO users (name) VALUES (?)", [name])
    return {"created": name}
```

## 🔨 Level Up

### Dependencies that Depend on Dependencies

```python
def get_token(authorization: str | None = Header(None)):
    if not authorization:
        raise HTTPException(401, "Not authenticated")
    return authorization.replace("Bearer ", "")

def get_current_user(token: str = Depends(get_token)):
    # Verify token and return user
    return {"id": 1, "name": "Alice"}

@app.get("/me")
def read_me(user: dict = Depends(get_current_user)):
    return user
```

Chained: request → `get_token()` → `get_current_user()` → endpoint. Each depends on the previous.

### Background Tasks

```python
from fastapi import BackgroundTasks

def send_welcome_email(email: str, name: str):
    # Simulate slow operation
    import time
    time.sleep(2)
    print(f"Welcome email sent to {name} at {email}")

@app.post("/register")
def register(name: str, email: str, bg: BackgroundTasks):
    # Create user in DB (fast)
    user = {"id": 42, "name": name, "email": email}

    # Schedule slow task (runs AFTER response is returned)
    bg.add_task(send_welcome_email, email, name)

    return {"user": user, "message": "Registration successful. Welcome email on its way!"}
```

The client gets an immediate response. The email sends in the background.

## 🧪 Practice — Try Each Step

1. Create a `get_current_time()` dependency and inject it into an endpoint.
2. Create a `get_db()` dependency that yields a mock database connection.
3. Chain two dependencies — second depends on the first's output.
4. Add a background task that logs "request processed" after the response.
5. Use a dependency to read a query parameter with validation.
6. Create a dependency that raises 401 if no auth header is present.

## ⚠️ Common Mistakes — Catch These Early

| Mistake | What You See | The Fix |
|---|---|---|
| `return` instead of `yield` in dependency | Connection never closes (memory leak) | Use `yield` for resources that need cleanup |
| Heavy work in endpoint | Client waits for slow operations | Move to background tasks if response doesn't need it |
| Dependency in wrong order | Authentication bypass | Put auth dependencies first in the chain |
| Not handling dependency failure | Silent failure or crash | Dependencies can raise HTTPException too |

## 🧠 Mental Model — One Sentence

Dependencies run before your endpoint and inject exactly what it needs; background tasks run after your response and handle work the client shouldn't wait for.

## 📝 Check Your Understanding

- **Define**: What's the difference between a dependency and a background task?
- **Predict**: If `get_db()` raises an exception, does the endpoint run?
- **Find the bug**: `def get_db(): db = connect(); return db` — what's the resource leak?
- **Write it**: Create an auth dependency that extracts and validates a token.
- **Apply it**: Add a background task that updates "last_login" after the user responds.
- **Reflect**: How does FastAPI's dependency injection compare to React hooks?

## 🚀 What This Unlocks

Enterprise patterns. Every production FastAPI app uses dependencies for auth, database sessions, and config — and background tasks for emails, notifications, and cleanup.
