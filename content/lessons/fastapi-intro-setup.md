# FastAPI: Introduction & Setup

## 🎯 By End of This Lesson You Will:
- Explain what FastAPI is and why it's so fast
- Create and run your first FastAPI server
- Understand automatic docs (Swagger UI)
- Write a GET endpoint that returns JSON

## 🌍 Real-World Analogy First

Imagine a restaurant where you don't need a waiter. You just tell the chef exactly what you want, and they cook it exactly to spec. FastAPI is that chef. You define what data goes in (request) and what comes out (response), and FastAPI handles all the validation, documentation, and serialization automatically.

## 📖 Start From Zero

### Install and Create

```bash
pip install fastapi uvicorn
```

```python
# main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, Learning OS!"}
```

```bash
uvicorn main:app --reload
# Open http://127.0.0.1:8000
```

**What just happened?**
- `FastAPI()` creates your app
- `@app.get("/")` says "when someone visits `/` with GET, run this function"
- `uvicorn` is the server that runs FastAPI
- `--reload` auto-restarts when you change code (like Next.js dev mode)

### Swagger Docs — Free Documentation

Open `http://127.0.0.1:8000/docs` — you get an interactive API documentation page. Every endpoint, every parameter, every model is documented automatically. You can even test endpoints right from the browser.

## 🔨 Level Up

### Path Parameters

```python
@app.get("/items/{item_id}")
def read_item(item_id: int):
    """FastAPI automatically converts item_id to int."""
    return {"item_id": item_id, "double": item_id * 2}
```

Try `http://127.0.0.1:8000/items/42` → `{"item_id": 42, "double": 84}`

Try `http://127.0.0.1:8000/items/hello` → FastAPI returns a validation error: "value is not a valid integer"

### Query Parameters

```python
@app.get("/search")
def search(q: str = "", limit: int = 10):
    return {"query": q, "limit": limit, "results": []}
```

Try `http://127.0.0.1:8000/search?q=python&limit=5`

### Request Body with Pydantic

```python
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    price: float
    is_available: bool = True

@app.post("/items")
def create_item(item: Item):
    # item is already validated!
    return {"name": item.name, "price_with_tax": item.price * 1.16}
```

## 🧪 Practice — Try Each Step

1. Create a FastAPI app with a root endpoint that returns your name and current time.
2. Add a path parameter endpoint `/greet/{name}` that returns `{"hello": name}`.
3. Add a query parameter endpoint `/calculate?a=5&b=3` that returns `{"sum": a+b}`.
4. Create a Pydantic model `Task` with `title`, `done`, and `priority`.
5. Add a POST endpoint that accepts a `Task` and returns it with an added `id`.
6. Open `/docs` and test all your endpoints from the browser.
7. Add type hints to every parameter. Watch FastAPI validate automatically.
8. Change a parameter type (e.g., `int` to `str`) and watch the docs update.

## ⚠️ Common Mistakes — Catch These Early

| Mistake | What You See | The Fix |
|---|---|---|
| Forgetting `uvicorn` | `'uvicorn' is not recognized` | `pip install uvicorn` in your venv |
| Port already in use | `OSError: [Errno 98] address already in use` | Kill the other process or use `--port 8001` |
| `@app.get` on POST endpoint | 405 Method Not Allowed | Use `@app.post` for POST requests |
| Wrong type annotation | FastAPI doesn't validate as expected | Always use Python type hints (`: int`, `: str`) |
| Missing `--reload` during dev | Changes don't take effect until restart | `uvicorn main:app --reload` |

## 🧠 Mental Model — One Sentence

FastAPI is a Python web framework where you write functions with type hints, and it automatically generates a validated, documented, high-performance API — no boilerplate, no configuration files, no magic.

## 📝 Check Your Understanding

- **Define**: What does `@app.get("/")` do?
- **Predict**: What happens if you visit `/items/hello` when `item_id` is typed as `int`?
- **Find the bug**: `@app.get("/users") def get_user(id): return {"id": id}` — what's missing?
- **Write it**: Create a `/health` endpoint that returns `{"status": "ok", "version": "1.0"}`.
- **Apply it**: Add a POST endpoint that accepts a dictionary and returns it with a "received" status.
- **Reflect**: How does FastAPI's automatic validation compare to Zod in Next.js?

## 🚀 What This Unlocks

Now you can build APIs. Every lesson from here adds capabilities: query params, path params, Pydantic models, dependency injection, authentication — all built on this foundation.
