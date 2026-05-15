# Setting Up Your Dev Environment

## 🎯 By End of This Lesson You Will:
- Install and verify Node.js, Python, Git, and VS Code
- Set up a project with version control
- Understand terminal basics
- Choose between global and project-level tools

## 🌍 Real-World Analogy First

Your dev environment is like a chef's kitchen. You need the right tools (VS Code), the right ingredients (Node.js, Python), a recipe book (Git for tracking changes), and a clean workspace (terminal). A well-organized kitchen makes cooking — and coding — faster and more enjoyable.

## 📖 Start From Zero

### Node.js — JavaScript Runtime

```bash
# Download from https://nodejs.org (LTS version)
node --version   # v20.x or later
npm --version    # 10.x or later
```

Node.js lets JavaScript run outside the browser. npm installs packages.

### Python — The Data & Backend Language

```bash
python --version   # 3.10 or later
pip --version      # package manager
```

### VS Code — Your Editor

Install extensions: Prettier (formatting), ESLint (JS linting), Python (Python support), Thunder Client (API testing).

### Git — Version Control

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## 🔨 Level Up

### Project Setup

```bash
mkdir my-project
cd my-project
git init
echo "node_modules/" > .gitignore
npm init -y
```

### Terminal Essentials

```bash
pwd              # where am I?
ls               # what's here?
cd folder        # go into folder
cd ..            # go up one level
code .           # open VS Code here
```

## 🧪 Practice — Try Each Step

1. Install Node.js (LTS) from nodejs.org. Verify with `node --version`.
2. Install Python 3.10+ from python.org. Verify with `python --version`.
3. Install VS Code and the Prettier extension.
4. Create a new folder, `git init`, create `.gitignore` with `node_modules/`.
5. Run `npm init -y` and examine `package.json`.
6. Run `python --version` and `pip --version`.
7. Create an `index.js` with `console.log("Ready!")` and run it with `node index.js`.
8. Open the project in VS Code with `code .`.

## ⚠️ Common Mistakes — Catch These Early

| Mistake | What You See | The Fix |
|---|---|---|
| Installing Current instead of LTS Node.js | Unstable features, compatibility issues | Always use LTS (Long Term Support) |
| Forgetting `.gitignore` | `node_modules/` committed to git | Create `.gitignore` FIRST, before first commit |
| Running commands in wrong folder | "package.json not found" | `pwd` to verify you're in the right directory |
| Multiple Python versions | `python` vs `python3` confusion | Use `python3` on Mac/Linux if `python` points to Python 2 |

## 🧠 Mental Model — One Sentence

Your dev environment is Node.js (for JavaScript) + Python (for everything else) + Git (for tracking changes) + VS Code (for editing) — set up once, use forever.

## 📝 Check Your Understanding

- **Define**: What's the difference between Node.js and npm?
- **Predict**: What happens if you run `git init` in a folder that already has a `.git` folder?
- **Find the bug**: `node_modules/` is missing from `.gitignore`. What's the consequence?
- **Write it**: Create a new project with git, npm, and a `.gitignore`.
- **Apply it**: Install 3 VS Code extensions and verify they're enabled.
- **Reflect**: What surprised you about setting up your environment?

## 🚀 What This Unlocks

Every project you build starts here. With the environment set up, you can jump into any JavaScript or Python tutorial and start coding immediately.
