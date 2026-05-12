# Advanced Git: Branching Strategy

## Why This Matters

Git branches are how you experiment without breaking main, work on features in parallel, and keep a clean history. Even as a solo developer, a good branching strategy saves you from "I changed too much and now nothing works." It also signals professionalism to anyone reviewing your repos.

## Core Concepts

### Feature Branch Workflow

```bash
# Start from an up-to-date main
git switch main
git pull origin main

# Create a branch for your feature
git switch -c feat/add-search

# Work, commit often
git add .
git commit -m "feat: add search input component"
git commit -m "feat: implement search filtering logic"
git commit -m "feat: style search results"

# Push to remote (first time)
git push -u origin feat/add-search

# Merge back to main
git switch main
git pull origin main             # update main
git merge feat/add-search        # bring in your work
git push origin main             # push the merge

# Clean up
git branch -d feat/add-search    # delete local
git push origin --delete feat/add-search  # delete remote
```

### Merge vs Rebase

```bash
# Merge — creates a merge commit (preserves exact history)
git merge feat/add-search
# History: A → B → C → M (merge commit) → D
#                          ↘ F → G ↗

# Rebase — replays commits on top of main (linear history)
git switch feat/add-search
git rebase main
# History: A → B → C → D → F' → G'
# (F and G are replayed, getting new hashes)
```

**Rule for solo work**: Merge is safer and preserves context. Rebase is cleaner for PRs. Never rebase commits you've already pushed.

### Conventional Commits

```
<type>: <description>

[optional body]
[optional footer]
```

| Type | When to use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | Formatting, semicolons, etc. (no code change) |
| `refactor:` | Restructuring without changing behavior |
| `test:` | Adding or fixing tests |
| `chore:` | Build process, dependencies, tooling |

### Pull Requests for Solo Work

Even solo, PRs are useful because they:
1. Create a review checkpoint before merging
2. Give you a chance to review your own diff
3. Document the "why" in the PR description
4. Keep your main branch always deployable

### Branch Naming Conventions

```bash
feat/add-dark-mode        # new feature
fix/streak-midnight-bug   # bug fix
refactor/xp-calculation   # code improvement
docs/api-documentation    # documentation
chore/update-deps         # maintenance

# Or with issue tracking:
feat/12-add-search        # #12 is the issue number
```

### Handling Merge Conflicts

```bash
# 1. Conflict appears during merge
git merge feat/conflicting-branch
# CONFLICT in file.js

# 2. Open the file. You'll see:
<<<<<<< HEAD
const name = "main version";
=======
const name = "branch version";
>>>>>>> feat/conflicting-branch

# 3. Edit to keep the correct version, remove markers:
const name = "resolved version";

# 4. Stage and commit
git add file.js
git commit -m "fix: resolve merge conflict in config"
```

### Stashing

```bash
# Save uncommitted work temporarily
git stash

# Switch branches, do something, come back
git switch main
# ... do work ...
git switch feat/feature

# Restore stashed changes
git stash pop

# List stashes
git stash list

# Stash with a message
git stash push -m "WIP: search component"
```

## Try It Yourself

1. Create a feature branch, make 2 commits, push to GitHub, and merge via PR.
2. Deliberately create a merge conflict between two branches and resolve it.
3. Stash some work, switch branches, then pop the stash.
4. Write a conventional commit message for each change you've made today.

## Common Mistakes

- **Working directly on main**: Always create a branch. Main should always be deployable.
- **Force-pushing shared branches**: `git push --force` overwrites history. Only force-push to your own feature branches.
- **Committing large unrelated changes together**: Each commit should be one logical change. "Fix bug AND add feature AND update docs" should be 3 commits.

## Checkpoint

1. What are 4 conventional commit prefixes and what do they mean?
2. When should you use merge vs rebase?
3. What command saves uncommitted work temporarily?
4. **Reflection**: How will you structure branches for the Learning OS project?
