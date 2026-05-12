# ES Modules: import & export

## Why This Matters

Monolithic files are unmaintainable. Modules split your code into focused, reusable pieces — each file does one thing well. Modern JavaScript uses ES Modules (ESM), the official standard. Every framework (React, Next.js, Vue) uses them. This is how professional codebases are organized.

## Core Concepts

### Named Exports

```javascript
// math.js — export individual items
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export const PI = 3.14159;

// or export all at once:
export { add, subtract, PI };
```

```javascript
// app.js — import what you need
import { add, PI } from "./math.js";

console.log(add(2, 3)); // 5
console.log(PI);        // 3.14159

// Rename on import
import { add as sum } from "./math.js";
sum(2, 3); // 5

// Import everything as a namespace
import * as math from "./math.js";
math.add(2, 3);
math.PI;
```

### Default Exports

```javascript
// user.js — one primary export per file
export default class User {
  constructor(name) {
    this.name = name;
  }
}

// Or for functions:
export default function greet(name) {
  return `Hello, ${name}`;
}
```

```javascript
// Import (no braces needed for default)
import User from "./user.js";
import greet from "./greet.js";

// Can rename freely
import MyUser from "./user.js";
```

### Mixing Named and Default

```javascript
// config.js
export default { apiUrl: "https://api.example.com" };
export const MAX_RETRIES = 3;
export function getConfig() { /* ... */ }

// Import
import config, { MAX_RETRIES, getConfig } from "./config.js";
```

### Module Scope

Every module has its own scope. Variables aren't global unless explicitly exported:

```javascript
// module.js
const secret = "only visible here";    // private to this file
export const publicData = "visible";   // accessible by importers
```

### Dynamic Imports

```javascript
// Load a module only when needed (code splitting)
button.addEventListener("click", async () => {
  const { heavyFunction } = await import("./heavy-module.js");
  heavyFunction();
});

// Conditional loading
if (featureFlag) {
  const module = await import("./experimental.js");
}
```

### Module Patterns for Your Project

```javascript
// Barrel exports — re-export from a central file
// components/index.js
export { Button } from "./button.js";
export { Card } from "./card.js";
export { Modal } from "./modal.js";

// Consumers import from one place:
import { Button, Card, Modal } from "./components/index.js";

// Side-effect imports — just run the module
import "./polyfills.js"; // executes the file, no exports needed
```

## Try It Yourself

1. Create `utils.js` with 3 named exports (functions or constants) and import them elsewhere.
2. Create `User.js` with a default export class and a named export helper function.
3. Set up a barrel export file that re-exports from 3 different module files.
4. Use a dynamic import to load a module only when a button is clicked.

## Common Mistakes

- **Mixing default and named import syntax**: Default imports use no braces; named imports use braces. `import User, { helper } from "./mod"` is correct.
- **Forgetting `.js` extension**: In browser-native ESM and some bundlers, you need the full path. Node.js allows omitting it.
- **Circular dependencies**: Module A imports B, B imports A. This causes `undefined` exports. Restructure to break the cycle.

## Checkpoint

1. What's the difference between default and named exports?
2. How do you import everything from a module under a namespace?
3. When would you use dynamic import over static import?
4. **Reflection**: Sketch the module structure for a to-do app. What would each module export?
