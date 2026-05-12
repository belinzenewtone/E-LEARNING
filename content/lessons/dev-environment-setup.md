# Setting Up Your Dev Environment

## Why This Matters

Every line of code you write runs somewhere. Setting up your environment properly means fewer "it works on my machine" moments and more time actually building things. A clean, repeatable dev environment is the first thing hiring managers check when they clone your repo.

## Core Concepts

### Node.js & npm

Node.js lets JavaScript run outside the browser. npm (Node Package Manager) installs libraries your project needs.

```bash
# Check your version
node --version  # Should be 18.x or later
npm --version   # Should be 9.x or later
```

When you run `npm init`, it creates a `package.json` — the ID card of your project. It tracks dependencies, scripts, and metadata.

### VS Code Extensions

Install these from the Extensions panel (Ctrl+Shift+X):

| Extension | Why |
|---|---|
| Prettier | Auto-formats code on save |
| ESLint | Catches bugs before they run |
| GitHub Copilot (optional) | AI code suggestions |
| Live Server | Opens HTML in browser with auto-reload |

### Terminal Basics

The terminal is your most powerful tool. You'll use it to run commands, install packages, and manage git.

```bash
pwd              # "print working directory" — where am I?
ls               # list files
cd projects      # change into the "projects" folder
cd ..            # go up one level
mkdir my-app     # create a folder
code .           # open current folder in VS Code
```

### Creating Your First Project

```bash
mkdir js-practice
cd js-practice
npm init -y       # creates package.json with defaults
code .            # open in VS Code
```

Create a `index.js` file with:

```javascript
console.log("Hello, Learning OS!");
```

Run it: `node index.js`

## Try It Yourself

1. Install Node.js from [nodejs.org](https://nodejs.org) (LTS version)
2. Create a folder called `week-01-practice` and `npm init` inside it
3. Write a script that prints your name, today's date, and your learning goal for this week
4. Open the folder in VS Code and install the Prettier extension

## Common Mistakes

- **Installing the wrong Node version**: Always use the LTS (Long Term Support) version, not the latest. Check with `node --version`.
- **Running npm in the wrong folder**: `package.json` must be in the root of your project. If `npm install` can't find it, you're in the wrong directory.
- **Skipping .gitignore**: Create one immediately. Add `node_modules/` to it. Never commit `node_modules`.

## Checkpoint

1. What command creates a new `package.json` file?
2. Why shouldn't you commit the `node_modules` folder?
3. What's the difference between `ls` and `pwd` in the terminal?
4. Reflection: What surprised you about setting up your environment?
