# Advanced Git: Branching Strategy

## 🎯 By End of This Lesson You Will:
- Create, switch, merge, and delete branches
- Understand the difference between merge and rebase
- Write conventional commits and good PR descriptions

---

## 🌍 Real-World Analogy First

A **branch** is a parallel line of work. Imagine writing a book:

```
main branch:     ─────●─────●─────●  ←  the official version

feature-X:                ╲
                           ●─────●  ← experimental chapter, isolated
```

You can experiment freely in your branch without affecting `main`. When you're happy, you **merge** back. If it doesn't work out, you delete the branch — `main` is untouched.

This is how every modern team works:
- Each feature/fix lives in its own branch
- Code is reviewed before merging back
- `main` is always stable

---

## 📖 Start From Zero

### Create and Switch to a Branch

```bash
# Create a new branch
git branch feature/login-form

# Switch to it
git checkout feature/login-form

# Combined (modern shorthand)
git switch -c feature/login-form
```

### See What Branch You're On

```bash
git branch
# Output:
#   main
# * feature/login-form    ← star = current branch
```

---

## 🔨 Level Up

### Step 1: The Branching Workflow (Solo or Team)

```bash
# 1. Make sure you're on main and up to date
git switch main
git pull

# 2. Create a feature branch
git switch -c feature/add-search

# 3. Work, commit, work, commit
git add .
git commit -m "Add search input UI"
git add .
git commit -m "Wire search to API"

# 4. Push your branch
git push -u origin feature/add-search

# 5. Open a Pull Request on GitHub (UI step)

# 6. After PR is merged, clean up
git switch main
git pull                              # get the merged code
git branch -d feature/add-search      # delete local branch
```

---

### Step 2: Merging vs Rebasing

You have two ways to bring `main` changes into your branch:

#### Merge (default)
```bash
git switch feature/x
git merge main
```

Creates a **merge commit** that combines histories:
```
main:     ─●─●─●──────●  ← merge commit
                       ╲ │
feature:           ●─●──●
```

#### Rebase (cleaner history)
```bash
git switch feature/x
git rebase main
```

Replays your branch's commits **on top** of main:
```
main:     ─●─●─●
                 ╲
feature:          ●─●─●  ← your commits, but rebased
```

**When to use which:**
- **Merge** for shared branches (no rewriting history)
- **Rebase** to keep your private feature branch clean before opening a PR
- **Never rebase** commits that others have based work on

```bash
# Rebase your feature onto latest main BEFORE opening PR:
git switch feature/x
git fetch
git rebase origin/main

# Resolve any conflicts (Git tells you which files)
git add resolved-file.js
git rebase --continue

# Force-push (you rewrote history — needed for already-pushed branches)
git push --force-with-lease
```

> **`--force-with-lease`** is safer than `--force` — it refuses to overwrite if someone else pushed in the meantime.

---

### Step 3: Conventional Commits

Standardized commit messages make changelogs and reviews easier:

```
type(optional-scope): short description

[optional body]
[optional footer]
```

**Common types:**
```bash
feat:     a new feature
fix:      a bug fix
docs:     documentation only
style:    formatting (no code change)
refactor: code restructure (no behavior change)
test:     adding/fixing tests
chore:    tooling, dependencies
perf:     performance improvement
```

**Examples:**
```bash
feat: add password strength meter to signup form
fix(auth): prevent login button double-click submission
refactor: extract date utilities into separate module
docs: update README installation steps
chore: bump Node version to 20
```

Bad commits don't tell future-you (or your team) anything:
```bash
"updates"  ❌
"fix bug"  ❌
"asdf"     ❌
```

---

### Step 4: Pull Requests (PRs) — The Code Review Step

A PR (or "Merge Request" on GitLab) is your branch asking to be merged back into main. A good PR:

```
Title: [type] Short, specific description

Description:
## What
- 1-3 bullets of what changed

## Why
- Why is this change needed?

## How to test
- [ ] Specific manual test steps
- [ ] Edge cases to verify

## Screenshots (if UI change)
[before/after]
```

Even when working solo, write PR descriptions for yourself. You'll thank yourself 3 months later.

---

### Step 5: Resolving Merge Conflicts

When two branches changed the same lines, Git can't auto-merge:

```bash
git merge main
# CONFLICT (content): Merge conflict in src/login.js
# Automatic merge failed; fix conflicts and then commit
```

Open the conflicted file. Git inserts markers:

```javascript
<<<<<<< HEAD (your version)
const greeting = "Welcome back!";
=======
const greeting = "Hello again!";    
>>>>>>> main (their version)
```

Decide which version to keep (or combine them), delete the markers, and:

```bash
git add src/login.js
git commit              # finishes the merge
```

For rebase conflicts:
```bash
# Resolve files, then:
git add resolved.js
git rebase --continue
```

---

### Step 6: Tags — Mark Releases

```bash
# Create a tag
git tag v1.0.0

# With a message (recommended)
git tag -a v1.0.0 -m "First production release"

# Push tags
git push --tags

# List tags
git tag

# Delete tag
git tag -d v1.0.0
```

Tags mark specific commits permanently (releases, milestones).

---

### Step 7: Cherry-Pick — Copy a Specific Commit

```bash
# Apply a single commit from another branch onto current branch
git switch main
git cherry-pick abc123def
```

Useful for hotfixes: fix a bug on `main`, then cherry-pick into the active feature branch.

---

### Step 8: Useful Aliases (Optional)

```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.st status
git config --global alias.lg "log --oneline --graph --all --decorate"

# Now:
git st
git lg
```

`git lg` becomes especially useful for visualizing branch structure.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Create a branch:**
```bash
# Create a feature branch, make a commit, push it
git switch -c feature/practice-1
echo "# Practice" > practice.md
git add practice.md
git commit -m "feat: add practice file"
git push -u origin feature/practice-1
```

**Exercise 2 — Merge:**
```bash
# Switch to main, merge your feature branch in
# Delete the feature branch after
```

**Exercise 3 — Conventional commit:**
```bash
# Make 5 commits with proper conventional commit messages:
# feat, fix, docs, refactor, chore
```

**Exercise 4 — Resolve a conflict:**
```bash
# In main, edit a file's first line to "main version"
# On a new branch, edit the same line to "branch version"
# Try to merge — resolve the conflict
```

**Exercise 5 — Rebase:**
```bash
# Start a feature branch from main
# Make 2 commits on main (a different change)
# Rebase your feature branch onto the updated main
```

**Exercise 6 — Tag a release:**
```bash
# Create an annotated tag v0.1.0 with a message
# Push it to remote
```

**Exercise 7 — Cherry-pick:**
```bash
# Make a fix on main, then cherry-pick it into a feature branch
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Rebasing public/shared branches | Breaks teammates' work | Only rebase private branches |
| `git push --force` (without --force-with-lease) | Overwrite teammates' commits | Use `--force-with-lease` |
| Merging without pulling first | Push rejected | Pull, resolve, push |
| Vague commit messages | Can't read history | Use conventional commits |
| Forgetting to delete merged branches | Branch list clutter | `git branch -d feature/x` after merge |
| Working directly on main | No PR review, risky | Always create a feature branch |

---

## 🧠 Mental Model

```
main         ─●─●─●──────●  (stable, protected)
                          │
feature  branch off ─────● [your work here] ──→ open PR → merge back

Common loop:
  switch -c feature → work → push → PR → review → merge → delete

Commits: feat, fix, docs, refactor, chore, test (conventional)
Merge:   combines histories (with merge commit)
Rebase:  replays history (clean linear log)
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between merge and rebase?
2. **Predict:**
   ```bash
   git switch -c feature/x
   echo "hi" > a.txt
   git add a.txt
   git commit -m "feat: a"
   git switch main
   # Is a.txt on main now? Why or why not?
   ```
3. **Find the bug:** Your `git push` is rejected with "non-fast-forward." What does this mean and how do you fix it?
4. **Write it:** Write the exact commands to: branch from main, commit twice with proper conventional commit messages, push, then merge back to main and delete the branch.
5. **Apply it:** When would you cherry-pick instead of merging?
6. **Reflect:** Why do most teams ban `git push --force` on `main`? What's the risk?
