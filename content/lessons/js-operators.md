# Operators & Expressions

## 🎯 By End of This Lesson You Will:
- Use arithmetic, comparison, and logical operators correctly
- Explain why `===` is always safer than `==`
- Combine operators to build real conditions

---

## 🌍 Real-World Analogy First

Operators are like **action verbs** in a sentence. The values are the nouns; operators are what you do with them.

```
NOUNS:  5,  3,  "Alice",  true,  false
VERBS:  +   -   ===       &&     ||
```

```
"5 + 3"            → add 5 and 3
"name === 'Alice'" → check if name is exactly 'Alice'
"isAdmin && online"→ both true at the same time?
```

Without operators, values just sit there. Operators are how your code **does things**.

---

## 📖 Start From Zero

### Arithmetic Operators (Math)

```javascript
10 + 3   // 13   addition
10 - 3   // 7    subtraction
10 * 3   // 30   multiplication
10 / 3   // 3.333... division
10 % 3   // 1    modulo (remainder)
2 ** 8   // 256  exponent (2 to the power of 8)
```

**Modulo (`%`) is the most useful one beginners overlook:**
```javascript
// Is n an even number?
10 % 2  // 0  (even — remainder is 0)
7 % 2   // 1  (odd  — remainder is 1)

// Is this minute on the hour?
const minute = 60;
minute % 60 === 0  // true — divisible by 60
```

---

## 🔨 Level Up

### Step 1: Assignment Operators (Shortcuts)

```javascript
let xp = 100;

xp += 50;   // same as: xp = xp + 50  → 150
xp -= 30;   // same as: xp = xp - 30  → 120
xp *= 2;    // same as: xp = xp * 2   → 240
xp /= 4;    // same as: xp = xp / 4   → 60
xp++;       // same as: xp = xp + 1   → 61
xp--;       // same as: xp = xp - 1   → 60
```

---

### Step 2: Comparison Operators — Always Return Boolean

```javascript
5 > 3       // true   greater than
5 < 3       // false  less than
5 >= 5      // true   greater than or equal
5 <= 4      // false  less than or equal
5 === 5     // true   strictly equal (type AND value)
5 !== 3     // true   not strictly equal
```

### Step 3: `==` vs `===` — The Critical Difference

```javascript
"5" == 5     // true   ⚠️ converts types first (coercion)
"5" === 5    // false  ✅ checks type AND value
0 == false   // true   ⚠️ both treated as "falsy" first
0 === false  // false  ✅ different types

null == undefined   // true   ⚠️
null === undefined  // false  ✅
```

> **Rule:** Always use `===` and `!==`. Never use `==` or `!=`. Type coercion via `==` causes silent bugs that are very hard to find.

---

### Step 4: Logical Operators

```javascript
const age = 22;
const hasAccount = true;

// AND — both must be true
age >= 18 && hasAccount     // true && true = true

// OR — at least one must be true
age >= 18 || hasAccount     // true || true = true (short-circuits at first true)

// NOT — flip the value
!hasAccount                 // false
!(age >= 18)                // false
```

**Truth tables:**
```
AND:  true  && true  → true
      true  && false → false
      false && true  → false
      false && false → false

OR:   true  || true  → true
      true  || false → true
      false || true  → true
      false || false → false
```

---

### Step 5: Short-Circuit Patterns (Used Everywhere)

```javascript
// Default value using ||
const name = userInput || "Anonymous";
// If userInput is "", null, undefined (falsy), use "Anonymous"

// Nullish coalescing using ??
const score = playerScore ?? 0;
// Only falls back if playerScore is null or undefined
// Unlike ||, this works correctly when 0 is a valid score!

// Guard early return
function award(user) {
  if (!user) return;
  if (!user.isActive) return;
  // ... reaching here means user is valid AND active
}
```

> **The difference between `||` and `??`:**
> - `||` falls back on ANY falsy value (`0`, `""`, `false`, `null`, `undefined`)
> - `??` falls back ONLY on `null` or `undefined`
> Use `??` when 0 or "" are valid values.

---

### Step 6: Ternary Operator — Inline if/else

```javascript
const age = 20;

// Old way:
let status;
if (age >= 18) status = "adult";
else status = "minor";

// Ternary — one-liner:
const status = age >= 18 ? "adult" : "minor";
//                ↑          ↑         ↑
//           condition    if true    if false
```

Real example:
```javascript
const xp = 250;
const tier = xp >= 500 ? "Gold" : xp >= 100 ? "Silver" : "Bronze";
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Math:**
```javascript
// Calculate the area of a circle with radius 5
// Hint: area = π × r²  (Math.PI for π, ** for power)
```

**Exercise 2 — Modulo:**
```javascript
// Print "Even" or "Odd" for the number 17
// Hint: use n % 2
```

**Exercise 3 — Comparison:**
```javascript
// Predict each one:
console.log(5 === "5");
console.log(5 == "5");
console.log(0 == false);
console.log(0 === false);
console.log(null == undefined);
```

**Exercise 4 — Logical:**
```javascript
const userAge = 25;
const isVerified = true;
const hasPaid = false;

// Print "Full access" only if user is 18+, verified, AND has paid
// Print "Limited access" if 18+ AND verified (but not paid)
// Print "No access" otherwise
```

**Exercise 5 — Nullish coalescing:**
```javascript
const settings = {
  theme: "dark",
  notifications: 0,   // 0 = silent, but still set!
  name: ""            // empty string is intentional
};

// Use ?? to give safe defaults:
const theme = settings.theme ?? "light";
const notifLevel = settings.notifications ?? 5;
const displayName = settings.name ?? "Guest";

console.log(theme, notifLevel, displayName);
// What does each print? Compare with ||
```

**Exercise 6 — Ternary chain:**
```javascript
const score = 78;
// Use a ternary chain to assign:
// A (>= 90), B (>= 80), C (>= 70), D (>= 60), F (< 60)
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Using `=` in a condition | Always truthy — assigns instead of checks | Use `===` |
| Using `==` everywhere | Silent type coercion bugs | Always use `===` and `!==` |
| `||` when 0 is valid | Falls back to default unexpectedly | Use `??` |
| Mixing `&&` and `||` without parens | Order is ambiguous to readers | Add parentheses for clarity |

---

## 🧠 Mental Model

```
Arithmetic: +, -, *, /, %, **    → produce a number
Comparison: ===, !==, >, <, >=, <=→ produce a boolean
Logical:    &&, ||, !, ??         → combine booleans / fallback
Shortcuts:  +=, -=, *=, ++, --    → update a variable
Ternary:    condition ? a : b    → inline if/else

Rule: Always === (not ==). Always ?? when 0/"" are valid values.
```

---

## 📝 Check Your Understanding

1. **Define:** What does the `%` (modulo) operator do?
2. **Predict:** What is `"3" + 2 * 4`?
3. **Find the bug:** `if (score = 100) { award(); }` — what's wrong?
4. **Write it:** Write a ternary that returns "weekend" if day is "Saturday" or "Sunday", otherwise "weekday".
5. **Apply it:** A `streak` variable starts at 0. Write a fallback using `??` that prints "Start your streak!" only when streak is null/undefined.
6. **Reflect:** Why is `===` always safer than `==`? Give a real example.
