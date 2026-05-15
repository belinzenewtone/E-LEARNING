# Classes & OOP in TypeScript

## 🎯 By End of This Lesson You Will:
- Define classes with access modifiers and readonly fields
- Use `implements` and `extends` correctly
- Use abstract classes for templates

---

## 🌍 Real-World Analogy First

A class in TypeScript is like an **architect's blueprint with strict permits**:

```
🏗️ Blueprint says:
   - public lobby     (anyone can enter)
   - private safe     (only staff inside)
   - protected stairs (staff + employees of subsidiaries)
   - readonly address (set once, never changes)
```

JavaScript classes give you the building. TypeScript classes give you the building **with rules about who can access what** — enforced before the building is even built.

---

## 📖 Start From Zero

### Your First Typed Class

```typescript
class User {
  name: string;
  email: string;
  xp: number;

  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
    this.xp = 0;
  }

  greet(): string {
    return `Hello, ${this.name}!`;
  }
}

const alice = new User("Alice", "a@x.com");
console.log(alice.greet());
```

Class fields and method return types are explicitly typed.

---

## 🔨 Level Up

### Step 1: Access Modifiers

```typescript
class BankAccount {
  public owner: string;          // accessible anywhere (default)
  private balance: number;       // only inside this class
  protected accountType: string; // this class + subclasses
  readonly id: string;            // set once, never changed

  constructor(owner: string, initial: number) {
    this.owner = owner;
    this.balance = initial;
    this.accountType = "standard";
    this.id = crypto.randomUUID();
  }

  deposit(amount: number): void {
    this.balance += amount;
  }

  getBalance(): number {
    return this.balance;
  }
}

const a = new BankAccount("Alice", 1000);
a.deposit(500);
// a.balance = 9999;   ❌ private — can't touch from outside
// a.id = "new";       ❌ readonly — can't reassign
```

---

### Step 2: Parameter Properties (Shorthand)

Long way:
```typescript
class User {
  public name: string;
  private email: string;
  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }
}
```

Shorthand — TypeScript creates and assigns automatically:
```typescript
class User {
  constructor(
    public name: string,
    private email: string,
    readonly id: string = crypto.randomUUID()
  ) {}
}
```

This is the modern idiomatic way to write small classes.

---

### Step 3: Implementing Interfaces

```typescript
interface Serializable {
  toJSON(): object;
}

interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

class Lesson implements Serializable, Timestamped {
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(public slug: string, public title: string) {}

  toJSON(): object {
    return { slug: this.slug, title: this.title };
  }
}
```

A class can implement multiple interfaces. The compiler verifies all required members exist.

---

### Step 4: Extending Classes

```typescript
class Person {
  constructor(public name: string, public email: string) {}

  introduce(): string {
    return `Hi, I'm ${this.name}`;
  }
}

class Student extends Person {
  constructor(name: string, email: string, public grade: number) {
    super(name, email);   // must call super first
  }

  override introduce(): string {
    return `${super.introduce()}, grade ${this.grade}`;
  }
}
```

`override` is optional but recommended — it tells TypeScript "I'm intentionally overriding the parent." If the parent removes the method, `override` will error and prevent silent breakage.

---

### Step 5: Abstract Classes

Abstract classes can't be instantiated directly — they're templates:

```typescript
abstract class BaseRepository<T> {
  abstract findById(id: string): Promise<T | null>;
  abstract findAll(): Promise<T[]>;

  // Concrete method shared by subclasses
  async exists(id: string): Promise<boolean> {
    return (await this.findById(id)) !== null;
  }
}

class LessonRepository extends BaseRepository<Lesson> {
  async findById(id: string) {
    return db.lesson.findUnique({ where: { id } });
  }

  async findAll() {
    return db.lesson.findMany();
  }
}

const repo = new LessonRepository();
// const x = new BaseRepository();   ❌ Cannot create instance of abstract class
```

Abstract = "you MUST extend me; you can't use me directly."

---

### Step 6: `implements` vs `extends`

| | `implements` | `extends` |
|---|---|---|
| What it does | Declares the class follows a contract | Inherits from another class |
| Multiple at once | ✅ Yes | ❌ Only one |
| Gets methods/props automatically | ❌ Must implement yourself | ✅ Inherited |
| Source | Interface or class | Class |

```typescript
class Bird extends Animal implements Flyable {
  // inherits Animal methods, must implement Flyable's
}
```

---

### Step 7: Static Members

```typescript
class XPCalculator {
  static MAX_PER_DAY = 500;

  static calculateBonus(base: number, multiplier: number): number {
    return Math.min(base * multiplier, XPCalculator.MAX_PER_DAY);
  }
}

XPCalculator.calculateBonus(100, 2);    // 200
XPCalculator.MAX_PER_DAY;                // 500
// No `new` needed
```

Static = belongs to the class itself, not instances.

---

### Step 8: Private Fields — Two Ways

```typescript
class A {
  private secret = "hidden";    // TypeScript private (compile-time only)
}

class B {
  #secret = "hidden";            // JS private (runtime hidden)
}
```

`#` private fields are enforced at runtime (added to JavaScript). TypeScript's `private` is only checked at compile time — at runtime the field is still accessible.

Modern preference: use `#` for genuinely private data.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Basic class:**
```typescript
// Class Lesson with slug, title, xpReward (public), private completed boolean
// Method complete() sets completed = true, returns xpReward
```

**Exercise 2 — Shorthand constructor:**
```typescript
// Same as above but use parameter property shorthand
```

**Exercise 3 — Implements:**
```typescript
// interface Greetable { greet(): string }
// Class Robot implements it: greet() returns "Beep boop"
```

**Exercise 4 — Extends:**
```typescript
// Person → Employee (extends Person, adds salary)
// Override introduce() to include salary
```

**Exercise 5 — Abstract:**
```typescript
// Abstract class Shape with abstract method area(): number
// Class Circle extends Shape, implements area() with πr²
// Class Square extends Shape, implements area() with side²
```

**Exercise 6 — Static:**
```typescript
// Class Utils with static method formatXP(amount): string returning "1,000 XP"
// Call without new
```

**Exercise 7 — Private field:**
```typescript
// Class Vault with #password
// Method unlock(attempt): boolean
// You can't read #password from outside
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Missing `super()` in extends | TypeError | Always call super first in extended constructors |
| Calling method without `new` | `this` is undefined | Use `new ClassName()` |
| Passing method as callback | `this` is lost | Use arrow class field or `.bind(this)` |
| Deep class hierarchies | Hard to maintain | Prefer composition over inheritance |
| Using `private` and expecting runtime privacy | Still accessible at runtime | Use `#field` for true privacy |

---

## 🧠 Mental Model

```
class Name {
  public a;    private b;    protected c;    readonly d;
  
  constructor(public x: T) {}  ← parameter property shorthand
  
  method(): T { return ...; }
  static helper() {}
  abstract templateMethod(): void;
  override method() { super.method(); ... }
}

extends   → inherit from class
implements → match a contract (interface)
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between `extends` and `implements`?
2. **Predict:**
   ```typescript
   class A { greet() { return "A"; } }
   class B extends A { override greet() { return "B" + super.greet(); } }
   console.log(new B().greet());
   ```
3. **Find the bug:**
   ```typescript
   class Counter { count = 0; increment() { this.count++; } }
   const c = new Counter();
   setTimeout(c.increment, 100);   // count stays 0. Why?
   ```
4. **Write it:** Abstract class `Animal` with abstract `sound(): string`. Class `Dog` and `Cat` extending it.
5. **Apply it:** Refactor a piece of stateful code into a class with private fields.
6. **Reflect:** Why do many modern JavaScript codebases use very few classes? (Hint: React function components, functional patterns)
