# Typing Functions & Parameters

## Why This Matters

Functions are where bugs happen — wrong arguments, missing returns, unexpected types. TypeScript function types eliminate entire categories of runtime errors by enforcing contracts between callers and callees.

## Core Concepts

### Parameter and Return Type Annotations

```typescript
function add(a: number, b: number): number {
  return a + b;
}

// TypeScript infers return type, but explicit is clearer for public APIs
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

### void and never

```typescript
// void — function doesn't return a useful value
function log(message: string): void {
  console.log(message);
  // no return statement needed
}

// never — function NEVER returns (throws or infinite loop)
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}
```

### Optional and Default Parameters

```typescript
// Optional — caller may omit
function greet(name: string, title?: string): string {
  if (title) return `${title} ${name}`;
  return name;
}

// Default — uses value if omitted
function createUser(name: string, role = "user"): User {
  return { name, role };
}

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}
```

### Function Type Expressions

```typescript
// Type alias for a function
type MathOperation = (a: number, b: number) => number;

const add: MathOperation = (a, b) => a + b;
const multiply: MathOperation = (a, b) => a * b;

// Callback type
type EventHandler = (event: Event) => void;

function onClick(handler: EventHandler) {
  document.addEventListener("click", handler);
}

// Generic callback
type Transformer<T> = (input: T) => T;
```

### Function Overloads

```typescript
// Multiple call signatures for the same function
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
  if (typeof value === "string") return value.trim();
  return value.toFixed(2);
}

format("  hello  "); // "hello"
format(3.14159);     // "3.14"
```

### this Parameter

```typescript
interface UIElement {
  addClickListener(onclick: (this: void, e: Event) => void): void;
}

// TypeScript ensures 'this' isn't misused in callbacks
class Handler {
  info: string;
  onClickBad(this: Handler, e: Event) {
    this.info = e.type; // 'this' is Handler
  }
}

// Without 'this' annotation, passing methods as callbacks loses 'this'
```

## Try It Yourself

1. Write a function with typed parameters and an explicit return type.
2. Create a `Callback` type alias and use it for an event handler.
3. Write a function with overloads that handles both string and number inputs.
4. Use rest parameters to create a function that concatenates strings with a separator.

## Common Mistakes

- **Ignoring return type**: Functions without `return` implicitly return `undefined`. Annotate `: void` to be explicit.
- **Optional vs union with undefined**: `name?: string` means `string | undefined`, but the property can be omitted entirely. `name: string | undefined` requires explicit `undefined`.
- **Over-engineered overloads**: Often a union type is simpler than multiple overload signatures. Prefer unions unless call/return relationship is complex.

## Checkpoint

1. What's the difference between `void` and `never` as return types?
2. How do you type a rest parameter?
3. When would you use function overloads vs union types?
4. **Reflection**: Add TypeScript types to a function you wrote in the JavaScript track.
