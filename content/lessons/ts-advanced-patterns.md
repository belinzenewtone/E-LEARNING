# Advanced Type Patterns

## 🎯 By End of This Lesson You Will:
- Write mapped types that transform every property of a type
- Use conditional types and `infer` to extract type information
- Compose template literal types for typed strings

---

## 🌍 Real-World Analogy First

These are **type-level computations**. Just as you write JavaScript that transforms data:

```javascript
const doubled = arr.map(n => n * 2);
```

You write **types** that transform other types:

```typescript
type Stringify<T> = { [K in keyof T]: string };
// "for each key K in T, map to string"
```

These advanced patterns are how TypeScript's standard library (Partial, Pick, Omit) is built. Once you can read them, the language opens up.

---

## 📖 Start From Zero

### A Mapped Type — Reimplementing `Partial<T>`

```typescript
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

interface User { id: string; name: string; age: number; }
type PartialUser = MyPartial<User>;
// { id?: string; name?: string; age?: number }
```

Read it:
- `keyof T` → the union of all property names of T (e.g. `"id" | "name" | "age"`)
- `[K in keyof T]` → for each key in that union
- `T[K]` → the type of that property
- `?:` → mark it as optional

Mapped types **iterate over keys** and transform them.

---

## 🔨 Level Up

### Step 1: More Mapped Type Examples

```typescript
// Make all properties readonly
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };

// Make all values strings
type Stringify<T> = { [K in keyof T]: string };

interface User { id: number; name: string; active: boolean; }
type StringifiedUser = Stringify<User>;
// { id: string; name: string; active: string }
```

### Step 2: Adding/Removing Modifiers

```typescript
// Remove readonly
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

// Remove optional
type Complete<T> = { [K in keyof T]-?: T[K] };
```

The `-` prefix says "remove this modifier."

---

### Step 3: Remapping Keys with `as`

```typescript
// Add "get" prefix to all keys → getter type
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person { name: string; age: number; }
type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number }
```

This is wild — TypeScript actually **transforms strings at the type level**.

---

### Step 4: Conditional Types

`T extends U ? X : Y` is the type-level ternary:

```typescript
type IsString<T> = T extends string ? "yes" : "no";

type A = IsString<"hello">;   // "yes"
type B = IsString<42>;         // "no"
```

### Step 5: `infer` — Extract Part of a Type

```typescript
// Extract the element type of an array
type Flatten<T> = T extends Array<infer Item> ? Item : T;

type A = Flatten<string[]>;   // string
type B = Flatten<number>;     // number (unchanged — wasn't an array)

// Extract return type of a function
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function greet(name: string): string { return `Hi ${name}`; }
type G = MyReturnType<typeof greet>;   // string

// Extract first parameter
type FirstArg<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
type X = FirstArg<(a: string, b: number) => void>;   // string
```

`infer X` says "give whatever type fits here a name X that I can use on the right side."

---

### Step 6: Distributive Conditional Types

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;

type Maybe = string | null | undefined;
type Definite = NonNullable<Maybe>;   // string

// When T is a union, the conditional DISTRIBUTES across each member:
type ToArray<T> = T extends any ? T[] : never;
type X = ToArray<string | number>;
// = string[] | number[]   (NOT (string | number)[])
```

This distribution is a powerful feature — and a common surprise.

---

### Step 7: Template Literal Types

```typescript
type Direction = "top" | "right" | "bottom" | "left";
type PaddingKey = `padding-${Direction}`;
// "padding-top" | "padding-right" | "padding-bottom" | "padding-left"

type EventName = "click" | "focus" | "blur";
type HandlerName = `on${Capitalize<EventName>}`;
// "onClick" | "onFocus" | "onBlur"
```

Template literal types compose strings at the type level.

---

### Step 8: Typed Event System (Practical)

```typescript
type EventMap = {
  "lesson:completed": { lessonId: string; xpEarned: number };
  "assignment:submitted": { assignmentId: string };
  "streak:broken": { previousStreak: number };
};

type EventName = keyof EventMap;

function emit<E extends EventName>(event: E, payload: EventMap[E]): void {
  // TypeScript enforces the correct payload for each event!
}

emit("lesson:completed", { lessonId: "abc", xpEarned: 50 });   // ✅
emit("streak:broken", { previousStreak: 7 });                    // ✅
// emit("streak:broken", { lessonId: "x" });                     // ❌
```

The compiler enforces "the payload for THIS event must be exactly this shape."

---

### Step 9: DeepReadonly — Combining Patterns

```typescript
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

interface Config {
  db: { host: string; port: number };
  auth: { secret: string };
}

const config: DeepReadonly<Config> = {
  db: { host: "localhost", port: 5432 },
  auth: { secret: "abc" }
};

// config.db.host = "other";   ❌ Error: deeply readonly
```

Mapped type + conditional type + recursion = deeply transform any structure.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Mapped type:**
```typescript
// Write Optional<T> that makes all properties optional (same as Partial)
```

**Exercise 2 — Stringify:**
```typescript
// Write Stringify<T> that converts every property's type to string
```

**Exercise 3 — infer:**
```typescript
// Write ElementType<T> that extracts the element type of an array
// ElementType<string[]> = string
// ElementType<number[]> = number
```

**Exercise 4 — Conditional:**
```typescript
// Write Extract<T, U> = T if T extends U, else never
// Apply it to: Extract<"a" | "b" | "c", "a" | "c">  → "a" | "c"
```

**Exercise 5 — Template literal:**
```typescript
// type Size = "sm" | "md" | "lg"
// Build type ClassName = `btn-${Size}` → "btn-sm" | "btn-md" | "btn-lg"
```

**Exercise 6 — DeepPartial:**
```typescript
// Write DeepPartial<T> that makes EVERY property at every level optional
```

**Exercise 7 — Typed routes:**
```typescript
// type Routes = "/users" | "/users/:id" | "/posts" | "/posts/:id"
// Extract just the routes with :id params using template literals
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Misunderstanding distribution | Union becomes weird shape | Wrap with `[T] extends [U]` to prevent distribution |
| Overusing advanced types | Slow compile, unreadable | Use only when truly needed |
| Recursive types without bounds | Infinite recursion error | Add a depth limit or stop condition |
| Forgetting `as` in remapping | Plain mapped type, keys unchanged | Use `[K in keyof T as NewKey]` |

---

## 🧠 Mental Model

```
Mapped type    → "for each key, do something"
  { [K in keyof T]: ... }

Conditional    → "if type extends X, return A, else B"
  T extends X ? A : B

infer          → "extract a type and name it"
  T extends Array<infer I> ? I : T

Template       → "compose strings at the type level"
  `prefix-${Union}`

Standard library types are built from these primitives.
```

---

## 📝 Check Your Understanding

1. **Define:** What does `keyof T` produce?
2. **Predict:**
   ```typescript
   type X = { a: 1, b: 2 } extends { a: number } ? "yes" : "no";
   ```
3. **Find the bug:**
   ```typescript
   type FirstArg<T> = T extends (a: infer F, ...rest) => any ? F : never;
   type X = FirstArg<() => void>;
   ```
   What is `X` and why?
4. **Write it:** A mapped type `Nullable<T>` that adds `| null` to every property.
5. **Apply it:** Use a template literal type to create event handler names from an event name union.
6. **Reflect:** Advanced types make code more precise but harder to read. When is the precision worth it?
