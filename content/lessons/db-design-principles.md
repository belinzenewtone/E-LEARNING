# Relational Database Design Principles

## 🎯 By End of This Lesson You Will:
- Identify entities, attributes, and relationships in a domain
- Choose primary and foreign keys correctly
- Model one-to-many and many-to-many relationships

---

## 🌍 Real-World Analogy First

Database design is like **organizing a filing cabinet for a business**:

```
A messy single drawer:        A well-organized cabinet:
  Orders, customers,            CUSTOMERS drawer (just customer files)
  products, addresses all       ORDERS drawer (with refs to customer ids)
  mixed in one folder            PRODUCTS drawer (separate)
                                 ORDER_ITEMS drawer (links orders↔products)
```

Good design makes finding things fast, prevents duplicates, and survives the business growing 100x.

---

## 📖 Start From Zero

### Entities, Attributes, Relationships

An **entity** is a thing you store. An **attribute** describes it. A **relationship** connects entities.

```
Entity: USER
  Attributes: id, name, email, createdAt

Entity: POST  
  Attributes: id, title, body, userId

Relationship: User HAS MANY Posts (one-to-many)
```

In SQL: each entity = a table. Attributes = columns. Relationships = foreign keys.

---

## 🔨 Level Up

### Step 1: Primary Keys

Every table needs a **primary key** — one column (or combination) that uniquely identifies each row.

```sql
CREATE TABLE users (
  id        UUID PRIMARY KEY,
  email     TEXT NOT NULL UNIQUE,
  name      TEXT NOT NULL
);
```

**Common primary key styles:**

| Style | Pros | Cons |
|---|---|---|
| `SERIAL` (auto-increment int) | Small, fast | Predictable IDs (security concern) |
| `UUID` | Globally unique, no collisions | 16 bytes vs 4 |
| `cuid()` / `cuid2` | URL-friendly, sortable | Library-specific |

For modern apps, `UUID` or `cuid` is standard.

---

### Step 2: Foreign Keys — Linking Tables

```sql
CREATE TABLE posts (
  id        UUID PRIMARY KEY,
  title     TEXT NOT NULL,
  body      TEXT,
  user_id   UUID NOT NULL REFERENCES users(id)
);
```

`user_id REFERENCES users(id)` enforces: **every post's user_id MUST exist in the users table.** No orphan posts allowed.

---

### Step 3: ON DELETE — What Happens When Parent is Removed?

```sql
user_id UUID REFERENCES users(id) ON DELETE CASCADE
-- If a user is deleted, their posts are deleted too

user_id UUID REFERENCES users(id) ON DELETE SET NULL
-- If a user is deleted, posts remain but user_id becomes NULL

user_id UUID REFERENCES users(id) ON DELETE RESTRICT
-- Deletion blocked if any posts reference this user
```

Choose based on business rules:
- **CASCADE**: child can't exist without parent (e.g., comments without their post)
- **SET NULL**: child can survive (e.g., author leaves but their posts stay)
- **RESTRICT**: protect important parents (e.g., can't delete a customer with active orders)

---

### Step 4: One-to-Many

```
USER  ─────────►  POSTS
 1                  many
```

```sql
CREATE TABLE posts (
  id      UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id)   -- the "many" side has the FK
);
```

The "many" side always holds the foreign key.

---

### Step 5: Many-to-Many — Needs a Join Table

A user has many **tags**; a tag has many **users**. You can't fit FKs in either table without duplication.

```sql
CREATE TABLE users (id UUID PRIMARY KEY, name TEXT);
CREATE TABLE tags  (id UUID PRIMARY KEY, name TEXT);

-- The "join table" links them:
CREATE TABLE user_tags (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tag_id  UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, tag_id)
);
```

The **composite primary key** `(user_id, tag_id)` prevents duplicate links.

---

### Step 6: One-to-One

Two tables, one FK on either side, marked `UNIQUE`:

```sql
CREATE TABLE users (id UUID PRIMARY KEY, /* ... */);

CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio     TEXT,
  website TEXT
);
```

The PK on user_id ensures one profile per user.

Why split? Profiles might be optional or rarely-accessed. Splitting keeps the core table small.

---

### Step 7: Indexes — Speed Up Common Queries

```sql
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

Without indexes, lookups scan EVERY row. With indexes, lookups are near-instant.

**Rules:**
- Always index foreign keys
- Index columns used in WHERE/JOIN/ORDER BY frequently
- Don't over-index — every index slows writes

---

### Step 8: Schema Documentation — The ER Diagram

```
USERS                        POSTS
─────────                    ─────────────
id (PK)         ◄────────── user_id (FK)
name                         id (PK)
email                        title
created_at                   body
                             published_at
                             ▲
                             │ (many-to-many)
                             ▼
                          POST_TAGS
                          ─────────────
                          post_id (FK)
                          tag_id (FK)
                          [composite PK]
                             ▲
                             │
                             ▼
                          TAGS
                          ─────────
                          id (PK)
                          name
```

Always sketch an ER diagram for non-trivial schemas. It exposes design issues before you write a single CREATE TABLE.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Identify entities:**
```
For an e-commerce site, list the entities:
- ___ (e.g., customers)
- ___
- ___
- ___
- ___
```

**Exercise 2 — Primary keys:**
```
Design the customers table — pick a PK type and justify
```

**Exercise 3 — Foreign keys:**
```
Design orders table with proper FK to customers
Decide: ON DELETE CASCADE, SET NULL, or RESTRICT? Why?
```

**Exercise 4 — Many-to-many:**
```
Design tables for: products can have many categories;
categories can have many products
Use a join table
```

**Exercise 5 — One-to-one:**
```
Users have an optional payment_method (one each)
Design both tables
```

**Exercise 6 — Indexes:**
```
Given the orders table with columns: id, customer_id, status, created_at
Which columns would you index? Why?
```

**Exercise 7 — Full design:**
```
Design a complete schema for a simple blog:
- Users (authors)
- Posts (by users)
- Comments (on posts, by users)
- Tags (many-to-many with posts)
Draw the ER diagram with all FKs
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Missing PK | Can't update individual rows | Always have a PK |
| Missing FK | Orphan records possible | Add REFERENCES + indexes |
| Forgetting NOT NULL | Unexpected nulls | Add NOT NULL where appropriate |
| Many-to-many without join table | Duplicate data everywhere | Use a join table |
| Indexing every column | Slow writes | Index strategically |

---

## 🧠 Mental Model

```
Database design recipe:
  1. List entities (nouns in the domain)
  2. List attributes per entity
  3. Identify relationships:
     - 1:1   → FK with UNIQUE on either side
     - 1:N   → FK on the "many" side
     - N:N   → join table
  4. Choose primary keys
  5. Decide ON DELETE behaviour
  6. Add indexes on FK and commonly-filtered columns
  7. Draw the ER diagram
```

---

## 📝 Check Your Understanding

1. **Define:** What is a foreign key?
2. **Predict:** If a User is deleted and the orders.user_id has `ON DELETE SET NULL`, what happens to their orders?
3. **Find the bug:**
   ```sql
   CREATE TABLE posts (
     id UUID,
     user_id UUID REFERENCES users(id)
   );
   ```
4. **Write it:** Design schema for: customers, products, orders, order_items.
5. **Apply it:** Sketch the Learning OS schema from memory — users, lessons, modules, tracks, study_logs.
6. **Reflect:** A common mistake is "over-normalizing." When might fewer tables be better?
