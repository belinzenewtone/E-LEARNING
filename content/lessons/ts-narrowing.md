# Narrowing & Type Guards

## 🎯 By End of This Lesson You Will:
- Use `typeof`, `in`, and `instanceof` to narrow union types
- Write user-defined type guards with type predicates
- Use discriminated unions with switch to safely access variant data

---

## 🌍 Real-World Analogy First

**Narrowing** is what you do when a package arrives and you check what's inside before unpacking it.

```
Box arrives → "What is this?"     ← typeof / instanceof check
   ↓
"It's clothes"  ← TypeScript narrows down what's possible
   ↓
You know you can fold it (string methods, etc.)
```

If the box could contain glass OR fabric, you'd be careful with both. After narrowing ("It's fabric"), you can confidently use fabric-only operations.

TypeScript does this through **type guards** — pieces of code that prove what type a value is, so the rest of the block can safely use type-specific operations.

---

## 📖 Start From Zero

### `typeof` — The Most Common Guard

```typescript
function describe(value: string | number): string {
  if (typeof value === "string") {
    return value.toUpperCase();   // ✅ TypeScript knows value is string here
  }
  return value.toFixed(2);         // ✅ TypeScript knows value is number here
}
```

Inside the `if`, TypeScript "narrows" the union from `string | number` to just `string`. Outside the `if` (in the implicit `else`), it narrows to `number`.

---

## 🔨 Level Up

### Step 1: typeof — All Values

```typescript
typeof "abc"          // "string"
typeof 42             // "number"
typeof true           // "boolean"
typeof undefined      // "undefined"
typeof null           // "object"  ← classic JavaScript bug
typeof {}             // "object"
typeof []             // "object"
typeof (() => {})     // "function"
```

Useful for primitives. For objects, use other guards.

---

### Step 2: `===` and `!==` — Equality Narrowing

```typescript
function process(value: string | null) {
  if (value === null) {
    return "no value";
  }
  // Here: value is narrowed to string
  return value.toUpperCase();
}
```

Equality checks narrow out specific values.

### Step 3: `in` Operator — Property Check

```typescript
interface Dog { bark(): void }
interface Cat { meow(): void }

function speak(pet: Dog | Cat) {
  if ("bark" in pet) {
    pet.bark();        // ✅ narrowed to Dog
  } else {
    pet.meow();        // ✅ narrowed to Cat
  }
}
```

`"property" in object` checks if a property exists — TypeScript uses this to narrow.

---

### Step 4: `instanceof` — Class Check

```typescript
class Cat { meow() {} }
class Dog { bark() {} }

function speak(pet: Cat | Dog) {
  if (pet instanceof Dog) {
    pet.bark();
  } else {
    pet.meow();
  }
}
```

`instanceof` narrows to a specific class instance.

---

### Step 5: Discriminated Unions — The Cleanest Pattern

Each variant has a unique literal tag:

```typescript
type Result =
  | { ok: true; value: number }
  | { ok: false; error: string };

function handle(r: Result) {
  if (r.ok) {
    console.log(r.value);    // ✅ TypeScript knows value exists
  } else {
    console.log(r.error);    // ✅ TypeScript knows error exists
  }
}
```

This is the modern preferred way to model multi-state types.

---

### Step 6: switch with Discriminated Union

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "rect"; width: number; height: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "square": return s.side * s.side;
    case "rect":   return s.width * s.height;
  }
}
```

Each `case` narrows `s` to that specific variant.

---

### Step 7: User-Defined Type Guards

When a guard is more complex, write a function that returns a **type predicate**:

```typescript
interface User {
  id: string;
  email: string;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "email" in value
  );
}

function process(input: unknown) {
  if (isUser(input)) {
    console.log(input.email);   // ✅ TypeScript knows input is User
  }
}
```

The `value is User` part is the **type predicate** — it tells TypeScript "if this function returns true, treat `value` as `User`."

---

### Step 8: Truthiness Narrowing

```typescript
function showName(name: string | null | undefined) {
  if (name) {
    console.log(name.toUpperCase());   // ✅ TS knows name is string (truthy)
  }
}
```

**Watch out:** Truthiness excludes `""` (empty string), `0`, etc. Use `!= null` if you only want to exclude null/undefined:

```typescript
function process(value: string | null | undefined) {
  if (value != null) {   // excludes ONLY null and undefined
    console.log(value.length);
  }
}
```

---

### Step 9: Non-Null Assertion (`!`) — Use Sparingly

```typescript
const el = document.getElementById("app")!;   // tells TS: "this is definitely not null"
```

The `!` says "trust me, this isn't null." But TypeScript can't verify — if you're wrong, you crash at runtime. Use guards (`if (el)`) instead when possible.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — typeof:**
```typescript
// Function describe(value: string | number | boolean): string
// Returns: "text: <upper>", "number: <fixed>", or "bool: yes/no"
// Use typeof to narrow each branch
```

**Exercise 2 — null check:**
```typescript
// Function showName(name: string | null): string
// Returns "Hello, <name>!" or "Anonymous" if null
```

**Exercise 3 — `in` operator:**
```typescript
// type Animal = { swim: () => void } | { fly: () => void }
// function move(a: Animal) — call .swim() or .fly() based on which exists
```

**Exercise 4 — Discriminated union switch:**
```typescript
// type Event = { type: "click"; x: number; y: number }
//            | { type: "keypress"; key: string }
//            | { type: "scroll"; delta: number }
// Function describeEvent(e): string — use switch
```

**Exercise 5 — User-defined guard:**
```typescript
// Function isString(value: unknown): value is string
// Use it to filter a mixed array
```

**Exercise 6 — Truthiness vs null check:**
```typescript
// Compare these two:
//   if (n) ...
//   if (n !== undefined) ...
// What's different when n is 0?
```

**Exercise 7 — Exhaustiveness:**
```typescript
// Use the assertNever pattern with a discriminated union
// Add a new variant and watch the compiler tell you about the missing case
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Trusting `typeof null === "object"` | null treated as object | Check `value === null` first |
| Truthiness narrowing for 0/"" | Treats them as missing | Use `!= null` when 0/"" are valid |
| Overusing `!` (non-null assertion) | Runtime crashes | Use guards instead |
| Forgetting `in` for object members | Manual property exists checks fail | Use `"prop" in obj` |
| Not adding exhaustive default | Missing cases silently slip through | `default: assertNever(x)` |

---

## 🧠 Mental Model

```
Narrowing transforms a wide type into a specific one
based on what you've proven about the value.

Tools:
  typeof value           → string, number, boolean, etc.
  value === null         → narrow out null
  "prop" in value        → object has this property
  value instanceof Cls   → class instance
  switch on discriminator → safe variant access
  custom guard (x is T)  → reusable narrowing
```

---

## 📝 Check Your Understanding

1. **Define:** What does "narrowing" mean in TypeScript?
2. **Predict:**
   ```typescript
   function f(value: string | number | null) {
     if (typeof value === "string") { /* a */ }
     else if (value !== null) { /* b */ }
     else { /* c */ }
   }
   ```
   In each branch, what is the type of `value`?
3. **Find the bug:**
   ```typescript
   function f(value: string | number) {
     if (value) { /* ... */ }
   }
   ```
   What's wrong if `value` is `0` or `""`?
4. **Write it:** A type guard `isError(value): value is { code: string; message: string }`.
5. **Apply it:** Use a discriminated union to model "form state": idle, submitting, success, error.
6. **Reflect:** Why is `value === null` safer than `if (!value)` when null is a valid value to exclude?
