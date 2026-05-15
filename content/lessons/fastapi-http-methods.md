# FastAPI: HTTP Methods

## 🎯 By End of This Lesson You Will:
- Use GET, POST, PUT, PATCH, DELETE correctly
- Return proper HTTP status codes
- Handle request bodies and responses
- Understand when to use each HTTP method

## 🌍 Real-World Analogy First

HTTP methods are verbs. GET asks "show me" (read the menu). POST says "here's something new" (place an order). PUT says "replace this completely" (return a dish for a new one). PATCH says "change just this part" (add extra cheese). DELETE says "remove this" (cancel an order).

## 📖 Start From Zero

```python
from fastapi import FastAPI

app = FastAPI()

# GET — read data
@app.get("/users")
def list_users():
    return [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]

# POST — create data
@app.post("/users")
def create_user(name: str):
    return {"id": 3, "name": name, "created": True}

# PUT — full replace
@app.put("/users/{user_id}")
def replace_user(user_id: int, name: str):
    return {"id": user_id, "name": name, "replaced": True}

# PATCH — partial update
@app.patch("/users/{user_id}")
def update_user(user_id: int, name: str | None = None):
    return {"id": user_id, "name": name, "updated": True}

# DELETE — remove
@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    return {"id": user_id, "deleted": True}
```

## 🔨 Level Up

### Status Codes

```python
from fastapi import FastAPI, status

@app.post("/items", status_code=status.HTTP_201_CREATED)
def create_item(name: str):
    return {"name": name}

# Common status codes:
# 200 OK          — success (default)
# 201 Created     — resource created
# 204 No Content  — success, nothing to return
# 400 Bad Request — client error
# 404 Not Found   — resource doesn't exist
# 422 Unprocessable Entity — validation error (FastAPI default)
```

### Response Model — Filter Output

```python
from pydantic import BaseModel

class UserIn(BaseModel):
    name: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    # password NOT included — won't be returned

@app.post("/users", response_model=UserOut)
def create_user(user: UserIn):
    # password is accepted but never returned
    return {"id": 1, "name": user.name}  # id added, password dropped
```

## 🧪 Practice — Try Each Step

1. Create all 5 HTTP method endpoints for a `books` resource.
2. Add proper status codes (201 for POST, 204 for DELETE).
3. Create separate Pydantic models for input (with password) and output (without password).
4. Use `response_model` to ensure passwords are never returned.
5. Test with `/docs` — click each endpoint and verify the response format.
6. Add an endpoint that returns 404 when a resource doesn't exist.
7. Try calling PUT on a POST endpoint — what happens?

## ⚠️ Common Mistakes — Catch These Early

| Mistake | What You See | The Fix |
|---|---|---|
| GET endpoint modifying data | Data changes on page refresh | GET must be idempotent — use POST/PUT for writes |
| PATCH acting like PUT | Partial update replaces everything | PATCH should only change the fields provided |
| Wrong status code | Client confused by response | Use `status_code=` parameter on the decorator |
| Response includes sensitive data | Password hash in response | Use `response_model` to filter output |

## 🧠 Mental Model — One Sentence

GET reads, POST creates, PUT replaces, PATCH updates partially, DELETE removes — and status codes tell the client exactly what happened.

## 📝 Check Your Understanding

- **Define**: When would you use PATCH instead of PUT?
- **Predict**: What status code does FastAPI return for a validation error?
- **Find the bug**: `@app.put("/users/{id}") def update(id):` — what's the security issue?
- **Write it**: Create a CRUD API (all 5 methods) for a `tasks` resource.
- **Apply it**: Add a 404 response when trying to GET a non-existent user.
- **Reflect**: How do these HTTP methods map to Prisma CRUD operations?

## 🚀 What This Unlocks

RESTful APIs. Every backend you build uses these patterns. FastAPI enforces them with type safety.
