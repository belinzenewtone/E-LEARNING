# Closures & Scope

## 🎯 By End of This Lesson You Will:
- Explain what a closure is in plain language
- Use closures to create private state (counters, factories)
- Recognize closures you've already been using without knowing

---

## 🌍 Real-World Analogy First

A **closure** is when a function "remembers" the variables from where it was created — even after that surrounding code has finished running.

Imagine a vending machine preset with a specific drink:

```
preset(coke)  →  returns a "dispense" button
   │
   └─ The button REMEMBERS it dispenses Coke
      Even though preset() is long done,
      the button still knows its drink.
```

```javascript
function preset(drink) {
  return function dispense() {
    console.log("Dispensing", drink);
  };
}

const cokeButton = preset("Coke");
const pepsiButton = preset("Pepsi");

cokeButton();   // "Dispensing Coke"
pepsiButton();  // "Dispensing Pepsi"
```

Each returned function **closes over** its own `drink` variable. They remember their own context — that's a closure.

---

## 📖 Start From Zero

### Your First Closure

```javascript
function outer() {
  const message = "Hello";

  function inner() {
    console.log(message);  // uses message from outer
  }

  return inner;
}

const greet = outer();
greet();  // "Hello"
```

Even though `outer()` has finished, `inner` still has access to `message`. The inner function "closed over" the message variable.

---

## 🔨 Level Up

### Step 1: Function Factories

```javascript
function makeAdder(x) {
  return function (y) {
    return x + y;   // uses x from outer
  };
}

const add5 = makeAdder(5);
const add10 = makeAdder(10);

console.log(add5(3));   // 8
console.log(add10(3));  // 13
```

`add5` and `add10` each have their own captured `x` — independent.

---

### Step 2: Counters — The Classic Example

```javascript
function makeCounter() {
  let count = 0;

  return {
    increment() { count++; },
    decrement() { count--; },
    get value() { return count; }
  };
}

const counter = makeCounter();
counter.increment();
counter.increment();
counter.increment();
console.log(counter.value);  // 3

// Can you access count directly?
console.log(counter.count);  // undefined — it's PRIVATE!
```

The `count` variable is invisible from outside but accessible to the methods. This is how JavaScript creates "private" data.

---

### Step 3: Each Closure Is Independent

```javascript
const counterA = makeCounter();
const counterB = makeCounter();

counterA.increment();
counterA.increment();
counterB.increment();

console.log(counterA.value);  // 2
console.log(counterB.value);  // 1
```

Each call creates a **fresh `count` variable** for that returned object.

---

### Step 4: Currying — Partial Application

```javascript
function multiply(a) {
  return function (b) {
    return a * b;
  };
}

const double = multiply(2);
const triple = multiply(3);

console.log(double(5));      // 10
console.log(triple(5));      // 15
console.log(multiply(4)(7)); // 28 — call it all at once
```

Arrow version (modern):
```javascript
const multiply = a => b => a * b;
const double = multiply(2);
```

---

### Step 5: Real-World Pattern — Event Handler State

```javascript
function makeClickCounter() {
  let clicks = 0;
  return function () {
    clicks++;
    console.log(`Button clicked ${clicks} times`);
  };
}

const handleClick = makeClickCounter();
document.querySelector("#myBtn").addEventListener("click", handleClick);
```

Each click increments the closed-over `clicks` variable. No global needed.

---

### Step 6: The Loop Closure Trap (Classic Interview)

```javascript
// ❌ Buggy: all timeouts log 5
for (var i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 5, 5, 5, 5, 5

// ✅ Fix: use `let` (block-scoped — each iteration gets its own `i`)
for (let i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2, 3, 4
```

Why? With `var`, all the timeout callbacks close over the SAME `i` variable, which is `5` by the time they run. With `let`, each iteration creates a new `i` for that block.

This is one reason `let`/`const` were introduced.

---

### Step 7: IIFE — Self-Executing Function

```javascript
(function () {
  const secret = "scoped here";
  console.log(secret);
})();

(() => {
  // arrow IIFE
})();
```

Creates a private scope without polluting the global. Common in older code, less needed today thanks to modules.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Basic closure:**
```javascript
// Write makeGreeter(name) returning a function that, when called,
// returns "Hello, [name]!"
const greetAlice = makeGreeter("Alice");
console.log(greetAlice());  // "Hello, Alice!"
```

**Exercise 2 — Counter:**
```javascript
// Build a counter with .increment, .decrement, .reset
// using a closure — count should be private
```

**Exercise 3 — Custom adders:**
```javascript
const add5 = makeAdder(5);
console.log(add5(10));      // 15
```

**Exercise 4 — Currying:**
```javascript
// Write curried power so power(2)(3) === 8
```

**Exercise 5 — Private XP tracker:**
```javascript
// addXP(amount), getXP(), reset()
const tracker = makeXPTracker();
tracker.addXP(50);
console.log(tracker.getXP());  // 50
```

**Exercise 6 — Loop bug:**
```javascript
// Predict BEFORE running:
for (var i = 1; i <= 3; i++) {
  setTimeout(() => console.log(`var: ${i}`), 0);
}
for (let i = 1; i <= 3; i++) {
  setTimeout(() => console.log(`let: ${i}`), 0);
}
```

**Exercise 7 — Once:**
```javascript
// Write once(fn) — returns a function that can only be called once
const init = once(() => console.log("initialized"));
init();  // "initialized"
init();  // nothing
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| `var` in loop with async callbacks | All share final value | Use `let` |
| Forgetting closure keeps variables alive | Memory bloat | Be deliberate about long-lived closures |
| Accessing private vars from outside | undefined | They're private — that's the point |

---

## 🧠 Mental Model

```
Closure = function + its captured variables

Inner functions CAPTURE their outer scope's variables.
Those variables stay alive even after outer returns.

Used for:
  • Private state (counters, trackers)
  • Function factories (makeAdder, makeGreeter)
  • Currying / partial application
  • Event handlers with state
```

---

## 📝 Check Your Understanding

1. **Define:** What is a closure in one sentence?
2. **Predict:**
   ```javascript
   function outer() {
     let x = 10;
     return () => x++;
   }
   const fn = outer();
   console.log(fn(), fn(), fn());
   ```
3. **Find the bug:** Why does `for (var i...)` with setTimeout print 3, 3, 3?
4. **Write it:** Create `makeStudyTimer()` with start(), pause(), getElapsed() methods using a closure.
5. **Apply it:** Find a closure you've already written without realizing — in event handlers, callbacks, etc.
6. **Reflect:** Why do closures matter in JavaScript more than some other languages? What feature do they enable?
