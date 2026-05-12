# Destructuring & Spread/Rest

## Why This Matters

Destructuring and spread/rest are the most impactful ES6 features for daily code. They replace verbose patterns with clean, readable one-liners. Any modern JavaScript codebase you encounter will use these heavily.

## Core Concepts

### Array Destructuring

```javascript
// Old way
const arr = [1, 2, 3];
const first = arr[0];
const second = arr[1];

// Destructured
const [first, second] = [1, 2, 3];
console.log(first);  // 1
console.log(second); // 2

// Skip elements
const [, , third] = [1, 2, 3]; // third = 3

// Default values
const [a = 10, b = 20] = [5]; // a=5, b=20

// Swap variables (no temp variable!)
let x = 1, y = 2;
[x, y] = [y, x]; // x=2, y=1
```

### Object Destructuring

```javascript
const user = { name: "Alice", age: 30, city: "Nairobi" };

// Basic
const { name, age } = user;
console.log(name); // "Alice"

// Rename while destructuring
const { name: userName, age: userAge } = user;
console.log(userName); // "Alice"

// Default values
const { role = "user" } = user; // "user" (role doesn't exist)

// Nested destructuring
const response = {
  data: {
    user: { id: 1, profile: { bio: "...", avatar: "..." } }
  }
};
const { data: { user: { profile: { bio } } } } = response;
console.log(bio); // "..."
```

### Spread Operator

```javascript
// Copy array
const original = [1, 2, 3];
const copy = [...original]; // new array, same values

// Merge arrays
const combined = [...arr1, ...arr2];

// Copy object
const userCopy = { ...user };

// Merge objects (later properties override earlier)
const defaults = { theme: "dark", fontSize: 14 };
const prefs = { fontSize: 18 };
const merged = { ...defaults, ...prefs };
// { theme: "dark", fontSize: 18 }

// Add properties while copying
const updated = { ...user, age: 31, isAdmin: true };
```

### Rest Parameters

```javascript
// Collect remaining elements
const [first, ...rest] = [1, 2, 3, 4, 5];
// first = 1, rest = [2, 3, 4, 5]

// Collect remaining properties
const { name, ...details } = { name: "Alice", age: 30, city: "NBO" };
// name = "Alice", details = { age: 30, city: "NBO" }

// Variadic functions
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
sum(1, 2, 3, 4, 5); // 15
```

## Try It Yourself

1. Destructure the first and third elements from `["a", "b", "c", "d"]`.
2. Given `{ title: "JS Guide", author: { name: "Marijn", country: "NL" } }`, extract the author's name and country.
3. Write a function `mergeConfig(defaults, overrides)` that uses spread to merge two config objects.
4. Use rest parameters to collect all but the first argument of a function.

## Common Mistakes

- **Shallow copy**: `[...arr]` and `{...obj}` create shallow copies. Nested objects are still shared references.
- **Destructuring `null/undefined`**: `const { x } = null` throws TypeError. Use default: `const { x } = obj || {}`.
- **Rest must be last**: `const [...rest, last] = arr` is a syntax error. Rest element must be the last.

## Checkpoint

1. How do you rename a variable while destructuring an object?
2. What's the difference between spread and rest syntax?
3. Are spread copies deep or shallow?
4. **Reflection**: Write a function that takes an object and returns a new object with one property changed.
