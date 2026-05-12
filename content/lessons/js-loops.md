# Loops: for, while, forEach

## Why This Matters

Computers are great at doing the same thing many times. Loops let you process every item in an array, repeat an action until a condition changes, or iterate through data without writing the same code 100 times.

## Core Concepts

### for Loop — When You Know the Count

```javascript
// Structure: (initialization; condition; increment)
for (let i = 0; i < 5; i++) {
  console.log(i); // 0, 1, 2, 3, 4
}

// Practical: iterate an array
const fruits = ["apple", "banana", "cherry"];
for (let i = 0; i < fruits.length; i++) {
  console.log(`${i}: ${fruits[i]}`);
}
// "0: apple"
// "1: banana"
// "2: cherry"
```

### while Loop — When You Don't Know the Count

```javascript
let count = 0;
while (count < 3) {
  console.log(count);
  count++;
}

// Real-world: polling
let data = null;
while (!data) {
  data = fetchData(); // keep trying until we get data
}
```

### do...while — Always Runs at Least Once

```javascript
let input;
do {
  input = prompt("Enter a number > 10:");
} while (input <= 10);
// The prompt runs once even if condition is false
```

### forEach — Functional Array Iteration

```javascript
const numbers = [10, 20, 30];

numbers.forEach((num, index) => {
  console.log(`Item ${index}: ${num}`);
});
// Item 0: 10
// Item 1: 20
// Item 2: 30
```

### break and continue

```javascript
// break — exit the loop immediately
for (let i = 0; i < 10; i++) {
  if (i === 5) break;
  console.log(i); // 0, 1, 2, 3, 4
}

// continue — skip to next iteration
for (let i = 0; i < 5; i++) {
  if (i === 2) continue;
  console.log(i); // 0, 1, 3, 4
}
```

### for...of — Modern Array Iteration

```javascript
const colors = ["red", "green", "blue"];
for (const color of colors) {
  console.log(color);
}
// Cleaner than classic for loop — use this when you just need values.
```

## Try It Yourself

1. Write a loop that prints numbers 1 to 20, but prints "Fizz" for multiples of 3, "Buzz" for multiples of 5, and "FizzBuzz" for multiples of both.
2. Write a `while` loop that generates random numbers between 1 and 100 until it finds one greater than 90.
3. Use `forEach` to sum all numbers in an array.

## Common Mistakes

- **Infinite loops**: Always ensure your condition eventually becomes false. `while (true)` without a `break` will freeze your browser.
- **Off-by-one errors**: `for (let i = 0; i <= arr.length; i++)` runs one too many times. Use `<`, not `<=`, with `.length`.
- **Modifying array while iterating**: `forEach` on an array you're adding to or removing from produces unpredictable results.

## Checkpoint

1. Which loop always executes its body at least once?
2. What's the difference between `break` and `continue`?
3. When would you choose `while` over `for`?
4. **Reflection**: Which loop style feels most natural to you and why?
