# Debugging JavaScript

## 🎯 By End of This Lesson You Will:
- Use `console.log`, `console.table`, and other console methods effectively
- Read JavaScript error messages and stack traces
- Use breakpoints in Chrome DevTools to pause and inspect code

---

## 🌍 Real-World Analogy First

**Debugging is detective work.** Your code is the crime scene. The bug is the suspect. You don't randomly guess who did it — you gather evidence: where did things go wrong? What was the value of X at that moment? What was supposed to happen vs what did?

Three tools any detective uses:
1. **Magnifying glass** → `console.log` and other console methods
2. **Pause time** → breakpoints in DevTools
3. **Read the witness statement** → error messages (don't ignore them!)

Bad debugging is changing random lines hoping the bug goes away. Good debugging is systematically finding **what is actually happening**, then fixing it.

---

## 📖 Start From Zero

### The Most Important Tool: `console.log`

```javascript
const xp = 250;
console.log(xp);              // 250
console.log("xp is", xp);     // xp is 250

// Debug an object
const user = { name: "Alice", xp: 250, streak: 7 };
console.log(user);
// Expands in DevTools to show all properties
```

---

## 🔨 Level Up

### Step 1: The 7 console Methods Worth Knowing

```javascript
console.log("regular message")      // gray "info" output
console.info("info message")        // blue info icon
console.warn("warning!")            // yellow warning
console.error("ERROR!")             // red error message
console.table(arrayOrObject)        // formats arrays/objects as a table
console.group("group label")        // start a collapsible group
console.groupEnd()                  // close the group
console.time("query")               // start a timer
console.timeEnd("query")            // print elapsed time
```

### Step 2: `console.table` — A Hidden Gem

For arrays of objects (the most common shape of real data):

```javascript
const users = [
  { name: "Alice", xp: 250, streak: 7 },
  { name: "Belinze", xp: 500, streak: 14 },
  { name: "Carol", xp: 120, streak: 3 }
];

console.table(users);
```

Output in DevTools:
```
┌─────────┬───────────┬─────┬────────┐
│ (index) │   name    │ xp  │ streak │
├─────────┼───────────┼─────┼────────┤
│    0    │ "Alice"   │ 250 │   7    │
│    1    │ "Belinze" │ 500 │  14    │
│    2    │ "Carol"   │ 120 │   3    │
└─────────┴───────────┴─────┴────────┘
```

So much more readable than `console.log(users)`.

---

### Step 3: Labeled Logs

When you have many console.logs, labels save your sanity:

```javascript
console.log("xp before bonus:", xp);
xp += bonus;
console.log("xp after bonus:", xp);
console.log("user state:", user);
```

Better than:
```javascript
console.log(xp);
console.log(xp);   // ← which one is this?!
```

### Step 4: Reading Error Messages

```javascript
const user = null;
console.log(user.name);
```

```
TypeError: Cannot read properties of null (reading 'name')
    at script.js:2:18
```

Read the error in 3 parts:
1. **Error type**: `TypeError` — wrong type of operation
2. **What happened**: "Cannot read properties of null (reading 'name')"
3. **Where**: `script.js:2:18` → line 2, column 18

Most common errors:

| Error | Means | Common Cause |
|---|---|---|
| `TypeError: Cannot read properties of undefined` | Tried to access property on undefined | Object not loaded yet, typo in name |
| `TypeError: x is not a function` | Called something that isn't a function | Typo, accidentally reassigned |
| `ReferenceError: x is not defined` | Used a variable that doesn't exist | Typo, declaration missing |
| `SyntaxError: Unexpected token` | Code structure broken | Missing }, ), or "; or extra one |
| `RangeError: Maximum call stack` | Infinite recursion | Function calls itself without exit condition |

---

### Step 5: Stack Traces — The Path of Execution

```javascript
function a() { b(); }
function b() { c(); }
function c() { throw new Error("Oops"); }
a();
```

```
Error: Oops
    at c (script.js:3:24)   ← where the error happened
    at b (script.js:2:16)   ← who called c
    at a (script.js:1:16)   ← who called b
    at script.js:4:1        ← who called a
```

Read it **top to bottom** = innermost to outermost. The top is where the error actually fired.

---

### Step 6: Breakpoints in Chrome DevTools

`console.log` is fast, but breakpoints are stronger:

1. Open DevTools (`F12` or `Cmd+Option+I`)
2. Go to **Sources** tab
3. Find your file in the file tree
4. **Click the line number** to set a breakpoint (blue marker)
5. Reload the page — execution pauses at that line
6. Hover over variables to see current values
7. Use the controls:
   - ▶ **Resume** — continue execution
   - ↪ **Step over** — run next line, stay at current function
   - ↘ **Step into** — go inside the function call
   - ↗ **Step out** — finish current function

Breakpoints let you see EVERY variable's state at any moment — no need to add `console.log` everywhere.

### Step 7: The `debugger` Statement

Put this anywhere in your code:

```javascript
function calculateXP(amount) {
  debugger;   // execution will pause here if DevTools is open
  return amount * 1.5;
}
```

It's like a breakpoint set from inside the code itself.

---

### Step 8: The Debugging Checklist

When you have a bug, follow these in order:

```
1. READ the error message — don't skip it
2. CHECK the line number it points to
3. LOG the variables just before the error
4. SIMPLIFY — comment out unrelated code to isolate the bug
5. REPRODUCE — confirm it happens consistently
6. EXPLAIN to a rubber duck (or yourself) — say each line out loud
7. CHANGE one thing at a time — never multiple
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — console.log basics:**
```javascript
const score = 85;
const passing = 60;
// Use console.log with labels to print both:
// "score: 85"
// "passing: 60"
// "passed: true"
```

**Exercise 2 — console.table:**
```javascript
const lessons = [
  { slug: "js-variables", completed: true, xp: 50 },
  { slug: "js-loops", completed: false, xp: 50 },
  { slug: "js-functions", completed: true, xp: 80 }
];
// Use console.table to display
```

**Exercise 3 — Read the error:**
```javascript
const user = { name: "Alice" };
console.log(user.address.city);
// Run this. What error appears? What does it mean? How would you guard against it?
```

**Exercise 4 — Find the bug:**
```javascript
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {  // ← off-by-one bug
    total += items[i].price;
  }
  return total;
}

const items = [{ price: 10 }, { price: 20 }, { price: 30 }];
console.log(calculateTotal(items));
// What error do you get? What's the bug? Use console.log inside the loop.
```

**Exercise 5 — Console timer:**
```javascript
// Use console.time and console.timeEnd to measure
// how long a 1-million-iteration loop takes
```

**Exercise 6 — debugger statement:**
```javascript
function processOrder(order) {
  debugger;
  const tax = order.subtotal * 0.16;
  const total = order.subtotal + tax;
  return total;
}
// Open DevTools, run this, and step through to see tax and total
processOrder({ subtotal: 1000 });
```

**Exercise 7 — Detective challenge:**
```javascript
const cart = [
  { name: "Book", price: 200, qty: 2 },
  { name: "Pen", price: 50, qty: 5 },
  { name: "Notebook", price: null, qty: 3 }  // ← bad data!
];

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

console.log(cartTotal(cart));
// You get NaN. Why? Use console.log inside .reduce to find the culprit row.
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Ignoring error messages | Random guessing | Always read the error first |
| Changing multiple things at once | Don't know what fixed it | Change ONE thing, test, repeat |
| Removing console.logs after fixing | Lose context for next bug | Use breakpoints OR leave debug logs commented |
| Trying to debug without reading the code | Going in circles | Read the function top-to-bottom first |
| Not reproducing the bug | "It works on my machine" | Make sure you can trigger the bug consistently |

---

## 🧠 Mental Model

```
Debugging is detective work, not guessing:

  1. Read the error          → what type? what line?
  2. Add console.log         → log variables BEFORE the error point
  3. Use console.table       → for arrays/objects
  4. Set breakpoints         → step through execution
  5. Simplify                → isolate the smallest broken case
  6. Change ONE thing        → confirm what's the fix
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between a `TypeError` and a `ReferenceError`?
2. **Predict:** What error does this produce?
   ```javascript
   const arr = [1, 2, 3];
   console.log(arr.length());
   ```
3. **Find the bug:**
   ```javascript
   function greet(user) {
     console.log("Hello, " + user.name.toUpperCase());
   }
   greet();
   // What error? Why? How do you fix it defensively?
   ```
4. **Write it:** Add labelled console.logs to this function to debug why it returns NaN:
   ```javascript
   function avg(nums) {
     let sum = 0;
     for (const n of nums) sum += n;
     return sum / nums.lenght;  // typo here!
   }
   ```
5. **Apply it:** When would you use `debugger` over `console.log`? When the opposite?
6. **Reflect:** Describe a bug you've seen (or imagine one) where reading the stack trace would have saved 10+ minutes.
