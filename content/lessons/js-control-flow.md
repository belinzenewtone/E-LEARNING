# Control Flow: if, else, switch

## 🎯 By End of This Lesson You Will:
- Write `if/else` conditions that react to different situations
- Use `switch` for multi-option decisions
- Apply guard clauses to keep code clean and flat

---

## 🌍 Real-World Analogy First

Imagine you're at a **traffic intersection** with a traffic light:

```
  🔴 Red    → STOP — don't proceed
  🟡 Yellow → SLOW DOWN — be careful
  🟢 Green  → GO — proceed safely
```

Your program makes decisions the same way — it checks a condition and picks a path. Without control flow, every program would do the same thing every time, regardless of input. That's not useful.

---

## 📖 Start From Zero

### The Simplest Condition

```javascript
const isLoggedIn = true;

if (isLoggedIn) {
  console.log("Welcome back!");
}
```

Read this as: **"IF** `isLoggedIn` is true, THEN show the welcome message."

If `isLoggedIn` is `false`, nothing happens.

---

## 🔨 Level Up — Building Your Decisions

### Step 1: Add an `else`

```javascript
const isLoggedIn = false;

if (isLoggedIn) {
  console.log("Welcome back!");
} else {
  console.log("Please log in.");
}
```

Now there are two paths:
```
isLoggedIn = true  →  "Welcome back!"
isLoggedIn = false →  "Please log in."
```

---

### Step 2: Add `else if` for Multiple Options

```javascript
const xp = 350;

if (xp >= 500) {
  console.log("🏆 Champion");
} else if (xp >= 300) {
  console.log("⭐ Advanced");     // ← this runs for xp = 350
} else if (xp >= 100) {
  console.log("🌱 Beginner");
} else {
  console.log("🆕 New learner");
}
```

**How it works — only the FIRST true condition runs:**
```
xp = 350
  Is 350 >= 500? No → skip
  Is 350 >= 300? YES → run "Advanced", STOP checking
```

Even though `350 >= 100` is also true, it never gets checked because we already found our match.

---

### Step 3: Comparison Operators

```javascript
5 > 3      // true  (greater than)
5 < 3      // false (less than)
5 >= 5     // true  (greater than OR equal)
5 <= 4     // false (less than OR equal)
5 === 5    // true  (exactly equal — type AND value)
5 !== 3    // true  (not equal)
5 == "5"   // true  (⚠️ loose equality — converts types, AVOID)
5 === "5"  // false (strict equality — correct way)
```

> **Rule:** Always use `===` (three equals signs). Never use `==` (two equals signs) — it does automatic type conversion and causes bugs.

---

### Step 4: Logical Operators — Combining Conditions

```javascript
const age = 20;
const hasAccount = true;

// AND — both must be true
if (age >= 18 && hasAccount) {
  console.log("Full access granted");
}

// OR — at least one must be true
if (age >= 18 || hasAccount) {
  console.log("Some access granted");
}

// NOT — flips the value
if (!hasAccount) {
  console.log("Please create an account");
}
```

**Visual:**
```
age=20, hasAccount=true

AND: Is age >= 18? YES. Is hasAccount true? YES. → true
OR:  Is age >= 18? YES. → true (don't even check second condition!)
NOT: Is hasAccount true? YES → flip it → false → block doesn't run
```

---

### Step 5: Truthy/Falsy Shortcut

You don't always need `=== true`:

```javascript
const username = "Alice";
const noName = "";

// Long way:
if (username !== "" && username !== null && username !== undefined) { ... }

// Short way (falsy check):
if (username) {
  console.log("Hello, " + username);
} else {
  console.log("Name required");
}
```

Empty string `""`, `null`, `undefined`, `0`, `NaN`, and `false` are all "falsy" — they act as false in conditions.

---

### Step 6: The `switch` Statement

Use `switch` when you're comparing **one value against many options**:

```javascript
const difficulty = "intermediate";

switch (difficulty) {
  case "beginner":
    console.log("Start with the basics");
    break;
  case "intermediate":
    console.log("Ready for more challenge");  // ← this runs
    break;
  case "advanced":
    console.log("Expert territory");
    break;
  default:
    console.log("Unknown difficulty");
}
```

> **Critical:** Never forget `break`! Without it, execution "falls through" to the next case and runs everything below it. This is one of the most common bugs beginners hit.

**Fall-through (intentional grouping):**
```javascript
const day = "Saturday";

switch (day) {
  case "Saturday":
  case "Sunday":
    console.log("Weekend!");   // runs for both Saturday and Sunday
    break;
  default:
    console.log("Weekday");
}
```

---

### Step 7: Guard Clauses — Exit Early, Stay Flat

Instead of nesting `if` inside `if` inside `if`:

```javascript
// ❌ Deep nesting — hard to read
function awardXP(user) {
  if (user) {
    if (user.isActive) {
      if (user.streak > 0) {
        console.log("XP awarded!");
      }
    }
  }
}

// ✅ Guard clauses — check invalid cases first and exit early
function awardXP(user) {
  if (!user) return;           // guard: no user
  if (!user.isActive) return;  // guard: not active
  if (user.streak <= 0) return; // guard: no streak

  console.log("XP awarded!");  // only reaches here if all checks pass
}
```

Guard clauses make code flat and readable. Each line says "if this is wrong, bail out."

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Basic if/else:**
```javascript
const score = 72;
// Write if/else to print:
// "Pass" if score >= 50
// "Fail" if less than 50
```

**Exercise 2 — Grade calculator:**
```javascript
const mark = 88;
// Print: A (90+), B (80-89), C (70-79), D (60-69), F (below 60)
// Use if/else if/else
```

**Exercise 3 — Logical operators:**
```javascript
const age = 16;
const parentalConsent = true;

// Print "Allowed" only if age >= 18 OR has parental consent
// Print "Not allowed" otherwise
```

**Exercise 4 — switch:**
```javascript
const trackSlug = "web";
// Use switch to print:
// "web" → "Web Development Track"
// "data-engineering" → "Data Engineering Track"
// "python-fastapi" → "Python & FastAPI Track"
// anything else → "Unknown Track"
```

**Exercise 5 — Guard clauses:**
```javascript
function logStudySession(user, minutes) {
  // Add guard clauses to exit early if:
  // 1. user is null
  // 2. minutes is 0 or less
  // Then: console.log(`${user.name} studied for ${minutes} minutes`)
}

logStudySession(null, 30);           // should do nothing
logStudySession({ name: "Belinze" }, 0);  // should do nothing
logStudySession({ name: "Belinze" }, 45); // should log
```

**Exercise 6 — Build the XP check:**
```javascript
function canUnlockLesson(user, requiredXP) {
  // Return true only if:
  // - user exists
  // - user.isActive is true
  // - user.xp >= requiredXP
}

console.log(canUnlockLesson(null, 100));
console.log(canUnlockLesson({ isActive: false, xp: 200 }, 100));
console.log(canUnlockLesson({ isActive: true, xp: 150 }, 100));
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Using `=` instead of `===` | `if (x = 5)` — always true, and changes x! | Use `===` |
| Forgetting `break` in switch | Runs all cases below the match | Add `break` after every case |
| Deep nesting | Hard to read, easy to miss bugs | Use guard clauses |
| `else if` after `else` | `SyntaxError` | `else` must come last |

---

## 🧠 Mental Model

```
if (condition) {
  // runs if condition is truthy
} else if (anotherCondition) {
  // runs if first was false and this is truthy
} else {
  // runs if nothing above was truthy
}

→ Only the FIRST matching branch runs. Rest are skipped.
→ Guard clause = check what's wrong first, exit early, rest of code is the happy path
```

---

## 📝 Check Your Understanding

1. **Define:** What is a "falsy" value? List 3 examples.
2. **Predict:** What does this print?
   ```javascript
   let x = 0;
   if (x) { console.log("A"); } else { console.log("B"); }
   ```
3. **Find the bug:**
   ```javascript
   switch (status) {
     case "active":
       console.log("Active");
     case "paused":
       console.log("Paused");  // why does this ALWAYS print?
   }
   ```
4. **Write it:** Write a function `getAccessLevel(xp)` that returns `"bronze"` (0-99), `"silver"` (100-499), `"gold"` (500-999), `"platinum"` (1000+).
5. **Apply it:** Rewrite this using guard clauses:
   ```javascript
   function process(data) {
     if (data) {
       if (data.items) {
         if (data.items.length > 0) {
           console.log("Processing...");
         }
       }
     }
   }
   ```
6. **Reflect:** When is `switch` better than `if/else if`? When is it worse?
