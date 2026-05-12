# Git & GitHub Fundamentals

## Why This Matters

Git is the universal version control system. Every professional software team uses it. Git tracks every change you make, lets you experiment safely with branches, and syncs your work with teammates. Your GitHub profile is your public resume — it's the first thing hiring managers look at.

## Core Concepts

### Git vs GitHub

**Git** is the tool that runs on your computer — it tracks changes, creates snapshots, and manages branches. **GitHub** is a website that hosts Git repositories and adds collaboration features (pull requests, issues, actions).

### Your First Repository

```bash
# Create a new project
mkdir my-project
cd my-project
git init                          # initializes empty git repo

# Create a file
echo "# My Project" > README.md

# Stage and commit
git add README.md                 # stage the file (prepare for commit)
git commit -m "Initial commit"    # create a snapshot with message

# Connect to GitHub
git remote add origin https://github.com/YOUR_USERNAME/my-project.git
git branch -M main                # rename default branch to main
git push -u origin main           # upload to GitHub
```

### The Three States

```
Working Directory  →  Staging Area  →  Repository
   (your files)      (git add)        (git commit)
```

- **Working Directory**: Your actual files. Edit freely.
- **Staging Area**: Files marked for the next commit. `git add` moves files here.
- **Repository**: Committed snapshots. `git commit` creates one.

### Essential Commands

```bash
git status              # what changed? what's staged?
git diff                # show unstaged changes line-by-line
git log --oneline       # compact commit history
git log --oneline --graph --all  # visual branch history

# Undoing
git restore file.js     # discard unstaged changes (careful!)
git restore --staged file.js  # unstage a file

# Ignoring files
# Create .gitignore:
node_modules/
.env
.DS_Store
```

### Branches

```bash
git branch feature-x          # create branch
git switch feature-x          # switch to it (or: git checkout)
# ... make changes ...
git add .
git commit -m "Add feature X"
git switch main               # back to main
git merge feature-x           # merge changes into main
git branch -d feature-x       # delete branch (clean up)
```

### Conventional Commits

```
feat: add lesson progress tracking
fix: prevent streak reset on midnight edge case
docs: document XP calculation formula
refactor: extract streak logic to lib/xp.ts
```

Use these prefixes consistently. They make your history readable and enable automatic versioning.

### Writing a Good README

Every repo should have a `README.md`:

```markdown
# Project Name
One-line description.

## What it does
2-3 sentences.

## How to run
\`\`\`bash
npm install
npm run dev
\`\`\`

## What I learned
Key takeaways from building this.
```

## Try It Yourself

1. Create a new repo on GitHub (don't initialize with README — you'll push your own)
2. Initialize git locally, create a README, commit, and push to GitHub
3. Create a branch called `experiment`, add a file, commit, switch back to main, and merge
4. Write a `.gitignore` file with at least 5 common entries

## Common Mistakes

- **Committing secrets**: `.env` files, API keys, and passwords should NEVER be committed. Add them to `.gitignore` immediately. If you accidentally commit a secret, it's compromised — rotate it.
- **`git add .` without checking**: Stages EVERYTHING including files you didn't mean to commit. Use `git status` first.
- **Large files in git**: Git is for code, not data. Keep repos under 100MB. Use `.gitignore` for `node_modules/`, build outputs, and large datasets.

## Checkpoint

1. What's the difference between `git add` and `git commit`?
2. What three states does a file move through in a standard Git workflow?
3. Name 4 conventional commit prefixes and what they mean.
4. **Reflection**: How will you structure your branches for the Learning OS project?
