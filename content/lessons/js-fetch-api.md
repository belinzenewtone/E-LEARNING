# Fetch API & Working with JSON

## 🎯 By End of This Lesson You Will:
- Use `fetch` to GET data from an API
- POST data with headers, JSON body, and proper error handling
- Handle loading states and HTTP error codes correctly

---

## 🌍 Real-World Analogy First

`fetch` is JavaScript's way of **making an HTTP request** — like ordering from a remote kitchen:

```
1. You tell the kitchen what you want      ← fetch(url, options)
2. Kitchen prepares the order              ← server processes
3. You receive a Response object           ← await fetch returns
4. You unwrap the actual food (JSON)       ← await response.json()
5. You use the data                        ← consume in your app
```

Every web app today talks to an API for data. `fetch` is how JavaScript does that.

---

## 📖 Start From Zero

### Your First Fetch

```javascript
async function getUser() {
  const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
  const user = await response.json();
  console.log(user);
}

getUser();
```

Step by step:
1. `fetch(url)` — sends the HTTP GET request, returns a Promise
2. `await` it → get a `Response` object (which has metadata: status, headers)
3. `response.json()` — parses the body as JSON, also returns a Promise
4. `await` that → get the actual JavaScript object

---

## 🔨 Level Up

### Step 1: The Response Object

```javascript
const response = await fetch("/api/data");

console.log(response.ok);          // true if status is 200-299
console.log(response.status);      // 200, 404, 500, etc.
console.log(response.statusText);  // "OK", "Not Found"
console.log(response.headers.get("content-type"));

// Body is a stream — you can only read it ONCE:
const data = await response.json();    // OR
// const text = await response.text();
// const blob = await response.blob();
```

### Step 2: Handle HTTP Errors Manually

**Critical:** `fetch` does NOT throw on 404 or 500. It only throws on network failure (offline, DNS, etc.).

```javascript
async function safeFetch(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

try {
  const data = await safeFetch("/api/users/9999");
} catch (err) {
  console.error("Fetch failed:", err.message);
}
```

This is a wrapper you'll write in every real project.

---

### Step 3: POST — Sending Data

```javascript
async function createUser(userData) {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) throw new Error("Failed to create user");

  return await response.json();
}

const newUser = await createUser({
  name: "Alice",
  email: "alice@example.com"
});
```

**Key parts:**
- `method: "POST"` — tell the server you're creating
- `Content-Type: application/json` — declare the body format
- `JSON.stringify(...)` — convert your object to a JSON string for transmission

---

### Step 4: PUT, PATCH, DELETE

```javascript
// Full update
await fetch(`/api/users/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(fullUserData)
});

// Partial update
await fetch(`/api/users/${id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "new@email.com" })
});

// Delete
await fetch(`/api/users/${id}`, { method: "DELETE" });
```

### Step 5: Query Parameters

```javascript
// Manually
fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`);

// Better — URL constructor
const url = new URL("https://api.example.com/search");
url.searchParams.set("q", query);
url.searchParams.set("limit", "10");
fetch(url);
```

`encodeURIComponent` is critical — without it, characters like `&` or spaces break your URL.

---

### Step 6: Headers — Auth Tokens

```javascript
async function getProtected() {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/me", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  // ...
}
```

For Next.js apps using cookies, no token header is needed — the browser sends cookies automatically.

---

### Step 7: Loading and Error States — The Full Pattern

```javascript
async function loadAndDisplay() {
  // Show loading
  setLoading(true);
  setError(null);

  try {
    const response = await fetch("/api/data");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    setData(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}
```

The 4 states every fetch-based UI must handle:
```
1. Idle    — haven't fetched yet
2. Loading — request in flight
3. Success — got data
4. Error   — fetch or parsing failed
```

---

### Step 8: AbortController — Cancel Requests

```javascript
const controller = new AbortController();

fetch("/api/slow-endpoint", { signal: controller.signal })
  .then(r => r.json())
  .catch(err => {
    if (err.name === "AbortError") console.log("Cancelled");
  });

// Later — cancel:
controller.abort();
```

Useful for canceling stale requests in search-as-you-type UIs.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Basic GET:**
```javascript
// Fetch https://jsonplaceholder.typicode.com/users/1
// Log the user's name and email
```

**Exercise 2 — Error handling:**
```javascript
// Fetch a URL that returns 404
// Show a friendly error message — don't crash
```

**Exercise 3 — Loading state simulation:**
```javascript
// Build a function loadData() that:
// 1. Logs "Loading..."
// 2. Fetches data (use a 1-second delay via setTimeout in a Promise)
// 3. Logs the data when done
// 4. Logs "Done"
```

**Exercise 4 — POST:**
```javascript
// POST to https://jsonplaceholder.typicode.com/posts with:
// { title: "Hello", body: "World", userId: 1 }
// Log the response (it should include an id assigned by the server)
```

**Exercise 5 — Query params:**
```javascript
// Build a URL with searchParams to fetch:
// https://jsonplaceholder.typicode.com/posts?userId=1
// (use URL constructor)
```

**Exercise 6 — Parallel fetches:**
```javascript
// Fetch users 1, 2, and 3 in parallel using Promise.all
// Log all 3 names
```

**Exercise 7 — Real pattern:**
```javascript
// Build a "search" function that:
// 1. Takes a query string
// 2. Cancels any previous request still in flight (AbortController)
// 3. Fetches /api/search?q=...
// 4. Returns results or null if cancelled
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Forgetting `response.ok` check | Treat error as success | Always check `if (!response.ok)` |
| Forgetting `await response.json()` | Get a Promise object | Add await |
| Body is read twice | "body stream already read" error | Read once, store in variable |
| Special chars in URL | Broken URL | Use `encodeURIComponent` or URL API |
| Mixing CORS sources | CORS error in browser | Server must allow your origin |
| Forgetting `Content-Type` on POST | Server can't parse body | Always set header for JSON |

---

## 🧠 Mental Model

```
fetch(url, options) → Promise<Response>
  response.ok        → true if 2xx
  response.status    → number
  response.json()    → Promise<parsed object>
  response.text()    → Promise<string>

options:
  method: "POST"/"PUT"/"DELETE"/etc.
  headers: { "Content-Type": "application/json", "Authorization": ... }
  body: JSON.stringify(data)
  signal: AbortController.signal

Always check `response.ok` — fetch doesn't reject on HTTP errors!
```

---

## 📝 Check Your Understanding

1. **Define:** Why is checking `response.ok` important after `fetch`?
2. **Predict:** What happens here?
   ```javascript
   const r = await fetch("/api/data");
   const a = await r.json();
   const b = await r.json();
   ```
3. **Find the bug:**
   ```javascript
   fetch("/api/users", {
     method: "POST",
     body: { name: "Alice" }
   });
   // Two things are wrong. What?
   ```
4. **Write it:** Write `loadUserSafely(id)` that fetches a user, returns `null` if the user doesn't exist, throws on network errors.
5. **Apply it:** Build a search box that fetches `/api/search?q=...` on each keystroke but cancels in-flight requests.
6. **Reflect:** Why does `fetch` not reject on 404? Is this a good design or bad?
