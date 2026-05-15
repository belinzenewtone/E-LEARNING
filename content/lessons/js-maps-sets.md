# Maps, Sets, and Symbols

## 🎯 By End of This Lesson You Will:
- Use `Map` when you need key-value storage beyond plain objects
- Use `Set` to store unique values and check membership quickly
- Understand when `Symbol` and WeakMap/WeakSet are useful

---

## 🌍 Real-World Analogy First

Objects and arrays aren't the only collection types — `Map` and `Set` are specialized tools:

```
Object — bucket of named fields, keys are strings/symbols
Array  — ordered list, looked up by position
Map    — like Object, but keys can be ANY type AND insertion order is preserved
Set    — like Array, but only unique values, with O(1) membership checks
```

Most of the time you use Object and Array. When you find yourself thinking "I wish keys could be objects..." or "I keep deduplicating..." — that's when Map and Set shine.

---

## 📖 Start From Zero

### `Set` — A Bag of Unique Values

```javascript
const tags = new Set();
tags.add("javascript");
tags.add("sql");
tags.add("javascript");  // ignored — already there

console.log(tags.size);            // 2
console.log(tags.has("sql"));      // true
console.log([...tags]);            // ["javascript", "sql"]
```

Sets automatically prevent duplicates.

---

## 🔨 Level Up

### Step 1: Set Operations

```javascript
const completed = new Set(["js-vars", "js-loops", "js-functions"]);

completed.add("js-arrays");
completed.delete("js-loops");
completed.has("js-functions");   // true
completed.size;                   // 3

for (const slug of completed) {
  console.log(slug);
}
```

### Step 2: Dedupe an Array (Cleanest Way)

```javascript
const numbers = [1, 2, 2, 3, 3, 3, 4];
const unique = [...new Set(numbers)];
console.log(unique);  // [1, 2, 3, 4]
```

### Step 3: Track What's Been Seen

```javascript
const seen = new Set();
const duplicates = [];

const events = ["login", "logout", "login", "view", "logout"];
for (const event of events) {
  if (seen.has(event)) duplicates.push(event);
  else seen.add(event);
}
console.log(duplicates);  // ["login", "logout"]
```

---

### Step 4: `Map` — Key-Value With Superpowers

```javascript
const scores = new Map();
scores.set("Alice", 95);
scores.set("Bob", 87);

scores.get("Alice");        // 95
scores.has("Bob");           // true
scores.size;                 // 2
scores.delete("Bob");
```

### Step 5: Why Not Just Use an Object?

| Plain Object | Map |
|---|---|
| Keys must be strings/symbols | Keys can be ANYTHING |
| No reliable iteration order | Preserves insertion order |
| `Object.keys(o).length` | `map.size` |
| Inherits from prototype | Clean — no prototype mess |
| Slower at huge scale | Optimized for frequent changes |

```javascript
// Object keys can only be strings — this is a BUG:
const obj = {};
const k1 = { id: 1 };
const k2 = { id: 2 };
obj[k1] = "first";
obj[k2] = "second";
console.log(obj);  // { "[object Object]": "second" }  ← both keys collapsed!

// Map handles object keys properly:
const map = new Map();
map.set(k1, "first");
map.set(k2, "second");
map.get(k1);  // "first"  ✅
```

---

### Step 6: Iterating Maps

```javascript
const studyTime = new Map([
  ["Monday", 45],
  ["Tuesday", 60]
]);

for (const [day, minutes] of studyTime) {
  console.log(`${day}: ${minutes} minutes`);
}

for (const day of studyTime.keys()) { /* ... */ }
for (const minutes of studyTime.values()) { /* ... */ }

const arr = [...studyTime];  // [["Monday", 45], ["Tuesday", 60]]
```

---

### Step 7: When To Use Each

```
Set when:
  • Unique values
  • Fast "is X here?" checks
  • Deduplicating

Map when:
  • Keys aren't strings (or shouldn't be)
  • Insertion order matters
  • Frequent add/remove
  • Large collections

Object when:
  • Modeling a single thing with fixed fields
  • String keys known at write time
  • Need JSON serialization (Map doesn't JSON nicely)
```

---

### Step 8: Symbol (Brief)

`Symbol` creates **completely unique** values:

```javascript
const id = Symbol("id");
const user = {
  name: "Alice",
  [id]: "secret-internal-id"
};

console.log(user[id]);   // "secret-internal-id"
Object.keys(user);       // ["name"] — symbol key is hidden
```

Used mainly inside libraries. Recognize them when you see them.

### Step 9: WeakMap / WeakSet (Mention)

Like Map/Set but their values can be garbage collected if no other reference exists. Useful for caching tied to object lifetimes — advanced framework territory.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Dedupe:**
```javascript
const tags = ["js", "sql", "js", "ts", "js", "sql"];
// Get unique tags via Set
```

**Exercise 2 — Set membership:**
```javascript
const completedLessons = new Set(["js-vars", "js-loops"]);
// Write isCompleted(slug) that returns true/false
```

**Exercise 3 — Map basics:**
```javascript
const scores = new Map();
// Add: Alice 90, Bob 75, Carol 88
// Print Bob's score
// Loop and print "name: score" for each
```

**Exercise 4 — Count occurrences:**
```javascript
const events = ["click", "view", "click", "submit", "view", "click"];
// Build a Map: event name -> count
// { click: 3, view: 2, submit: 1 }
```

**Exercise 5 — Set operations:**
```javascript
const a = new Set([1, 2, 3, 4]);
const b = new Set([3, 4, 5, 6]);
// Intersection, union, difference (use loops + Set methods)
```

**Exercise 6 — Object vs Map:**
```javascript
// Try using user objects as keys in BOTH Object and Map
// Notice the difference
```

**Exercise 7 — Dedup objects:**
```javascript
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 1, name: "Alice" },
  { id: 3, name: "Carol" }
];
// Dedupe by id using Map or Set
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Object as key in another Object | All become "[object Object]" | Use Map |
| `JSON.stringify(map)` | Returns `{}` | `JSON.stringify([...map])` |
| Comparing objects in Set | Different reference = different item | Set uses reference equality |
| Using `for...in` on Map | Doesn't work | Use `for...of` with entries/keys/values |

---

## 🧠 Mental Model

```
Set:  [unique values] — add, delete, has, size
Map:  {any key → any value, insertion-ordered} — set, get, has, size
Object: still your default for known string-keyed data
```

---

## 📝 Check Your Understanding

1. **Define:** Why does `Set` automatically remove duplicates?
2. **Predict:** `const s = new Set([1, 2, 2, 3, "2"]); console.log(s.size);`
3. **Find the bug:**
   ```javascript
   const map = new Map();
   map.set({ id: 1 }, "first");
   console.log(map.get({ id: 1 }));   // undefined — why?
   ```
4. **Write it:** Use Set to find words appearing more than once in a string.
5. **Apply it:** Why is Set faster than Array for "is this visitor ID in our list?"
6. **Reflect:** When would you NOT use Map even when it would work? (think JSON, debugging, simplicity)
