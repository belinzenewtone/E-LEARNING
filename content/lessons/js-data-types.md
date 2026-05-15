# Data Types & Type Coercion

## 🎯 By End of This Lesson You Will:
- Name all 7 primitive types and what each one stores
- Use `typeof` to identify any value's type
- Predict — and prevent — type coercion surprises

---

## 🌍 Real-World Analogy First

Types are like **different kinds of containers in a kitchen**:

| Container | Purpose | JS Type |
|---|---|---|
| Notebook | Words and text | `string` |
| Calculator | Numbers and math | `number` |
| Light switch | On / Off only | `boolean` |
| Empty shelf (forgot) | "Nothing here yet" | `undefined` |
| Empty shelf (deliberate) | "Intentionally nothing" | `null` |

The key rule in the kitchen: **you don't pour milk into a sugar jar**. But JavaScript will try to mix containers — it's called **type coercion**, and it causes silent bugs. Understanding types is how you prevent them.

---

## 📖 The 7 Types — One at a Time

### Type 1: `string` — Any Text

Strings are text. Always wrapped in quotes:

```javascript
const firstName = "Alice";          // double quotes
const city = 'Nairobi';             // single quotes — both work
const message = `Hello, Alice!`;    // backticks — special (more below)
```

**Strings can be added together:**
```javascript
const first = "Hello";
const second = "World";
console.log(first + " " + second);  // "Hello World"
```

**Template literals (backticks) — embed variables:**
```javascript
const name = "Belinze";
const week = 1;
console.log(`Welcome back, ${name}! You're on week ${week}.`);
// "Welcome back, Belinze! You're on week 1."
```

---

### Type 2: `number` — All Numbers

```javascript
const age = 25;           // whole number
const price = 9.99;       // decimal
const temperature = -3;   // negative
const million = 1_000_000; // underscores for readability
```

**Math operations:**
```javascript
10 + 3    // 13  → addition
10 - 3    // 7   → subtraction
10 * 3    // 30  → multiplication
10 / 4    // 2.5 → division
10 % 3    // 1   → remainder (called modulo) — "what's left over?"
2 ** 8    // 256 → exponent ("2 to the power of 8")
```

**Special value: `NaN` (Not a Number)**
```javascript
"hello" - 5   // NaN — can't subtract from a word
0 / 0         // NaN — mathematically undefined
```

`NaN` is JavaScript saying "I tried to do math but it doesn't make sense."

---

### Type 3: `boolean` — Yes or No

Only two possible values:

```javascript
const isLoggedIn = true;
const hasFinished = false;
```

Every comparison you make produces a boolean:

```javascript
5 > 3         // true
10 === 10     // true
"a" === "b"   // false
100 < 50      // false
```

---

### Type 4: `undefined` — "I Don't Have a Value Yet"

```javascript
let score;               // declared but nothing assigned
console.log(score);      // undefined
```

JavaScript itself sets things to `undefined` when no value has been assigned. It's the equivalent of finding an empty form field.

---

### Type 5: `null` — "Intentionally Empty"

```javascript
const selectedUser = null;   // "no user selected — on purpose"
let currentLesson = null;    // "no lesson loaded yet — by choice"
```

**The key difference:**
```
undefined = JavaScript says "I don't have a value"
null      = YOU say "I'm deliberately putting nothing here"
```

---

### Types 6 & 7: `Symbol` and `BigInt`

Advanced types you'll rarely use in the first few months. For now, just know they exist:
```javascript
const uniqueId = Symbol("id");           // unique identifier
const hugeMoney = 9_007_199_254_740_991n; // very large integer (the n suffix)
```

---

## 🔎 `typeof` — Your Type Detective Tool

Use `typeof` to ask: "what type is this value?"

```javascript
typeof "hello"        // "string"
typeof 42             // "number"
typeof true           // "boolean"
typeof undefined      // "undefined"
typeof null           // "object"  ← THE FAMOUS BUG
typeof [1, 2, 3]      // "object"  ← arrays show as object too
typeof { name: "A" }  // "object"
typeof function(){}   // "function"
```

**The `null` bug** — this is a 25-year-old JavaScript mistake that can never be fixed:
```javascript
typeof null === "object"  // true — but null is NOT an object!

// Correct way to check for null:
const value = null;
if (value === null) {
  console.log("it's null");   // ✅ use === not typeof
}
```

---

## ⚡ Type Coercion — The Hidden Behavior

JavaScript automatically converts types when operators expect something different. This is called **type coercion** and it causes real bugs.

### The `+` Operator — String Wins

```javascript
// Number + Number = math
5 + 3             // 8  ✅

// String + Anything = join text (string wins)
"5" + 3           // "53"  ← NOT 8!
"Hello" + 5       // "Hello5"
"Score: " + 100   // "Score: 100"
```

**Visual:**
```
"5"  +  3  →  "5" + "3"  →  "53"   (number became a string)
 5   +  3  →  5   +  3   →   8     (both numbers — math)
```

### Subtraction/Multiplication/Division — Math Wins

```javascript
"10" - 5     // 5   ← "10" converted to number
"10" * 2     // 20  ← "10" converted to number
"hello" - 5  // NaN ← "hello" can't become a number
```

### Real Bug This Causes:

```javascript
// User types their score in a text box
const userInput = "90";         // comes in as a string!
const bonus = 10;
const total = userInput + bonus; // ← "9010" not 100!

// Fix:
const total = Number(userInput) + bonus;  // 100 ✅
// or
const total = parseInt(userInput) + bonus; // 100 ✅
```

---

## 💡 Truthy and Falsy — The 6 False Values

In JavaScript, any value can be used in an `if` condition. These 6 values act as `false`:

```
false, 0, "", null, undefined, NaN
```

**Everything else acts as `true`**, including:
```javascript
"0"      // truthy — it's a non-empty string
"false"  // truthy — it's a non-empty string
[]       // truthy — empty array
{}       // truthy — empty object
-1       // truthy — non-zero number
```

**Why this matters:**
```javascript
const streak = 0;

if (streak) {
  console.log("Great streak!");
} else {
  console.log("No streak yet");  // ← this runs because 0 is falsy
}
```

---

## 🧪 Practice — Try Each One

**Exercise 1 — `typeof` exploration:**
```javascript
// Run these and note what you get:
console.log(typeof 42);
console.log(typeof "hello");
console.log(typeof true);
console.log(typeof undefined);
console.log(typeof null);        // surprise?
console.log(typeof [1, 2, 3]);   // surprise?
console.log(typeof { name: "A" });
```

**Exercise 2 — Predict before running:**
```javascript
console.log("5" + 5);
console.log("5" - 5);
console.log(true + 1);
console.log(false + 10);
console.log("3" * "4");
console.log("hello" - 1);
```

**Exercise 3 — Truthy/Falsy test:**
```javascript
const values = [0, "", null, undefined, NaN, "0", [], {}, -1, "false"];
values.forEach(v => {
  console.log(`${String(v)}: ${v ? "truthy" : "falsy"}`);
});
```

**Exercise 4 — Fix the real bug:**
```javascript
// A user submits a form — age comes as a string
const inputAge = "25";
const yearsUntilRetirement = 65 - inputAge;
console.log(yearsUntilRetirement);
// What do you get? Why? How do you fix it?
```

**Exercise 5 — Safe null check:**
```javascript
function showUserName(user) {
  // user can be an object OR null (not logged in)
  if (user === null) {
    console.log("Not logged in");
  } else {
    console.log("Welcome, " + user.name);
  }
}

showUserName(null);
showUserName({ name: "Belinze" });
```

**Exercise 6 — Build something real:**
```javascript
const lesson = {
  title: "Data Types",
  durationMinutes: 60,
  xpReward: 50,
  completed: false
};

// Calculate how many lessons like this = 1 hour
// Use the number type correctly
const lessonsPerHour = 60 / lesson.durationMinutes;
console.log(`Lessons per hour: ${lessonsPerHour}`);
```

---

## ⚠️ Watch Out For

| Trap | What You See | Fix |
|---|---|---|
| `"5" + 3` | `"53"` | `Number("5") + 3` |
| `typeof null` | `"object"` (wrong!) | Use `value === null` |
| `if (0)` | Never runs — 0 is falsy | Use `if (value !== undefined)` if 0 is valid |
| `"5" == 5` | `true` (coercion) | Always use `===` not `==` |

---

## 🧠 Mental Model

```
Types = what kind of data is stored:
  "text"    → string   → always in quotes
  42, 3.14  → number   → no quotes
  true/false→ boolean  → yes or no answers
  <nothing> → null     → you set it empty
  <missing> → undefined→ JS set it empty

Type coercion = JS tries to "help" by converting types automatically
  + with a string → joins text (even if one side is a number)
  -, *, / → always tries to do math first
```

---

## 📝 Check Your Understanding

1. **Define:** What is the difference between `null` and `undefined`?
2. **Predict:** What does `"10" + 5` produce? What about `"10" - 5`?
3. **Find the bug:** `const total = userInput + taxRate` gives `"9.990.1"` instead of a number. Why? Fix it.
4. **Write it:** Write a `typeof` check AND a `=== null` check that together can correctly identify if a value is `null`.
5. **Apply it:** A user's XP starts at `null` (never logged in) or a number. Write an `if` that handles both cases safely.
6. **Reflect:** Why is understanding type coercion important when building real apps? Give a bug that could happen in a login form.
