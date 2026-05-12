# Arrays: Creation & Core Methods

## Why This Matters

Arrays are how you work with lists of data in JavaScript — a list of users, a list of scores, a list of products. Most real-world data comes in lists. Master arrays and you've mastered half of day-to-day JavaScript.

## Core Concepts

### Creating Arrays

```javascript
// Array literal (preferred)
const fruits = ["apple", "banana", "cherry"];

// Array constructor (avoid unless you need a specific size)
const numbers = new Array(5); // [empty × 5] — not [5]

// Mixed types (allowed but not recommended)
const mixed = [1, "hello", true, { name: "Alice" }];
```

### Accessing and Modifying

```javascript
const items = ["a", "b", "c"];

items[0];           // "a" — first element (zero-indexed)
items[items.length - 1]; // "c" — last element
items[0] = "z";     // replace: ["z", "b", "c"]
items.length;       // 3
```

### push, pop, shift, unshift

```javascript
const queue = [];

// Add to end (fast)
queue.push("first");   // ["first"]
queue.push("second");  // ["first", "second"]

// Remove from end (fast)
queue.pop();           // "second" — array is now ["first"]

// Add to front (slow — re-indexes everything)
queue.unshift("zero"); // ["zero", "first"]

// Remove from front (slow)
queue.shift();         // "zero" — array is now ["first"]
```

### slice vs splice

```javascript
const arr = ["a", "b", "c", "d", "e"];

// slice — returns a COPY (original unchanged)
arr.slice(1, 3);    // ["b", "c"]
arr.slice(2);       // ["c", "d", "e"] — from index 2 to end
arr.slice(-2);      // ["d", "e"] — last 2 elements

// splice — MODIFIES original (adds/removes in place)
arr.splice(2, 1);        // remove 1 at index 2 → ["a", "b", "d", "e"]
arr.splice(1, 0, "x");   // insert at index 1 → ["a", "x", "b", "d", "e"]
arr.splice(2, 2, "y");   // replace 2 at index 2 → ["a", "x", "y", "e"]
```

### indexOf, includes, find

```javascript
const colors = ["red", "green", "blue", "green"];

colors.indexOf("green");     // 1 — first occurrence
colors.lastIndexOf("green"); // 3 — last occurrence
colors.includes("red");      // true
colors.includes("yellow");   // false

// find — returns first match (for objects)
const users = [{ id: 1, name: "A" }, { id: 2, name: "B" }];
users.find(u => u.id === 2); // { id: 2, name: "B" }
users.findIndex(u => u.id === 2); // 1
```

### Spread Operator

```javascript
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

// Combine arrays
const combined = [...arr1, ...arr2]; // [1, 2, 3, 4, 5, 6]

// Clone array (shallow copy)
const clone = [...arr1];  // [1, 2, 3] — new array, same values

// Add elements while copying
const extended = [0, ...arr1, 4]; // [0, 1, 2, 3, 4]
```

## Try It Yourself

1. Create an array of 5 favorite foods. Use `push`, `pop`, `shift`, and `unshift` on it.
2. Given `[10, 20, 30, 40, 50]`, use `slice` to get the middle 3 elements.
3. Use `find` to locate a todo item by its id in an array of todo objects.
4. Combine two arrays of different types using spread. What happens?

## Common Mistakes

- **Confusing slice and splice**: `slice` doesn't modify; `splice` does. Memory aid: "splice" has a "p" for "permanent."
- **Using indexOf with objects**: `arr.indexOf({ id: 1 })` always returns -1 because objects are compared by reference. Use `findIndex` instead.
- **Negative indices**: `arr[-1]` returns `undefined` in JS. Use `arr[arr.length - 1]` or `arr.at(-1)`.

## Checkpoint

1. What's the difference between `slice` and `splice`?
2. How do you combine two arrays without modifying either?
3. Why does `arr.indexOf({ id: 1 })` return -1?
4. **Reflection**: When would you use `find` vs `filter`?
