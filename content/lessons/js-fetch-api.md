# Fetch API & Working with JSON

## Why This Matters

Every web app communicates with servers. The Fetch API is the modern way to make HTTP requests from the browser. Combined with JSON, it's how you load data, submit forms, and sync state. Master fetch and JSON, and you can talk to any API on the internet.

## Core Concepts

### Basic fetch

```javascript
// GET request
fetch("https://api.example.com/users")
  .then(response => response.json())  // parse JSON body
  .then(data => console.log(data))
  .catch(error => console.error("Fetch failed:", error));
```

### async/await Style

```javascript
async function getUsers() {
  try {
    const response = await fetch("https://api.example.com/users");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}
```

### Understanding the Response

```javascript
const response = await fetch("/api/users");

response.ok;        // true if status 200-299
response.status;    // 200, 404, 500, etc.
response.headers;   // response headers (Headers object)

// Always check response.ok — fetch doesn't throw on 404/500
if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}
```

### JSON.stringify and JSON.parse

```javascript
// JavaScript object → JSON string
const user = { name: "Alice", age: 30, roles: ["admin"] };
const json = JSON.stringify(user);
// '{"name":"Alice","age":30,"roles":["admin"]}'

// JSON string → JavaScript object
const parsed = JSON.parse(json);
parsed.name; // "Alice"

// Pretty-print
JSON.stringify(user, null, 2);
// {
//   "name": "Alice",
//   "age": 30,
//   "roles": ["admin"]
// }

// Custom serialization
JSON.stringify(user, ["name", "age"]); // only these keys
```

### POST, PUT, DELETE Requests

```javascript
// POST — create
const newUser = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Bob", email: "bob@test.com" }),
});

// PUT — update (full replacement)
await fetch("/api/users/1", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Robert", email: "bob@test.com" }),
});

// PATCH — partial update
await fetch("/api/users/1", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Bobby" }),
});

// DELETE
await fetch("/api/users/1", { method: "DELETE" });
```

### Loading, Error, and Empty States

```javascript
async function UserList() {
  const [status, setStatus] = useState("loading"); // loading | error | empty | success

  try {
    const response = await fetch("/api/users");
    if (!response.ok) throw new Error("Failed");
    const users = await response.json();

    if (users.length === 0) {
      setStatus("empty");
    } else {
      setStatus("success");
      // render users
    }
  } catch {
    setStatus("error");
  }
}
```

### Working with Headers

```javascript
// Authentication
const response = await fetch("/api/protected", {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

// Reading response headers
const rateLimit = response.headers.get("X-RateLimit-Remaining");
const contentType = response.headers.get("Content-Type");
```

## Try It Yourself

1. Fetch data from `https://jsonplaceholder.typicode.com/posts` and log the first post's title.
2. POST a new post to the same API and log the response.
3. Implement all four states (loading, error, empty, success) for a fetch request.
4. Write a utility function `apiFetch(url, options)` that adds auth headers and checks `response.ok`.

## Common Mistakes

- **Not checking response.ok**: Fetch only rejects on network errors, not HTTP errors (404, 500). Always check `response.ok`.
- **Calling .json() twice**: `response.json()` consumes the body stream. Second call fails. Save the result.
- **Forgetting Content-Type header for POST**: Without it, the server may not parse your JSON body correctly.

## Checkpoint

1. Why do you need to call `.json()` on a fetch response?
2. What HTTP status codes will NOT cause fetch to throw an error?
3. What's the difference between `JSON.parse` and `JSON.stringify`?
4. **Reflection**: Design the data fetching strategy for your Learning OS dashboard.
