# Python: Data Types

## 🎯 By End of This Lesson You Will:
- Use strings, integers, floats, booleans, and `None`
- Convert between types with `int()`, `str()`, `float()`
- Index and slice strings
- Use f-strings for clean formatting
- Avoid the most common type-related bugs

## 🌍 Real-World Analogy First

Think of data types like different kinds of containers. A string is a glass jar labeled "cookies" — you can read what's inside. An integer is a briefcase with a combination lock — it's just a number. A boolean is a light switch — it's either on (`True`) or off (`False`). You can't pour cookies into a briefcase without converting the container first.

## 📖 Start From Zero

```python
# Python knows the type automatically
name = "Alice"          # str (string)
age = 30                # int (integer)
height = 1.73           # float (decimal)
is_student = False      # bool (boolean)
middle_name = None      # NoneType (nothing)

print(type(name))       # <class 'str'>
print(type(age))        # <class 'int'>
```

Python infers types. You don't declare `string name` like in TypeScript — Python figures it out from the value.

### Strings — Text

```python
greeting = "Hello"
name = "Alice"

# Concatenation
full = greeting + " " + name   # "Hello Alice"

# f-strings (the modern, readable way)
full = f"{greeting} {name}"    # "Hello Alice"
formatted = f"{name} is {age} years old"

# Indexing (zero-based)
name[0]    # 'A'
name[-1]   # 'e' (last character)

# Slicing
name[1:4]  # 'lic' (index 1 up to 4, not including 4)
name[:3]   # 'Ali' (from start to 3)
```

### Numbers — int and float

```python
# int — whole numbers
x = 42
y = -10
big = 1_000_000     # underscores for readability

# float — decimals
pi = 3.14159
speed = 2.5e8       # scientific notation (2.5 × 10^8)

# Common operations
sum = 5 + 3         # 8
power = 2 ** 10     # 1024 (exponentiation)
remainder = 17 % 5  # 2
```

## 🔨 Level Up

### Type Conversion

```python
# String → int
number = int("42")      # 42
int("101", 2)           # 5 (binary to int)

# Int → string
text = str(42)          # "42"

# String → float
price = float("19.99")  # 19.99

# Dangerous: int("hello") → ValueError!
```

### Booleans and None

```python
is_admin = True
is_banned = False

# What's truthy/falsy?
bool(0)         # False
bool("")        # False
bool([])        # False
bool(None)      # False
bool("hello")   # True
bool(42)        # True

# None — the absence of a value
result = None
if result is None:
    print("No result yet")
```

### String Methods

```python
text = "  Hello, World!  "

text.strip()          # "Hello, World!" (remove whitespace)
text.upper()          # "  HELLO, WORLD!  "
text.lower()          # "  hello, world!  "
text.replace("World", "Python")  # "  Hello, Python!  "
text.split(",")       # ["  Hello", " World!  "]
" ".join(["a", "b"])  # "a b"
```

## 🧪 Practice — Try Each Step

1. Create variables of each type (str, int, float, bool, None) and use `type()` on each.
2. Write an f-string that formats: `"X is Y years old and Z meters tall"`.
3. Slice `"Python"` to get `"yth"`, `"Py"`, `"hon"`.
4. Convert `"3.14"` to a float, then multiply by 2.
5. Use `.strip()`, `.upper()`, and `.replace()` on a messy string.
6. Check what `bool()` returns for: `0`, `""`, `" "`, `42`, `None`, `[]`, `[1]`.
7. Join a list of words into a sentence with `.join()`.
8. Try `int("hello")` and read the error message carefully.

## ⚠️ Common Mistakes — Catch These Early

| Mistake | What You See | The Fix |
|---|---|---|
| `"5" + 3` | `TypeError: can only concatenate str (not "int") to str` | Convert: `int("5") + 3` or use f-string |
| `name[100]` | `IndexError: string index out of range` | Check length with `len(name)` first |
| `int("3.14")` | `ValueError` — can't convert float string to int | Use `int(float("3.14"))` |
| Confusing `is` and `==` | `[] == []` is True, but `[] is []` is False | `==` checks value, `is` checks identity |
| `name[0] = "X"` | `TypeError: 'str' object does not support item assignment` | Strings are immutable — create a new one |

## 🧠 Mental Model — One Sentence

Python has five main types you'll use daily: `str` for text, `int`/`float` for numbers, `bool` for yes/no, and `None` for "no value" — and every type knows what operations it supports.

## 📝 Check Your Understanding

- **Define**: What does `type()` return?
- **Predict**: What is `int("10") + float("2.5")`? (Hint: Python auto-converts int to float)
- **Find the bug**: `message = "Score: " + 95`
- **Write it**: Create variables for first_name, last_name, age, and use f-strings to print a bio.
- **Apply it**: Extract the domain from `"alice@example.com"` using slicing (get everything after `@`).
- **Reflect**: Which Python type system do you prefer — JavaScript's loose typing, TypeScript's strict typing, or Python's dynamic-with-hints approach?

## 🚀 What This Unlocks

Data types are the foundation. Lists, dictionaries, functions — everything builds on `str`, `int`, `float`, `bool`, and `None`. Get these five rock-solid and the rest flows naturally.
