# Utility Types

## 🎯 By End of This Lesson You Will:
- Use `Partial`, `Required`, `Pick`, `Omit`, `Record` to transform types
- Use `ReturnType` and `Awaited` to extract types from functions
- Reach for the right utility instead of redefining types

---

## 🌍 Real-World Analogy First

Utility types are like **photo filters for your types**. You start with a base picture (an interface) and apply transformations:

```
Original photo  →  Black & White filter  →  new photo
User interface  →  Partial<User>          →  new type (all optional)
                 →  Pick<User, "id">       →  new type (just id)
                 →  Omit<User, "password"> →  new type (without password)
```

You don't redefine the type from scratch — you transform an existing one.

---

## 📖 Start From Zero

### `Partial<T>` — Make All Fields Optional

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

// For an update endpoint — only changed fields needed
type UpdateUserInput = Partial<User>;
// Equivalent to: { id?: string; name?: string; email?: string; age?: number }

function updateUser(id: string, changes: Partial<User>) {
  // ...
}

updateUser("123", { name: "Alice" });       // ✅
updateUser("123", { email: "x@y.com" });    // ✅
updateUser("123", {});                       // ✅ all fields optional
```

---

## 🔨 Level Up

### Step 1: `Required<T>` — Make All Fields Required

```typescript
interface Config {
  host?: string;
  port?: number;
  debug?: boolean;
}

// After validation, none can be undefined
type ValidatedConfig = Required<Config>;
// { host: string; port: number; debug: boolean }
```

### Step 2: `Pick<T, K>` — Select Specific Fields

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
}

// For a list view — you only need a few fields
type ProductSummary = Pick<Product, "id" | "name" | "price">;
// { id: string; name: string; price: number }
```

### Step 3: `Omit<T, K>` — Remove Specific Fields

```typescript
// For creation — exclude id (DB generates it)
type CreateProductInput = Omit<Product, "id">;
// { name: string; price: number; description: string; inStock: boolean }

// Hide sensitive fields
type PublicUser = Omit<User, "passwordHash" | "ssn">;
```

> **Pick vs Omit:** Use `Pick` when keeping few fields, `Omit` when removing a few.

---

### Step 4: `Record<K, V>` — Key-Value Mapping

```typescript
type UserMap = Record<string, User>;

const cache: UserMap = {
  "u1": { id: "u1", name: "Alice", email: "a@x.com", age: 30 }
};

// With literal keys:
type Status = "pending" | "active" | "blocked";
type StatusConfig = Record<Status, { label: string; color: string }>;

const config: StatusConfig = {
  pending: { label: "Pending", color: "yellow" },
  active:  { label: "Active",  color: "green" },
  blocked: { label: "Blocked", color: "red" }
};
// TypeScript ensures ALL Status keys are present!
```

`Record<K, V>` is one of the most useful types when keys are known.

---

### Step 5: `Readonly<T>` — Lock the Whole Object

```typescript
const config: Readonly<Config> = { host: "localhost", port: 3000, debug: false };
config.port = 4000;   // ❌ Error: readonly
```

For deep immutability you need a custom `DeepReadonly` — `Readonly` only locks the top level.

---

### Step 6: `ReturnType<T>` — Extract Function's Return

```typescript
function getUser() {
  return { id: "1", name: "Alice", role: "admin" as const };
}

type UserFromDB = ReturnType<typeof getUser>;
// { id: string; name: string; role: "admin" }
```

Powerful pattern with async functions:
```typescript
async function fetchLesson() {
  return db.lesson.findFirst({ where: { slug: "intro" } });
}

type LessonResult = Awaited<ReturnType<typeof fetchLesson>>;
// Unwraps the Promise
```

---

### Step 7: `Parameters<T>` — Extract Function Parameters

```typescript
function createUser(name: string, age: number, role: "admin" | "user") {
  return { name, age, role };
}

type CreateUserParams = Parameters<typeof createUser>;
// [name: string, age: number, role: "admin" | "user"]
```

Useful for higher-order functions and wrappers.

---

### Step 8: `NonNullable<T>` — Strip null/undefined

```typescript
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>;  // string

function ensure<T>(value: T | null | undefined): NonNullable<T> {
  if (value == null) throw new Error("expected value");
  return value as NonNullable<T>;
}
```

---

### Step 9: Real-World CRUD Pattern

```typescript
interface Lesson {
  id: string;
  slug: string;
  title: string;
  content: string;
  estimatedMinutes: number;
  createdAt: Date;
}

// Create: no id or createdAt (DB generates them)
type CreateLessonInput = Omit<Lesson, "id" | "createdAt">;

// Update: every field optional except id
type UpdateLessonInput = Partial<Omit<Lesson, "id" | "createdAt">> & { id: string };

// List view: lightweight
type LessonSummary = Pick<Lesson, "id" | "slug" | "title" | "estimatedMinutes">;

// Public view: no internal IDs
type PublicLesson = Omit<Lesson, "id">;
```

You can build 4 derived types without redefining anything. This is the **payoff** of utility types — change `Lesson` and all derivatives update automatically.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Partial:**
```typescript
// interface Article { id: string; title: string; body: string; tags: string[] }
// Type the parameter of updateArticle(id, changes) where changes is Partial
```

**Exercise 2 — Pick:**
```typescript
// From an Article interface, create ArticleListItem with just id, title, tags
```

**Exercise 3 — Omit:**
```typescript
// Create CreateArticleInput by removing id from Article
```

**Exercise 4 — Record:**
```typescript
// Build a translations type:
// type Lang = "en" | "sw" | "fr"
// Each language must have { hello: string; goodbye: string }
// Use Record
```

**Exercise 5 — ReturnType:**
```typescript
// Given:
// function getUser() { return { id: "1", admin: true }; }
// Create a type UserFromFn equal to the return type
// Then create UserWithoutAdmin by Omit on UserFromFn
```

**Exercise 6 — NonNullable:**
```typescript
// type Maybe = string | null | undefined
// Define type Definite = NonNullable<Maybe>
// Write a function that takes Maybe and returns Definite
```

**Exercise 7 — Compose:**
```typescript
// interface Comment { id: string; postId: string; author: string; text: string; createdAt: Date; }
// Create:
// - CommentCreate (no id, no createdAt)
// - CommentUpdate (id required, other fields optional)
// - CommentPublic (no internal fields like author email if it existed)
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Redefining shapes from scratch | Drift when source changes | Use Pick/Omit/Partial |
| Forgetting Awaited on async return types | Get `Promise<X>` instead of `X` | Wrap with `Awaited<...>` |
| Using Record for known fixed keys | Loose type | Use a literal-key Record or interface |
| Deep mutation with Readonly | Only shallow | Use a DeepReadonly mapped type |

---

## 🧠 Mental Model

```
Transform existing types:
  Partial<T>     — all fields optional
  Required<T>    — all fields required
  Readonly<T>    — all fields locked (shallow)
  Pick<T, K>     — keep selected fields
  Omit<T, K>     — remove selected fields
  Record<K, V>   — key-value mapping
  NonNullable<T> — strip null/undefined
  
Extract from functions:
  ReturnType<typeof fn>
  Parameters<typeof fn>
  Awaited<Promise<T>>
```

---

## 📝 Check Your Understanding

1. **Define:** What does `Partial<T>` do?
2. **Predict:**
   ```typescript
   type X = Pick<{ a: number; b: string; c: boolean }, "a" | "c">;
   // X = ?
   ```
3. **Find the bug:**
   ```typescript
   const fn = async () => ({ id: "1" });
   type R = ReturnType<typeof fn>;   // R = ?
   // The author wanted R = { id: string }. What went wrong?
   ```
4. **Write it:** Given `interface Order { id; userId; total; status; createdAt; updatedAt }`, build:
   - `CreateOrderInput` (no id, no timestamps)
   - `OrderSummary` (just id, total, status)
5. **Apply it:** You have a User interface. Use `Omit` to create a `PublicUser` that hides `passwordHash`.
6. **Reflect:** Why is using utility types better than copy-pasting type definitions across an app?
