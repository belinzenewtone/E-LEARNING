# Prisma: CRUD Operations

## 🎯 By End of This Lesson You Will:
- Define a Prisma schema for your domain
- Use `create`, `findMany`, `findUnique`, `update`, `delete`
- Use relations and `include`/`select` for nested queries

---

## 🌍 Real-World Analogy First

Prisma is your **autocomplete-aware translator** between TypeScript and your database.

```
You write:        const user = await db.user.findUnique({ where: { id: "1" } })
Prisma translates: SELECT * FROM users WHERE id = '1' LIMIT 1;
                  → typed User object back to your code
```

No SQL strings in your TypeScript. No untyped DB results. Just type-safe queries with full autocompletion based on your schema.

---

## 📖 Start From Zero

### A Minimal Schema

```prisma
// prisma/schema.prisma
generator client { provider = "prisma-client-js" }
datasource db    { provider = "postgresql"; url = env("DATABASE_URL") }

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  posts     Post[]
}

model Post {
  id       String @id @default(cuid())
  title    String
  body     String
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
}
```

Run:
```bash
npx prisma migrate dev --name init
```

This creates the SQL tables AND generates a typed Prisma Client.

---

## 🔨 Level Up

### Step 1: The Prisma Client

```typescript
// lib/db.ts
import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();
```

`db` is now a fully typed object with autocomplete for every model and query.

---

### Step 2: CREATE — Insert New Records

```typescript
const user = await db.user.create({
  data: {
    name: "Alice",
    email: "alice@x.com"
  }
});
// user is fully typed: { id, name, email, createdAt }
```

Create with relations:
```typescript
const user = await db.user.create({
  data: {
    name: "Alice",
    email: "alice@x.com",
    posts: {
      create: [
        { title: "First Post", body: "Hi!" }
      ]
    }
  },
  include: { posts: true }
});
```

---

### Step 3: READ — Find Records

```typescript
// Find one by unique field
const user = await db.user.findUnique({
  where: { email: "alice@x.com" }
});
// returns User | null

// Find first matching
const post = await db.post.findFirst({
  where: { authorId: "u1" }
});

// Find many with filters
const users = await db.user.findMany({
  where: {
    email: { contains: "@example.com" }
  },
  orderBy: { createdAt: "desc" },
  take: 10,
  skip: 0
});
```

### Step 4: include vs select

```typescript
// include — return all fields PLUS specified relations
const userWithPosts = await db.user.findUnique({
  where: { id: "1" },
  include: { posts: true }
});

// select — return ONLY specified fields (whitelist)
const userMini = await db.user.findUnique({
  where: { id: "1" },
  select: {
    name: true,
    email: true,
    posts: { select: { title: true } }
  }
});
```

Use `select` for lightweight queries (lists, summaries). Use `include` when you need the full record + relations.

---

### Step 5: UPDATE — Modify Records

```typescript
// Update one
const user = await db.user.update({
  where: { id: "u1" },
  data: { name: "Alice Updated" }
});

// Update many
await db.post.updateMany({
  where: { authorId: "u1" },
  data: { published: true }
});

// Upsert — create if missing, update if existing
await db.user.upsert({
  where: { email: "alice@x.com" },
  update: { name: "Alice (updated)" },
  create: { name: "Alice", email: "alice@x.com" }
});
```

### Step 6: DELETE

```typescript
// Delete one
await db.user.delete({ where: { id: "u1" } });

// Delete many
await db.post.deleteMany({ where: { authorId: "u1" } });
```

---

### Step 7: Filters and Operators

```typescript
const users = await db.user.findMany({
  where: {
    AND: [
      { email: { endsWith: "@example.com" } },
      { createdAt: { gte: new Date("2026-01-01") } }
    ],
    OR: [
      { name: { startsWith: "A" } },
      { name: { startsWith: "B" } }
    ],
    NOT: { name: "Admin" }
  }
});

// String operators
{ name: { contains: "ali", mode: "insensitive" } }
{ email: { startsWith: "admin@" } }
{ email: { endsWith: ".com" } }

// Number operators
{ age: { gt: 18 } }      // greater than
{ age: { gte: 18 } }     // greater or equal
{ age: { lt: 65 } }
{ age: { in: [25, 30, 35] } }

// Date operators (same as numbers)
{ createdAt: { gte: thirtyDaysAgo } }
```

---

### Step 8: Aggregations

```typescript
// Count
const totalUsers = await db.user.count();
const activeUsers = await db.user.count({ where: { active: true } });

// Aggregate
const stats = await db.post.aggregate({
  _count: { _all: true },
  _avg: { views: true },
  _max: { views: true },
  where: { authorId: "u1" }
});

// Group by
const postsByAuthor = await db.post.groupBy({
  by: ["authorId"],
  _count: { _all: true },
  having: { _count: { _all: { gt: 5 } } }
});
```

---

### Step 9: Transactions

When multiple writes must succeed or fail together:

```typescript
const [user, profile] = await db.$transaction([
  db.user.create({ data: { /* ... */ } }),
  db.profile.create({ data: { /* ... */ } })
]);

// Interactive transaction
await db.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { /* ... */ } });
  await tx.profile.create({ data: { userId: user.id } });
});
```

If anything throws, both writes are rolled back.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Schema:**
```prisma
// Define a Note model: id, title, content, createdAt, userId
// Add a User relation
```

**Exercise 2 — Create:**
```typescript
// Create a user with 2 notes in one call
```

**Exercise 3 — Read with relations:**
```typescript
// Find a user by id, include their notes
// Then write the same query with select for just name + note titles
```

**Exercise 4 — Filters:**
```typescript
// Find notes whose title contains "todo" (case-insensitive)
// AND were created in the last 7 days
```

**Exercise 5 — Update:**
```typescript
// Update a single note's title
// Then upsert a note (create if missing, update if exists)
```

**Exercise 6 — Aggregations:**
```typescript
// Count total notes per user using groupBy
```

**Exercise 7 — Transaction:**
```typescript
// Within a transaction: create a user AND their initial settings record
// If settings fails, the user should also not be created
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Missing `await` | Get a Promise, not a User | Always `await` Prisma calls |
| Updating with no `where` | Doesn't compile (good!) | Always include `where` |
| Forgetting `include` | Related fields missing | Add `include` or `select` |
| Using `findFirst` for unique fields | Slower | Use `findUnique` when unique key |
| Many `await`s in sequence | Slow N+1 | Use `Promise.all` or include relation |

---

## 🧠 Mental Model

```
Model in schema.prisma  →  generates typed client  →  use in code

CRUD:
  create / createMany
  findUnique / findFirst / findMany
  update / updateMany / upsert
  delete / deleteMany

Shape:
  include — get full relation
  select — pick specific fields

Filters: where: { ..., AND, OR, NOT, contains, gt, in, ... }
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between `include` and `select`?
2. **Predict:**
   ```typescript
   const user = await db.user.findUnique({ where: { id: "nope" } });
   ```
   What is `user` if no row matches?
3. **Find the bug:**
   ```typescript
   await db.user.update({ data: { name: "Alice" } });
   ```
4. **Write it:** Fetch the 10 most recent posts with the author's name (one Prisma call).
5. **Apply it:** Convert a raw SQL query you wrote in earlier lessons into a Prisma call.
6. **Reflect:** When would you reach for raw SQL (`db.$queryRaw`) instead of Prisma's typed methods?
