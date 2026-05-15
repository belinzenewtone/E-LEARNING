# FastAPI: SQLAlchemy & Async Databases

## 🎯 By End of This Lesson You Will:
- Connect FastAPI to PostgreSQL with SQLAlchemy
- Define async models and run queries
- Use dependency injection for database sessions
- Perform CRUD operations asynchronously

## 🌍 Real-World Analogy First

SQLAlchemy is a translator between your Python objects and your database tables. Instead of writing raw SQL strings and manually mapping rows to objects, SQLAlchemy does it automatically. A `Student` class in Python maps to a `students` table in PostgreSQL — create a Student object, and SQLAlchemy writes the INSERT for you.

## 📖 Start From Zero

```bash
pip install sqlalchemy[asyncio] asyncpg
```

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# ── Engine ──────────────────────────────────────
DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/db"
engine = create_async_engine(DATABASE_URL, echo=True)

# ── Base class ──────────────────────────────────
class Base(DeclarativeBase):
    pass

# ── Model ───────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column()
    email: Mapped[str] = mapped_column(unique=True)
```

## 🔨 Level Up — FastAPI Integration

```python
from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

app = FastAPI()
async_session = async_sessionmaker(engine, expire_on_commit=False)

# ── Dependency: get DB session ──────────────────
async def get_db():
    async with async_session() as session:
        yield session

# ── CRUD endpoints ──────────────────────────────
@app.get("/users")
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    return result.scalars().all()

@app.post("/users")
async def create_user(name: str, email: str, db: AsyncSession = Depends(get_db)):
    user = User(name=name, email=email)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@app.get("/users/{user_id}")
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user
```

### On Startup — Create Tables

```python
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

## 🧪 Practice — Try Each Step

1. Define a SQLAlchemy model for a `Task` with id, title, done, created_at.
2. Create a database session dependency.
3. Build a GET endpoint that lists all tasks.
4. Build a POST endpoint that creates a task and returns it with the generated ID.
5. Build a PATCH endpoint that marks a task as done.
6. Build a DELETE endpoint that removes a task.
7. Add error handling for non-existent resources (404).

## ⚠️ Common Mistakes — Catch These Early

| Mistake | What You See | The Fix |
|---|---|---|
| Forgetting `await` on queries | Coroutine warning, no data | All SQLAlchemy async operations need `await` |
| Mixing sync and async sessions | `greenlet_spawn` errors | Use `AsyncSession` consistently |
| Not committing after add | Changes lost after request | `await db.commit()` after `db.add()` |
| Using the same session across requests | Data leaks between users | Session dependency scoped per request via `yield` |

## 🧠 Mental Model — One Sentence

SQLAlchemy maps Python classes to database tables — create objects, add them to a session, commit — and FastAPI's dependency injection gives each request its own database session automatically.

## 📝 Check Your Understanding

- **Define**: What does `async_sessionmaker` do?
- **Predict**: What happens if you forget `await db.commit()` after adding a user?
- **Find the bug**: `db.add(user); return user` — missing commit, what's the risk?
- **Write it**: Build a full CRUD API for a `notes` resource with SQLAlchemy.
- **Apply it**: Add a query parameter to filter users by name.
- **Reflect**: How does SQLAlchemy compare to Prisma for database access?

## 🚀 What This Unlocks

Every production FastAPI backend uses SQLAlchemy (or similar ORM) for database access. Combined with JWT auth, you can build complete authenticated APIs.
