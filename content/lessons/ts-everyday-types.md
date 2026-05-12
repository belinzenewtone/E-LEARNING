# Everyday Types

## Why This Matters

TypeScript's type system is its superpower. The primitive types, arrays, objects, and unions you use daily cover 80% of all typing needs. Master these and you've already got most of the value TypeScript provides.

## Core Concepts

### Primitive Types

```typescript
const name: string = "Alice";
const age: number = 30;
const isAdmin: boolean = true;
const middleName: null = null;
const notAssigned: undefined = undefined;
```

TypeScript infers types when possible — you don't always need annotations:

```typescript
let name = "Alice";  // TypeScript infers: string
name = 42;           // ❌ Error: Type 'number' is not assignable to 'string'
```

### Arrays

```typescript
const numbers: number[] = [1, 2, 3];
const names: string[] = ["Alice", "Bob"];

// Alternative syntax
const scores: Array<number> = [95, 87, 92];

// Mixed types (avoid unless necessary)
const mixed: (string | number)[] = ["hello", 42];
```

### Tuples — Fixed-Length Arrays

```typescript
// Exactly 2 elements: string then number
const pair: [string, number] = ["age", 30];

// Useful for React's useState
const [count, setCount] = useState<number>(0);
// count: number, setCount: (value: number) => void
```

### Object Types

```typescript
// Inline type annotation
const user: { name: string; age: number } = {
  name: "Alice",
  age: 30,
};

// Optional properties
const config: { theme?: string; debug?: boolean } = {};
// theme and debug are optional — no error if missing
```

### Union Types — This OR That

```typescript
type Status = "loading" | "success" | "error";

function setStatus(status: Status) {
  console.log(status);
}

setStatus("loading");  // ✅
setStatus("unknown");  // ❌ Error: not assignable to Status

// Union with different types
type ID = string | number;
function getUser(id: ID) { /* ... */ }
getUser(1);     // ✅
getUser("abc"); // ✅
```

### Type Aliases

```typescript
type User = {
  name: string;
  age: number;
  email: string;
};

type Point = {
  x: number;
  y: number;
};

function distance(a: Point, b: Point): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}
```

### Type Inference vs Explicit Annotations

```typescript
// Inference is usually sufficient
let count = 0;           // TypeScript knows this is number
const names = ["A","B"]; // string[]

// Annotate when inference can't know
let result: number;      // declared but not assigned
const data: User[] = []; // empty array needs annotation
```

### Literal Types

```typescript
let direction: "up" | "down" | "left" | "right";
direction = "up";    // ✅
direction = "north"; // ❌ Error

// Combine with unions for precision
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type HttpStatus = 200 | 201 | 400 | 401 | 404 | 500;
```

## Try It Yourself

1. Type-annotate a variable of each primitive type.
2. Create a `Product` type with a union for category (e.g., "electronics" | "clothing" | "food").
3. Write a function that accepts either a string or a number and returns a different format for each.
4. Create a tuple type for a coordinate `[number, number]` and write a function that takes it.

## Common Mistakes

- **Over-annotating**: `let x: number = 5;` is redundant. TypeScript infers `number` from `5`.
- **Using `any`**: It disables type checking entirely. If you're stuck, use `unknown` instead — it forces you to narrow before use.
- **Empty array without annotation**: `const arr = [];` gets type `never[]`. Annotate: `const arr: string[] = [];`.

## Checkpoint

1. What is a union type? Write an example.
2. When should you use explicit type annotations vs relying on inference?
3. What's wrong with `const arr = []` without an annotation?
4. **Reflection**: Convert a JavaScript object you've written to use TypeScript types.
