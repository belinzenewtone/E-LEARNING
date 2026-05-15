# TypeScript: Why and How

## 🎯 By End of This Lesson You Will:
- Explain why TypeScript exists and what problems it solves
- Set up a TypeScript project from scratch
- Run TypeScript files and produce compiled JavaScript

---

## 🌍 Real-World Analogy First

JavaScript is like writing a recipe with no measurements:

```
"Add some sugar"  →  how much? 1 tbsp? 1 cup?
"Mix the ingredients"  →  which ones?
```

TypeScript adds **labels and quantities**:

```typescript
"Add 2 tbsp of sugar"   ← number type
"Mix flour, eggs, milk" ← typed string[]
```

The chef (your code) now knows EXACTLY what's expected. Mistakes get caught **before cooking** (compile time) instead of when the cake fails (runtime).

```
JavaScript:  catches errors when the user runs the broken code 💥
TypeScript:  catches errors WHILE you type them ✅
```

---

## 📖 Start From Zero

### The Most Basic TypeScript Code

```typescript
const name: string = "Alice";
const age: number = 30;
const isActive: boolean = true;

console.log(`${name} is ${age}, active: ${isActive}`);
```

The colons (`: string`, `: number`) are **type annotations** — they tell TypeScript what kind of value each variable holds. If you try to assign the wrong type, TypeScript yells at you BEFORE the code runs.

---

## 🔨 Level Up

### Step 1: Why TypeScript?

A JavaScript bug:
```javascript
function getDiscount(price, percent) {
  return price * percent;
}

getDiscount("100", 0.1);   // returns "1010101010" (string repeated!) 🐛
```

The same with TypeScript:
```typescript
function getDiscount(price: number, percent: number): number {
  return price * percent;
}

getDiscount("100", 0.1);   // ❌ Compile error: '"100"' is not a number
```

You caught the bug **before** running the code. Multiplied across hundreds of bugs in a real project, this saves enormous time.

---

### Step 2: Install TypeScript

```bash
# In a new project folder:
npm init -y
npm install --save-dev typescript

# Initialize tsconfig.json
npx tsc --init
```

`tsconfig.json` is TypeScript's config file — it tells the compiler your preferences.

### Step 3: Write Your First .ts File

Create `hello.ts`:
```typescript
function greet(name: string): string {
  return `Hello, ${name}!`;
}

console.log(greet("Belinze"));
```

Compile to JavaScript:
```bash
npx tsc hello.ts
# Creates hello.js — pure JavaScript browsers/Node can run
```

Run the result:
```bash
node hello.js
```

---

### Step 4: tsx — Run TS Directly

You don't always want to compile-then-run. The `tsx` tool runs TypeScript directly:

```bash
npm install --save-dev tsx
npx tsx hello.ts   # runs directly, no separate .js file
```

This is what most modern Node.js projects use.

### Step 5: tsconfig.json — The Important Flags

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,                    ← turn on ALL strict checks
    "noImplicitAny": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

The single most important option: **`"strict": true`**. It enables all strict checks. Use it from day one — it's much easier than retrofitting strict types later.

### Step 6: Watching Mode

```bash
npx tsc --watch
# Watches all .ts files and recompiles on change
```

Or with tsx:
```bash
npx tsx watch src/index.ts
# Reruns on change (like nodemon for TypeScript)
```

---

### Step 7: Type Inference — TypeScript Often Knows

You don't always need to write `: type`:

```typescript
let name = "Alice";       // TypeScript infers: string
let age = 30;              // infers: number
let users = ["Alice", "Bob"]; // infers: string[]

name = 42;                 // ❌ Error — TypeScript caught it from inference
```

**Rule:** Annotate function parameters, return types, and empty arrays/objects. Let TypeScript infer the rest.

---

### Step 8: When to Use TypeScript

```
Always use it for:
  • Production applications (any size)
  • Anything that will be maintained > 1 month
  • Code that other people will work on
  • API contracts

You can skip it for:
  • Throwaway scripts
  • Tiny prototypes (< 100 lines)
  • Quick experiments
```

In 2026, TypeScript is essentially the default for new web/Node projects.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Set up:**
```bash
# Create a new folder, init npm, install TypeScript and tsx
# Run npx tsc --init
```

**Exercise 2 — Type a variable:**
```typescript
// Declare:
//   a string for your name
//   a number for your age  
//   a boolean for whether you've completed Week 1
// Try assigning the wrong type to each and watch TypeScript complain
```

**Exercise 3 — Typed function:**
```typescript
// Write a function add(a: number, b: number) that returns the sum
// Call it with wrong types — observe the error
```

**Exercise 4 — Strict mode bug:**
```typescript
// Set "strict": true
// Write a function with no return type annotation:
//   function half(n) { return n / 2; }
// What error do you get? Fix it.
```

**Exercise 5 — Inference:**
```typescript
// Declare these and notice what type TypeScript infers:
const score = 100;
const name = "Alice";
const flags = [true, false, true];
const data = { id: 1, name: "Alice" };
// Hover each variable in your IDE to see the inferred type
```

**Exercise 6 — Compile and run:**
```bash
# Write hello.ts that prints "Hello, [name]"
# Compile with npx tsc hello.ts
# Run with node hello.js
# Then run directly with npx tsx hello.ts
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Not enabling `strict` mode | Most type checks silently disabled | Always `"strict": true` |
| Over-annotating | Cluttered code | Let TypeScript infer where it can |
| Using `any` to silence errors | Loses all type safety | Use `unknown` or proper types |
| Editing .js while leaving .ts | They drift apart | Always edit .ts; .js is generated |

---

## 🧠 Mental Model

```
TypeScript = JavaScript + types

  .ts file  →  tsc  →  .js file  →  runs in Node/browser

Why use it:
  • Errors caught BEFORE running
  • Self-documenting code (types are docs)
  • Better autocomplete in editors
  • Safer refactoring

Always: "strict": true in tsconfig.json
```

---

## 📝 Check Your Understanding

1. **Define:** What is the main benefit of TypeScript over plain JavaScript?
2. **Predict:** What error does TypeScript give for:
   ```typescript
   const age: number = "thirty";
   ```
3. **Find the bug:** Why does this fail?
   ```typescript
   function double(n) { return n * 2; }
   ```
   (With strict mode on)
4. **Write it:** Create a typed function `formatXP(amount: number): string` returning "1,250 XP".
5. **Apply it:** Convert a JavaScript file you've written into TypeScript. Add types to every variable and function parameter.
6. **Reflect:** Some teams resist TypeScript because "it slows down writing." What's the counter-argument?
