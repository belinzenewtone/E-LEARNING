# Operators & Expressions

## Why This Matters

Operators are the verbs of programming — they do the work. Every calculation, every comparison, every logical decision goes through an operator. Knowing which operator to reach for and understanding operator precedence is the difference between code that works and code that quietly does the wrong thing.

## Core Concepts

### Arithmetic Operators

```javascript
5 + 3    // 8  (addition)
5 - 3    // 2  (subtraction)
5 * 3    // 15 (multiplication)
5 / 2    // 2.5 (division)
5 % 2    // 1  (remainder/modulo)
5 ** 2   // 25 (exponentiation)

// Operator precedence: PEMDAS
2 + 3 * 4    // 14 (not 20 — multiplication first)
(2 + 3) * 4  // 20 (parentheses override)
```

### Comparison Operators

```javascript
5 > 3    // true
5 >= 5   // true
5 < 3    // false
5 <= 5   // true
5 === 5  // true (strict equality — checks value AND type)
5 == "5" // true (loose equality — coerces types. AVOID THIS)
5 !== 3  // true (strict not-equal)
```

**Golden rule: always use `===` and `!==`.** The `==` operator does type coercion and produces surprising results:

```javascript
"" == false    // true (both falsy, coerced to 0)
0 == false     // true
null == undefined // true
"" == 0        // true (empty string coerced to 0)
```

### Logical Operators

```javascript
// AND (&&) — both must be true
true && true   // true
true && false  // false
age > 18 && hasLicense // can drive only if both conditions met

// OR (||) — either must be true
true || false  // true
false || false // false
isAdmin || isModerator // has access if either role

// NOT (!) — flips the boolean
!true          // false
!0             // true (0 is falsy)
!!"hello"      // true (double-bang converts to boolean)
```

### The Ternary Operator

A compact if/else:

```javascript
const status = age >= 18 ? "adult" : "minor";
//             condition    if true    if false
```

### Short-Circuit Evaluation

`&&` and `||` stop evaluating as soon as they know the answer:

```javascript
// If left side is falsy, right side never runs
false && console.log("never runs");

// If left side is truthy, right side never runs
true || console.log("never runs");

// Practical use: default values
const name = userInput || "Anonymous"; // fallback if userInput is falsy
```

## Try It Yourself

1. Write an expression that checks if a number is between 10 and 20 (inclusive).
2. Create a variable `score` and use the ternary operator to assign a grade ("pass" if >= 50, "fail" otherwise).
3. Predict the result of: `0 || "default"`, `"hello" && 42`, `!"" && !0`
4. Write a function `isEven(n)` that returns `true` if `n` is even, using only the `%` operator.

## Common Mistakes

- **Using `=` instead of `===`**: `if (x = 5)` assigns 5 to x and always evaluates as truthy. Use `if (x === 5)`.
- **Chaining comparisons incorrectly**: `10 < x < 20` doesn't work in JS. Write `x > 10 && x < 20`.
- **Using `==` with null checks**: `if (x == null)` checks for both null AND undefined. If you only want null, use `===`.

## Checkpoint

1. What does `===` check that `==` does not?
2. What is the result of `5 > 4 > 3`? (Hint: it evaluates left-to-right)
3. What is short-circuit evaluation and why is it useful?
4. Write a ternary expression that returns "even" if a number is even and "odd" otherwise.
