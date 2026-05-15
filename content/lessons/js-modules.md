# ES Modules: import & export

## 🎯 By End of This Lesson You Will:
- Split your code across multiple files using `export` / `import`
- Distinguish named exports from default exports
- Understand the difference between ES Modules and CommonJS (Node.js)

---

## 🌍 Real-World Analogy First

Modules are like the **chapters of a book** instead of one giant scroll. Each chapter (file) has its own focused content. You can reference other chapters as needed.

```
Without modules (one big file):
  app.js — 5000 lines of mixed everything → unreadable, unmaintainable

With modules (one file per concern):
  utils/dates.js    → date helpers
  utils/format.js   → text formatting
  services/xp.js    → XP calculation logic
  components/Card.js → UI card
  app.js            → wires them together with imports
```

Modules let you organize code into **small, focused pieces** — and reuse them across projects.

---

## 📖 Start From Zero

### Two Files

**File 1: `math.js`**
```javascript
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}
```

**File 2: `app.js`**
```javascript
import { add, multiply } from "./math.js";

console.log(add(2, 3));        // 5
console.log(multiply(4, 5));   // 20
```

That's it. One file defines functions and `export`s them. Another `import`s them and uses them.

---

## 🔨 Level Up

### Step 1: Named Exports

You can export multiple things by name:

```javascript
// utils.js
export const PI = 3.14159;
export function double(n) { return n * 2; }
export class Calculator { /* ... */ }

// alternative: export at the bottom
function triple(n) { return n * 3; }
const E = 2.71828;
export { triple, E };
```

Imports must use the exact names:
```javascript
import { PI, double, Calculator, triple, E } from "./utils.js";
```

### Step 2: Renaming on Import

```javascript
import { double as makeDouble } from "./utils.js";

makeDouble(5);   // 10
```

Useful when names conflict with existing variables.

---

### Step 3: Default Exports — One Main Thing Per File

```javascript
// User.js
export default class User {
  constructor(name) { this.name = name; }
}

// Or for a function:
export default function greet(name) {
  return `Hello, ${name}`;
}
```

```javascript
// importing a default — no braces, you choose the name
import User from "./User.js";
import greet from "./greet.js";
import WhateverIWant from "./User.js";   // ← name is up to you
```

**Default vs named:**
```javascript
// You can mix them in one file:
export default class Lesson { /* ... */ }
export const LESSON_TYPES = ["video", "text", "quiz"];

// Import:
import Lesson, { LESSON_TYPES } from "./Lesson.js";
```

---

### Step 4: Importing Everything as a Namespace

```javascript
// math.js exports add, subtract, multiply, divide

import * as Math from "./math.js";

Math.add(2, 3);
Math.subtract(10, 4);
```

Useful for utility libraries with many small functions.

---

### Step 5: Side-Effect Imports

```javascript
import "./polyfills.js";          // runs the file, imports nothing
import "./styles.css";              // common in bundled apps
```

The file runs for its side effects (like setting up global state or applying styles), but you don't use any exports.

---

### Step 6: Re-exporting (Barrel Files)

A common pattern is a barrel `index.js` that re-exports from multiple files:

```javascript
// components/index.js
export { Button } from "./Button.js";
export { Card } from "./Card.js";
export { Modal } from "./Modal.js";

// Then anywhere else:
import { Button, Card, Modal } from "./components";
// One clean import line instead of 3
```

---

### Step 7: ES Modules vs CommonJS

You'll encounter two module systems in JavaScript:

| ES Modules (modern) | CommonJS (Node.js classic) |
|---|---|
| `import x from "..."` | `const x = require("...")` |
| `export default x` | `module.exports = x` |
| Static (analyzed at compile time) | Dynamic (analyzed at runtime) |
| Used everywhere modern | Older Node.js code |
| Browser-native | Node.js only |

```javascript
// CommonJS (old way, still works in Node.js):
const fs = require("fs");
module.exports = function () { /* ... */ };

// ES Modules (modern):
import fs from "fs";
export default function () { /* ... */ };
```

Modern Node.js (16+) supports ES Modules. Set `"type": "module"` in `package.json` to use them.

---

### Step 8: Imports Are Hoisted (Like Function Declarations)

```javascript
greet();  // works! imports are hoisted to the top

import { greet } from "./greet.js";
```

But the code above is bad style — always put imports at the top of the file.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Two files:**
```javascript
// Create math.js with export function add(a, b)
// Create app.js that imports and uses it
```

**Exercise 2 — Multiple named exports:**
```javascript
// In date-utils.js, export:
//   - formatDate(date) — returns "YYYY-MM-DD"
//   - daysAgo(date) — returns number of days ago
// In app.js, import both and call them
```

**Exercise 3 — Default export:**
```javascript
// Create User.js with a default export: class User
// Import it elsewhere with your own name
```

**Exercise 4 — Mixed:**
```javascript
// In lesson.js:
//   default export: Lesson class
//   named export: LESSON_TYPES (array)
// Import both in another file
```

**Exercise 5 — Renaming:**
```javascript
// You have two files that both export "format"
// Import them with different aliases (e.g. formatDate, formatMoney)
```

**Exercise 6 — Namespace:**
```javascript
// Import an entire module's exports as a namespace
// Call several functions through the namespace object
```

**Exercise 7 — Barrel file:**
```javascript
// Create:
//   components/Button.js — exports Button
//   components/Card.js — exports Card
//   components/index.js — re-exports both
// Import both from a single line: import { Button, Card } from "./components"
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Forgetting `.js` extension in imports | Errors in Node.js, works in bundlers | Be consistent — use extensions in raw ES Modules |
| Default export with `{}` import | `import { User }` ≠ `import User` | Default = no braces; named = with braces |
| Circular imports | Some values appear undefined | Refactor — extract shared code to a third file |
| Mixing ES Modules and CommonJS | Some imports fail | Stick to one style per project |
| Putting imports after code | Confusing | Always at the top of the file |

---

## 🧠 Mental Model

```
File A:                           File B:
  export const X = 1;             import { X } from "./A.js";
  export function f() {}          import { f as run } from "./A.js";
  export default Thing;           import Thing from "./A.js";
                                  import * as A from "./A.js";

Named export   ↔ named import   (braces required, names must match)
Default export ↔ default import (no braces, name is your choice)
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between a named export and a default export?
2. **Predict:** What does this print?
   ```javascript
   // a.js
   export const x = 1;
   export default 99;
   
   // b.js
   import y, { x } from "./a.js";
   console.log(y, x);
   ```
3. **Find the bug:**
   ```javascript
   // utils.js exports `format` as default
   import { format } from "./utils.js";
   // What error appears?
   ```
4. **Write it:** Create three files — one with constants, one with helpers, and one (index.js) that re-exports both.
5. **Apply it:** Refactor a script you've written into multiple files using exports.
6. **Reflect:** Why are modules a critical feature for large applications? What would maintenance look like without them?
