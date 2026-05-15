# Promises & Async/Await

## 🎯 By End of This Lesson You Will:
- Explain what a Promise is and the three states it can be in
- Use `.then`/`.catch` and `async`/`await` correctly
- Handle multiple async operations with `Promise.all`

---

## 🌍 Real-World Analogy First

A **Promise** is a "future result" — like ordering food at a restaurant:

```
1. You order               (call an async function)
2. You get a receipt        (the Promise is returned IMMEDIATELY)
3. You sit and do other     (other code runs — JS doesn't block!)
4. Eventually food arrives  (the Promise resolves with a value)
   OR they're out of stock   (the Promise rejects with an error)
```

You don't sit staring at the kitchen — you get a **placeholder** (the Promise) and decide what to do once the food arrives (using `.then` or `await`).

Async code is everywhere in real apps — every network request, file read, database query is async. Master Promises and you've unlocked real-world JavaScript.

---

## 📖 Start From Zero

### Three States of a Promise

```
┌─────────┐   resolve(value)   ┌──────────┐
│         │ ─────────────────► │ FULFILLED│
│ PENDING │                    └──────────┘
│         │   reject(error)    ┌──────────┐
│         │ ─────────────────► │ REJECTED │
└─────────┘                    └──────────┘
```

Every Promise starts pending. Eventually it transitions to fulfilled (with a value) or rejected (with an error) — and stays there forever.

---

## 🔨 Level Up

### Step 1: Creating a Promise

```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = Math.random() > 0.5;
    if (success) resolve("It worked!");
    else reject(new Error("It failed"));
  }, 1000);
});

promise
  .then(value => console.log("Got:", value))
  .catch(error => console.log("Error:", error.message));
```

In practice, you rarely create Promises with `new Promise()` — most APIs (fetch, file read, database) return Promises for you.

### Step 2: Consuming Promises with `.then`/`.catch`

```javascript
fetch("https://api.example.com/users/1")
  .then(response => response.json())
  .then(user => console.log(user))
  .catch(error => console.error("Failed:", error))
  .finally(() => console.log("Done"));
```

**The chain:**
- `.then(fn)` — runs when the previous step resolves; receives the value
- `.catch(fn)` — runs if ANY previous step rejects
- `.finally(fn)` — always runs at the end (cleanup)

Each `.then` can return a value or another Promise — chains let you sequence work.

---

### Step 3: async/await — The Modern Way

`async`/`await` is **syntax sugar** over Promises. It makes async code read like synchronous code:

```javascript
// Old way — Promise chain:
function loadUser() {
  return fetch("/api/user")
    .then(r => r.json())
    .then(user => {
      console.log(user);
      return user;
    })
    .catch(err => console.error(err));
}

// Modern way — async/await:
async function loadUser() {
  try {
    const response = await fetch("/api/user");
    const user = await response.json();
    console.log(user);
    return user;
  } catch (err) {
    console.error(err);
  }
}
```

**Rules:**
- `async` before a function → that function automatically returns a Promise
- `await` before a Promise → pauses inside this async function until the Promise resolves
- `await` can only be used inside `async` functions (or at top level in modules)

---

### Step 4: Error Handling

```javascript
// With .then/.catch
fetch("/api/data")
  .then(r => r.json())
  .catch(err => console.error("Failed:", err));

// With try/catch (async/await)
async function loadData() {
  try {
    const r = await fetch("/api/data");
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (err) {
    console.error("Failed:", err);
    throw err;   // re-throw if caller should handle
  }
}
```

> **Critical:** `fetch` does NOT reject on HTTP errors (404, 500). It only rejects on network failure. Always check `response.ok` manually.

---

### Step 5: Promise.all — Parallel Operations

```javascript
// ❌ Sequential — slow
async function loadDashboard() {
  const user = await fetch("/api/user").then(r => r.json());
  const stats = await fetch("/api/stats").then(r => r.json());
  const lessons = await fetch("/api/lessons").then(r => r.json());
  return { user, stats, lessons };
}
// Total time: user + stats + lessons (in series)

// ✅ Parallel — fast
async function loadDashboard() {
  const [user, stats, lessons] = await Promise.all([
    fetch("/api/user").then(r => r.json()),
    fetch("/api/stats").then(r => r.json()),
    fetch("/api/lessons").then(r => r.json())
  ]);
  return { user, stats, lessons };
}
// Total time: max of (user, stats, lessons) — runs in parallel
```

`Promise.all` waits for ALL Promises to resolve, or rejects as soon as any one rejects.

---

### Step 6: Promise.allSettled, Promise.race

```javascript
// Wait for ALL — fail-fast on any rejection
Promise.all([p1, p2, p3])

// Wait for ALL — never fails, returns array of results+errors
Promise.allSettled([p1, p2, p3]);
// Each: { status: "fulfilled", value: X } or { status: "rejected", reason: e }

// First one to finish (success OR failure)
Promise.race([p1, p2, p3])

// First successful one (or rejects if all fail)
Promise.any([p1, p2, p3])
```

Use `allSettled` when you want all results regardless of failures (e.g., load all dashboards, show whatever loaded).

---

### Step 7: Common Gotchas

```javascript
// ❌ Forgetting await
async function bad() {
  const data = fetch("/api/x");   // ← missing await! data is a Promise, not the response
  console.log(data);               // logs the Promise object
}

// ❌ Awaiting in sequence when parallel is possible
async function slow() {
  const a = await fetch("/api/a");
  const b = await fetch("/api/b");   // could've run in parallel
}

// ✅ Use Promise.all
async function fast() {
  const [a, b] = await Promise.all([fetch("/api/a"), fetch("/api/b")]);
}

// ❌ Forgetting to handle errors
async function unsafe() {
  const data = await fetch("/api/might-fail");   // unhandled rejection if fails
}

// ✅ try/catch
async function safe() {
  try {
    const data = await fetch("/api/might-fail");
  } catch (err) {
    /* handle */
  }
}
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Basic Promise:**
```javascript
// Create a Promise that resolves with "Hello" after 1 second
// Consume it with .then to log the value
```

**Exercise 2 — async/await:**
```javascript
// Rewrite the above using async/await
```

**Exercise 3 — Sequential then parallel:**
```javascript
// Write a function that fetches:
//   https://jsonplaceholder.typicode.com/users/1
//   https://jsonplaceholder.typicode.com/users/2
//   https://jsonplaceholder.typicode.com/users/3
// First write it sequentially
// Then rewrite using Promise.all
// Time each version with console.time
```

**Exercise 4 — Error handling:**
```javascript
// Fetch from a URL that doesn't exist (e.g., /api/nope)
// Show a user-friendly error message in the console
```

**Exercise 5 — Chaining:**
```javascript
// Use a Promise chain (no async/await):
// 1. Fetch a user
// 2. Then fetch their posts
// 3. Then console.log the post titles
```

**Exercise 6 — allSettled:**
```javascript
// Try to load 3 different URLs (some valid, some 404)
// Use Promise.allSettled
// Print which succeeded and which failed
```

**Exercise 7 — Real pattern:**
```javascript
// Build loadDashboard() async function:
// - Fetches user profile, stats, and recent activity in parallel
// - Returns one combined object
// - Shows a friendly error if anything fails
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Forgetting `await` | Get a Promise instead of value | Add `await` |
| `await` outside async function | SyntaxError | Wrap in async function or use top-level await in modules |
| Not handling errors | Unhandled promise rejection | try/catch or `.catch` |
| Sequential when parallel works | Slow | Use `Promise.all` |
| Assuming fetch rejects on 404 | Silently uses the error body | Check `response.ok` |

---

## 🧠 Mental Model

```
Promise = future result (pending → fulfilled or rejected)

Consume:
  .then(fn).catch(fn).finally(fn)
  or
  async function f() {
    try {
      const x = await somePromise;
    } catch (err) { ... }
  }

Combine:
  Promise.all([...])         all succeed or one fails
  Promise.allSettled([...])  always succeeds, returns each result
  Promise.race([...])        first to settle (success or fail)
  Promise.any([...])         first to succeed
```

---

## 📝 Check Your Understanding

1. **Define:** What are the three states of a Promise?
2. **Predict:**
   ```javascript
   const p = Promise.resolve(1)
     .then(x => x + 1)
     .then(x => x * 2);
   p.then(console.log);   // what?
   ```
3. **Find the bug:**
   ```javascript
   async function load() {
     const data = fetch("/api/x");
     console.log(data.name);
   }
   // Why does this fail?
   ```
4. **Write it:** Write a function that retries a fetch up to 3 times with 1 second between tries.
5. **Apply it:** Sequential vs parallel — which would you use for "load user info AND their orders"? Why?
6. **Reflect:** Why does JavaScript use Promises instead of just blocking until the result is ready (like some other languages)?
