# Python: Functions & OOP

## 🎯 By End of This Lesson You Will:
- Define and call functions with parameters and return values
- Use default parameters and keyword arguments
- Write simple classes with `__init__`, methods, and attributes
- Understand `self` and when to use it

## 🌍 Real-World Analogy First

A function is like a recipe. You give it ingredients (parameters), it follows steps (the function body), and returns a dish (return value). You can reuse the recipe infinite times with different ingredients. A class is like a restaurant — it has a name, a menu (methods), and each instance is a different branch with its own staff.

## 📖 Start From Zero

### Functions — Reusable Recipes

```python
def greet(name):
    """Say hello to someone."""  # docstring — describes the function
    return f"Hello, {name}!"

# Call it
print(greet("Alice"))   # Hello, Alice!
print(greet("Bob"))     # Hello, Bob!
```

Every `def` starts a function. The body is indented. `return` sends a value back. Without `return`, the function returns `None`.

### Parameters — Defaults and Keywords

```python
def create_user(name, role="user", active=True):
    return {"name": name, "role": role, "active": active}

# Positional
create_user("Alice")                    # role="user", active=True

# Keyword (any order!)
create_user(role="admin", name="Bob")   # Bob, admin, True

# Mix positional then keyword
create_user("Charlie", active=False)    # Charlie, user, False
```

**Rule**: positional arguments come before keyword arguments.

### Return Values

```python
def divide(a, b):
    if b == 0:
        return None         # guard clause
    return a / b

result = divide(10, 2)      # 5.0
result = divide(10, 0)      # None
```

## 🔨 Level Up — Classes

### Your First Class

```python
class Student:
    def __init__(self, name, track):
        """Constructor — runs when you create a Student."""
        self.name = name
        self.track = track
        self.xp = 0          # default value

    def study(self, minutes):
        """Add XP based on study time."""
        self.xp += minutes // 10  # 10 min = 1 XP
        return f"{self.name} now has {self.xp} XP"

    def summary(self):
        return f"{self.name} | {self.track} | {self.xp} XP"


# Create instances
alice = Student("Alice", "Web Dev")
bob = Student("Bob", "Data Engineering")

print(alice.study(90))   # Alice now has 9 XP
print(bob.study(60))     # Bob now has 6 XP
print(alice.summary())   # Alice | Web Dev | 9 XP
```

### `self` — The Key Concept

`self` refers to the specific instance. When you call `alice.study(90)`, Python passes `alice` as `self` automatically. That's how the method knows which student to update.

### Inheritance

```python
class AdminStudent(Student):
    def __init__(self, name, track, permissions):
        super().__init__(name, track)  # call parent constructor
        self.permissions = permissions

    def study(self, minutes):
        """Admins earn double XP!"""
        self.xp += (minutes // 10) * 2
        return f"ADMIN {self.name} now has {self.xp} XP"

admin = AdminStudent("Charlie", "Both", ["manage_users"])
print(admin.study(30))  # ADMIN Charlie now has 6 XP (double!)
```

## 🧪 Practice — Try Each Step

1. Write a function `add(a, b)` that returns the sum. Call it with different numbers.
2. Write a function `is_even(n)` that returns `True` for even numbers, `False` for odd.
3. Create a function with a default parameter. Call it with and without that argument.
4. Write a function that returns multiple values: `return (min_val, max_val)`.
5. Create a `Book` class with `title`, `author`, and `pages`. Add a `read()` method.
6. Add a `__str__` method to Book that returns `"Title by Author"`.
7. Create an `EBook` subclass that adds a `file_size` attribute.
8. Write a function that takes a list of numbers and returns their average. Handle the empty list case.

## ⚠️ Common Mistakes — Catch These Early

| Mistake | What You See | The Fix |
|---|---|---|
| Forgetting `self` | `TypeError: method() takes 0 positional arguments but 1 was given` | Add `self` as first parameter in methods |
| `self` used outside class | `NameError: name 'self' is not defined` | `self` only exists inside class methods |
| Mutable default parameter | Function `def f(lst=[])` shares the same list across calls | Use `def f(lst=None): if lst is None: lst = []` |
| Confusing `return` vs `print` | Function returns `None` | `return` sends a value back; `print` just displays |
| Forgetting `()` when calling | `greet` instead of `greet()` returns the function object | Add parentheses to call the function |

## 🧠 Mental Model — One Sentence

Functions package logic you can reuse; classes package data AND behavior together. `def` creates functions, `class` creates blueprints, and `self` keeps each instance's data separate.

## 📝 Check Your Understanding

- **Define**: What is `self` and why does every method need it as the first parameter?
- **Predict**: What does `Student("X", "Y").study(0)` return?
- **Find the bug**: `def add(a, b): a + b` — what's missing?
- **Write it**: Create a `Counter` class with `increment()` and `reset()` methods.
- **Apply it**: Write a function `password_strength(pw)` that returns "weak", "medium", or "strong" based on length.
- **Reflect**: When would you use a class vs a function for a problem?

## 🚀 What This Unlocks

Functions and classes are how you organize EVERY Python program. FastAPI endpoints are functions. SQLAlchemy models are classes. Pydantic schemas are classes. Master these and you can read any Python codebase.
