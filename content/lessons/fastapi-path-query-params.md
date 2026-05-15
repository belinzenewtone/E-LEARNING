# FastAPI: Path & Query Parameters

## 🎯 By End of This Lesson You Will:
- Use path parameters for resource identifiers
- Use query parameters for filtering, sorting, pagination
- Set default values and validation constraints
- Combine path and query parameters in one endpoint

## 🌍 Real-World Analogy First

Path parameters are like an address on a letter — "Alice, Apartment 42." Query parameters are like sorting instructions — "newest first, only unread, page 3." The address identifies WHAT; the query describes HOW to present it.

## 📖 Start From Zero

```python
from fastapi import FastAPI

app = FastAPI()

# Path parameter — part of the URL
@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"user_id": user_id}

# Query parameter — after ? in URL
@app.get("/users")
def list_users(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}
```

Call `/users/42` → path parameter. Call `/users?skip=20&limit=5` → query parameters.

## 🔨 Level Up

### Validation with Path and Query

```python
from fastapi import Path, Query

@app.get("/items/{item_id}")
def read_item(
    item_id: int = Path(ge=1, description="The item ID"),
    q: str | None = Query(None, min_length=3, max_length=50),
    short: bool = Query(False, description="Return short version"),
):
    result = {"item_id": item_id}
    if q:
        result["q"] = q
    return result
```

`Path(ge=1)` → item_id must be ≥ 1. `Query(None, min_length=3)` → q is optional, but if provided must be 3+ chars.

### Enums for Path Parameters

```python
from enum import Enum

class TrackEnum(str, Enum):
    web = "web"
    data = "data"

@app.get("/progress/{track}")
def get_progress(track: TrackEnum):
    # FastAPI validates that track is "web" or "data"
    return {"track": track, "progress": 75 if track == TrackEnum.web else 60}
```

### Combining Both

```python
@app.get("/lessons/{module_slug}/{lesson_slug}")
def get_lesson(
    module_slug: str,
    lesson_slug: str,
    include_notes: bool = Query(False),
    format: str = Query("full", regex="^(full|summary)$"),
):
    return {
        "module": module_slug,
        "lesson": lesson_slug,
        "notes_included": include_notes,
        "format": format,
    }
```

## 🧪 Practice — Try Each Step

1. Create `/products/{id}` that accepts an int ID and returns a mock product.
2. Add pagination: `/products?skip=0&limit=10` with defaults.
3. Add validation: ID must be ≥ 1, limit must be 1-100.
4. Create an enum for categories and use it as a path parameter.
5. Combine path params + query params in one endpoint.
6. Add an optional query param with min/max length validation.
7. Test validation by sending invalid values — observe the automatic error messages.

## ⚠️ Common Mistakes — Catch These Early

| Mistake | What You See | The Fix |
|---|---|---|
| Same path, different type | Ambiguous routes | FastAPI resolves in order — put specific routes before generic ones |
| Query param without default | Endpoint requires it or returns 422 | Add `= None` or `= defaultValue` to make it optional |
| Forgetting type annotation | No automatic validation | Always annotate: `q: str` not just `q` |
| Using `+` in query params | Gets converted to space in some clients | URL-encode special characters |

## 🧠 Mental Model — One Sentence

Path parameters identify resources (`/users/42`), query parameters modify how you retrieve them (`?sort=name&limit=10`), and FastAPI validates both automatically.

## 📝 Check Your Understanding

- **Define**: When would you use a path parameter vs a query parameter?
- **Predict**: What happens if you send `/users/hello` to `user_id: int`?
- **Find the bug**: `def list(page=1, size=10)` — why might page be a string?
- **Write it**: Create an endpoint with 2 path params and 3 query params.
- **Apply it**: Add validation — one param must be 1-100, another must not be empty.
- **Reflect**: How would you design the URL structure for a course platform?

## 🚀 What This Unlocks

Search, filter, paginate, validate — every real API needs these. Combined with Pydantic models, you can build production-ready endpoints.
