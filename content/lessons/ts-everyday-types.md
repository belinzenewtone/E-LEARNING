# Everyday Types

## 🎯 By End of This Lesson You Will:
- Annotate variables with `string`, `number`, `boolean`, and arrays
- Use union types and literal types
- Recognize when to rely on type inference vs explicit annotations

---

## 🌍 Real-World Analogy First

Types are like **measuring containers in a kitchen**:

```
A tablespoon holds:   liquid (a small amount)
A pot holds:          soup or stew
A cup holds:          dry goods or tea

You don't pour soup into a tablespoon.
You don't measure flour with a teaspoon.
```

TypeScript's everyday types — `string`, `number`, `boolean`, arrays, etc. — are the basic measuring containers. Master these and you can describe 80% of real-world data.

---

## 📖 Start From Zero

### The 5 Primitive Types You Use Daily

```typescript
let name: string = "Belinze";
let age: number = 25;
let isActive: boolean = true;
let nothing: null = null;
let missing: undefined = undefined;
```

You don't usually annotate primitives explicitly — TypeScript infers:

```typescript
let name = "Belinze";   // inferred: string
let age = 25;            // inferred: number
```

Annotate when:
- The variable is declared without a value (`let count: number;`)
- The inferred type is too narrow or too wide
- You want to make intent clear

---

## 🔨 Level Up

### Step 1: Arrays — Two Syntaxes

```typescript
const scores: number[] = [90, 85, 70];
const names: string[] = ["Alice", "Belinze"];

// Equivalent (generic syntax)
const flags: Array<boolean> = [true, false, true];
```

Both work — `Type[]` is the common style.

### Step 2: Tuples — Fixed-Length Arrays With Known Types

```typescript
let coordinate: [number, number] = [10, 20];
let userInfo: [string, number, boolean] = ["Alice", 25, true];

coordinate[0] = 50;     // OK — first element is number
coordinate[0] = "abc";  // ❌ wrong type
coordinate[2];           // ❌ undefined — only 2 elements
```

Common use: `useState` returns a tuple `[value, setter]`.

---

### Step 3: Union Types — "This OR That"

```typescript
let id: number | string;
id = 123;        // OK
id = "abc-123";  // OK
id = true;       // ❌ Error

function format(value: string | number): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}
```

`|` means "one of these types." Use unions when a value can be one of several shapes.

---

### Step 4: Literal Types — Specific Values

```typescript
let status: "active" | "paused" | "completed";
status = "active";        // OK
status = "deleted";       // ❌ not in the union

let direction: "up" | "down" | "left" | "right";

// Combined with regular types:
let result: { ok: true } | { ok: false; error: string };
```

Literal types let TypeScript catch typos in fixed string sets.

---

### Step 5: `any` vs `unknown` vs `never`

```typescript
// any — opt out of type checking (avoid!)
let untyped: any = 42;
untyped.toUpperCase();   // no error, but breaks at runtime

// unknown — must narrow before use (safe!)
let mystery: unknown = "hello";
mystery.toUpperCase();   // ❌ Error — must narrow first
if (typeof mystery === "string") {
  mystery.toUpperCase(); // ✅ now TypeScript knows
}

// never — value that never exists (returns of functions that throw/loop forever)
function fail(msg: string): never { throw new Error(msg); }
```

> **Rule:** Avoid `any`. Use `unknown` when you genuinely don't know the type yet, and narrow it before use.

---

### Step 6: Type Aliases — Name Your Types

```typescript
type UserId = string;
type Status = "active" | "paused" | "completed";
type Point = [number, number];

function setStatus(id: UserId, status: Status) {
  /* ... */
}
```

Aliases make code easier to read and refactor.

---

### Step 7: Inferring Object Types

```typescript
const user = {
  name: "Alice",
  age: 25,
  isActive: true
};

// TypeScript infers:
//   { name: string; age: number; isActive: boolean }

user.name = "Bob";       // OK
user.age = "thirty";     // ❌ Error
user.role = "admin";     // ❌ Error — property doesn't exist
```

TypeScript tracks the exact shape from the initial value.

---

### Step 8: Explicit Object Types

```typescript
let config: { host: string; port: number; debug: boolean };

config = { host: "localhost", port: 3000, debug: true };

// Optional properties with ?
let event: { name: string; date?: Date };
event = { name: "Launch" };         // OK — date optional
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Basic types:**
```typescript
// Declare 5 variables with correct types: string, number, boolean,
// number[], and a tuple [string, number]
```

**Exercise 2 — Union:**
```typescript
// Write a function describe(value: string | number) that returns:
// - for strings: "Got text: <value>"
// - for numbers: "Got number: <value>"
// Use typeof to narrow
```

**Exercise 3 — Literal types:**
```typescript
// Define a Status type with exactly: "draft", "published", "archived"
// Write a function transition(from: Status, to: Status) that allows only:
// draft → published, published → archived
// Throws for anything else
```

**Exercise 4 — Type alias:**
```typescript
// Create a type alias `LessonId` for `string`
// Use it as the parameter type in a function getLesson(id: LessonId)
```

**Exercise 5 — Optional:**
```typescript
// Define a Note type with: id (string), title (string), content (string),
// pinned (optional boolean)
// Create 2 example notes — one with pinned, one without
```

**Exercise 6 — unknown:**
```typescript
// Function parseInput(input: unknown): number
// Returns the input as a number if it's a number or a numeric string
// Returns 0 for everything else (use typeof to narrow!)
```

**Exercise 7 — Tuples:**
```typescript
// Write a function divideWithRemainder(a: number, b: number): [number, number]
// Returns [quotient, remainder]
// Destructure the result and print both
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Using `any` | Defeats TypeScript's purpose | Use `unknown` or a specific type |
| Over-annotating obvious types | Cluttered code | Let TS infer simple types |
| Forgetting `?` on optional fields | Required when you meant optional | Add `?` after the field name |
| Comparing without narrowing | Errors on unknown/union | Use typeof, instanceof, or in |

---

## 🧠 Mental Model

```
Primitives: string, number, boolean, null, undefined
Arrays:     number[]  or  Array<number>
Tuples:     [string, number]
Unions:     string | number
Literals:   "active" | "paused"
Special:    any (avoid), unknown (safe), never (never returns)
Type alias: type Foo = string | number
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between `any` and `unknown`?
2. **Predict:** What does this allow/disallow?
   ```typescript
   let x: "yes" | "no";
   x = "yes";
   x = "maybe";
   ```
3. **Find the bug:**
   ```typescript
   function format(value: string | number): string {
     return value.toUpperCase();
   }
   ```
4. **Write it:** Define a `Response` type that is either `{ ok: true; data: string }` or `{ ok: false; error: string }`.
5. **Apply it:** A function returns either a number or null if not found. Type its return value.
6. **Reflect:** When does explicit type annotation HELP readability, and when does it HURT it?
