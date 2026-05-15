# Generics Basics

## 🎯 By End of This Lesson You Will:
- Write generic functions and types that work for many types
- Use `extends` to constrain generics
- Use built-in generic types like `Array<T>`, `Promise<T>`, `Record<K, V>`

---

## 🌍 Real-World Analogy First

Generics are **placeholders for types** — like a recipe that says "your favorite spice":

```
Recipe (generic):                Recipe (specific):
  Roast meat with <spice>          Roast chicken with cumin
  Pair with <side dish>            Pair with rice
```

The recipe works for ANY spice and side dish. Generics let your code work for any type, while STILL being type-safe.

```typescript
function identity<T>(value: T): T {
  return value;
}

identity<string>("hello");   // T = string
identity<number>(42);        // T = number
identity(true);              // T inferred as boolean
```

The `<T>` is a placeholder. When you call the function, TypeScript fills it in.

---

## 📖 Start From Zero

### Why Generics?

Without generics, you'd have to write separate functions for each type:

```typescript
function firstString(arr: string[]): string | undefined {
  return arr[0];
}

function firstNumber(arr: number[]): number | undefined {
  return arr[0];
}
// ...for every type? Ugh.
```

With generics, **one function for all types**:

```typescript
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

first(["a", "b"]);    // returns string | undefined
first([1, 2]);         // returns number | undefined
first([{ x: 1 }]);     // returns { x: number } | undefined
```

The return type **follows the input type** automatically.

---

## 🔨 Level Up

### Step 1: Generic Functions

```typescript
function repeat<T>(value: T, n: number): T[] {
  return Array(n).fill(value);
}

repeat("hi", 3);      // string[] — ["hi", "hi", "hi"]
repeat(42, 2);        // number[] — [42, 42]
repeat({ ok: true }, 2);  // { ok: true }[]
```

TypeScript infers `T` from the first argument. You can also pass it explicitly:
```typescript
repeat<string>("x", 5);
```

---

### Step 2: Multiple Type Parameters

```typescript
function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}

pair("hello", 42);     // [string, number]
pair(true, [1, 2]);    // [boolean, number[]]
```

Use different letters for different generic parameters.

---

### Step 3: Generic Interfaces and Types

```typescript
interface Box<T> {
  value: T;
  set(value: T): void;
  get(): T;
}

const stringBox: Box<string> = {
  value: "",
  set(v) { this.value = v; },
  get() { return this.value; }
};

type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function divide(a: number, b: number): Result<number> {
  if (b === 0) return { ok: false, error: "div by zero" };
  return { ok: true, value: a / b };
}
```

---

### Step 4: Constraints with `extends`

```typescript
// Without constraint — T could be ANYTHING, including types without .length
function longest<T>(items: T[]): T {
  // items[0].length   ❌ Error — TS doesn't know if T has .length
  return items[0];
}

// With constraint — T must have a .length property
function longest<T extends { length: number }>(items: T[]): T {
  let result = items[0];
  for (const item of items) {
    if (item.length > result.length) result = item;
  }
  return result;
}

longest(["a", "bb", "ccc"]);     // ✅ strings have .length
longest([[1], [1,2], [1,2,3]]);  // ✅ arrays have .length
longest([1, 2, 3]);              // ❌ numbers don't have .length
```

`T extends X` = "T must be a subtype of X."

---

### Step 5: Default Type Parameters

```typescript
function createMap<K = string, V = unknown>(): Map<K, V> {
  return new Map();
}

const userMap = createMap<string, User>();    // explicit
const defaultMap = createMap();                // K = string, V = unknown
```

Defaults make generics more flexible without forcing users to specify every type.

---

### Step 6: Common Built-in Generics

```typescript
const numbers: Array<number> = [1, 2, 3];          // same as number[]
const promise: Promise<string> = fetch("...").then(r => r.text());
const lookup: Map<string, User> = new Map();
const events: Set<string> = new Set();

// Function return:
async function getUser(id: string): Promise<User | null> {
  // ...
}
```

Generics are everywhere in modern TypeScript — you've been using them already.

---

### Step 7: Generic Constraints with `keyof`

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Alice", age: 25 };

getProperty(user, "name");    // string
getProperty(user, "age");     // number
getProperty(user, "email");   // ❌ Error — "email" not in keyof user
```

This is THE pattern for type-safe property access.

---

### Step 8: A Real-World Repository Pattern

```typescript
class Repository<T extends { id: string }> {
  private items = new Map<string, T>();

  add(item: T): void {
    this.items.set(item.id, item);
  }

  findById(id: string): T | undefined {
    return this.items.get(id);
  }

  findAll(): T[] {
    return Array.from(this.items.values());
  }
}

interface Lesson { id: string; slug: string; }
const lessonRepo = new Repository<Lesson>();
lessonRepo.add({ id: "1", slug: "intro" });
lessonRepo.findById("1");   // Lesson | undefined ✅
```

One class definition serves ALL entity types — type-safely.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Generic function:**
```typescript
// Write last<T>(arr: T[]): T | undefined
// Tests with [1,2,3], ["a","b"], [{x:1}]
```

**Exercise 2 — Two type params:**
```typescript
// Write swap<A, B>(pair: [A, B]): [B, A]
```

**Exercise 3 — Generic interface:**
```typescript
// interface Stack<T> with push(value: T), pop(): T | undefined, peek(): T | undefined
// Implement for strings AND for numbers
```

**Exercise 4 — Constraint:**
```typescript
// Write biggest<T extends { value: number }>(items: T[]): T
// Find the item with the largest value
```

**Exercise 5 — keyof:**
```typescript
// Write pluck<T, K extends keyof T>(items: T[], key: K): T[K][]
// Pluck the value of `key` from each item, return as array
```

**Exercise 6 — Generic type alias:**
```typescript
// type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string }
// Use it for fetching a User and for fetching a list of Posts
```

**Exercise 7 — Real pattern:**
```typescript
// Write a generic memoize function:
// memoize<Args extends unknown[], R>(fn: (...args: Args) => R): (...args: Args) => R
// Cache results based on JSON of args
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Forgetting `<T>` declaration | "T not defined" error | Add `<T>` before parameters |
| Trying to use unconstrained T's properties | Error: property doesn't exist on T | Use `extends` constraint |
| Generic that takes `any` parameters | No type safety | Add explicit generic signatures |
| Specifying T explicitly when inferred works | Unnecessary verbosity | Let TS infer when possible |

---

## 🧠 Mental Model

```
Generic = type parameter
  function name<T>(...) → T is filled in at call time
  function name<T extends X>(...) → T must satisfy X
  function name<K extends keyof T>(obj: T, key: K) → safe property access

Generics flow types through code:
  in (T) → out (T or related)
```

---

## 📝 Check Your Understanding

1. **Define:** Why are generics useful? Give a real-world example.
2. **Predict:** What's the return type of `first(["a", "b"])` from this lesson's `first` function?
3. **Find the bug:**
   ```typescript
   function double<T>(value: T): T {
     return value * 2;   // why fail?
   }
   ```
4. **Write it:** Generic function `wrap<T>(value: T): { value: T; createdAt: Date }`.
5. **Apply it:** Convert a non-generic function in your code (one that handles arrays of objects) into a generic.
6. **Reflect:** TypeScript's `Array<T>`, `Promise<T>`, and `Map<K,V>` are all generic. What problem do generics solve in standard library types?
