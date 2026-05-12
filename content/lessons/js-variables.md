# Variables: var, let, const

## Why This Matters

Variables are the most fundamental concept in programming. Every piece of data your application works with — user names, prices, API responses — lives in a variable. Understanding how they're scoped and how they behave determines whether your code works or silently fails.

## Core Concepts

### The Three Declarations

```javascript
var name = "Alice";    // function-scoped, hoisted (avoid)
let age = 25;           // block-scoped, reassignable
const PI = 3.14159;     // block-scoped, cannot be reassigned
```

### Block Scope vs Function Scope

`let` and `const` are **block-scoped** — they only exist inside the `{}` where they were declared. `var` is **function-scoped** — it ignores block boundaries.

```javascript
if (true) {
  var x = 1;   // leaks outside the if block
  let y = 2;   // stays inside
}
console.log(x); // 1 — var leaked
console.log(y); // ReferenceError — let didn't
```

### const is Not Immutable

`const` prevents reassignment of the variable itself, but the contents of objects and arrays can still change:

```javascript
const user = { name: "Alice" };
user.name = "Bob";    // ✅ allowed — we're changing contents, not reassigning
user = { name: "Cat" }; // ❌ TypeError — reassignment

const numbers = [1, 2, 3];
numbers.push(4);       // ✅ allowed
numbers = [4, 5, 6];   // ❌ TypeError
```

### Temporal Dead Zone (TDZ)

`let` and `const` are hoisted but not initialized. Accessing them before declaration throws an error:

```javascript
console.log(a); // undefined (var — hoisted as undefined)
var a = 1;

console.log(b); // ReferenceError (let — in TDZ)
let b = 2;
```

## Try It Yourself

1. Declare a `const` object with your name, age, and favorite language. Try changing each property.
2. Write a loop that uses `let` inside the loop body. Try accessing it outside — what happens?
3. Create a function that uses `var` inside an `if` block. Call the variable outside the `if`. Does it work?

## Common Mistakes

- **Using `var` by habit**: Always start with `const`. If you need to reassign, switch to `let`. If you think you need `var`, you probably don't.
- **Thinking `const` freezes objects**: It only freezes the reference. Use `Object.freeze()` if you need true immutability.
- **Re-declaring `let` in the same scope**: You get a SyntaxError. Use a new variable name or let the old one go out of scope.

## Checkpoint

1. Which keyword creates a block-scoped variable?
2. Explain why `const user = {}; user.name = "A";` works but `const user = {}; user = {};` doesn't.
3. What is the Temporal Dead Zone?
4. **Reflection**: Write a rule for yourself about when to use `const` vs `let` vs `var`.
