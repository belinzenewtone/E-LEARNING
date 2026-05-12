# OOP: Classes & Prototypes

## Why This Matters

Object-Oriented Programming lets you model real-world entities as code. A User has properties (name, email) and behaviors (login, logout). Classes are the blueprint. JavaScript's OOP is prototype-based, which works differently from Java or Python — understanding this difference prevents subtle bugs.

## Core Concepts

### Class Syntax

```javascript
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.createdAt = new Date();
  }

  greet() {
    return `Hi, I'm ${this.name}`;
  }

  // Static method — called on the class itself, not instances
  static fromJSON(json) {
    const data = JSON.parse(json);
    return new User(data.name, data.email);
  }
}

const alice = new User("Alice", "alice@example.com");
alice.greet();           // "Hi, I'm Alice"
alice instanceof User;   // true
```

### Inheritance with extends

```javascript
class Admin extends User {
  constructor(name, email, permissions) {
    super(name, email);        // must call parent constructor first
    this.permissions = permissions;
  }

  // Override parent method
  greet() {
    return `Admin ${this.name} — ${this.permissions.length} permissions`;
  }

  banUser(user) {
    // admin-specific behavior
  }
}

const admin = new Admin("Bob", "bob@admin.com", ["delete", "ban"]);
admin.greet();    // "Admin Bob — 2 permissions"
admin instanceof Admin; // true
admin instanceof User;  // true (inheritance chain)
```

### Private Fields (Modern JS)

```javascript
class BankAccount {
  #balance = 0;               // truly private — can't access from outside

  constructor(initialBalance) {
    this.#balance = initialBalance;
  }

  deposit(amount) {
    this.#balance += amount;
    return this.#balance;
  }

  get balance() {              // getter — accessed like a property
    return this.#balance;
  }
}

const account = new BankAccount(100);
account.balance;         // 100 (via getter)
account.#balance;        // SyntaxError — truly private
```

### Getters and Setters

```javascript
class Temperature {
  constructor(celsius) {
    this._celsius = celsius;
  }

  get fahrenheit() {
    return this._celsius * 9/5 + 32;
  }

  set fahrenheit(value) {
    this._celsius = (value - 32) * 5/9;
  }
}

const temp = new Temperature(25);
temp.fahrenheit;       // 77 (computed)
temp.fahrenheit = 86;  // sets celsius to 30
```

### Prototypes — What's Actually Happening

```javascript
// Classes are syntactic sugar over prototypes:
class Dog {
  bark() { return "Woof"; }
}

// Under the hood:
function Dog() {}
Dog.prototype.bark = function() { return "Woof"; };

// The prototype chain:
const fido = new Dog();
fido.bark();            // JS looks: fido → Dog.prototype → Object.prototype → null
fido.toString();        // found on Object.prototype
```

## Try It Yourself

1. Create a `Product` class with `name`, `price`, and a `discount(percentage)` method.
2. Extend it with `DigitalProduct` that adds a `fileSize` property and overrides `discount` to cap at 50%.
3. Add a private field `#reviews` (array) to `Product` with methods `addReview` and `averageRating`.
4. Create a getter `info` that returns a formatted string of the product details.

## Common Mistakes

- **Forgetting `new`**: `const user = User("Alice")` without `new` sets `this` to the global object (or undefined in strict mode).
- **Forgetting `super()` in constructor**: The parent constructor must be called before accessing `this` in the child.
- **`this` in callbacks**: Methods lose their `this` when passed as callbacks. Use arrow functions or `.bind(this)`.

## Checkpoint

1. What's the difference between a class and a prototype in JavaScript?
2. How do private fields differ from properties prefixed with underscore?
3. What does `super()` do in a child class constructor?
4. **Reflection**: Design a class hierarchy for a learning platform (User → Student → Instructor).
