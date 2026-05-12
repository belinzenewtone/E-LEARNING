# Generics Basics

## Why This Matters

Without generics, you'd write the same function for every type — one for `number[]`, one for `string[]`, one for `User[]`. Generics let you write a single function that works with ANY type while still being type-safe. They're how libraries like React, Prisma, and Zod give you great autocomplete.

## Core Concepts

### Generic Functions

```typescript
// Without generics — loses type information
function first(arr: any[]): any {
  return arr[0];
}
const num = first([1, 2, 3]); // type is 'any' — useless

// With generics — preserves type
function first<T>(arr: T[]): T {
  return arr[0];
}
const num = first([1, 2, 3]);     // type is number
const str = first(["a", "b"]);    // type is string
```

### Common Generic Patterns

```typescript
// Identity (the simplest generic function)
function identity<T>(value: T): T {
  return value;
}

// Pair / Tuple
function makePair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}
const pair = makePair("hello", 42); // [string, number]

// Array utilities
function last<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

// Promise wrapper
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return response.json(); // TypeScript knows return type is T
}

// Explicit type argument
const users = await fetchData<User[]>("/api/users");
// users is typed as User[]
```

### Generic Interfaces and Types

```typescript
// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

type UserResponse = ApiResponse<User>;
type PostResponse = ApiResponse<Post[]>;

// Generic type alias
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function parseJSON<T>(json: string): Result<T> {
  try {
    const value = JSON.parse(json) as T;
    return { ok: true, value };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}
```

### Constraints with `extends`

```typescript
// T must have a length property
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

longest([1, 2], [1, 2, 3]); // fine — arrays have length
longest("hello", "hi");      // fine — strings have length
longest(1, 2);               // ❌ Error — numbers lack length

// Constrain to specific properties
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Alice", age: 30 };
getProperty(user, "name"); // "Alice" — type is string
getProperty(user, "email"); // ❌ Error — "email" not a key of User
```

### keyof and typeof

```typescript
// keyof — get union of keys
type UserKeys = keyof User; // "name" | "age" | "email"

// typeof — get type of a value
const config = { theme: "dark", debug: true };
type Config = typeof config; // { theme: string; debug: boolean }

// Combined: record type
function groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const group = String(item[key]);
    acc[group] = [...(acc[group] || []), item];
    return acc;
  }, {} as Record<string, T[]>);
}
```

## Try It Yourself

1. Write a generic `swap` function that swaps two elements in a tuple.
2. Create a generic `Stack<T>` class with `push`, `pop`, and `peek` methods.
3. Write a generic `pluck` function that extracts a property from an array of objects.
4. Use `keyof` and generics to create a type-safe object picker function.

## Common Mistakes

- **Over-constraining generics**: `T extends object` is often too restrictive. Think about what you actually need.
- **Generic functions without inference**: Always test that TypeScript can infer `T` from usage. If not, reconsider the API.
- **Forgetting default type parameters**: `type Result<T, E = Error>` gives callers a good default.

## Checkpoint

1. Write a generic identity function.
2. What does `T extends { length: number }` constrain?
3. What does `keyof` return?
4. **Reflection**: Find a function in your code that could benefit from generics.
