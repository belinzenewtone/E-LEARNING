# Loops: for, while, forEach

## 🎯 By End of This Lesson You Will:
- Write `for`, `while`, and `for...of` loops that repeat actions correctly
- Stop and skip loop iterations using `break` and `continue`
- Choose the right loop type for the situation

---

## 🌍 Real-World Analogy First

Imagine you're a teacher marking 30 student papers. You do the same thing 30 times:

```
For each paper:
  1. Pick it up
  2. Read the answers
  3. Assign a grade
  4. Put it in the graded pile

Repeat until all 30 are done
```

A loop does exactly this. Instead of writing the same code 30 times, you write it **once** inside a loop and tell it how many times to repeat.

```
Without loop:            With loop:
  markPaper(1);          for (let i = 1; i <= 30; i++) {
  markPaper(2);            markPaper(i);
  markPaper(3);          }
  ... 27 more lines
```

---

## 📖 Start From Zero

### Your First Loop

```javascript
for (let i = 0; i < 5; i++) {
  console.log(i);
}
```

Output:
```
0
1
2
3
4
```

Let's read the three parts inside `for (...)`:

```
for (let i = 0;   i < 5;   i++) {
     ─────────    ─────   ─────
     START        CHECK   STEP
     set i to 0   run if  add 1
                  i < 5   after each
                          cycle
```

**Step by step:**
1. `let i = 0` — create i, start at 0
2. Is `0 < 5`? Yes → run the block → `console.log(0)`
3. `i++` → i becomes 1
4. Is `1 < 5`? Yes → run the block → `console.log(1)`
5. `i++` → i becomes 2
6. ...continues...
7. `i++` → i becomes 5
8. Is `5 < 5`? **No** → STOP

---

## 🔨 Level Up — Four Loop Types

### Type 1: `for` Loop — When You Know the Count

```javascript
// Print weeks 1 to 10
for (let week = 1; week <= 10; week++) {
  console.log(`Week ${week}`);
}

// Iterate an array using its index
const lessons = ["Variables", "Data Types", "Loops"];
for (let i = 0; i < lessons.length; i++) {
  console.log(`${i + 1}. ${lessons[i]}`);
}
// 1. Variables
// 2. Data Types
// 3. Loops
```

---

### Type 2: `for...of` — Cleaner Array Iteration

When you just need the **values** (not the index):

```javascript
const lessons = ["Variables", "Data Types", "Loops"];

for (const lesson of lessons) {
  console.log(lesson);
}
// Variables
// Data Types
// Loops
```

Comparison:
```javascript
// Classic for — when you need the index number
for (let i = 0; i < lessons.length; i++) {
  console.log(`${i}: ${lessons[i]}`);
}

// for...of — when you just need each item
for (const lesson of lessons) {
  console.log(lesson);
}
```

> **Prefer `for...of`** for simple array loops. Use `for` with index only when you need the position number.

---

### Type 3: `while` Loop — When You Don't Know the Count

Use `while` when the number of repetitions depends on a condition:

```javascript
let xp = 0;
let level = 1;

while (xp < 100) {
  xp += 20;   // earn XP from each task
  console.log(`XP: ${xp}`);
}

console.log("Reached 100 XP!");
```

```
Loop trace:
  xp=0  → Is 0 < 100? Yes → xp becomes 20
  xp=20 → Is 20 < 100? Yes → xp becomes 40
  xp=40 → Is 40 < 100? Yes → xp becomes 60
  xp=60 → Is 60 < 100? Yes → xp becomes 80
  xp=80 → Is 80 < 100? Yes → xp becomes 100
  xp=100→ Is 100 < 100? NO → STOP
```

> **Warning:** Always make sure `while` can reach a false condition. If you forget to update `xp` inside the loop, it runs forever and crashes your browser.

---

### Type 4: `do...while` — Always Runs at Least Once

```javascript
let attempts = 0;

do {
  attempts++;
  console.log(`Attempt ${attempts}`);
} while (attempts < 3);

// Output:
// Attempt 1
// Attempt 2
// Attempt 3
```

The difference from `while`:
```
while   → checks condition BEFORE running (might run 0 times)
do/while → runs ONCE, then checks (always runs at least once)
```

---

### `forEach` — Array Method for Loops

```javascript
const scores = [85, 92, 78, 96, 70];

scores.forEach((score, index) => {
  const grade = score >= 80 ? "Pass" : "Retry";
  console.log(`Student ${index + 1}: ${score} — ${grade}`);
});
```

---

## 🎯 `break` and `continue`

### `break` — Stop the Loop Immediately

```javascript
const lessons = ["Variables", "Loops", "Functions", "Arrays"];

for (const lesson of lessons) {
  if (lesson === "Functions") {
    console.log("Found it! Stopping.");
    break;   // exit loop entirely
  }
  console.log(lesson);
}

// Output:
// Variables
// Loops
// Found it! Stopping.
// (Functions and Arrays are never printed)
```

### `continue` — Skip This Iteration, Keep Going

```javascript
for (let i = 1; i <= 6; i++) {
  if (i === 3 || i === 5) continue;   // skip 3 and 5
  console.log(i);
}

// Output: 1, 2, 4, 6
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Count to 10:**
```javascript
// Print numbers 1 through 10 using a for loop
```

**Exercise 2 — Even numbers only:**
```javascript
// Print only even numbers from 1 to 20
// Hint: use the modulo operator — n % 2 === 0 means n is even
```

**Exercise 3 — Array processing:**
```javascript
const weeklyXP = [50, 80, 120, 45, 90, 75, 60];

// Use a for...of loop to:
// 1. Print each week's XP
// 2. Calculate the total XP (sum all values)
```

**Exercise 4 — FizzBuzz (classic):**
```javascript
// For numbers 1 to 20:
// If divisible by 3: print "Fizz"
// If divisible by 5: print "Buzz"
// If divisible by both: print "FizzBuzz"
// Otherwise: print the number
```

**Exercise 5 — while loop:**
```javascript
// Simulate earning XP:
// Start with xp = 0
// Each study session adds a random amount between 10 and 50
// Use Math.floor(Math.random() * 41) + 10 to generate the random amount
// Keep going until xp >= 200
// Print how many sessions it took
```

**Exercise 6 — break and continue:**
```javascript
const lessons = [
  { title: "Variables", completed: true },
  { title: "Data Types", completed: true },
  { title: "Loops", completed: false },
  { title: "Functions", completed: false },
];

// Find the FIRST incomplete lesson and print its title
// Use break to stop once found
// Hint: use for...of with an if and break
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| `for (let i = 0; i <= arr.length; i++)` | Reads `undefined` on last step | Use `< arr.length` not `<=` |
| `while` without updating condition | Infinite loop — browser freezes | Always ensure condition can become false |
| Forgetting `const/let` in `for...of` | `ReferenceError` | Always write `for (const item of array)` |
| Using `i++` when you need `i--` | Counts wrong direction | Check your loop direction |

---

## 🧠 When to Use Which Loop

```
for (let i = 0; ...)  → You know the exact count, need the index
for...of array        → You want each item in an array (no index needed)
while (condition)     → You don't know how many times — depends on state
do...while            → Must run at least once before checking condition
forEach               → Array method, functional style
```

---

## 📝 Check Your Understanding

1. **Define:** What are the three parts of a `for` loop: `let i = 0`, `i < 5`, `i++`?
2. **Predict:** What does this print?
   ```javascript
   for (let i = 10; i > 0; i -= 3) {
     console.log(i);
   }
   ```
3. **Find the infinite loop:**
   ```javascript
   let count = 1;
   while (count < 10) {
     console.log(count);
   }
   ```
   What's wrong? How do you fix it?
4. **Write it:** Loop through `["Monday","Tuesday","Wednesday","Thursday","Friday"]` and print only the days that contain the letter "s".
5. **Apply it:** You have an array of lessons. Write a loop that finds the first lesson with `completed: false` and prints its title (then stops).
6. **Reflect:** You need to process all orders in a shopping cart. Which loop would you use and why?
