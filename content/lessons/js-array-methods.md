# Array Methods: map, filter, reduce

## 🎯 By End of This Lesson You Will:
- Transform every item in an array using `map`
- Select items matching a condition using `filter`
- Combine items into one value using `reduce`
- Chain these methods for expressive data transformations

---

## 🌍 Real-World Analogy First

Think of an assembly line in a factory:

```
INPUT items  ──►  process  ──►  OUTPUT

map:    [🍎🍎🍎] ──peel──► [🍎(peeled), 🍎(peeled), 🍎(peeled)]
                          same count, each transformed

filter: [🍎🍌🍎] ──keep apples──► [🍎🍎]
                          same or fewer, each unchanged

reduce: [🍎🍎🍎] ──juice──► 🥤
                          ONE result combining all inputs
```

Once these three click, you'll see them everywhere — and use them daily.

---

## 📖 Start From Zero

### `map` — Transform Every Item

```javascript
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log(doubled);  // [2, 4, 6, 8, 10]
console.log(numbers);  // [1, 2, 3, 4, 5] — unchanged!
```

`map` always returns an array with the **same length** as the input.

---

## 🔨 Level Up

### Step 1: map with Objects

```javascript
const users = [
  { name: "Alice", xp: 100 },
  { name: "Bob", xp: 250 },
  { name: "Carol", xp: 50 }
];

const names = users.map(u => u.name);
// ["Alice", "Bob", "Carol"]

const summaries = users.map(u => ({
  name: u.name,
  level: u.xp >= 200 ? "advanced" : "beginner"
}));
```

### Step 2: filter — Keep What Matches

```javascript
const numbers = [1, 2, 3, 4, 5];
const evens = numbers.filter(n => n % 2 === 0);
console.log(evens);  // [2, 4]
```

The function returns `true` (keep) or `false` (skip).

### Step 3: filter Examples

```javascript
const lessons = [
  { slug: "js-vars", completed: true, xp: 50 },
  { slug: "js-loops", completed: false, xp: 50 },
  { slug: "js-functions", completed: true, xp: 80 }
];

const todo = lessons.filter(l => !l.completed);
const valuable = lessons.filter(l => l.xp >= 60);
const important = lessons.filter(l => !l.completed && l.xp >= 60);
```

---

### Step 4: reduce — Combine Into One Value

```javascript
const numbers = [1, 2, 3, 4, 5];

const sum = numbers.reduce((total, n) => total + n, 0);
//                          ─────  ─        ───      ─
//                        accumulator current     start value
console.log(sum);  // 15
```

Step-by-step:
```
Start:  total = 0
Step 1: total = 0 + 1 = 1
Step 2: total = 1 + 2 = 3
Step 3: total = 3 + 3 = 6
Step 4: total = 6 + 4 = 10
Step 5: total = 10 + 5 = 15
```

### Step 5: reduce — Beyond Sum

```javascript
const lessons = [
  { slug: "js-vars", xp: 50 },
  { slug: "js-loops", xp: 50 },
  { slug: "js-functions", xp: 80 }
];

const totalXP = lessons.reduce((sum, l) => sum + l.xp, 0);

const maxXP = lessons.reduce((max, l) => l.xp > max ? l.xp : max, 0);

// Build an object grouped by some key
const bySlug = lessons.reduce((acc, l) => {
  acc[l.slug] = l;
  return acc;
}, {});
```

---

### Step 6: Chaining — The Power Move

```javascript
const users = [
  { name: "Alice", xp: 100, active: true },
  { name: "Bob", xp: 250, active: false },
  { name: "Carol", xp: 50, active: true },
  { name: "Dave", xp: 300, active: true }
];

// Total XP of active users with > 50 XP
const totalActiveXP = users
  .filter(u => u.active)
  .filter(u => u.xp > 50)
  .map(u => u.xp)
  .reduce((sum, xp) => sum + xp, 0);
```

This reads like a sentence: filter active, filter high-XP, get their xp, sum them.

---

### Step 7: Other Useful Methods

```javascript
users.find(u => u.xp > 200);              // first match (Bob)
users.findIndex(u => u.name === "Carol"); // position (2)
users.some(u => u.xp > 200);              // any match? (true)
users.every(u => u.xp > 0);               // all match? (true)
[1, 2, 3].includes(2);                    // exact value? (true)
[...users].sort((a, b) => b.xp - a.xp);   // sort DESC by xp (spread first!)
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — map basics:**
```javascript
const prices = [10, 20, 30, 40, 50];
// Add 16% tax to each
```

**Exercise 2 — map with objects:**
```javascript
const lessons = [
  { title: "Variables", minutes: 50 },
  { title: "Loops", minutes: 60 }
];
// Make array of "Variables (50 min)" strings
```

**Exercise 3 — filter:**
```javascript
const scores = [85, 42, 91, 67, 38, 100, 73];
// Only passing scores (>= 60)
```

**Exercise 4 — Combined filter:**
```javascript
const users = [
  { name: "A", age: 17, registered: true },
  { name: "B", age: 22, registered: false },
  { name: "C", age: 30, registered: true }
];
// Registered users 18+
```

**Exercise 5 — reduce sum:**
```javascript
const cart = [
  { item: "Book", price: 200, qty: 2 },
  { item: "Pen", price: 50, qty: 5 }
];
// Total: sum of price * qty
```

**Exercise 6 — reduce to object:**
```javascript
const items = [
  { category: "fruit", name: "apple" },
  { category: "veg", name: "carrot" },
  { category: "fruit", name: "banana" }
];
// Build: { fruit: 2, veg: 1 }
```

**Exercise 7 — Chain:**
```javascript
const students = [
  { name: "Alice", grade: 88, attendance: 0.95 },
  { name: "Bob", grade: 72, attendance: 0.80 },
  { name: "Carol", grade: 91, attendance: 0.98 }
];
// Average grade of students with attendance >= 0.85
```

**Exercise 8 — find:**
```javascript
// First student with attendance < 0.85
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Forgetting `return` in map body | `[undefined, undefined, ...]` | Add `return` or implicit arrow |
| Confusing `map` vs `forEach` | `forEach` returns nothing | Use `map` when you need a new array |
| `reduce` without initial value | First item used as accumulator (bug-prone) | Always pass initial value |
| Mutating with `.sort()` | Original array changes | `[...arr].sort()` to keep original |

---

## 🧠 Mental Model

```
map(fn)      → same length, each transformed
filter(fn)   → same or fewer, each unchanged
reduce(fn,i) → ONE value combining all
find(fn)     → ONE matching item
some(fn)     → boolean: any match?
every(fn)    → boolean: all match?

Chain: arr.filter(...).map(...).reduce(...)
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between `map` and `filter`?
2. **Predict:** `[1, 2, 3, 4, 5].filter(n => n > 2).map(n => n * 10);`
3. **Find the bug:** Why does `[1,2,3].map(n => { n * 2 })` produce `[undefined, undefined, undefined]`?
4. **Write it:** Given `[{ subject, score }]`, find the AVERAGE score per subject (group then average).
5. **Apply it:** Total XP from only completed lessons in the "Web Dev" track.
6. **Reflect:** When is a `for` loop still better than `map`/`filter`/`reduce`?
