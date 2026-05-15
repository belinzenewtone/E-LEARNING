# Objects: Properties & Methods

## 🎯 By End of This Lesson You Will:
- Create objects that group related data and behaviour together
- Access and update properties using dot and bracket notation
- Loop through object keys and values

---

## 🌍 Real-World Analogy First

An object is a **form or profile** — a collection of labelled fields about one thing:

```
┌────────────────────────────────────────┐
│           USER PROFILE                 │
├────────────────┬───────────────────────┤
│ name           │ "Belinze"             │
│ email          │ "b.newtone@jtl.co.ke" │
│ xp             │ 350                   │
│ streak         │ 7                     │
│ isActive       │ true                  │
│ currentTrack   │ "web"                 │
└────────────────┴───────────────────────┘
```

In code, this becomes:

```javascript
const user = {
  name: "Belinze",
  email: "b.newtone@jtl.co.ke",
  xp: 350,
  streak: 7,
  isActive: true,
  currentTrack: "web"
};
```

The left side of each line = the **key** (field label)  
The right side = the **value** (the data)

---

## 📖 Start From Zero

### Your First Object

```javascript
const lesson = {
  title: "Objects",
  slug: "js-objects",
  estimatedMinutes: 60,
  completed: false
};
```

### Reading Values — Dot Notation

```javascript
console.log(lesson.title);             // "Objects"
console.log(lesson.estimatedMinutes);  // 60
console.log(lesson.completed);         // false
```

Read `lesson.title` as: "Go into the `lesson` object and get the `title` field."

---

## 🔨 Level Up

### Step 1: Dot vs Bracket Notation

Two ways to access values:

```javascript
const user = { name: "Alice", xp: 500 };

// Dot notation — the common way
user.name    // "Alice"
user.xp      // 500

// Bracket notation — when the key is a variable or has special characters
const field = "name";
user[field]      // "Alice" — uses the VALUE of field
user["name"]     // "Alice" — same result

// Only brackets work for keys with spaces or special characters:
const prefs = { "dark-mode": true };
prefs["dark-mode"]   // true
// prefs.dark-mode   // ❌ SyntaxError!
```

> **Bracket notation rule:** Use it when the key is stored in a variable, or when the key has spaces/dashes/special characters.

---

### Step 2: Updating Values

```javascript
const user = { name: "Alice", xp: 0, streak: 0 };

// Update existing property
user.xp = 100;
user.streak += 1;

// Add new property
user.lastLoginDate = "2026-05-15";
user.badges = ["first-lesson", "three-day-streak"];

console.log(user);
// {
//   name: "Alice", xp: 100, streak: 1,
//   lastLoginDate: "2026-05-15",
//   badges: ["first-lesson", "three-day-streak"]
// }
```

---

### Step 3: Nested Objects

Objects can contain other objects (and arrays):

```javascript
const lesson = {
  title: "Objects",
  module: {
    name: "JavaScript Foundations",
    order: 1
  },
  checkpointQuestions: [
    { type: "multiple-choice", question: "What is an object?" },
    { type: "reflection", question: "How would you model a car as an object?" }
  ]
};

// Accessing nested values — chain the dots
console.log(lesson.module.name);               // "JavaScript Foundations"
console.log(lesson.checkpointQuestions[0].type); // "multiple-choice"
```

---

### Step 4: Methods — Functions Inside Objects

When a function is stored as an object property, it's called a **method**:

```javascript
const user = {
  name: "Alice",
  xp: 0,
  streak: 0,

  // This is a method — a function that belongs to this object
  addXP(amount) {
    this.xp += amount;
    console.log(`${this.name} now has ${this.xp} XP`);
  },

  resetStreak() {
    this.streak = 0;
    console.log("Streak reset");
  }
};

user.addXP(50);     // "Alice now has 50 XP"
user.addXP(80);     // "Alice now has 130 XP"
user.resetStreak(); // "Streak reset"
```

`this` inside a method refers to the object itself — it's how the method can access the object's own data.

---

### Step 5: `Object.keys()`, `Object.values()`, `Object.entries()`

```javascript
const scores = {
  javascript: 92,
  sql: 85,
  typescript: 78
};

Object.keys(scores)
// ["javascript", "sql", "typescript"]

Object.values(scores)
// [92, 85, 78]

Object.entries(scores)
// [["javascript", 92], ["sql", 85], ["typescript", 78]]
```

### Looping Over an Object

```javascript
for (const [subject, score] of Object.entries(scores)) {
  console.log(`${subject}: ${score}`);
}
// javascript: 92
// sql: 85
// typescript: 78
```

---

### Step 6: Destructuring — Pull Properties Out

```javascript
const user = { name: "Alice", xp: 500, streak: 7, isActive: true };

// Old way:
const name = user.name;
const xp = user.xp;

// Destructuring — pull multiple at once:
const { name, xp, streak } = user;
console.log(name);    // "Alice"
console.log(xp);      // 500
console.log(streak);  // 7

// Rename while destructuring:
const { name: userName, xp: totalXP } = user;
console.log(userName);  // "Alice"
console.log(totalXP);   // 500

// Default value if missing:
const { badge = "none" } = user;
console.log(badge);     // "none" (user didn't have this property)
```

---

### Step 7: Spread — Copy and Merge Objects

```javascript
const defaults = { theme: "dark", language: "en", notifications: true };
const userPrefs = { theme: "light", language: "sw" };

// Merge — userPrefs overrides defaults
const finalSettings = { ...defaults, ...userPrefs };
console.log(finalSettings);
// { theme: "light", language: "sw", notifications: true }

// Copy an object (not the same reference)
const original = { name: "Alice", xp: 100 };
const copy = { ...original };
copy.xp = 200;
console.log(original.xp);   // 100 — original unchanged
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Create a profile:**
```javascript
// Create a const object called "profile" with:
// - name (your name)
// - currentWeek (number)
// - xp (start at 0)
// - completedLessons (empty array)
// Print each value using dot notation
```

**Exercise 2 — Update:**
```javascript
const progress = { lessonsCompleted: 0, xp: 0, streak: 0 };

// Simulate completing 3 lessons:
// Each lesson: +1 lesson, +50 XP, +1 streak
// Show the final progress object
```

**Exercise 3 — Nested:**
```javascript
const course = {
  name: "Web Development",
  instructor: { name: "Self-taught", country: "Kenya" },
  modules: ["JS Foundations", "TypeScript", "React"]
};

// Access: instructor's country
// Access: the second module
```

**Exercise 4 — Destructuring:**
```javascript
const lesson = {
  title: "Objects",
  slug: "js-objects",
  xpReward: 50,
  difficulty: "beginner"
};

// Destructure: title, xpReward, and difficulty
// Print: "Lesson: Objects (+50 XP) — beginner"
```

**Exercise 5 — Loop over object:**
```javascript
const trackProgress = {
  javascript: 0.45,    // 45%
  sql: 0.30,
  typescript: 0.10,
  fastapi: 0
};

// Loop and print each track's progress as a percentage:
// "javascript: 45%"
// "sql: 30%"
// etc.
```

**Exercise 6 — Build something real:**
```javascript
// Build a lesson tracker object with a method
const tracker = {
  lessons: [],
  totalXP: 0,

  complete(lessonTitle, xpEarned) {
    // Add lessonTitle to this.lessons array
    // Add xpEarned to this.totalXP
    // console.log a summary
  }
};

tracker.complete("Variables", 50);
tracker.complete("Data Types", 50);
tracker.complete("Control Flow", 50);
console.log("Total lessons:", tracker.lessons.length);
console.log("Total XP:", tracker.totalXP);
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| `user.dark-mode` | SyntaxError | Use `user["dark-mode"]` |
| `this` in arrow function method | `this` is wrong context | Use regular function for methods |
| Reading from undefined nested property | `TypeError: Cannot read properties of undefined` | Use optional chaining: `user?.address?.city` |
| Comparing objects with `===` | `{} === {}` is `false` (different references) | Compare individual properties |

---

## 🧠 Mental Model

```
Object = named container with labelled fields
  { key: value, key: value }

Access:   object.key           (dot notation — common)
          object["key"]        (bracket notation — for variables/special keys)

Update:   object.key = newValue

Methods:  functions inside objects — use this to access own data

Shortcuts:
  Object.keys(obj)     → array of key names
  Object.values(obj)   → array of values
  Object.entries(obj)  → array of [key, value] pairs
  { ...obj }           → copy/spread
  const { a, b } = obj → destructuring
```

---

## 📝 Check Your Understanding

1. **Define:** What is the difference between dot notation and bracket notation?
2. **Predict:** What does this print?
   ```javascript
   const obj = { a: 1, b: 2 };
   const key = "b";
   console.log(obj[key]);
   ```
3. **Find the bug:**
   ```javascript
   const user = { name: "Alice" };
   console.log(user.email.toUpperCase());  // what error? why?
   ```
4. **Write it:** Create a `lesson` object with a `complete()` method that sets `completed: true` and returns the XP reward.
5. **Apply it:** You have a `config` object with 10 settings. You want to update 3 of them without changing the others. Use spread operator.
6. **Reflect:** Arrays store ordered lists. Objects store named data. Give a real example of when you'd choose one over the other.
