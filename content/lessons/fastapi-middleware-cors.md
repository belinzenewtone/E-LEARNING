# FastAPI: Middleware & CORS

## 🎯 By End of This Lesson You Will:
- Add CORS middleware to allow frontend requests
- Create custom middleware for logging and request timing
- Understand middleware execution order
- Use built-in middleware for common tasks

## 🌍 Real-World Analogy First

Middleware is like airport security — every passenger (request) passes through the same checkpoints before reaching their gate (endpoint). One checkpoint checks your passport (auth), another scans your bags (CORS), another timestamps your journey (logging). You don't add security to each gate individually — you put it at the entrance.

## 📖 Start From Zero

### CORS — The Essential Middleware

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://myapp.com"],
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Authorization, Content-Type, etc.
)
```

Without CORS, browsers block requests from different origins. With this middleware, your Next.js frontend (`localhost:3000`) can call your FastAPI backend (`localhost:8000`).

## 🔨 Level Up

### Custom Middleware — Request Logger

```python
import time
from fastapi import Request

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()

    # BEFORE the endpoint
    print(f"→ {request.method} {request.url.path}")

    response = await call_next(request)  # the actual endpoint runs here

    # AFTER the endpoint
    duration = time.time() - start
    print(f"← {response.status_code} ({duration:.2f}s)")

    response.headers["X-Process-Time"] = str(duration)
    return response
```

Every request now logs: method, path, status code, and duration. The `X-Process-Time` header appears in every response.

### Adding Security Headers

```python
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
```

### Middleware Order Matters

```python
# Executes in order: outermost first
app.add_middleware(LoggingMiddleware)      # runs first, finishes last
app.add_middleware(CORSMiddleware)         # runs second
app.add_middleware(AuthMiddleware)         # runs third, finishes first
```

Request flows: Logging → CORS → Auth → Endpoint → Auth → CORS → Logging.

## 🧪 Practice — Try Each Step

1. Add CORS middleware allowing your frontend origin.
2. Create a logging middleware that prints method + path for every request.
3. Add a `X-Response-Time` header to all responses.
4. Create middleware that blocks requests from suspicious User-Agent strings.
5. Chain 3 middleware functions and observe their execution order in logs.
6. Test CORS by calling the API from a different origin.

## ⚠️ Common Mistakes — Catch These Early

| Mistake | What You See | The Fix |
|---|---|---|
| `allow_origins=["*"]` with credentials | Browsers reject with CORS error | Specify exact origins when using credentials |
| Middleware blocking all requests | Endpoints never reached | Ensure middleware calls `call_next(request)` |
| Heavy work in middleware | Every request slows down | Middleware should be lightweight — move heavy logic to dependencies |
| Forgetting `await call_next(request)` | Response never returns | Always `await` the next handler |

## 🧠 Mental Model — One Sentence

Middleware wraps every request in layers — each layer can inspect, modify, or short-circuit the request before it reaches your endpoint, and modify the response on the way back.

## 📝 Check Your Understanding

- **Define**: What problem does CORS middleware solve?
- **Predict**: If you reverse the order of CORS and auth middleware, what happens?
- **Find the bug**: `allow_origins=["*"]` and `allow_credentials=True` together.
- **Write it**: Create middleware that adds a unique request ID to every response.
- **Apply it**: Add rate-limiting middleware that rejects after 100 requests/minute.
- **Reflect**: How does FastAPI middleware differ from Next.js middleware?

## 🚀 What This Unlocks

Every production API needs CORS, logging, and security headers. Middleware makes them consistent across all endpoints.
