# Interfaces & Type Aliases

## Why This Matters

Real applications have complex data shapes — users with profiles, orders with line items, API responses with nested data. Interfaces and type aliases let you name and reuse these shapes. They're the vocabulary you use to describe your data to TypeScript.

## Core Concepts

### Interfaces — Describing Object Shapes

```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

const alice: User = {
  name: "Alice",
  age: 30,
  email: "alice@example.com",
};

// Functions that accept interfaces
function sendEmail(user: User, subject: string) {
  // TypeScript knows user.email exists
}

// Optional properties
interface Config {
  theme?: string;
  debug?: boolean;
}
```

### Extending Interfaces

```typescript
interface Animal {
  name: string;
  makeSound(): string;
}

interface Dog extends Animal {
  breed: string;
  fetch(): void;
}

const fido: Dog = {
  name: "Fido",
  breed: "Labrador",
  makeSound() { return "Woof"; },
  fetch() { console.log("Fetching!"); },
};
```

### Type Aliases — More Flexible

```typescript
// Type aliases can describe anything, not just objects
type Point = { x: number; y: number };
type ID = string | number;
type Callback = (data: User) => void;
type Status = "active" | "inactive";

// Combining types with intersection
type Admin = User & {
  permissions: string[];
  level: number;
};

// Union of interfaces (discriminated union)
type Result<T> =
  | { status: "success"; data: T }
  | { status: "error"; message: string };
```

### Interface vs Type Alias — When to Use Which

| Feature | Interface | Type Alias |
|---|---|---|
| Describe object shapes | ✅ | ✅ |
| Extend/merge | ✅ (extends) | ✅ (intersection) |
| Unions & primitives | ❌ | ✅ |
| Declaration merging | ✅ | ❌ |
| Performance | Slightly faster | Slightly slower |

```typescript
// Declaration merging (interface only)
interface Window {
  title: string;
}
interface Window {
  ts: TypeScriptAPI;
}
// Window now has both title AND ts — interfaces merge automatically
```

**Rule of thumb**: Use `interface` for object shapes (especially public APIs). Use `type` for unions, primitives, and when you need full flexibility.

### readonly Properties

```typescript
interface Config {
  readonly apiUrl: string;   // can't be changed after creation
  port: number;              // mutable
}

const config: Config = { apiUrl: "https://api.com", port: 3000 };
config.port = 4000;          // ✅ OK
config.apiUrl = "new";       // ❌ Error: readonly

// readonly arrays
const numbers: readonly number[] = [1, 2, 3];
numbers.push(4);             // ❌ Error
```

### Index Signatures

```typescript
// Object with any number of string keys, all values are strings
interface Dictionary {
  [key: string]: string;
}

const translations: Dictionary = {
  hello: "Hola",
  goodbye: "Adios",
  // any key works, but values must be strings
};
```

## Try It Yourself

1. Create a `Product` interface with `name`, `price`, `category`, and optional `discount`.
2. Extend `Product` into `DigitalProduct` with a `fileSize` property.
3. Create a discriminated union `ApiResponse` with `success` and `error` variants.
4. Use `readonly` to make an object's id immutable.

## Common Mistakes

- **Using type for everything**: Interfaces give better error messages and are optimized for objects. Prefer interfaces for object shapes.
- **Forgetting readonly**: If a property should never change after creation, mark it `readonly`. Catches accidental mutations.
- **Relying on declaration merging**: It's powerful but surprising. Only rely on it when augmenting library types (like `Window`).

## Checkpoint

1. When would you use `interface` vs `type` alias?
2. What is declaration merging and which construct supports it?
3. How do you create a discriminated union type?
4. **Reflection**: Convert a JavaScript config object to a TypeScript interface with readonly properties.
