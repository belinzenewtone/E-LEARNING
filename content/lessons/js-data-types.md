# Data Types & Type Coercion

## Why This Matters

JavaScript's type system is its most misunderstood feature. The language will silently convert types behind your back — what's called "type coercion." Understanding when and how this happens prevents bugs that are notoriously hard to track down.

## Core Concepts

### The 7 Primitive Types

```javascript
// String — text
const name = "Alice";

// Number — all numbers (no int/float distinction)
const age = 25;
const price = 9.99;

// Boolean — true or false
const isLoggedIn = true;

// undefined — variable declared but not assigned
let x;
console.log(x); // undefined

// null — intentional absence of value
const middleName = null;

// Symbol — unique identifier (rare in day-to-day)
const id = Symbol("id");

// BigInt — for very large integers
const bigNumber = 9007199254740991n;
```

### typeof — Your Diagnostic Tool

```javascript
typeof "hello"     // "string"
typeof 42          // "number"
typeof true        // "boolean"
typeof undefined   // "undefined"
typeof null        // "object"  ← most famous JS bug
typeof { name: "A" } // "object"
typeof [1, 2, 3]   // "object"  ← arrays are objects too
typeof function(){} // "function"
```

### Type Coercion: The Silent Killer

JavaScript automatically converts types when operators expect something different:

```javascript
"5" + 3      // "53" — number coerced to string
"5" - 3      // 2    — string coerced to number
"hello" - 3  // NaN  — can't convert "hello" to number
5 + true     // 6    — true coerced to 1
5 + false    // 5    — false coerced to 0
"" + 0       // "0"  — empty string + anything = string concatenation
```

### Falsy Values

These 6 values are treated as `false` in boolean contexts:

```javascript
false, 0, "", null, undefined, NaN
```

Everything else is truthy — including `"0"`, `"false"`, `[]`, and `{}`.

## Try It Yourself

1. Use `typeof` on: `42`, `"42"`, `true`, `undefined`, `null`, `[]`, `{}`, and a function. Record your results.
2. Predict the result of: `"10" - 5`, `"10" + 5`, `10 + "5"`, `"hello" * 2`
3. Write a function `isTruthy(value)` that returns `true` if the value is truthy and `false` if it's falsy. Test it with all 6 falsy values.

## Common Mistakes

- **Trusting `typeof null`**: It returns `"object"`. To check for null, use `value === null`.
- **Using `==` for equality**: `==` does type coercion; `===` doesn't. `"" == false` is `true` but `"" === false` is `false`. Always use `===`.
- **Assuming arrays get special typeof**: `typeof [1,2,3]` returns `"object"`. Use `Array.isArray()` instead.

## Checkpoint

1. What does `typeof null` return and why is it considered a bug?
2. List all 6 falsy values in JavaScript.
3. Why does `"5" + 3` produce `"53"` but `"5" - 3` produces `2`?
4. **Reflection**: What surprised you most about type coercion? Give an example.
