# Functions: Declaration & Expression

## Why This Matters

Functions are reusable blocks of code — the building blocks of every application. Instead of writing the same logic 50 times, you write it once as a function and call it 50 times. Functions are also how you organize code into meaningful, testable units.

## Core Concepts

### Function Declaration

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet("Alice")); // "Hello, Alice!"
```

Function declarations are **hoisted** — you can call them before they're defined in the file:

```javascript
sayHi(); // Works! "Hi!"
function sayHi() {
  console.log("Hi!");
}
```

### Function Expression

```javascript
const greet = function(name) {
  return `Hello, ${name}!`;
};

greet("Bob"); // "Hello, Bob!"
```

Function expressions are NOT hoisted. Calling before assignment throws an error.

### Arrow Functions

```javascript
// Full syntax
const add = (a, b) => {
  return a + b;
};

// Implicit return (single expression, no braces)
const add = (a, b) => a + b;

// Single parameter — can omit parentheses
const double = n => n * 2;

// No parameters — must have parentheses
const sayHello = () => "Hello!";
```

### Parameters vs Arguments

```javascript
// Parameters: variables listed in function definition
function multiply(a, b) {  // a and b are parameters
  return a * b;
}

// Arguments: actual values passed when calling
multiply(3, 4);  // 3 and 4 are arguments
```

### Default Parameters

```javascript
function greet(name = "Guest") {
  return `Hello, ${name}!`;
}

greet();          // "Hello, Guest!"
greet("Alice");   // "Hello, Alice!"
```

### Rest Parameters

```javascript
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3, 4, 5); // 15 — any number of arguments
```

## Try It Yourself

1. Write a function `calculateTax(amount, rate = 0.16)` that returns the tax amount.
2. Convert `calculateTax` to an arrow function with implicit return.
3. Write a function `average(...numbers)` that returns the average of all arguments.
4. Create a function `createGreeting(greeting)` that returns a new function — the returned function takes a name and returns the full greeting.

## Common Mistakes

- **Arrow functions and `this`**: Arrow functions don't have their own `this`. They inherit it from the surrounding scope. Don't use arrow functions as object methods when you need `this` to refer to the object.
- **Forgetting `return`**: Without `return`, a function returns `undefined`. Arrow functions with `{}` still need `return`. Only implicit return (no braces) skips it.
- **Parameter naming**: JavaScript doesn't check argument count. Missing arguments become `undefined`, extra arguments are ignored.

## Checkpoint

1. What's the difference between a function declaration and expression in terms of hoisting?
2. When would arrow functions cause problems with `this`?
3. Write a function that uses rest parameters and a default parameter.
4. **Reflection**: Write a rule for when you'll use arrow functions vs regular functions.
