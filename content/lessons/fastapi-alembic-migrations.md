# FastAPI: Alembic Migrations

## 🎯 By End of This Lesson You Will:
- Initialize Alembic for database migrations
- Create and apply migration scripts
- Roll back migrations safely
- Understand migration best practices

## 🌍 Real-World Analogy First

Alembic is like version control for your database. Git tracks changes to your code — Alembic tracks changes to your tables. "Added email column to users" is like a git commit for your database. You can go forward (upgrade) or backward (downgrade), and every change is documented.

## 📖 Start From Zero

```bash
pip install alembic
alembic init alembic
```

This creates:
```
alembic/
├── versions/       # migration files go here
├── env.py          # Alembic configuration
└── script.py.mako  # migration template
alembic.ini         # database URL config
```

### Configure alembic.ini

```ini
# alembic.ini
sqlalchemy.url = postgresql+asyncpg://user:pass@localhost/db
```

### Connect to Your Models

```python
# alembic/env.py
from app.models import Base  # your SQLAlchemy Base
target_metadata = Base.metadata
```

## 🔨 Level Up

### Create a Migration

```bash
# Auto-generate from model changes
alembic revision --autogenerate -m "add email to users"

# Creates: alembic/versions/abc123_add_email_to_users.py
```

```python
# alembic/versions/abc123_add_email_to_users.py
def upgrade():
    op.add_column("users", sa.Column("email", sa.String(), nullable=True))

def downgrade():
    op.drop_column("users", "email")
```

### Apply Migrations

```bash
alembic upgrade head       # apply all pending migrations
alembic upgrade +1          # apply just the next one
alembic downgrade -1        # roll back one migration
alembic current             # see current migration version
alembic history             # see migration history
```

### Creating an Empty Migration (Manual)

```bash
alembic revision -m "add admin user seed"
```

```python
def upgrade():
    op.execute("INSERT INTO users (name, email) VALUES ('Admin', 'admin@app.com')")

def downgrade():
    op.execute("DELETE FROM users WHERE email = 'admin@app.com'")
```

## 🧪 Practice — Try Each Step

1. Initialize Alembic in your project.
2. Configure it to use your SQLAlchemy models' metadata.
3. Add a new column to your User model.
4. Generate an auto-migration with `--autogenerate`.
5. Apply the migration with `upgrade head`.
6. Roll it back with `downgrade -1`.
7. Create a manual migration that inserts seed data.

## ⚠️ Common Mistakes — Catch These Early

| Mistake | What You See | The Fix |
|---|---|---|
| Not importing all models | Migration misses new tables | Import every model in env.py before setting target_metadata |
| `--autogenerate` missing | Empty migration generated | Include `--autogenerate` to detect model changes |
| Downgrade without `downgrade()` | Can't roll back | Always write the downgrade function |
| Running migrations on wrong DB | Migrations applied to dev instead of prod | Always check `sqlalchemy.url` in alembic.ini |

## 🧠 Mental Model — One Sentence

Alembic versions your database schema — each migration is a timestamped script with upgrade (forward) and downgrade (rollback) functions, applied in order like git commits.

## 📝 Check Your Understanding

- **Define**: What is the difference between `upgrade()` and `downgrade()`?
- **Predict**: What happens if you run `alembic upgrade head` twice?
- **Find the bug**: Migration generated without any table changes — why?
- **Write it**: Create a migration that adds a `bio` column and seeds 3 test users.
- **Apply it**: Generate a migration from a model change and apply it.
- **Reflect**: How is Alembic similar to or different from Prisma Migrate?

## 🚀 What This Unlocks

Every production database needs migrations. Alembic ensures your schema evolves safely across environments.
