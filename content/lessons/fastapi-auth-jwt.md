# FastAPI: Authentication with JWT

## 🎯 By End of This Lesson You Will:
- Hash passwords with bcrypt
- Create and verify JWT tokens
- Protect endpoints with token-based auth
- Build a complete login/signup flow

## 🌍 Real-World Analogy First

JWT is like a VIP wristband at a festival. You show your ID once at the entrance (login), they give you a wristband (JWT token). Now every venue inside (protected endpoint) just checks your wristband — no need to pull out your ID again. The wristband has an expiry (you can't reuse yesterday's), and tampering is obvious (it's cryptographically signed).

## 📖 Start From Zero

### Install

```bash
pip install python-jose[cryptography] passlib[bcrypt] python-multipart
```

### Password Hashing

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# Usage
hashed = hash_password("mypassword")
# $2b$12$...long string...
verify_password("mypassword", hashed)     # True
verify_password("wrongpass", hashed)      # False
```

## 🔨 Level Up — Full Auth Flow

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

SECRET_KEY = "your-secret-key-keep-it-safe"
ALGORITHM = "HS256"

# ── Token creation ────────────────────────────
def create_token(data: dict, expires_minutes: int = 30):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ── Token verification ────────────────────────
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

# ── Protected dependency ──────────────────────
def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"id": payload.get("sub"), "name": payload.get("name")}

# ── Login endpoint ────────────────────────────
@app.post("/login")
def login(username: str, password: str):
    # In production: verify against database
    if username != "admin" or not verify_password(password, hash_password("secret")):
        raise HTTPException(401, "Invalid credentials")

    token = create_token({"sub": username, "name": "Admin"})
    return {"access_token": token, "token_type": "bearer"}

# ── Protected endpoint ────────────────────────
@app.get("/me")
def read_me(user: dict = Depends(get_current_user)):
    return {"id": user["id"], "name": user["name"]}
```

## 🧪 Practice — Try Each Step

1. Hash a password and verify it.
2. Create a JWT token with a user ID and expiry.
3. Decode the token and extract the user ID.
4. Build a login endpoint that returns a token for valid credentials.
5. Create a `get_current_user` dependency that extracts the user from the token.
6. Protect an endpoint — only authenticated users can access it.
7. Test with `/docs` — use the "Authorize" button to add your token.

## ⚠️ Common Mistakes — Catch These Early

| Mistake | What You See | The Fix |
|---|---|---|
| Hardcoded SECRET_KEY | Security risk | Use environment variables: `os.getenv("SECRET_KEY")` |
| No token expiry | Token valid forever | Always set `exp` claim in JWT |
| Storing plain text passwords | Data breach risk | Always hash with bcrypt before storing |
| Token in URL | Token appears in logs and browser history | Send in Authorization header only |

## 🧠 Mental Model — One Sentence

JWT auth: client sends credentials → server verifies and returns a signed token → client sends token on every subsequent request → server verifies the signature without a database lookup.

## 📝 Check Your Understanding

- **Define**: What are the three parts of a JWT token separated by dots?
- **Predict**: What happens if you modify a JWT token's payload?
- **Find the bug**: `create_token(data)` — no expiry set. What's the risk?
- **Write it**: Build a full login + protected endpoint flow.
- **Apply it**: Add a "refresh token" endpoint that extends the session.
- **Reflect**: How does JWT auth in FastAPI compare to NextAuth in Next.js?

## 🚀 What This Unlocks

Every production app needs auth. This pattern (bcrypt + JWT + middleware) powers millions of APIs.
