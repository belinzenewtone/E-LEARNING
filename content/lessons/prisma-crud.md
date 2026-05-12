# Prisma: CRUD Operations

## Why This Matters

Prisma is the ORM that sits between your TypeScript code and your PostgreSQL database. It generates types from your schema, provides autocomplete for every query, and prevents SQL injection. Understanding CRUD (Create, Read, Update, Delete) operations with Prisma is how you store and retrieve every piece of data in your app.

## Core Concepts

### Read Operations

```typescript
// Find all
const lessons = await db.lesson.findMany({
  where: { difficulty: "beginner" },
  orderBy: { order: "asc" },
  take: 10,        // limit to 10 results
  skip: 20,        // offset (pagination)
});

// Find one
const lesson = await db.lesson.findUnique({
  where: { slug: "js-variables" },
});

// Find first match
const firstCompleted = await db.lesson.findFirst({
  where: { status: "completed" },
});

// Aggregation
const stats = await db.xpEvent.aggregate({
  where: { userId: "..." },
  _sum: { points: true },
  _count: { id: true },
  _avg: { points: true },
});
```

### Create

```typescript
const note = await db.note.create({
  data: {
    title: "My Note",
    content: "Markdown content here",
    userId: session.user.id,
    tags: ["javascript", "variables"],
  },
});

// Create with relations
const progress = await db.progress.create({
  data: {
    userId: session.user.id,
    lessonId: lesson.id,
    status: "completed",
    completedAt: new Date(),
  },
});
```

### Update

```typescript
// Update one
const updated = await db.note.update({
  where: { id: noteId },
  data: { title: "Updated Title", pinned: true },
});

// Update many
await db.notification.updateMany({
  where: { userId: session.user.id, read: false },
  data: { read: true },
});
```

### Upsert — Create or Update

```typescript
// If exists → update. If not → create.
const progress = await db.progress.upsert({
  where: {
    userId_lessonId: { userId: user.id, lessonId: lesson.id },
  },
  update: { status: "completed", completedAt: new Date() },
  create: {
    userId: user.id,
    lessonId: lesson.id,
    status: "completed",
    completedAt: new Date(),
  },
});
```

### Delete

```typescript
await db.note.delete({ where: { id: noteId } });

// Delete many
await db.notification.deleteMany({
  where: { userId: user.id, read: true },
});
```

### Selecting and Including Relations

```typescript
// select — pick specific fields
const lesson = await db.lesson.findUnique({
  where: { slug },
  select: {
    title: true,
    objective: true,
    module: {
      select: { title: true, slug: true },
    },
  },
});

// include — load full relations
const user = await db.user.findUnique({
  where: { id: userId },
  include: {
    notes: { orderBy: { createdAt: "desc" }, take: 5 },
    studyLogs: { where: { date: { gte: weekAgo } } },
    progress: { include: { lesson: true } },
  },
});
```

### Transactions

```typescript
// Multiple operations that must all succeed or all fail
const [xpEvent, progress] = await db.$transaction([
  db.xpEvent.create({
    data: { userId, type: "lesson-completed", points: 30, lessonId },
  }),
  db.progress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { status: "completed" },
    create: { userId, lessonId, status: "completed" },
  }),
]);
```

## Try It Yourself

1. Write a query that finds all completed lessons for a user.
2. Create a new note with tags and relations.
3. Use upsert to either update or create a progress record.
4. Write a transaction that creates an XP event AND updates progress atomically.

## Common Mistakes

- **N+1 queries**: Looping over results and querying inside the loop. Use `include` to load relations in one query.
- **No where clause on updateMany/deleteMany**: `updateMany({ data: { ... } })` without `where` updates ALL rows. Always check your where clause.
- **Large payloads without select**: `findMany()` returns all fields. Use `select` when you only need specific columns.

## Checkpoint

1. When would you use `upsert` instead of `create`?
2. What's an N+1 query and how do you prevent it?
3. Why use a transaction instead of multiple separate queries?
4. **Reflection**: Write the Prisma query for your dashboard's main data fetch.
