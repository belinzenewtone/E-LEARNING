# DOM Manipulation Basics

## 🎯 By End of This Lesson You Will:
- Select elements on a webpage using `querySelector`
- Read and change text, HTML, and CSS classes from JavaScript
- Listen for clicks, inputs, and other events

---

## 🌍 Real-World Analogy First

The **DOM (Document Object Model)** is your webpage represented as a **tree of objects** that JavaScript can read and change.

```
Think of HTML as a tree:

     <html>
       │
       ├─ <head>
       │    └─ <title>My Page</title>
       │
       └─ <body>
            ├─ <h1>Welcome</h1>
            ├─ <button id="btn">Click me</button>
            └─ <ul id="list">
                 ├─ <li>Item 1</li>
                 └─ <li>Item 2</li>
```

Without DOM manipulation, your page is **static**. With it, your page becomes **interactive** — buttons that respond, lists that grow, themes that toggle. Every dynamic feature on the web uses the DOM.

---

## 📖 Start From Zero

### Setup — A Minimal HTML Page

```html
<!DOCTYPE html>
<html>
  <body>
    <h1 id="greeting">Hello</h1>
    <button id="changeBtn">Change greeting</button>

    <script>
      // Our JavaScript goes here
    </script>
  </body>
</html>
```

### Your First DOM Action

```javascript
const heading = document.querySelector("#greeting");
heading.textContent = "Hello, Belinze!";
```

Read it step by step:
- `document.querySelector("#greeting")` — find the element with id="greeting"
- `heading.textContent = "..."` — change its text content

That's it. You just changed your webpage from JavaScript.

---

## 🔨 Level Up

### Step 1: Selecting Elements

```javascript
// By ID — fastest, must be unique on the page
const btn = document.querySelector("#changeBtn");

// By class — first matching
const card = document.querySelector(".card");

// By tag — first matching
const heading = document.querySelector("h1");

// All matches as a list (NodeList)
const allCards = document.querySelectorAll(".card");
const allButtons = document.querySelectorAll("button");

// Loop over multiple elements
allCards.forEach(card => {
  card.classList.add("highlighted");
});
```

**Selectors are CSS selectors** — anything you'd use in CSS works:
```javascript
document.querySelector("nav > ul li:first-child");
document.querySelector("input[type='text']");
document.querySelector(".active.featured");
```

---

### Step 2: Reading and Changing Text

```javascript
const heading = document.querySelector("h1");

// Read it
console.log(heading.textContent);  // "Hello"

// Change it
heading.textContent = "New text";

// Add HTML (be careful — see warning below)
heading.innerHTML = "<em>Italic</em> text";
```

> **Critical:** Use `textContent` for plain text. Use `innerHTML` only when you need to insert HTML — and **never** with untrusted input (it's an XSS security risk).

---

### Step 3: Changing CSS Classes

The clean way to change styles is via CSS classes:

```html
<style>
  .dark-mode { background: black; color: white; }
  .highlighted { border: 2px solid yellow; }
</style>

<div id="box">Box</div>
```

```javascript
const box = document.querySelector("#box");

// Add a class
box.classList.add("dark-mode");

// Remove a class
box.classList.remove("highlighted");

// Toggle (add if absent, remove if present) — perfect for dark mode buttons
box.classList.toggle("dark-mode");

// Check if it has a class
if (box.classList.contains("dark-mode")) {
  console.log("It's dark!");
}
```

---

### Step 4: Reading Form Inputs

```html
<input type="text" id="nameInput" placeholder="Your name">
<button id="submitBtn">Submit</button>
<p id="output"></p>
```

```javascript
const input = document.querySelector("#nameInput");
const output = document.querySelector("#output");

// Read what the user typed
const value = input.value;
console.log(value);  // whatever they typed

// Set the value (programmatic update)
input.value = "Default name";

// For checkboxes:
const checkbox = document.querySelector("#myCheck");
console.log(checkbox.checked);   // true or false
```

---

### Step 5: Event Listeners — Reacting to User Actions

```javascript
const btn = document.querySelector("#submitBtn");

btn.addEventListener("click", () => {
  console.log("Button clicked!");
});
```

Read this as: **"When `btn` receives a `click` event, run this function."**

**Common events:**
```javascript
button.addEventListener("click", handler);
input.addEventListener("input", handler);       // every keystroke
input.addEventListener("change", handler);      // when leaves field
form.addEventListener("submit", handler);
window.addEventListener("load", handler);
window.addEventListener("keydown", handler);
```

---

### Step 6: The Event Object

```javascript
input.addEventListener("input", (event) => {
  console.log(event.target.value);  // current input text
});

button.addEventListener("click", (event) => {
  event.preventDefault();           // stop default behaviour (e.g. form submit)
  console.log(event.target.id);     // "submitBtn"
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    console.log("Enter pressed!");
  }
});
```

`event.target` = the element the event happened on  
`event.preventDefault()` = stop the browser's default behaviour

---

### Step 7: Creating and Adding Elements

```javascript
const list = document.querySelector("#list");

// Create a new element
const newItem = document.createElement("li");
newItem.textContent = "New item!";
newItem.classList.add("new");

// Add it to the page
list.appendChild(newItem);   // adds to the end
list.prepend(newItem);        // adds to the beginning

// Remove an element
const oldItem = document.querySelector(".old");
oldItem.remove();
```

---

### Step 8: Putting It Together — A Working Mini-App

```html
<input type="text" id="todoInput" placeholder="Add a task">
<button id="addBtn">Add</button>
<ul id="todoList"></ul>
```

```javascript
const input = document.querySelector("#todoInput");
const addBtn = document.querySelector("#addBtn");
const list = document.querySelector("#todoList");

addBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return;   // guard against empty input

  const item = document.createElement("li");
  item.textContent = text;
  list.appendChild(item);

  input.value = "";   // clear the input
});
```

You just built a working to-do list. That's the DOM in 15 lines.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Select and change:**
```javascript
// HTML has <h1 id="title">Old Title</h1>
// Change its text to "New Title"
```

**Exercise 2 — Toggle a class:**
```javascript
// On button click, toggle a "dark-mode" class on the <body>
```

**Exercise 3 — Read input:**
```javascript
// Build: input + button. When clicked, alert what the user typed.
```

**Exercise 4 — List builder:**
```javascript
// Click a button to add a new <li> with text "Item 1", "Item 2", etc.
// Use a counter variable to track the number
```

**Exercise 5 — Live counter:**
```javascript
// Input that shows the current character count below it
// e.g. typing "hello" shows "5 characters"
// Use addEventListener("input", ...)
```

**Exercise 6 — Remove on click:**
```javascript
// A list of items where clicking an item removes it from the list
// Hint: use event.target inside the click handler
```

**Exercise 7 — Form submit:**
```javascript
// Form with email + password
// On submit: prevent default, validate both are non-empty, show message
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| `querySelector` before DOM is loaded | `null` returned | Put `<script>` at end of body or use `DOMContentLoaded` |
| Using `innerHTML` with user input | XSS security hole | Use `textContent` for user input |
| Adding event listener inside loop incorrectly | All trigger the same value | Use `event.target` or scope variables properly |
| Forgetting `event.preventDefault()` on forms | Page reloads, losing state | Always preventDefault on form submit |
| Querying every time | Slow | Cache the result in a variable |

---

## 🧠 Mental Model

```
DOM = the live tree of your webpage that JavaScript can read & change

Select:    document.querySelector("#id" | ".class" | "tag")
Read:      element.textContent / .value / .classList
Change:    element.textContent = "..."
           element.classList.add/remove/toggle("...")
Create:    document.createElement("li")
Add:       parent.appendChild(child)
Listen:    element.addEventListener("event", handler)
Remove:    element.remove()
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between `textContent` and `innerHTML`? When would you use each?
2. **Predict:** What does this print?
   ```javascript
   const btn = document.querySelector("#myBtn");
   btn.addEventListener("click", e => console.log(e.target.id));
   ```
3. **Find the bug:**
   ```javascript
   const btn = document.querySelector("#submit");
   btn.addEventListener("click", () => {
     console.log("clicked");
   });
   // Nothing happens when clicked. Possible reasons?
   ```
4. **Write it:** Build a counter app — display a number, with "+1" and "-1" buttons that update it.
5. **Apply it:** Build a theme toggle button. Clicking it adds/removes a "dark" class on `<body>`. The button label should change between "🌙 Dark" and "☀️ Light".
6. **Reflect:** Why is changing classes preferred over changing inline styles directly with JavaScript?
