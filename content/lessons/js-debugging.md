# Debugging JavaScript

## Why This Matters

You will spend more time debugging than writing code. Professional developers spend 30-50% of their time finding and fixing bugs. The faster you can diagnose problems, the faster you ship. Debugging isn't a failure — it's the main skill.

## Core Concepts

### console.log — Your First Line of Defense

```javascript
// Basic logging
console.log("User data:", user);

// Better: log with labels
console.log({ user, timestamp: Date.now() });

// Levels of severity
console.warn("Deprecated API called");
console.error("Failed to fetch:", error);

// Table format for arrays/objects
console.table(users);

// Group related logs
console.group("Auth Flow");
console.log("Checking token...");
console.log("Token valid");
console.groupEnd();
```

### Breakpoints in DevTools

1. Open Chrome DevTools (F12)
2. Go to **Sources** tab
3. Click a line number to set a breakpoint (blue marker)
4. Refresh the page — execution pauses at that line
5. Hover over variables to see their current values
6. Use Step Over (F10), Step Into (F11), Step Out (Shift+F11)
7. Use the **Console** panel to evaluate expressions at the breakpoint

### Reading Stack Traces

```javascript
// If this code errors:
function c() { throw new Error("boom"); }
function b() { c(); }
function a() { b(); }
a();

// The stack trace shows the call chain:
// Error: boom
//   at c (script.js:1)
//   at b (script.js:2)    ← b called c
//   at a (script.js:3)    ← a called b
//   at <anonymous>:1      ← top-level call
```

**Read bottom to top** — that's the actual execution order.

### Common Error Types

```javascript
// ReferenceError — variable doesn't exist
console.log(undefinedVar);  // ReferenceError: undefinedVar is not defined

// TypeError — wrong type used
null.toUpperCase();          // TypeError: Cannot read properties of null
const x = 1; x = 2;        // TypeError: Assignment to constant variable

// SyntaxError — code can't be parsed
if (true { }                // SyntaxError: Unexpected token '{'

// RangeError — value out of range
new Array(-1);              // RangeError: Invalid array length
```

### The Debugger Statement

```javascript
function calculateTotal(items) {
  debugger;  // execution pauses here (when DevTools is open)
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

## Try It Yourself

1. Open DevTools on any website. Find the Sources tab and set a breakpoint on a script.
2. Write a function that intentionally throws each error type (ReferenceError, TypeError, SyntaxError) and read the stack trace.
3. Use `console.table()` to display an array of objects in a readable format.
4. Add `debugger;` to a function and step through it line by line.

## Common Mistakes

- **Reading stack traces top-to-bottom**: The error is at the top, but the cause is at the bottom. Read bottom-up.
- **console.logging everything**: Learn to use breakpoints. They're faster and don't clutter your code.
- **Not checking the console**: Many beginners don't open DevTools at all. The console is where errors appear — always have it open during development.

## Checkpoint

1. What is a stack trace and how do you read it?
2. What's the difference between `console.warn` and `console.error`?
3. Name three error types and what causes each.
4. **Reflection**: Set a breakpoint in a function and step through it. What did you learn about how your code executes?
