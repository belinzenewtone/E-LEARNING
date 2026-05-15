# Arrays: Creation & Core Methods

## 🎯 By End of This Lesson You Will:
- Create arrays and access elements by position
- Add, remove, and search items using built-in methods
- Loop through arrays to process every item

---

## 🌍 Real-World Analogy First

An array is a **numbered list** — like a restaurant's menu or a shopping list:

```
Index →   0           1           2           3
       ┌─────────┬───────────┬───────────┬──────────┐
Array: │"Lessons"│"Exercises"│"Quizzes" │ "Projects"│
       └─────────┴───────────┴───────────┴──────────┘
```

Each item has a **position number** (called an index). Indexes **start at 0**, not 1 — this trips up every beginner at first.

```
"Lessons"   → position 0 (the first item)
"Exercises" → position 1
"Quizzes"   → position 2
"Projects"  → position 3 (the last item)
```

---

## 📖 Start From Zero

### Creating an Array

```javascript
const fruits = ["apple", "banana", "cherry"];
```

- `const` — we're creating a named container
- `fruits` — the name/label
- `[...]` — the square brackets mean "this is an array"
- Items are separated by commas

### Reading Items (Indexing)

```javascript
const fruits = ["apple", "banana", "cherry"];

console.log(fruits[0]);   // "apple"  (first item — index 0)
console.log(fruits[1]);   // "banana" (second item — index 1)
console.log(fruits[2]);   // "cherry" (third item — index 2)
console.log(fruits[3]);   // undefined (nothing at index 3!)
```

### The Length

```javascript
console.log(fruits.length);   // 3 (number of items)

// Last item is always at index: length - 1
console.log(fruits[fruits.length - 1]);   // "cherry"
```

---

## 🔨 Level Up — The Core Methods

### Adding Items

```javascript
const scores = [80, 90];

// Add to the END — push (most common)
scores.push(95);
console.log(scores);   // [80, 90, 95]

// Add to the BEGINNING — unshift
scores.unshift(70);
console.log(scores);   // [70, 80, 90, 95]
```

### Removing Items

```javascript
const scores = [70, 80, 90, 95];

// Remove from the END — pop (returns removed item)
const last = scores.pop();
console.log(last);     // 95
console.log(scores);   // [70, 80, 90]

// Remove from the BEGINNING — shift
const first = scores.shift();
console.log(first);    // 70
console.log(scores);   // [80, 90]
```

**Memory trick:**
```
push  → push onto the end  (like pushing a shopping cart forward)
pop   → pop off the end    (like a stack of plates — take the top)
unshift → add to beginning (harder to remember — just memorize it)
shift   → remove from beginning
```

### Checking if an Item Exists

```javascript
const subjects = ["JavaScript", "SQL", "TypeScript"];

subjects.includes("SQL");         // true
subjects.includes("Python");      // false

subjects.indexOf("TypeScript");   // 2 (position)
subjects.indexOf("Python");       // -1 (not found)
```

### Finding an Item

```javascript
const lessons = [
  { id: 1, title: "Variables", completed: true },
  { id: 2, title: "Loops", completed: false },
  { id: 3, title: "Functions", completed: true },
];

// find — returns the first item that matches
const incomplete = lessons.find(lesson => !lesson.completed);
console.log(incomplete);   // { id: 2, title: "Loops", completed: false }

// findIndex — returns the position
const index = lessons.findIndex(lesson => lesson.id === 3);
console.log(index);   // 2
```

### Slicing Out a Portion

```javascript
const letters = ["a", "b", "c", "d", "e"];

//                              start  end (not included)
const middle = letters.slice(1, 4);
console.log(middle);   // ["b", "c", "d"]
console.log(letters);  // ["a", "b", "c", "d", "e"] — original unchanged!
```

`slice` is non-destructive — it creates a **copy**, never modifies the original.

### Sorting

```javascript
const numbers = [3, 1, 4, 1, 5, 9, 2];
numbers.sort((a, b) => a - b);   // ascending
console.log(numbers);   // [1, 1, 2, 3, 4, 5, 9]

numbers.sort((a, b) => b - a);   // descending
console.log(numbers);   // [9, 5, 4, 3, 2, 1, 1]
```

### Joining into a String

```javascript
const words = ["Learning", "is", "fun"];
console.log(words.join(" "));    // "Learning is fun"
console.log(words.join(", "));   // "Learning, is, fun"
console.log(words.join(""));     // "Learningisfun"
```

---

## 🔁 Looping Through Arrays

```javascript
const weeklyXP = [50, 80, 120, 45, 90];

// for...of — cleanest for just values
for (const xp of weeklyXP) {
  console.log("XP this week:", xp);
}

// forEach — with index access
weeklyXP.forEach((xp, index) => {
  console.log(`Week ${index + 1}: ${xp} XP`);
});
// Week 1: 50 XP
// Week 2: 80 XP
// ... etc
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Create and access:**
```javascript
const tracks = ["Web Dev", "Data Engineering", "Python & FastAPI"];
// Print the second track
// Print the last track (use .length - 1)
// Print how many tracks there are
```

**Exercise 2 — Add and remove:**
```javascript
let queue = ["Alice", "Bob", "Carol"];
// Add "Dave" to the end
// Remove the first person (who gets served first)
// Print who's now at the front of the queue
```

**Exercise 3 — Find:**
```javascript
const lessons = [
  { slug: "js-variables", completed: true },
  { slug: "js-data-types", completed: true },
  { slug: "js-loops", completed: false },
  { slug: "js-functions", completed: false },
];

// Find the first incomplete lesson
// Print: "Next up: [slug]"
```

**Exercise 4 — Includes:**
```javascript
const completedModules = ["js-foundations", "advanced-sql", "ts-fundamentals"];

// Check if "nextjs-react" is completed
// Print "Unlocked!" if yes, "Not yet" if no
```

**Exercise 5 — Loop and calculate:**
```javascript
const scores = [85, 92, 78, 96, 70, 88];
// Use forEach to find and print the highest score
// Hint: start with let highest = 0, update it in the loop
```

**Exercise 6 — Build something real:**
```javascript
const studyLog = [];

// Add 5 study sessions (minutes each):
studyLog.push(45);
studyLog.push(60);
studyLog.push(30);
studyLog.push(90);
studyLog.push(55);

// Calculate total minutes studied
// Calculate average session length
// Find the longest session
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| `arr[arr.length]` | `undefined` — one past the end | Use `arr[arr.length - 1]` for last item |
| Indexes start at 1 | Wrong items read | Indexes start at **0** |
| `arr.sort()` on numbers | Wrong order (sorts as text!) | Use `arr.sort((a,b) => a - b)` |
| Confusing `slice` vs `splice` | `slice` is safe, `splice` modifies original | Use `slice` for copies, `splice` to actually remove items |

---

## 🧠 Mental Model

```
Array = ordered, numbered list
  arr[0]  = first item (index starts at 0)
  arr[arr.length - 1] = last item

Add:     push (end), unshift (start)
Remove:  pop (end),  shift (start)
Find:    includes (yes/no), indexOf (position), find (first match)
Copy:    slice (safe copy of portion)
Loop:    for...of (simple), forEach (with index)
```

---

## 📝 Check Your Understanding

1. **Define:** What is an array index and why does it start at 0?
2. **Predict:** What does this output?
   ```javascript
   const arr = [10, 20, 30, 40];
   arr.push(50);
   arr.shift();
   console.log(arr);
   ```
3. **Find the bug:**
   ```javascript
   const names = ["Alice", "Bob", "Carol"];
   console.log(names[3]);   // what is this? is it an error?
   ```
4. **Write it:** Create an array of 5 weekly XP values. Write code to find the total and average.
5. **Apply it:** You have an array of lesson objects. Write code to find all incomplete lessons and print their titles.
6. **Reflect:** Why do array indexes start at 0 instead of 1? (Research this — it's about memory addresses.)
