# Control Flow: if, else, switch

## Why This Matters

Programs don't just execute top to bottom — they make decisions. Control flow is how you tell your code "if this condition is true, do X; otherwise, do Y." Without it, every program would just be a calculator.

## Core Concepts

### if / else if / else

```javascript
const score = 85;

if (score >= 90) {
  console.log("A");
} else if (score >= 80) {
  console.log("B");      // this runs
} else if (score >= 70) {
  console.log("C");
} else {
  console.log("Needs work");
}
```

Conditions are checked top to bottom. The first `true` branch wins — later branches are skipped even if they'd also be true.

### Truthy and Falsy in Conditions

The condition inside `if (...)` can be any value, not just a boolean:

```javascript
if ("hello") { /* runs — non-empty string is truthy */ }
if (0)       { /* doesn't run — 0 is falsy */ }
if ([])      { /* runs — empty array is truthy */ }
if (null)    { /* doesn't run */ }

// Common pattern: guard clause
function greet(name) {
  if (!name) return;  // exit early if no name
  console.log(`Hello, ${name}`);
}
```

### switch Statements

Useful when comparing one value against many options:

```javascript
const day = "Monday";

switch (day) {
  case "Monday":
    console.log("Back to work");
    break;                          // don't forget break!
  case "Friday":
    console.log("Almost weekend");
    break;
  case "Saturday":
  case "Sunday":                    // fall-through for weekends
    console.log("Weekend!");
    break;
  default:
    console.log("Midweek");
}
```

Without `break`, execution "falls through" to the next case. This is sometimes intentional (like grouping Saturday and Sunday) but usually a bug.

### Short-Circuit Patterns

```javascript
// Instead of if/else for simple value assignment:
const displayName = user.name || "Anonymous";

// Guard clause instead of nested if:
if (error) return;
// ... rest of function
```

## Try It Yourself

1. Write a function `getTicketPrice(age)` that returns "free" (under 5), "child" (5-12), "adult" (13-64), or "senior" (65+).
2. Convert the ticket price function to use a `switch` statement on age ranges.
3. Write a function `canVote(age, isCitizen)` that returns `true` only if both conditions are met. Use a guard clause.

## Common Mistakes

- **Using `=` instead of `===`**: `if (x = 5)` always runs because assignment returns the assigned value.
- **Missing `break` in switch**: Execution falls through silently — a classic source of bugs.
- **Over-nesting**: Instead of `if (a) { if (b) { if (c) { ... }}}`, use guard clauses: `if (!a) return; if (!b) return; if (!c) return; ...`

## Checkpoint

1. List 5 falsy values in JavaScript.
2. What happens if you forget `break` in a switch case?
3. When would you use `switch` over `if/else if`?
4. **Reflection**: Write a guard clause pattern you can use in your own code.
