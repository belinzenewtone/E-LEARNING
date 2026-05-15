# Interfaces & Type Aliases

## 🎯 By End of This Lesson You Will:
- Define object shapes with `interface` and `type`
- Use optional, readonly, and index signatures
- Choose between `interface` and `type` for any situation

---

## 🌍 Real-World Analogy First

An **interface** is a contract — like a job description:

```
"This role requires:
  - name (string)
  - email (string)
  - age (number, optional)
  - role (must be: 'admin' or 'user')

Anyone applying must meet these requirements."
```

In TypeScript, when you say a parameter has interface `User`, you're saying: "Whatever you pass in MUST match this shape." TypeScript checks at compile time.

---

## 📖 Start From Zero

### Your First Interface

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

const alice: User = {
  id: "u1",
  name: "Alice",
  email: "alice@x.com",
  age: 25
};
```

The `User` interface defines the **shape**. The variable `alice` must match exactly.

---

## 🔨 Level Up

### Step 1: Optional Properties

```typescript
interface Lesson {
  slug: string;
  title: string;
  description?: string;       // optional
  estimatedMinutes?: number;  // optional
}

const a: Lesson = { slug: "x", title: "X" };                    // OK
const b: Lesson = { slug: "y", title: "Y", description: "..." }; // OK
```

The `?` makes the property optional. The user can include it or omit it.

---

### Step 2: Readonly Properties

```typescript
interface User {
  readonly id: string;        // can't be reassigned after creation
  name: string;
  email: string;
}

const alice: User = { id: "u1", name: "Alice", email: "a@x.com" };
alice.name = "Bob";        // ✅ OK
alice.id = "u2";           // ❌ Error: readonly
```

Use `readonly` for fields like IDs and creation timestamps that should never change.

---

### Step 3: Methods on Interfaces

```typescript
interface Counter {
  count: number;
  increment(): void;
  decrement(): void;
  reset(value?: number): void;
}

const counter: Counter = {
  count: 0,
  increment() { this.count++; },
  decrement() { this.count--; },
  reset(value = 0) { this.count = value; }
};
```

Interfaces describe both **data** and **behavior**.

---

### Step 4: Extending Interfaces

```typescript
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface User extends BaseEntity {
  name: string;
  email: string;
}

interface AdminUser extends User {
  permissions: string[];
}

// AdminUser has: id, createdAt, updatedAt, name, email, permissions
```

`extends` lets you build up types compositionally — like inheritance but for shapes.

You can extend multiple interfaces:
```typescript
interface Timestamped { createdAt: Date; }
interface Identifiable { id: string; }

interface User extends Timestamped, Identifiable {
  name: string;
}
```

---

### Step 5: Type Aliases — The Alternative

```typescript
type User = {
  id: string;
  name: string;
  email: string;
};

const alice: User = { id: "u1", name: "Alice", email: "a@x.com" };
```

`type` works almost exactly like `interface` for objects. The key differences:

```typescript
// type can hold ANY type (union, intersection, primitive)
type Status = "active" | "paused" | "completed";
type Point = [number, number];
type ID = string;

// interface is OBJECT-shape only
interface Status { ... }   // can't represent a literal union like above
```

For most object shapes, both work. Use `type` when you need unions, tuples, or other non-object types.

---

### Step 6: Intersection Types (Combine With `&`)

```typescript
type Identifiable = { id: string };
type Timestamped = { createdAt: Date };

type Entity = Identifiable & Timestamped;
// Has: id AND createdAt

const e: Entity = { id: "1", createdAt: new Date() };
```

`A & B` = "has properties of A AND B." Like `extends` for type aliases.

---

### Step 7: Index Signatures — Dynamic Keys

```typescript
interface ScoreMap {
  [subject: string]: number;
}

const scores: ScoreMap = {
  javascript: 92,
  sql: 85,
  typescript: 78
};

scores.python = 80;       // OK — any string key, number value
scores.python = "high";   // ❌ wrong value type
```

Use index signatures when keys aren't known up front.

---

### Step 8: `interface` vs `type` — When to Use Each

| | `interface` | `type` |
|---|---|---|
| Object shape | ✅ | ✅ |
| Union types | ❌ | ✅ |
| Tuple types | ❌ | ✅ |
| Primitive alias | ❌ | ✅ |
| Re-open / declaration merge | ✅ | ❌ |
| Extends | `extends` | `&` (intersection) |

**Most modern teams use one or the other consistently:**
- Use `interface` for object shapes (especially in libraries)
- Use `type` when you need union, tuple, or primitive aliasing

**Both can do the same job for most cases. Pick one and be consistent.**

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Basic interface:**
```typescript
// Define interface Lesson with: slug, title, xpReward, completed (boolean)
// Create 2 instances
```

**Exercise 2 — Optional + readonly:**
```typescript
// Define interface Note with:
// - id (readonly string)
// - title (string)
// - tags (optional string[])
// Try to reassign id — see the error
```

**Exercise 3 — Methods:**
```typescript
// Define interface Stack<T> with:
// - items (T[])
// - push(value: T)
// - pop(): T | undefined
// - peek(): T | undefined
// Implement it for numbers
```

**Exercise 4 — Extends:**
```typescript
// interface BaseEntity { id: string; createdAt: Date; }
// interface User extends BaseEntity { name: string; email: string; }
// interface Admin extends User { permissions: string[]; }
// Create one of each
```

**Exercise 5 — Intersection:**
```typescript
// type A = { foo: string }; type B = { bar: number };
// Build a value of type A & B
```

**Exercise 6 — Index signature:**
```typescript
// Build a Translations type: keys are language codes (string),
// values are objects with greeting (string) and farewell (string)
```

**Exercise 7 — Choose wisely:**
```typescript
// For each, would you use interface or type? Why?
// 1. Status = "active" | "paused"
// 2. User profile object
// 3. A tuple [x, y]
// 4. A complex object shape that other interfaces will extend
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Trying to union with `interface` | Doesn't work | Use `type` for unions |
| Forgetting optional properties | Required when intended optional | Add `?` |
| Extending an unrelated type | Doesn't make sense | Only extend when shape is genuinely shared |
| Mixing interface/type styles randomly | Confusing codebase | Pick one for objects, be consistent |

---

## 🧠 Mental Model

```
interface Name { ... }   ← object shape, can extends, can re-open
type Name = { ... }      ← any type: object, union, tuple, primitive

Modifiers:
  readonly  → can't be reassigned
  ?         → optional

Combine:
  interface B extends A   (interface)
  type C = A & B          (type)
```

---

## 📝 Check Your Understanding

1. **Define:** When would you use `type` instead of `interface`?
2. **Predict:** Does this compile?
   ```typescript
   interface User { id: string; }
   const u: User = { id: "1", name: "Alice" };
   ```
3. **Find the bug:**
   ```typescript
   interface Lesson {
     readonly id: string;
   }
   const l: Lesson = { id: "1" };
   l.id = "2";
   ```
4. **Write it:** Define a `Result<T>` type (using `type` not `interface`) that's either `{ ok: true; value: T }` or `{ ok: false; error: string }`.
5. **Apply it:** Refactor a plain JS object you've written into a typed interface.
6. **Reflect:** Why does TypeScript have both `interface` AND `type`? Why not just one?
