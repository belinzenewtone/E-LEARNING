# OOP: Classes & Prototypes

## 🎯 By End of This Lesson You Will:
- Define classes with constructors, methods, and properties
- Use inheritance with `extends` and `super`
- Understand `this` and avoid common pitfalls

---

## 🌍 Real-World Analogy First

A **class** is a **blueprint**. An **instance** is the actual building made from that blueprint.

```
🏗️ House Blueprint (class)
   ├── bedrooms, bathrooms, area
   ├── method: turnOnLights()
   └── method: openDoor()

   ↓ build one
   ↓ build another
   ↓ build another

🏠 House 1   🏠 House 2   🏠 House 3
(each one is independent — their own state)
```

A class describes WHAT something is and CAN DO. Each instance is a specific one with its own data.

---

## 📖 Start From Zero

### Your First Class

```javascript
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.xp = 0;
  }

  greet() {
    return `Hello, ${this.name}!`;
  }
}

const alice = new User("Alice", "a@x.com");
console.log(alice.greet());   // "Hello, Alice!"
console.log(alice.xp);         // 0
```

Reading it:
- `class User` — defines the blueprint named User
- `constructor` — runs when you call `new User(...)` to set up the instance
- `this.name = name` — set this instance's `name` property
- `new User(...)` — creates an instance
- `alice.greet()` — calls the method on this specific instance

---

## 🔨 Level Up

### Step 1: Methods & this

```javascript
class StudyTracker {
  constructor(userId) {
    this.userId = userId;
    this.minutes = 0;
    this.sessions = 0;
  }

  logSession(minutes) {
    this.minutes += minutes;
    this.sessions += 1;
  }

  averageSession() {
    if (this.sessions === 0) return 0;
    return this.minutes / this.sessions;
  }
}

const tracker = new StudyTracker("user-1");
tracker.logSession(45);
tracker.logSession(60);
tracker.logSession(30);
console.log(tracker.averageSession());  // 45
```

`this` inside a method = "the specific instance this method was called on."

---

### Step 2: Inheritance — `extends`

```javascript
class Person {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  introduce() {
    return `Hi, I'm ${this.name}`;
  }
}

class Student extends Person {
  constructor(name, email, grade) {
    super(name, email);   // call parent constructor
    this.grade = grade;
  }

  introduce() {
    return `${super.introduce()}, a Grade ${this.grade} student`;
  }
}

const alice = new Student("Alice", "a@x.com", 3);
console.log(alice.introduce());
// "Hi, I'm Alice, a Grade 3 student"
```

`extends Person` — Student inherits all of Person's methods and properties.  
`super(...)` — call the parent constructor.  
`super.method()` — call the parent's version of a method.

---

### Step 3: Static Methods — Class-Level Functions

```javascript
class Mathy {
  static add(a, b) { return a + b; }
  static multiply(a, b) { return a * b; }
}

Mathy.add(2, 3);       // 5 — call directly on the class
// No `new` needed
```

Static methods belong to the class itself, not to instances. Use them for helpers that don't need instance state (validators, factories).

---

### Step 4: Getters and Setters

```javascript
class Temperature {
  constructor(celsius) {
    this._celsius = celsius;
  }

  get fahrenheit() {
    return this._celsius * 9 / 5 + 32;
  }

  set fahrenheit(f) {
    this._celsius = (f - 32) * 5 / 9;
  }
}

const t = new Temperature(20);
console.log(t.fahrenheit);  // 68 — looks like property, runs the get
t.fahrenheit = 100;          // looks like assignment, runs the set
console.log(t._celsius);     // 37.77...
```

Getters/setters let methods look and feel like properties.

---

### Step 5: Private Fields (Modern JS)

```javascript
class BankAccount {
  #balance = 0;   // # prefix = truly private

  deposit(amount) {
    this.#balance += amount;
  }

  get balance() {
    return this.#balance;
  }
}

const account = new BankAccount();
account.deposit(100);
console.log(account.balance);     // 100
// console.log(account.#balance);   // ❌ SyntaxError — private!
```

Use `#` prefix for fields that should be inaccessible from outside the class.

---

### Step 6: The `this` Trap

`this` inside a method works correctly when you call `instance.method()`. But when you pass the method as a callback, `this` can get lost:

```javascript
class Counter {
  constructor() { this.count = 0; }
  increment() { this.count++; }
}

const counter = new Counter();

// ✅ Works
counter.increment();

// ❌ Loses `this`
const fn = counter.increment;
fn();   // TypeError: Cannot read properties of undefined

// ✅ Fix 1: arrow function (lexical this)
class Counter {
  count = 0;
  increment = () => { this.count++; };   // class field with arrow
}

// ✅ Fix 2: bind
const fn = counter.increment.bind(counter);
```

---

### Step 7: Composition Over Inheritance

Deep inheritance hierarchies (Class → SubClass → SubSubClass) become hard to manage. Most modern teams prefer **composition**:

```javascript
// Composition pattern — small classes combining behaviors
class Logger {
  log(msg) { console.log(`[${this.constructor.name}] ${msg}`); }
}

class UserService {
  constructor() {
    this.logger = new Logger();
  }

  createUser(data) {
    this.logger.log("Creating user");
    // ...
  }
}
```

Lesson: classes are useful — but don't over-architect. Use them where they make code clearer.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Basic class:**
```javascript
// Define a class Lesson with:
// - constructor(slug, title, xpReward)
// - method: complete() that returns xpReward
// Create 2 instances and call complete()
```

**Exercise 2 — Methods:**
```javascript
// Add a Counter class with:
// - count starts at 0
// - increment() adds 1
// - decrement() subtracts 1
// - reset() sets to 0
// - get value() returns count
```

**Exercise 3 — Inheritance:**
```javascript
// Class Animal with name and method describe()
// Class Dog extends Animal, adds breed
// Dog's describe() returns "I'm <name>, a <breed>"
```

**Exercise 4 — Static methods:**
```javascript
// Class XPCalculator with static method bonus(base, multiplier)
// returning base * multiplier
// Call without `new`: XPCalculator.bonus(50, 1.5) === 75
```

**Exercise 5 — Getters:**
```javascript
// Class User with first and last name
// Add a get fullName() that returns "first last"
```

**Exercise 6 — Private:**
```javascript
// Class PinLock with #pin (private)
// constructor takes pin
// method unlock(attempt) returns true if matches
// pin should NOT be accessible from outside
```

**Exercise 7 — this trap:**
```javascript
// Predict — does this work?
class Greeter {
  constructor(name) { this.name = name; }
  greet() { return `Hi, ${this.name}`; }
}
const g = new Greeter("Alice");
const fn = g.greet;
console.log(fn());   // does this print "Hi, Alice"?
// If not, fix it two ways
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Forgetting `super()` in subclass | ReferenceError when using `this` | Always call `super(...)` first in extended constructors |
| Calling method without `new` | `this` is undefined | Use `new ClassName()` |
| Passing method as callback | `this` is lost | Use arrow function or `.bind()` |
| Deep inheritance | Hard to maintain | Prefer composition |
| Mutating instances from outside | Breaks encapsulation | Use private `#fields` and getters |

---

## 🧠 Mental Model

```
class Name {
  field = defaultValue;
  #privateField = ...;

  constructor(args) {
    this.field = args;
  }

  method() { /* uses this.field */ }
  static helper() { /* no this */ }
  get computed() { /* derived */ }
  set computed(v) { /* validate */ }
}

new Name() → create instance
class Child extends Parent → inherit
super(...) / super.method() → call parent
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between a class and an instance?
2. **Predict:** What does this print?
   ```javascript
   class A { greet() { return "A"; } }
   class B extends A { greet() { return "B" + super.greet(); } }
   console.log(new B().greet());
   ```
3. **Find the bug:**
   ```javascript
   class Counter {
     constructor() { this.count = 0; }
     increment() { this.count++; }
   }
   const c = new Counter();
   setTimeout(c.increment, 100);
   // After 100ms, c.count is still 0. Why?
   ```
4. **Write it:** Create a `BankAccount` class with deposit, withdraw, and a private balance that can't be set from outside.
5. **Apply it:** Refactor a piece of code you've written into a class. Was it clearer?
6. **Reflect:** Many modern JavaScript codebases use very few classes. Why might that be? (Hint: think about React function components.)
