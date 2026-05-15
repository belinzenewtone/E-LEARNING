# Destructuring & Spread/Rest

## 🎯 By End of This Lesson You Will:
- Pull values out of objects and arrays in one line using destructuring
- Use the spread operator `...` to copy and merge objects/arrays
- Use rest parameters to accept a variable number of arguments

---

## 🌍 Real-World Analogy First

**Destructuring** is unpacking a delivery box. Instead of opening the box, looking inside, then pulling each item out one at a time — you label everything and unpack all at once:

```
Without destructuring:
  const name = user.name;
  const email = user.email;
  const age = user.age;          ← 3 lines, repetitive

With destructuring:
  const { name, email, age } = user;   ← 1 line, clean
```

**Spread (`...`)** is the opposite — taking individual items and spreading them out:
```
const a = [1, 2, 3];
const b = [...a, 4, 5];   // [1, 2, 3, 4, 5]  spread "unpacks" a
```

Both use the same `...` syntax but in different positions. The intent is what differs.

---

## 📖 Start From Zero

### Object Destructuring

```javascript
const user = { name: "Alice", email: "a@x.com", xp: 350 };

const { name, xp } = user;
console.log(name); // "Alice"
console.log(xp);   // 350
```

The variable names inside `{ }` must **match the property names** in the object.

---

## 🔨 Level Up

### Step 1: Rename While Destructuring

```javascript
const user = { name: "Alice", xp: 350 };

const { name: userName, xp: totalXP } = user;
console.log(userName); // "Alice"
console.log(totalXP);  // 350
```

### Step 2: Defaults

```javascript
const config = { theme: "dark" };

const { theme, language = "en" } = config;
console.log(theme);    // "dark"
console.log(language); // "en" (default — not in object)
```

### Step 3: Nested Destructuring

```javascript
const order = {
  id: 1,
  customer: { name: "Alice", email: "a@x.com" },
  items: [{ name: "Book", qty: 2 }]
};

const {
  customer: { name, email },
  items: [firstItem]
} = order;

console.log(name, email, firstItem);
```

### Step 4: Array Destructuring

```javascript
const colors = ["red", "green", "blue"];

const [first, second, third] = colors;
console.log(first);  // "red"

// Skip values with commas:
const [, , third2] = colors;
console.log(third2); // "blue"
```

---

### Step 5: Destructuring Function Parameters

The most common modern JS pattern:

```javascript
// Old:
function createUser(opts) {
  const name = opts.name;
  const email = opts.email;
  const role = opts.role || "user";
}

// Modern:
function createUser({ name, email, role = "user" }) {
  console.log(name, email, role);
}

createUser({ name: "Alice", email: "a@x.com" });
```

This pattern is used everywhere in React, Next.js, and modern Node.js.

---

### Step 6: The Spread Operator

**Spread copies/expands an object or array.**

#### Arrays
```javascript
const a = [1, 2, 3];
const b = [...a, 4, 5];        // [1, 2, 3, 4, 5]
const c = [0, ...a, 4];         // [0, 1, 2, 3, 4]
const copy = [...a];            // independent copy
```

#### Objects
```javascript
const defaults = { theme: "dark", lang: "en" };
const userPrefs = { lang: "sw" };

const merged = { ...defaults, ...userPrefs };
// { theme: "dark", lang: "sw" }
// later spreads override earlier
```

#### Updating Without Mutating
```javascript
const user = { name: "Alice", xp: 100 };

// Wrong — mutates the original
user.xp += 50;

// Right — create a new object with the update
const updated = { ...user, xp: user.xp + 50 };
```

This pattern is critical in React state.

---

### Step 7: Rest Parameter

```javascript
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3);          // 6
sum(1, 2, 3, 4, 5);    // 15
```

`...numbers` says "collect ALL arguments into an array called `numbers`."

### Step 8: Mixing Regular and Rest Params

```javascript
function greet(greeting, ...names) {
  return `${greeting}, ${names.join(" and ")}!`;
}

greet("Hello", "Alice", "Bob", "Carol");
// "Hello, Alice and Bob and Carol!"
```

> **Rule:** Rest parameter MUST be the LAST parameter.

### Step 9: Rest in Destructuring

```javascript
const { name, ...others } = { name: "Alice", xp: 100, streak: 5 };
console.log(name);    // "Alice"
console.log(others);  // { xp: 100, streak: 5 }

const [first, ...rest] = [1, 2, 3, 4, 5];
console.log(first); // 1
console.log(rest);  // [2, 3, 4, 5]
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Object destructuring:**
```javascript
const lesson = { slug: "js-loops", title: "Loops", xp: 50, completed: false };
// Destructure title and xp, then console.log them
```

**Exercise 2 — Defaults:**
```javascript
const settings = { theme: "dark" };
// Destructure theme, language (default "en"), notifications (default true)
```

**Exercise 3 — Function params:**
```javascript
// Rewrite to destructure:
function logUser(user) {
  console.log(user.name + " has " + user.xp + " XP");
}
```

**Exercise 4 — Array destructuring:**
```javascript
const [r, g, b] = [255, 128, 0];
// Print each
```

**Exercise 5 — Spread to clone:**
```javascript
const original = { name: "Alice", xp: 100 };
// Make a copy where xp is 200, without mutating original
```

**Exercise 6 — Spread to merge:**
```javascript
const defaults = { fontSize: 14, theme: "dark", autosave: true };
const userOverrides = { fontSize: 16 };
// Merge — user overrides win
```

**Exercise 7 — Rest params:**
```javascript
// Write average(...nums) returning the mean, 0 if no args
```

**Exercise 8 — Rest destructuring:**
```javascript
const user = { id: 1, name: "Alice", email: "a@x.com", password: "secret" };
// Pull password into its own variable, rest into 'publicData'
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| `const [a, b] = { x: 1 }` | Doesn't work | `{}` for objects, `[]` for arrays |
| Spread on nested objects | Shallow copy only | Use `structuredClone()` for deep |
| Rest param not last | Syntax error | Rest must be last |
| Spread on undefined | Error: not iterable | Default: `{ ...(obj \|\| {}) }` |

---

## 🧠 Mental Model

```
Destructuring = UNPACK from object/array
  const { a, b } = obj
  const [x, y] = arr
  const { a = 5 } = obj   (default)
  const { a: x } = obj    (rename)

Spread (...) = EXPAND into another
  [...arr, 4]
  { ...obj, b: 2 }

Rest (...) = COLLECT remaining
  function f(a, ...rest)
  const { a, ...rest } = obj
```

---

## 📝 Check Your Understanding

1. **Define:** When does `...` mean "spread" vs "rest"?
2. **Predict:** `const { a, b = 10, c = 20 } = { a: 1, b: 2 }; console.log(a, b, c);`
3. **Find the bug:** Why does this mutate `arr`?
   ```javascript
   const arr = [1, 2, 3];
   const copy = arr;
   copy.push(4);
   console.log(arr);
   ```
4. **Write it:** `mergeConfig(...configs)` that merges any number of configs, later overriding earlier.
5. **Apply it:** Given `user = { id, password, ...everythingElse }`, write code to log only safe-to-display fields.
6. **Reflect:** Why is `{ ...obj, x: newValue }` preferred over `obj.x = newValue` in React state?
