# DOM Manipulation Basics

## Why This Matters

The DOM (Document Object Model) is how JavaScript talks to HTML. Every interactive website you've ever used — every button click, form submission, animation, and live update — is JavaScript manipulating the DOM. This is where JavaScript stops being abstract and starts affecting what users actually see.

## Core Concepts

### The DOM Tree

The browser converts your HTML into a tree of objects:

```html
<div id="app">
  <h1 class="title">Welcome</h1>
  <p>Hello, <span>world</span></p>
</div>
```

```
document
  └── div#app
        ├── h1.title ("Welcome")
        └── p ("Hello, ")
              └── span ("world")
```

### Selecting Elements

```javascript
// By ID — returns single element (fastest)
const app = document.getElementById("app");

// CSS selector — returns first match
const title = document.querySelector(".title");
const link = document.querySelector("a[href='/login']");

// CSS selector — returns ALL matches (NodeList)
const allButtons = document.querySelectorAll("button");
allButtons.forEach(btn => console.log(btn.textContent));
```

### Reading and Changing Content

```javascript
const heading = document.querySelector("h1");

// textContent — plain text (safe, ignores HTML)
heading.textContent = "Goodbye";

// innerHTML — parses HTML (use carefully)
heading.innerHTML = "<em>Goodbye</em>";

// For form inputs, use .value
const input = document.querySelector("input");
console.log(input.value);
```

### Modifying Classes and Styles

```javascript
const box = document.querySelector(".box");

// classList — the modern way
box.classList.add("highlight");
box.classList.remove("hidden");
box.classList.toggle("active");  // add if absent, remove if present
box.classList.contains("active"); // true/false

// Inline styles (use sparingly — prefer CSS classes)
box.style.backgroundColor = "blue";
box.style.display = "none";
```

### Event Listeners

```javascript
const button = document.querySelector("button");

button.addEventListener("click", (event) => {
  console.log("Clicked!", event);
  console.log("Target:", event.target);       // what was clicked
  console.log("Position:", event.clientX, event.clientY);
});

// Common events: click, submit, input, change, keydown, mouseover
```

### Creating and Removing Elements

```javascript
// Create
const newItem = document.createElement("li");
newItem.textContent = "New task";
document.querySelector("ul").appendChild(newItem);

// Or with modern API
document.querySelector("ul").insertAdjacentHTML(
  "beforeend",
  "<li>New task</li>"
);

// Remove
const item = document.querySelector("li");
item.remove();
```

## Try It Yourself

1. Create an HTML page with a button and a paragraph. When clicked, change the paragraph text.
2. Build a color-switcher: three buttons (red, green, blue) that change a div's background.
3. Create a counter: "Increase" and "Decrease" buttons that modify a displayed number.
4. Add a "dark mode" toggle button that adds/removes a CSS class from the body.

## Common Mistakes

- **Running JS before DOM loads**: If your script runs in `<head>` before the body, elements don't exist yet. Use `DOMContentLoaded` event or put scripts at the end of `<body>`.
- **Using innerHTML with user input**: `innerHTML = userInput` is an XSS security risk. Use `textContent` instead.
- **querySelector vs querySelectorAll**: The former returns one element (or null), the latter returns a NodeList. `querySelectorAll("p").classList.add(...)` fails — you need to loop.

## Checkpoint

1. Which method returns the first matching CSS selector?
2. What's the difference between `textContent` and `innerHTML`?
3. How do you add a class to an element without overwriting existing classes?
4. **Reflection**: Build a simple click counter. What surprised you about DOM manipulation?
