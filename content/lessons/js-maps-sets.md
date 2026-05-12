# Maps, Sets, and Symbols

## Why This Matters

Objects and arrays cover most cases, but they have limitations. Maps let you use any type as a key. Sets guarantee unique values. Symbols create truly private property keys. These are the right tools for specific problems — knowing them makes you a more precise developer.

## Core Concepts

### Map — Dictionary With Any Key Type

```javascript
// Objects only allow string/symbol keys. Maps allow ANY type.
const map = new Map();

// Set
map.set("name", "Alice");
map.set(42, "the answer");
map.set({ id: 1 }, "object key");  // object as key!
map.set(true, "boolean key");

// Get
map.get("name");  // "Alice"
map.get(42);      // "the answer"

// Check and delete
map.has("name");  // true
map.delete(42);   // removes the entry
map.size;         // 3

// Iterate
for (const [key, value] of map) {
  console.log(key, value);
}

// Convert to/from arrays
const entries = [...map]; // [["name","Alice"], ...]
const newMap = new Map([["a", 1], ["b", 2]]);
```

**When to use Map over Object**: keys aren't strings, you need guaranteed insertion order, you add/remove keys frequently.

### Set — Unique Values Only

```javascript
const set = new Set();

set.add(1);
set.add(2);
set.add(2);           // duplicate — ignored
set.add(3);

set.size;             // 3
set.has(2);           // true
set.delete(1);
[...set];             // [2, 3]

// Practical: remove duplicates from array
const numbers = [1, 2, 2, 3, 3, 3, 4];
const unique = [...new Set(numbers)]; // [1, 2, 3, 4]

// Practical: track seen items
const visited = new Set();
function visit(url) {
  if (visited.has(url)) return;
  visited.add(url);
  // ... process url
}
```

### WeakMap and WeakSet

```javascript
// WeakMap — keys are objects, doesn't prevent garbage collection
const cache = new WeakMap();
function process(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = /* expensive computation */;
  cache.set(obj, result);
  return result;
}
// When obj is garbage collected, its cache entry is automatically removed.

// WeakSet — like Set but only for objects
const processedItems = new WeakSet();
```

### Symbol — Guaranteed Unique Keys

```javascript
const id1 = Symbol("id");
const id2 = Symbol("id");
id1 === id2; // false — every Symbol is unique

// Use as object keys (avoid name collisions)
const user = {
  name: "Alice",
  [Symbol("id")]: 1,
  [Symbol("id")]: 2,  // different property!
};

// Well-known symbols
Symbol.iterator; // makes objects iterable
Symbol.toStringTag; // customizes Object.prototype.toString
```

## Try It Yourself

1. Create a `Map` that maps user IDs (numbers) to user objects.
2. Write a function `removeDuplicates(arr)` using a `Set`.
3. Create a `WeakMap`-based cache for expensive function results.
4. Add a `Symbol` key to an object. Can you access it with dot notation? With `Object.keys()`?

## Common Mistakes

- **Using Map methods on an Object**: `obj.size`, `obj.has()`, `obj.set()` don't exist on plain objects.
- **Iterating Sets with index**: `set[0]` doesn't work. Use `[...set]` or `set.forEach()`.
- **Stringifying Symbols**: `JSON.stringify({ [Symbol("id")]: 1 })` returns `"{}"` — symbols are skipped.

## Checkpoint

1. What advantage does `Map` have over plain objects for keys?
2. How do you remove duplicates from an array using `Set`?
3. What's the difference between `WeakMap` and `Map`?
4. **Reflection**: Give a real-world use case where `Set` is more appropriate than `Array`.
