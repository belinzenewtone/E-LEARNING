# Functions: Declaration & Expression

## 🎯 By End of This Lesson You Will:
- Write functions that accept inputs and return outputs
- Explain the difference between declaration, expression, and arrow functions
- Use default parameters and apply functions to real problems

---

## 🌍 Real-World Analogy First

A function is a **recipe**.

```
Recipe: "Make Tea"
─────────────────────────────────
Inputs (ingredients): water, tea bag, sugar

Steps:
  1. Boil water
  2. Add tea bag
  3. Wait 3 minutes
  4. Add sugar
  5. Return finished tea

Output: a cup of tea
─────────────────────────────────
```

Once you write the recipe, you can **make tea 1000 times** without rewriting the steps. You just call the recipe:

```
makeTea(water, teaBag, sugar)  →  ☕ cup of tea
makeTea(water, teaBag, sugar)  →  ☕ another cup of tea
```

In code:
```javascript
function makeTea(water, teaBag, sugar) {
  // steps...
  return "☕ cup of tea";
}
```

---

## 📖 Start From Zero

### Your First Function

```javascript
function greet() {
  console.log("Hello, Belinze!");
}

greet();   // call the function
greet();   // call it again — code runs again
```

**Output:**
```
Hello, Belinze!
Hello, Belinze!
```

The code inside `{ }` is the **recipe body**. It only runs when you "call" the function — `greet()`.

---

## 🔨 Level Up — Building Your Functions

### Step 1: Parameters — Inputs to Your Function

```javascript
function greet(name) {        // name is the parameter (input slot)
  console.log("Hello, " + name + "!");
}

greet("Alice");    // "Hello, Alice!"
greet("Belinze");  // "Hello, Belinze!"
greet("Bob");      // "Hello, Bob!"
```

Parameters are like **input slots** in the recipe. When you call the function, you fill the slots with real values ("Alice", "Belinze") — those are called **arguments**.

```
function greet(name)  ← name is a PARAMETER (the slot label)
greet("Alice")        ← "Alice" is the ARGUMENT (the actual value)
```

---

### Step 2: Return Values — Getting Something Back

```javascript
function add(a, b) {
  return a + b;    // the function produces this value
}

const result = add(5, 3);   // result = 8
console.log(result);         // 8

// Use the result directly:
console.log(add(10, 20));    // 30
console.log(add(100, 50));   // 150
```

**Without `return`, a function gives back `undefined`:**
```javascript
function addBad(a, b) {
  a + b;   // ← no return! result goes nowhere
}

console.log(addBad(5, 3));   // undefined ← oops
```

---

### Step 3: Multiple Parameters

```javascript
function calculateXP(lessonsCompleted, streakDays, bonusMultiplier) {
  const base = lessonsCompleted * 50;
  const streakBonus = streakDays * 10;
  const total = (base + streakBonus) * bonusMultiplier;
  return total;
}

console.log(calculateXP(3, 5, 1.5));   // (150 + 50) * 1.5 = 300
console.log(calculateXP(10, 0, 1));    // (500 + 0) * 1 = 500
```

---

### Step 4: Default Parameters

```javascript
function greet(name = "Guest", language = "English") {
  if (language === "English") {
    return `Hello, ${name}!`;
  }
  if (language === "Swahili") {
    return `Habari, ${name}!`;
  }
}

greet();                          // "Hello, Guest!"
greet("Belinze");                 // "Hello, Belinze!"
greet("Belinze", "Swahili");      // "Habari, Belinze!"
```

---

### Step 5: Arrow Functions — Shorter Syntax

Arrow functions are the modern, compact way to write functions:

```javascript
// Old way (function expression)
const add = function(a, b) {
  return a + b;
};

// Arrow function — same thing, shorter
const add = (a, b) => {
  return a + b;
};

// Even shorter — when body is just one expression, drop {} and return
const add = (a, b) => a + b;
```

More examples:
```javascript
const double = n => n * 2;           // one param: no parentheses needed
const sayHi = () => "Hello!";        // no params: empty parentheses required
const square = x => x * x;

console.log(double(5));    // 10
console.log(sayHi());      // "Hello!"
console.log(square(4));    // 16
```

**When to use which:**
```
function declaration  → named functions, called anywhere in file (hoisting)
const fn = function() → function stored in variable
const fn = () =>      → modern shorthand, preferred for short functions
```

---

### Step 6: Function Declarations Are Hoisted

```javascript
// ✅ Call BEFORE the function is defined — works with declarations
console.log(double(4));  // 8

function double(n) {
  return n * 2;
}
```

But this doesn't work with expressions:
```javascript
// ❌ Call BEFORE assignment — ReferenceError
console.log(triple(4));  // ReferenceError!

const triple = n => n * 3;
```

> **Practical rule:** Define functions before you use them. Don't rely on hoisting — it confuses readers.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Your first function:**
```javascript
// Write a function greetUser(name) that returns "Welcome, [name]!"
// Call it with your own name and print the result
```

**Exercise 2 — Math function:**
```javascript
// Write a function calculateArea(width, height) that returns width * height
// Test it with 3 different sets of values
```

**Exercise 3 — Default parameters:**
```javascript
// Write a function logStudySession(minutes, mood = "neutral") that
// returns: "Studied for X minutes. Feeling: Y"
// Test calling with and without the mood argument
```

**Exercise 4 — Convert to arrow function:**
```javascript
// Convert this to an arrow function:
function isEven(n) {
  return n % 2 === 0;
}
// Make it a one-liner with implicit return
```

**Exercise 5 — Real function:**
```javascript
// Write a function getXPLevel(xp) that returns:
// "🆕 Starter"    if xp < 100
// "🌱 Beginner"   if xp < 500
// "⭐ Intermediate" if xp < 1500
// "🏆 Advanced"   if xp >= 1500
```

**Exercise 6 — Functions calling functions:**
```javascript
function celsiusToFahrenheit(c) {
  return (c * 9/5) + 32;
}

function describeTemperature(celsius) {
  const f = celsiusToFahrenheit(celsius);  // call another function!
  if (celsius < 0) return `${f}°F — Freezing!`;
  if (celsius < 20) return `${f}°F — Cool`;
  if (celsius < 35) return `${f}°F — Warm`;
  return `${f}°F — Hot!`;
}

console.log(describeTemperature(30));   // "86°F — Warm"
console.log(describeTemperature(-5));   // "23°F — Freezing!"
```

---

## ⚠️ Watch Out For

| Mistake | Error/Result | Fix |
|---|---|---|
| Forgetting `return` | Function gives back `undefined` | Add `return` to your last expression |
| Calling before `const`/`let` assignment | `ReferenceError` | Use function declarations or define before calling |
| Arrow function with `{}` but no `return` | `undefined` | `{}` requires explicit `return`; or remove `{}` for implicit |
| Wrong number of arguments | `undefined` values, silent bugs | Add default parameters for optional ones |

---

## 🧠 Mental Model

```
function name(param1, param2) {
  // do work
  return value;   ← output
}
               ↑
               inputs

Call:  name(arg1, arg2)  → runs the recipe → returns a value

Arrow function shorthand:
  (a, b) => a + b      (one expression = implicit return)
  (a, b) => { ... }    (block body = needs explicit return)
```

---

## 📝 Check Your Understanding

1. **Define:** What is the difference between a parameter and an argument?
2. **Predict:** What does this return?
   ```javascript
   function mystery(x) {
     x * 2;
   }
   console.log(mystery(5));
   ```
3. **Find the bug:**
   ```javascript
   const multiply = (a, b) => {
     a * b;
   }
   console.log(multiply(3, 4));   // what does this print? why?
   ```
4. **Write it:** Write a function `getLetterGrade(score)` that returns "A", "B", "C", "D", or "F" based on score ranges.
5. **Apply it:** Write a function `formatXP(xp)` that returns `"1,250 XP"` (with comma for thousands). Use `.toLocaleString()`.
6. **Reflect:** Why is it better to write functions that `return` values rather than directly calling `console.log` inside them?
