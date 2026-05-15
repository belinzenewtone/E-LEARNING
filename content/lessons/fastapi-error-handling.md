# FastAPI: Error Handling

## 🎯 By End of This Lesson You Will:
- Raise HTTPExceptions with proper status codes
- Create custom exception handlers
- Return consistent error responses
- Handle validation errors gracefully

## 🌍 Real-World Analogy First

When you order food and they're out of an ingredient, the restaurant doesn't just ignore you — they tell you "sorry, we're out of avocado." Good error handling in APIs does the same: it tells the client exactly what went wrong, in a format they expect, so they can fix it.

## 📖 Start From Zero

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()

users = {1: {"name": "Alice"}, 2: {"name": "Bob"}}

@app.get("/users/{user_id}")
def get_user(user_id: int):
    if user_id not in users:
        raise HTTPException(status_code=404, detail="User not found")
    return users[user_id]
```

Try `/users/99` → `{"detail": "User not found"}` with status 404.

## 🔨 Level Up

### Custom Headers in Errors

```python
@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id <= 0:
        raise HTTPException(
            status_code=400,
            detail="Item ID must be positive",
            headers={"X-Error-Code": "INVALID_ID"},
        )
    return {"item_id": item_id}
```

### Global Exception Handlers

```python
from fastapi import Request
from fastapi.responses import JSONResponse

class BusinessError(Exception):
    def __init__(self, message: str, code: str):
        self.message = message
        self.code = code

@app.exception_handler(BusinessError)
async def business_error_handler(request: Request, exc: BusinessError):
    return JSONResponse(
        status_code=422,
        content={"error": exc.code, "message": exc.message},
    )

@app.get("/reserve/{item_id}")
def reserve(item_id: int, quantity: int):
    if quantity > 10:
        raise BusinessError(
            message=f"Cannot reserve {quantity} items (max 10)",
            code="QUANTITY_EXCEEDED",
        )
    return {"reserved": quantity}
```

### Validation Error Customization

```python
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        errors.append({
            "field": " → ".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        })
    return JSONResponse(status_code=422, content={"errors": errors})
```

## 🧪 Practice — Try Each Step

1. Add 404 handling to a user endpoint when the user doesn't exist.
2. Raise 400 for invalid query parameters (e.g., negative page number).
3. Create a custom exception class and global handler for it.
4. Customize the validation error response — make it cleaner than the default.
5. Add an `X-Request-ID` header to all error responses.
6. Log every 500 error to the console with the request path.

## ⚠️ Common Mistakes — Catch These Early

| Mistake | What You See | The Fix |
|---|---|---|
| Returning plain string as error | Client gets 200 with text | Always use `raise HTTPException` for error status |
| Catching all exceptions silently | Server returns 500 with no details | Log the error, return a sanitized message to client |
| Exposing stack traces | Client sees database internals | Never include `str(e)` in production error responses |
| Same handler for different errors | Generic "something went wrong" | Use specific exception classes for specific problems |

## 🧠 Mental Model — One Sentence

HTTPExceptions tell the client "here's what went wrong" with the right status code; custom handlers give you control over the format and consistency of every error your API returns.

## 📝 Check Your Understanding

- **Define**: What's the difference between an HTTPException and a custom exception?
- **Predict**: What status code does FastAPI return if you don't handle an error?
- **Find the bug**: `raise HTTPException(404, "Not found")` — what's missing?
- **Write it**: Create a 409 Conflict handler for duplicate resources.
- **Apply it**: Add a global handler that returns all errors as `{"error": ..., "code": ...}`.
- **Reflect**: How should error handling differ between development and production?

## 🚀 What This Unlocks

Professional APIs. Clients need to handle errors gracefully — consistent error formats, proper status codes, and clear messages make your API a joy to integrate with.
