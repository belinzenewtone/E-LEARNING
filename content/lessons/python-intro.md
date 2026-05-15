# Python: Introduction

## 🎯 By End of This Lesson You Will:
- Explain what Python is and why it's so popular
- Install Python and run your first script
- Use the Python REPL as a calculator
- Understand Python's philosophy ("readability counts")

## 🌍 Real-World Analogy First

Imagine a Swiss Army knife. You can open cans, cut rope, screw things, and saw wood — all with one tool. Python is the Swiss Army knife of programming. It reads almost like English, runs almost everywhere, and has tools for everything: websites, data science, automation, AI.

## 📖 Start From Zero — Hello, Python!

```python
print("Hello, Learning OS!")
```

That's a complete Python program. Save it as `hello.py`, open a terminal, and run:

```bash
python hello.py
# Hello, Learning OS!
```

**What just happened?** `print()` is a built-in function that displays text. The quotes tell Python "this is text." That's it — you just wrote and ran Python.

### Python REPL — Your Instant Playground

Type `python` in your terminal (no filename). You'll see `>>>`. This is the REPL (Read-Eval-Print Loop):

```python
>>> 2 + 3
5
>>> "hello".upper()
'HELLO'
>>> len("Python")
6
```

The REPL evaluates every line immediately — perfect for quick experiments.

## 🔨 Level Up

### Python vs JavaScript — Key Differences

| Feature | Python | JavaScript |
|---|---|---|
| Statement endings | Line breaks | Semicolons `;` |
| Code blocks | Indentation (4 spaces) | Curly braces `{}` |
| Comments | `#` | `//` or `/* */` |
| Boolean values | `True` / `False` | `true` / `false` |
| Variable declaration | Just assign: `x = 5` | `let x = 5` |
| String concatenation | `"a" + "b"` or f-strings | `"a" + "b"` or template literals |

### Python's Philosophy

```python
>>> import this
The Zen of Python, by Tim Peters

Beautiful is better than ugly.
Explicit is better than implicit.
Simple is better than complex.
Readability counts.
```

Python forces indentation. This means ALL Python code looks structured — no arguments about brace placement.

## 🧪 Practice — Try Each Step

1. Open your terminal and type `python` to enter the REPL. Use it as a calculator: `45 * 67`, `2 ** 10`.
2. Create a file called `hello.py` with `print("Hello, World!")` and run it with `python hello.py`.
3. In the REPL, try: `type(42)`, `type("hello")`, `type(True)`. What do you get?
4. Create a multi-line program with 3 print statements. Run it.
5. Deliberately mess up the indentation — put random spaces before a line. What error do you get?
6. Use `len()` on a string: `len("Learning")`. What does it return?
7. Type `import this` in the REPL and read through the Zen of Python.
8. Write a script that prints your name, today's date, and your Python learning goal.

## ⚠️ Common Mistakes — Catch These Early

| Mistake | What You See | The Fix |
|---|---|---|
| Forgetting quotes | `print(hello)` → `NameError: name 'hello' is not defined` | `print("hello")` — strings need quotes |
| Wrong indentation | `IndentationError: unexpected indent` | Remove extra spaces. Python uses 4 spaces per level, not tabs mixed with spaces |
| Using `python3` instead of `python` | `'python3' is not recognized` on Windows | Try just `python`. On some systems it's `python3` |
| Typing `True` as `true` | `NameError: name 'true' is not defined` | Python uses capital `True`/`False` |
| Forgetting parentheses in print | `print "hello"` in Python 3 → `SyntaxError` | `print("hello")` — parentheses required in Python 3 |

## 🧠 Mental Model — One Sentence

Python reads almost like English — variables hold data, functions do things, and indentation defines structure. Most Python code you can decode just by reading it out loud.

## 📝 Check Your Understanding

- **Define**: What is the REPL and what's it used for?
- **Predict**: What happens if you run `python hello.py` when `hello.py` contains only `print(2 + 2)`?
- **Find the bug**: `Print("Hello")` — will this work? Why or why not?
- **Write it**: Create a script that prints your three biggest learning goals separated by blank lines.
- **Apply it**: Use the REPL to find out what `"python".upper()`, `"PYTHON".lower()`, and `"python".capitalize()` return.
- **Reflect**: What's one thing about Python's syntax that feels natural? One thing that feels different from JavaScript?

## 🚀 What This Unlocks

Master these basics and you're ready for data types, functions, and building real programs. Every Python tutorial and library assumes you know `print()`, the REPL, and indentation.
