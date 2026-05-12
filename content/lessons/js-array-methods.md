# Array Methods: map, filter, reduce

## Why This Matters

These three methods replace 90% of the loops you'd write with `for`. They're declarative — you describe WHAT you want, not HOW to get it. This makes code shorter, more readable, and less bug-prone. Every professional JS developer reaches for these daily.

## Core Concepts

### map — Transform Every Element

```javascript
const numbers = [1, 2, 3, 4];

const doubled = numbers.map(n => n * 2);
// [2, 4, 6, 8]

const labeled = numbers.map((n, i) => `Item ${i}: ${n}`);
// ["Item 0: 1", "Item 1: 2", "Item 2: 3", "Item 3: 4"]

// Practical: extract a property from objects
const users = [{ name: "Alice" }, { name: "Bob" }];
const names = users.map(u => u.name);
// ["Alice", "Bob"]
```

**Rule**: `map` always returns a new array of the same length. Use it when you want to transform every element.

### filter — Keep Only What Matches

```javascript
const numbers = [1, 2, 3, 4, 5, 6];

const evens = numbers.filter(n => n % 2 === 0);
// [2, 4, 6]

const highScores = scores.filter(s => s >= 80);

// Remove falsy values
const clean = [0, "hello", null, "", false, "world"].filter(Boolean);
// ["hello", "world"]
```

**Rule**: `filter` returns a new array with only elements that pass the test. Length may be smaller.

### reduce — Accumulate to a Single Value

```javascript
const numbers = [1, 2, 3, 4];

// Sum
const total = numbers.reduce((acc, n) => acc + n, 0);
// 10

// Step-by-step:
// acc=0, n=1 → 1
// acc=1, n=2 → 3
// acc=3, n=3 → 6
// acc=6, n=4 → 10

// Count by category
const items = ["apple", "banana", "apple", "cherry"];
const counts = items.reduce((acc, item) => {
  acc[item] = (acc[item] || 0) + 1;
  return acc;
}, {});
// { apple: 2, banana: 1, cherry: 1 }

// Build an object from an array
const pairs = [["name", "Alice"], ["age", 30]];
const obj = pairs.reduce((acc, [key, val]) => {
  acc[key] = val;
  return acc;
}, {});
// { name: "Alice", age: 30 }
```

### Chaining Methods

```javascript
const orders = [
  { id: 1, total: 50, status: "delivered" },
  { id: 2, total: 120, status: "pending" },
  { id: 3, total: 80, status: "delivered" },
  { id: 4, total: 30, status: "cancelled" },
];

const highValueDeliveredTotal = orders
  .filter(o => o.status === "delivered")
  .filter(o => o.total > 40)
  .map(o => o.total)
  .reduce((sum, t) => sum + t, 0);
// 130 (50 + 80)
```

## Try It Yourself

1. Given `[1, 2, 3, 4, 5]`, use `map` to produce `[2, 4, 6, 8, 10]`.
2. Filter an array of numbers to keep only those greater than 10.
3. Use `reduce` to find the maximum value in an array.
4. Chain `filter`, `map`, and `reduce` to process an array of products.

## Common Mistakes

- **Using map when you don't need the result**: If you're not using the returned array, use `forEach` instead.
- **Forgetting the initial value in reduce**: Without `0`, `[].reduce((a,b) => a+b)` throws TypeError. Always provide an initial value.
- **Using reduce when a simpler method exists**: `arr.reduce((max, n) => n > max ? n : max)` should be `Math.max(...arr)`.

## Checkpoint

1. Which method returns a new array of the same length?
2. What does `reduce` do that `map` and `filter` can't?
3. Write a chain that filters odd numbers, doubles them, and sums the result.
4. **Reflection**: When would you chain `map` and `filter` together?
