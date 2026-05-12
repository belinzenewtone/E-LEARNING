# Closures & Scope

## Why This Matters

Closures are JavaScript's most powerful (and most misunderstood) feature. They power module patterns, data privacy, event handlers, and React hooks. If you understand closures, you understand how JavaScript really works under the hood.

## Core Concepts

### Lexical Scope

JavaScript uses **lexical scoping** — a function can access variables from where it was **defined**, not where it was **called**.

```javascript
const outer = "I'm outside";

function showOuter() {
  console.log(outer); // works — defined in same scope
}

function inner() {
  const inner = "I'm inside";
  console.log(outer); // works — outer is in parent scope
  console.log(inner); // works — defined here
}
```

### What Is a Closure?

A closure is when a function "remembers" the variables from its outer scope even after that scope has finished executing.

```javascript
function createCounter() {
  let count = 0;          // this variable is "closed over"

  return function() {     // the returned function is the closure
    count++;
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
// count persists between calls — it's a closure!
```

### Practical Closure Patterns

```javascript
// Factory functions
function makeMultiplier(factor) {
  return function(number) {
    return number * factor;
  };
}
const double = makeMultiplier(2);
const triple = makeMultiplier(3);
double(5); // 10
triple(5); // 15

// Data privacy (no one can modify count directly)
function createBankAccount(initialBalance) {
  let balance = initialBalance;
  return {
    deposit(amount) { balance += amount; return balance; },
    withdraw(amount) {
      if (amount > balance) return "Insufficient funds";
      balance -= amount;
      return balance;
    },
    getBalance() { return balance; },
  };
}

// Event handler factory
function createHandler(message) {
  return function(event) {
    console.log(message, event.target);
  };
}
```

### IIFE (Immediately Invoked Function Expression)

```javascript
// Old pattern (pre-ES6 modules) — creates a private scope
const module = (function() {
  const privateVar = "secret";

  return {
    getSecret() { return privateVar; },
    setSecret(val) { privateVar = val; },
  };
})();

module.getSecret(); // "secret"
module.privateVar;  // undefined (not accessible)
```

### The Loop Closure Trap

```javascript
// Classic bug
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Prints: 3, 3, 3 — all closures share the same 'i'

// Fix 1: use let (block-scoped)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Prints: 0, 1, 2

// Fix 2: create a new closure each iteration
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100);
  })(i);
}
```

## Try It Yourself

1. Write a `createCounter` that starts at a given number and increments by a given step.
2. Create a `createPasswordValidator(minLength)` factory that returns a function checking if a password meets the min length.
3. Fix the loop closure trap: create an array of 5 functions that each return their index when called.

## Common Mistakes

- **Creating closures in loops with `var`**: Use `let` or an IIFE.
- **Memory leaks**: Closures hold references to their outer scope. If you create many closures that reference large objects, those objects can't be garbage collected.
- **Overusing closures for simple state**: Sometimes a plain variable is cleaner. Don't wrap everything in a closure factory.

## Checkpoint

1. Write a counter function factory using a closure.
2. What is lexical scoping?
3. Why does the `var` loop closure trap happen?
4. **Reflection**: Where in your own code could closures help hide implementation details?
