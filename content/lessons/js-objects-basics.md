# Objects: Properties & Methods

## Why This Matters

Objects are the core data structure of JavaScript. Almost everything in JS is an object or behaves like one. Objects let you group related data and behavior together — a user has a name, email, and a `login()` method. Understanding objects is understanding JavaScript.

## Core Concepts

### Object Literals

```javascript
const user = {
  name: "Alice",
  age: 30,
  email: "alice@example.com",
  isAdmin: false,
};

// Accessing properties
user.name;       // "Alice" — dot notation
user["name"];    // "Alice" — bracket notation (for dynamic keys)
user.age;        // 30
user.role;       // undefined — property doesn't exist
```

### Dot vs Bracket Notation

```javascript
const key = "email";
user[key];       // "alice@example.com" — dynamic access
user.key;        // undefined — looks for property literally named "key"

// Bracket notation for special characters
const data = { "user-name": "Alice" };
data["user-name"]; // "Alice"
data.user-name;    // NaN — interpreted as subtraction!
```

### Adding, Updating, Deleting

```javascript
const person = { name: "Bob" };

// Add
person.age = 25;
person["city"] = "Nairobi";

// Update
person.name = "Robert";

// Delete
delete person.city;

console.log(person); // { name: "Robert", age: 25 }
```

### Methods — Functions Inside Objects

```javascript
const calculator = {
  value: 0,
  add(n) {
    this.value += n;  // 'this' refers to calculator
    return this;
  },
  subtract(n) {
    this.value -= n;
    return this;
  },
  getValue() {
    return this.value;
  },
};

calculator.add(5).subtract(2).getValue(); // 3 — method chaining!
```

### Object.keys, values, entries

```javascript
const user = { name: "Alice", age: 30, role: "admin" };

Object.keys(user);    // ["name", "age", "role"]
Object.values(user);  // ["Alice", 30, "admin"]
Object.entries(user); // [["name","Alice"], ["age",30], ["role","admin"]]

// Practical: iterate over properties
for (const [key, value] of Object.entries(user)) {
  console.log(`${key}: ${value}`);
}
```

### Nested Objects

```javascript
const company = {
  name: "Acme Corp",
  address: {
    street: "123 Main St",
    city: "Nairobi",
    country: "Kenya",
  },
  employees: [
    { name: "Alice", role: "Engineer" },
    { name: "Bob", role: "Designer" },
  ],
};

company.address.city;           // "Nairobi"
company.employees[0].name;      // "Alice"

// Optional chaining — safe access
company.address?.zip;           // undefined (no error)
company.branch?.location;       // undefined (branch doesn't exist)
```

## Try It Yourself

1. Create an object representing a book (title, author, pages, isRead). Add a method `toggleRead()` that flips `isRead`.
2. Use `Object.entries()` to print all properties of an object.
3. Create a nested object `school` with `name`, `address` (street, city), and `students` (array of student objects).
4. Use optional chaining to safely access `school.principal.name` when `principal` might not exist.

## Common Mistakes

- **`this` in arrow functions**: Arrow functions inside objects don't bind `this` to the object. Use method shorthand `methodName() {}` or regular functions.
- **Dot notation with dynamic keys**: `obj.key` always looks for the property literally named "key". Use `obj[key]` for variables.
- **Shallow copying**: `const copy = { ...original }` only copies one level deep. Nested objects are still shared references.

## Checkpoint

1. What's the difference between dot notation and bracket notation?
2. What does `Object.entries()` return?
3. How does optional chaining (`?.`) help prevent errors?
4. **Reflection**: Write an object with a method. What happens if you use an arrow function for the method?
