# Narrowing & Type Guards

## Why This Matters

Union types are powerful but ambiguous — is this value a `string` or a `number`? Narrowing is how TypeScript figures out which specific type you're working with at any point in your code. Without narrowing, you can't safely use union types.

## Core Concepts

### typeof Guard

```typescript
function printValue(value: string | number) {
  if (typeof value === "string") {
    console.log(value.toUpperCase()); // TypeScript knows it's string here
  } else {
    console.log(value.toFixed(2));    // TypeScript knows it's number here
  }
}
```

### Truthiness Narrowing

```typescript
function getText(input: string | null | undefined) {
  if (input) {
    console.log(input); // type is string (truthy)
  } else {
    console.log("empty"); // type is null | undefined | ""
  }
}
```

### Equality Narrowing

```typescript
function example(x: string | number, y: string | boolean) {
  if (x === y) {
    // Both must be string (only type they share)
    console.log(x.toUpperCase());
  }
}
```

### in Operator

```typescript
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim(); // TypeScript knows it's Fish
  } else {
    animal.fly();  // Must be Bird
  }
}
```

### instanceof Guard

```typescript
function logValue(value: Date | string) {
  if (value instanceof Date) {
    console.log(value.toISOString()); // Date
  } else {
    console.log(value);               // string
  }
}
```

### Discriminated Unions

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
  }
}
// Exhaustiveness check — if you add a new shape type,
// TypeScript will error here because not all cases are handled.
```

### Type Predicates — Custom Guards

```typescript
interface User {
  name: string;
  email: string;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "email" in value
  );
}

function process(data: unknown) {
  if (isUser(data)) {
    console.log(data.email); // TypeScript knows it's User
  }
}
```

### Exhaustiveness Checking

```typescript
type Status = "loading" | "success" | "error";

function handleStatus(status: Status) {
  switch (status) {
    case "loading": return "Loading...";
    case "success": return "Data loaded!";
    case "error": return "Something went wrong";
    default: {
      // This will error if a new status is added later
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
```

## Try It Yourself

1. Write a function that handles `string | number | boolean` using `typeof` narrowing.
2. Create a discriminated union for API responses and handle each case.
3. Write a custom type predicate `isString` and use it in a function.
4. Add an exhaustiveness check to a switch statement.

## Common Mistakes

- **Not handling all union members**: If you handle `string` and `number` but forget `boolean`, TypeScript will error. Fix the switch or add the missing case.
- **Overly broad type predicates**: `value is object` isn't useful. Be specific: `value is User`.
- **Relying on type assertions instead of narrowing**: `(value as string).toUpperCase()` bypasses safety. Narrow properly.

## Checkpoint

1. How does TypeScript know which type a variable is after narrowing?
2. What is a discriminated union? Write an example.
3. What does `value is Type` syntax do?
4. **Reflection**: Add discriminated unions to a function you've written to make it safer.
