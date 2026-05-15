# Typing Functions & Parameters

## 🎯 By End of This Lesson You Will:
- Annotate parameters, return types, and optional/default parameters
- Use `void` and `never` correctly
- Type higher-order functions and callbacks

---

## 🌍 Real-World Analogy First

A function signature is like a **service order form**:

```
SERVICE: calculateXP
  INPUTS (params):
    base:        number  (required)
    multiplier:  number  (default: 1)
  OUTPUT (return):
    number
```

Anyone calling the function knows EXACTLY what they need to provide and what they'll get back. No guesswork.

```typescript
function calculateXP(base: number, multiplier: number = 1): number {
  return base * multiplier;
}
```

---

## 📖 Start From Zero

### Annotate Parameters and Return Type

```typescript
function add(a: number, b: number): number {
  return a + b;
}

add(2, 3);        // 5
add("2", 3);      // ❌ "2" is not a number
add(2);           // ❌ missing argument
```

Both inputs AND output are typed. The compiler verifies every call.

---

## 🔨 Level Up

### Step 1: Return Type Inference

TypeScript can often infer return types:

```typescript
function add(a: number, b: number) {
  return a + b;
}
// Inferred return: number
```

**When to annotate the return type explicitly:**
- Public/exported functions (clearer contract)
- When inference would be too wide or too narrow
- To prevent accidental return type changes

> **Rule:** Annotate return types on exported functions. Let TS infer for small internal helpers.

---

### Step 2: Optional Parameters

```typescript
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Hello"}, ${name}!`;
}

greet("Alice");                // "Hello, Alice!"
greet("Alice", "Habari");      // "Habari, Alice!"
```

The `?` makes the parameter optional — but optional params **must come AFTER required** ones.

### Step 3: Default Parameters

```typescript
function createUser(name: string, role: "admin" | "user" = "user") {
  return { name, role };
}

createUser("Alice");          // role defaults to "user"
createUser("Bob", "admin");
```

When a default is provided, you don't need the `?` — TypeScript treats it as optional.

---

### Step 4: Rest Parameters

```typescript
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3);          // 6
sum(1, 2, 3, 4, 5);    // 15
```

`...numbers: number[]` collects ALL arguments into a typed array.

### Step 5: Function Type Aliases

```typescript
type GreetFn = (name: string, lang?: string) => string;

const greetEnglish: GreetFn = (name) => `Hello, ${name}!`;
const greetSwahili: GreetFn = (name) => `Habari, ${name}!`;
```

Useful when many functions share the same signature (event handlers, mappers, predicates).

---

### Step 6: void Return Type

```typescript
function logEvent(message: string): void {
  console.log(`[${new Date().toISOString()}] ${message}`);
}
```

`void` means "this function doesn't return a useful value." Use for:
- Functions that only do side effects (logging, mutating)
- Event handlers
- Forms that submit without returning data

```typescript
// void is different from returning undefined:
function a(): void {}
function b(): undefined { return undefined; }
// In strict mode, b() must explicitly return undefined. a() doesn't.
```

---

### Step 7: never Return Type

```typescript
function fail(message: string): never {
  throw new Error(message);
}

function loopForever(): never {
  while (true) { /* ... */ }
}
```

`never` means "this function never returns normally" — it throws or infinitely loops. Used for:
- Throwing helpers (`throw` only)
- Exhaustiveness checks in discriminated unions

---

### Step 8: Higher-Order Functions

```typescript
// Function that takes a callback
function retry<T>(
  fn: () => Promise<T>,
  attempts: number = 3
): Promise<T> {
  return fn().catch((err) => {
    if (attempts > 1) return retry(fn, attempts - 1);
    throw err;
  });
}

// Function that returns a function
function makeMultiplier(factor: number): (n: number) => number {
  return (n) => n * factor;
}

const double = makeMultiplier(2);
double(5);   // 10
```

Type higher-order functions by explicitly naming the callback's signature.

---

### Step 9: Function Overloads

Sometimes a function returns different types depending on its input:

```typescript
function getValue(key: "name"): string;
function getValue(key: "age"): number;
function getValue(key: "isActive"): boolean;
function getValue(key: string): unknown {
  /* runtime impl */
  return null;
}

const n = getValue("name");    // type: string
const a = getValue("age");     // type: number
```

Overloads tell TypeScript: "for this input, the output is this type." The actual implementation handles all cases.

Rarely needed in everyday code but useful for libraries.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Typed function:**
```typescript
// Type this function:
// function multiply(a, b) { return a * b }
// Add proper parameter and return types
```

**Exercise 2 — Optional + default:**
```typescript
// Write greet(name, language?, capitalize = false): string
// Defaults: language = "English"
```

**Exercise 3 — Rest params:**
```typescript
// Write average(...nums: number[]): number
// Handle empty array (return 0)
```

**Exercise 4 — Function type alias:**
```typescript
// type Predicate<T> = (item: T) => boolean
// Use it: filter array of numbers keeping only positives
```

**Exercise 5 — Callback type:**
```typescript
// Type this:
// function process(items, onEach) { ... }
// where items is number[] and onEach takes a number, returns void
```

**Exercise 6 — Returns void:**
```typescript
// Build a logger function: log(level, message): void
// level is "info" | "warn" | "error"
```

**Exercise 7 — Never:**
```typescript
// Type a function unreachable(msg: string) that always throws
// Use it inside a switch's default for exhaustiveness checking
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Forgetting to type callback | `any` everywhere | Annotate the callback type explicitly |
| Mixing void and undefined | Subtle bugs in callbacks | Use void unless you need to assert undefined |
| Optional param before required | SyntaxError | Required params first |
| Skipping return type on exported fn | API contract unclear | Annotate return type on exports |

---

## 🧠 Mental Model

```
function name(a: type, b?: type, c: type = default, ...rest: type[]): returnType { }

Return types:
  T          → normal value
  void       → no useful return
  never      → never returns (throws or loops)
  Promise<T> → async result

Function as a value:
  type Fn = (x: number) => string
  const f: Fn = (x) => String(x)
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between `void` and `never`?
2. **Predict:** Does this compile?
   ```typescript
   function greet(name: string, age?: number, lang: string = "en") {}
   ```
3. **Find the bug:**
   ```typescript
   const callback: (x: number) => void = (x) => "hello";
   ```
   Why does this NOT fail? (Hint: void is lenient on returns)
4. **Write it:** A function that takes an array of users and a callback `(user) => boolean`, returns the filtered array. Type it fully.
5. **Apply it:** Type a click handler: `(event) => void`. Add it to a button in TypeScript-friendly DOM code.
6. **Reflect:** Why does TypeScript often infer return types well but require explicit param types?
