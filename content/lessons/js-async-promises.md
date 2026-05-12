# Promises & Async/Await

## Why This Matters

JavaScript is single-threaded but the world is asynchronous. Network requests, file reads, timers — they all take time. Promises and async/await let you write non-blocking code that reads like synchronous code, without callback hell. This is the backbone of every modern web app.

## Core Concepts

### The Problem: Callback Hell

```javascript
// The old way — "callback hell" or "pyramid of doom"
getUser(id, (err, user) => {
  if (err) return handleError(err);
  getPosts(user.id, (err, posts) => {
    if (err) return handleError(err);
    getComments(posts[0].id, (err, comments) => {
      if (err) return handleError(err);
      console.log(comments); // finally — after 3 levels of nesting
    });
  });
});
```

### Promises — The Solution

A Promise is an object representing a value that will be available in the future. It has three states:

```
pending → fulfilled (success)
       → rejected  (error)
```

```javascript
// Creating a Promise
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = Math.random() > 0.3;
    if (success) {
      resolve("Data loaded!");
    } else {
      reject(new Error("Network error"));
    }
  }, 1000);
});

// Consuming a Promise
promise
  .then(result => console.log(result))   // runs on resolve
  .catch(error => console.error(error))  // runs on reject
  .finally(() => console.log("Done"));   // always runs
```

### Chaining Promises

```javascript
fetchUser(1)
  .then(user => fetchPosts(user.id))
  .then(posts => fetchComments(posts[0].id))
  .then(comments => console.log(comments))
  .catch(error => console.error("Something failed:", error));
// One .catch handles errors from ANY step in the chain
```

### async/await — Syntactic Sugar

```javascript
// Same logic, but reads like synchronous code
async function loadUserData(userId) {
  try {
    const user = await fetchUser(userId);
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    console.log(comments);
  } catch (error) {
    console.error("Something failed:", error);
  }
}

// async functions ALWAYS return a Promise
async function getValue() {
  return 42; // implicitly wrapped in Promise.resolve(42)
}
getValue().then(v => console.log(v)); // 42
```

### Running Promises in Parallel

```javascript
// Sequential (slow — 3 seconds total)
const user = await fetchUser(1);       // 1s
const posts = await fetchPosts(1);     // 1s
const settings = await fetchSettings(); // 1s

// Parallel (fast — 1 second total)
const [user, posts, settings] = await Promise.all([
  fetchUser(1),
  fetchPosts(1),
  fetchSettings(),
]);
// All three requests fire at the same time. Waits for all to finish.

// Promise.allSettled — don't fail if some reject
const results = await Promise.allSettled([
  fetch("/api/users"),
  fetch("/api/posts"),
  fetch("/api/broken-endpoint"),
]);
// results: [{ status: "fulfilled", value: ... }, { status: "rejected", reason: ... }]

// Promise.race — take the first to resolve/reject
const timeout = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("Timeout")), 5000)
);
const data = await Promise.race([fetch("/api/slow"), timeout]);
```

### Error Handling Patterns

```javascript
// Pattern 1: try/catch
async function getData() {
  try {
    return await fetch("/api/data").then(r => r.json());
  } catch (error) {
    console.error(error);
    return null; // graceful degradation
  }
}

// Pattern 2: .catch on the promise
async function getData() {
  const data = await fetch("/api/data")
    .then(r => r.json())
    .catch(() => null); // default on error
  return data;
}
```

## Try It Yourself

1. Create a Promise that resolves after 2 seconds with "Done" and log the result.
2. Chain 3 `.then()` calls that each wait 1 second and log a message.
3. Rewrite the chain using async/await.
4. Fetch 3 different API endpoints in parallel using `Promise.all`.

## Common Mistakes

- **Not returning in .then()**: `.then(() => { fetchData() })` breaks the chain. Use `.then(() => fetchData())` or add `return`.
- **async function without await**: An async function without await still returns a Promise. You still need `.then()` or `await` to get the value.
- **Promise.all fast-fails**: If any promise in `Promise.all` rejects, the whole thing rejects. Use `Promise.allSettled` if you need partial results.

## Checkpoint

1. What does async/await do to Promise rejection?
2. What's the difference between `Promise.all` and `Promise.allSettled`?
3. Why does an async function always return a Promise?
4. **Reflection**: Find a place in your code where parallel Promises would be faster than sequential awaits.
