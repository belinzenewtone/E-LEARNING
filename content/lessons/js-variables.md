# Variables: var, let, const

## 🎯 By End of This Lesson You Will:
- Create variables using `const` and `let`
- Explain the difference between sealed (`const`) and updatable (`let`) variables
- Predict what happens when scoping rules are broken

---

## 🌍 Real-World Analogy First

Imagine a **labelled storage box** in a warehouse.

```
  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
  │  userName    │   │     xp       │   │   isOnline   │
  │ ──────────── │   │ ──────────── │   │ ──────────── │
  │   "Belinze"  │   │     350      │   │    true      │
  └──────────────┘   └──────────────┘   └──────────────┘
```

- The **label on the box** = the variable name
- The **contents of the box** = the value

`const` = the box is **sealed with superglue** — you can't swap out the contents  
`let` = the box has a **normal lid** — you can replace what's inside anytime  
`var` = an old broken box — ignore it for now

---

## 📖 Start From Zero

### Your Very First Variable

Type this and run it:

```javascript
const myName = "Belinze";
console.log(myName);
```

Let's read it piece by piece:

| Piece | What it means |
|---|---|
| `const` | "I'm creating a permanent box" |
| `myName` | "Label it myName" |
| `=` | "Put this value inside:" |
| `"Belinze"` | "The text Belinze" |
| `console.log(...)` | "Show me what's in that box" |

**Output:** `Belinze`

That's it. You stored a value and read it back. That's a variable.

---

## 🔨 Level Up — Three Keywords, One Rule

### Step 1: `const` — Your Default

```javascript
const siteName = "Learning OS";
const weekNumber = 1;
const isAdmin = false;
```

Once set, a `const` variable cannot be replaced:

```javascript
const score = 100;
score = 200; // ❌ TypeError: Assignment to constant variable.
```

You'll see this error the first time you try to change a `const`. That's the point — it's protecting you.

> **Your rule from today:** Always start with `const`. Only switch to `let` if you need to update the value later.

---

### Step 2: `let` — When the Value Changes

Some things in a program change over time — a score, a counter, a status:

```javascript
let xp = 0;             // starts at zero
xp = xp + 50;           // earned 50 XP
xp = xp + 80;           // earned 80 more
console.log(xp);        // 130
```

Shorthand for `xp = xp + 80`:
```javascript
xp += 80;    // add 80
xp -= 10;    // subtract 10
xp *= 2;     // multiply by 2
xp++;        // add 1 (increment)
xp--;        // subtract 1 (decrement)
```

---

### Step 3: Scope — Where Can the Variable Be Seen?

Variables live inside the `{ }` where they were created. Outside those braces, they don't exist.

```javascript
if (true) {
  const message = "Hello!";    // only lives inside this { }
  console.log(message);        // ✅ works — inside the block
}

console.log(message);          // ❌ ReferenceError — outside the block
```

Think of it as rooms in a house — what happens in the room stays in the room.

**The `var` Problem:**

```javascript
if (true) {
  var leaked = "I escape";    // var IGNORES block boundaries
  let safe = "I stay";
}

console.log(leaked);  // "I escape"  ← bug waiting to happen
console.log(safe);    // ❌ ReferenceError — let stayed put
```

This is why `var` was replaced with `let` and `const`. Pretend `var` doesn't exist.

---

### Step 4: `const` With Objects (The Surprise)

```javascript
const user = { name: "Alice", xp: 0 };

// ✅ You CAN change what's INSIDE the object
user.name = "Bob";
user.xp += 100;

// ❌ You CANNOT replace the whole object
user = { name: "Carol" };   // TypeError!
```

Why? The `const` seals the **reference to the box** — not the contents of the box. The object itself can change, but you can't swap out the whole box.

```
Before:  user ──→ { name: "Alice", xp: 0 }
After:   user ──→ { name: "Bob", xp: 100 }   ← same box, new contents ✅
         user ──→ { name: "Carol" }           ← different box entirely ❌
```

---

## 🧪 Practice — Try Each One

**Exercise 1 — Basic:**
Create a variable for your name and print it:
```javascript
const myName = "___";   // your name here
console.log(myName);
```

**Exercise 2 — Update with `let`:**
```javascript
let streak = 0;
streak += 1;   // studied today
streak += 1;   // studied again
console.log("Streak:", streak);   // should be 2
```

**Exercise 3 — Predict the output:**
```javascript
let score = 100;
score *= 2;
score -= 50;
console.log(score);    // what is it?
```

**Exercise 4 — Find and fix the bug:**
```javascript
const level = 1;
level = 2;            // ← what goes wrong here?
console.log(level);
// How do you fix this?
```

**Exercise 5 — Scope trap:**
```javascript
function checkScore() {
  const passing = 50;
  let result = "fail";
  if (score > passing) {
    let result = "pass";   // is this the same result as above?
  }
  console.log(result);     // what does this print?
}

let score = 80;
checkScore();
```

**Exercise 6 — Object contents:**
```javascript
const lesson = {
  title: "Variables",
  completed: false,
  xpReward: 50
};

// Mark as complete and award XP
// Write 2 lines that update the object

console.log(lesson);
```

---

## ⚠️ Watch Out For

| Mistake | Error You'll See | The Fix |
|---|---|---|
| `const x = 5; x = 10` | `TypeError: Assignment to constant variable` | Switch to `let x = 5` |
| Using a variable before declaring it | `ReferenceError: Cannot access before initialization` | Always declare at the top |
| `var` leaking out of blocks | Silent bug — wrong value used | Never use `var` |
| Forgetting you can update object properties | No error, but confused | Remember `const` only seals the reference |

---

## 🧠 Mental Model

```
Variable = named box for a value
  const = sealed box  → you can't replace it (but can update inside for objects)
  let   = open box    → you can replace it anytime
  scope = the { } block → variables only exist inside where they were created
```

---

## 📝 Check Your Understanding

1. **Define:** In one sentence, what does `const` prevent?
2. **Predict:** What does this output?
   ```javascript
   let total = 10;
   total += 5;
   total *= 2;
   console.log(total);
   ```
3. **Find the bug:** What's wrong here?
   ```javascript
   console.log(greeting);
   const greeting = "Hello!";
   ```
4. **Write it:** Declare variables for: a username that won't change, an XP counter that starts at 0, and a boolean for whether the user is subscribed.
5. **Apply it:** A lesson has these properties: slug, title, estimatedMinutes, completed. Write a `const` object for it. Then mark it as completed.
6. **Reflect:** When should you choose `let` over `const`? Give 2 real examples from an app.
