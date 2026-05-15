# Git & GitHub Fundamentals

## 🎯 By End of This Lesson You Will:
- Use `git init`, `add`, `commit`, `push`, and `pull` confidently
- Explain the difference between local, staged, committed, and remote state
- Publish your code to GitHub and update it as you go

---

## 🌍 Real-World Analogy First

Git is a **save system with infinite undo** — like the version history in Google Docs, but for code, and far more powerful.

```
Without Git:
  my-project-final.js
  my-project-final-v2.js
  my-project-final-FINAL.js
  my-project-final-FINAL-fixed.js   ← chaos
```

```
With Git:
  my-project.js  →  commit history:
    abc123: "Initial commit"
    def456: "Add login feature"
    789xyz: "Fix typo in header"
    ...
  
  Any version is 1 command away.
```

**GitHub** = a website that **hosts your Git repositories online** so you can:
- Back them up (no more lost work)
- Share them with others
- Show them to employers (your portfolio)

---

## 📖 Start From Zero

### Install Git (Once)

```bash
# Check if installed
git --version

# Configure your identity (use your real name + GitHub email)
git config --global user.name "Belinze Newtone"
git config --global user.email "belinze.newtone@jtl.co.ke"
```

### Your First Repository

```bash
# 1. Create a folder for your project
mkdir my-first-repo
cd my-first-repo

# 2. Initialize Git in this folder
git init
# → "Initialized empty Git repository in ..."

# 3. Create a file
echo "# My First Repo" > README.md

# 4. Check status
git status
# Shows: README.md is "untracked"

# 5. Stage the file
git add README.md

# 6. Commit (save a snapshot)
git commit -m "Initial commit"
```

That's it. You just created your first save point. You can keep coding and committing as much as you want — every commit is forever recoverable.

---

## 🔨 Level Up

### Step 1: The Three Zones — A Mental Model

```
┌──────────────┐    git add    ┌─────────────┐    git commit   ┌──────────────┐
│              │ ─────────────► │             │ ──────────────► │              │
│  Working dir │                │   Staging   │                 │  Committed   │
│  (your edits)│                │ (ready to   │                 │  (saved in   │
│              │                │   commit)   │                 │   history)   │
└──────────────┘                └─────────────┘                 └──────────────┘
        ↓                              ↑                                 ↓
        ↓                              git reset                git push (next step)
        ↓                                                                ↓
   (just edits)                                                  ┌──────────────┐
                                                                 │   GitHub     │
                                                                 │   (remote)   │
                                                                 └──────────────┘
```

- **Working directory**: your files as they currently sit on disk
- **Staging area**: changes you've selected to be in the next commit
- **Commit history**: snapshots saved permanently in `.git`
- **Remote (GitHub)**: a copy pushed online

---

### Step 2: The Daily Workflow

```bash
# 1. See what changed
git status

# 2. Add specific files
git add filename.js
git add .                          # all changes in current folder

# 3. Commit with a message
git commit -m "Add login form validation"

# 4. Push to GitHub (after first push: just `git push`)
git push
```

**Good commit messages tell the WHY, not the WHAT:**
```bash
# ❌ Bad
git commit -m "updates"
git commit -m "fix"
git commit -m "asdf"

# ✅ Good
git commit -m "Add input validation to login form"
git commit -m "Fix off-by-one bug in lesson counter"
git commit -m "Refactor study log query for performance"
```

---

### Step 3: Connecting to GitHub

```bash
# 1. Create an empty repo on github.com (don't add README/LICENSE)

# 2. Link your local repo to GitHub
git remote add origin https://github.com/yourusername/repo-name.git

# 3. Set the default branch name (modern convention)
git branch -M main

# 4. Push for the first time
git push -u origin main
# -u (upstream) sets it so future `git push` knows where to send commits

# After that, just:
git push
```

---

### Step 4: Pulling Changes

When working on another machine (or after editing files in GitHub web UI):

```bash
git pull
# Fetches changes from GitHub and merges them into your local copy
```

---

### Step 5: .gitignore — Files Git Should Skip

Some files should never be committed:
- Secret keys (`.env`)
- `node_modules/` (huge folder, regeneratable)
- Build outputs (`dist/`, `build/`)
- IDE-specific files (`.vscode/`, `.idea/`)

Create a `.gitignore` file:
```gitignore
# .gitignore

# Dependencies
node_modules/

# Build outputs
dist/
build/
.next/

# Environment
.env
.env.local

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

Git completely ignores anything matching these patterns. **Always create a `.gitignore` before your first commit.**

---

### Step 6: Viewing History

```bash
# Show commit history
git log

# Cleaner one-line view
git log --oneline

# Last 5 commits
git log -5

# What changed in the last commit
git show
```

Example output:
```
abc123f Add login form validation
def456a Fix off-by-one bug in counter
789xyz3 Initial commit
```

---

### Step 7: Undoing Things

```bash
# Discard changes to a file (before staging)
git restore filename.js

# Unstage a file (you ran `git add` by mistake)
git restore --staged filename.js

# Amend the last commit message
git commit --amend -m "New message"

# Reset to a previous commit (CAUTION — only for unpushed commits)
git reset --hard abc123f
```

> **Warning:** Never use `git reset --hard` on a shared branch — you'll erase history. For pushed code, use `git revert` instead which creates a new commit that undoes the bad one.

---

### Step 8: SSH Keys (Better Than HTTPS)

After a while you'll get tired of typing your password. Set up SSH:

```bash
# Generate a key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy the public key
cat ~/.ssh/id_ed25519.pub

# Paste it on GitHub: Settings → SSH and GPG Keys → New SSH Key

# Test
ssh -T git@github.com
# → "Hi yourusername! You've successfully authenticated..."

# Change your remote to use SSH
git remote set-url origin git@github.com:yourusername/repo-name.git
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Your first commit:**
```bash
# 1. Make a folder, init git, create README.md
# 2. Commit it with message "Initial commit"
# 3. Run git log — confirm your commit is there
```

**Exercise 2 — Stage selectively:**
```bash
# 1. Make 2 files: file1.js, file2.js
# 2. Stage only file1.js
# 3. Commit it
# 4. Stage file2.js and commit separately
# 5. git log — you should see 2 separate commits
```

**Exercise 3 — Publish to GitHub:**
```bash
# 1. Create a new repo on github.com (empty, no README)
# 2. Connect your local repo to it (git remote add origin ...)
# 3. Push (git push -u origin main)
# 4. Refresh GitHub — your code should appear
```

**Exercise 4 — Update workflow:**
```bash
# 1. Edit a file in your repo
# 2. git status — see the change
# 3. git diff — see exactly what changed
# 4. git add, commit, push
# 5. Refresh GitHub — confirm changes appear
```

**Exercise 5 — .gitignore:**
```bash
# 1. Create node_modules/something.txt in your repo
# 2. Notice git wants to add it
# 3. Create .gitignore with `node_modules/`
# 4. git status — node_modules should disappear
# 5. Commit .gitignore
```

**Exercise 6 — Fix a mistake:**
```bash
# 1. Commit a file with a typo in the message
# 2. Use git commit --amend to fix the message
# 3. git log to verify
```

**Exercise 7 — Practice reading log:**
```bash
# 1. Make 5 small commits with meaningful messages
# 2. View them with git log --oneline
# 3. Pick one and view it with git show <commit-hash>
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Committing `.env` or secrets | Credentials leak to the internet | Add `.env` to `.gitignore` BEFORE first commit |
| Committing `node_modules/` | Repo becomes huge and slow | Always include in `.gitignore` |
| Vague commit messages | Future-you can't read your own history | Write what + why |
| `git reset --hard` on shared branches | Erases teammates' work | Use `git revert` instead |
| Not pulling before pushing | Push rejected — out of date | `git pull` first, resolve any conflicts |
| Forgetting to push | Code is local-only, lost if laptop dies | Push at the end of every session |

---

## 🧠 Mental Model

```
Workflow (memorize this):
  edit files  →  git add .  →  git commit -m "msg"  →  git push

Zones:
  Working dir    : your current files
  Staging area   : added but not committed
  Local repo     : committed but not pushed
  Remote (GitHub): pushed, safely backed up

Daily commands (90% of usage):
  git status              what's the state?
  git add .               stage everything
  git commit -m "..."     save snapshot
  git push                send to GitHub
  git pull                get changes from GitHub
  git log --oneline       view history
```

---

## 📝 Check Your Understanding

1. **Define:** What is the difference between `git add` and `git commit`?
2. **Predict:** What does `git status` show after running `git add file.js` but before committing?
3. **Find the bug:**
   ```bash
   git push
   # → "rejected — non-fast-forward"
   # What does this mean? What should you do?
   ```
4. **Write it:** Write the exact commands to: create a new repo, add a README.md, and push to a new GitHub repo (you can assume the GitHub repo URL exists).
5. **Apply it:** You accidentally added a `.env` file with secrets and pushed it. Outline the steps to fix this (this is harder than it sounds — research what to do).
6. **Reflect:** Why is Git used by virtually every software team? What problems does it solve that file naming (`final-v3-FINAL.js`) doesn't?
