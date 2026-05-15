# Python: Virtual Environments

## 🎯 By End of This Lesson You Will:
- Create and activate a virtual environment
- Install packages with `pip` without polluting your global Python
- Use `requirements.txt` to share dependencies
- Understand why virtual environments prevent "works on my machine" problems

## 🌍 Real-World Analogy First

Your global Python is like a public kitchen where everyone dumps their ingredients. Project A needs flour version 1, Project B needs flour version 2 — chaos! A virtual environment is a private kitchen per project. Each has its own pantry, its own version of every ingredient. No conflicts, no confusion.

## 📖 Start From Zero

### Create and Activate

```bash
# Create a virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Your terminal prompt now shows (venv) — you're in!
(venv) $
```

**What just happened?** `venv` created a folder called `venv/` with a fresh Python installation. Activating it tells your terminal: "use THIS Python, not the global one."

### Install Packages

```bash
# Inside your venv (you see (venv) in the prompt):
(venv) $ pip install requests
(venv) $ pip install fastapi uvicorn

# Check what's installed
(venv) $ pip list

# Pin exact versions
(venv) $ pip freeze > requirements.txt
```

`pip freeze` writes all installed packages to a file. Anyone can recreate your exact environment:

```bash
(venv) $ pip install -r requirements.txt
```

### Deactivate

```bash
(venv) $ deactivate
# Back to global Python
$
```

## 🔨 Level Up

### Project Structure

```
my-fastapi-project/
├── venv/              # virtual environment (NEVER commit this)
├── requirements.txt   # dependencies (ALWAYS commit this)
├── main.py            # your code
└── .gitignore         # must include: venv/
```

### `.gitignore`

```
venv/
__pycache__/
*.pyc
.env
```

### Choosing Python Version

```bash
# Create venv with a specific Python version
python3.11 -m venv venv       # Python 3.11
python3.12 -m venv venv       # Python 3.12

# Check which Python you're using
(venv) $ python --version
```

### Common pip Commands

```bash
pip install package           # install
pip install package==1.2.3    # install specific version
pip install --upgrade package # upgrade
pip uninstall package         # remove
pip list                      # show installed
pip show package              # details about one package
pip check                     # verify no broken dependencies
```

## 🧪 Practice — Try Each Step

1. Create a new directory `venv-practice` and create a venv inside it.
2. Activate the venv. Notice the `(venv)` in your prompt.
3. Run `pip list` — you should see only pip and setuptools.
4. Install `requests` and `flask`. Run `pip list` again.
5. Run `pip freeze > requirements.txt` and examine the file.
6. Deactivate, delete the venv folder, then recreate from requirements.txt.
7. Add `venv/` to a `.gitignore` file.
8. Create a second venv with a different name (`python -m venv test-env`) — activate it and verify it's a fresh environment.

## ⚠️ Common Mistakes — Catch These Early

| Mistake | What You See | The Fix |
|---|---|---|
| Installing globally instead of in venv | Package installed but project can't find it | Always activate venv first, then pip install |
| Committing venv/ to git | Huge repo, merge conflicts on lock files | Add `venv/` to .gitignore immediately |
| Wrong venv active | Import errors for packages you know are installed | Check `which python` or `where python` — is it pointing to venv? |
| Using `sudo pip install` | Installs globally as root, permission nightmares | Never sudo pip. Use venv. |
| requirements.txt without versions | "works on my machine" — your colleague gets different versions | Use `pip freeze` to pin exact versions |

## 🧠 Mental Model — One Sentence

A virtual environment is a lightweight, isolated Python installation per project — every project gets its own Python and packages, preventing version conflicts forever.

## 📝 Check Your Understanding

- **Define**: What is a virtual environment and why do you need one?
- **Predict**: If you install Flask in a venv, can a different venv (or global Python) use it?
- **Find the bug**: `pip install requests` — but you forgot to activate the venv first. Where did requests go?
- **Write it**: Create a new project with a venv, install 3 packages, and generate a requirements.txt.
- **Apply it**: Clone a Python project from GitHub. Create a venv and install its dependencies from requirements.txt.
- **Reflect**: How is this similar to or different from `node_modules` and `package.json` in JavaScript?

## 🚀 What This Unlocks

Every Python project you'll ever work on starts with `python -m venv venv`. FastAPI, Django, data science — they all require virtual environments. This is step zero for every Python developer.
