# Enums & Literal Types

## 🎯 By End of This Lesson You Will:
- Use literal union types instead of magic strings
- Build discriminated unions for safe state modelling
- Use exhaustiveness checking to catch missed cases at compile time

---

## 🌍 Real-World Analogy First

A **literal type** is like a multiple-choice question on a form. Instead of letting people type anything ("kinda done", "almost", "Done!", "DONE"), you give them **fixed options**: "active", "paused", "completed".

```
Without literals:           With literals:
status: string              status: "active" | "paused" | "completed"
   ↓                            ↓
status = "ACTIVATED"        status = "ACTIVATED"   ❌ compile error
status = "done"             status = "done"        ❌ not in set
status = "active"           status = "active"      ✅
```

Literal types eliminate typos and "almost-right" values.

---

## 📖 Start From Zero

### Your First Literal Union

```typescript
let direction: "left" | "right" | "up" | "down";

direction = "left";       // ✅
direction = "back";       // ❌ not in the union
```

Each option is a **literal type** — TypeScript only allows those exact strings.

---

## 🔨 Level Up

### Step 1: Practical Literal Unions

```typescript
type Status = "pending" | "active" | "completed" | "cancelled";
type Difficulty = "beginner" | "intermediate" | "advanced";
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface Lesson {
  slug: string;
  title: string;
  difficulty: Difficulty;
  status: Status;
}
```

### Step 2: Literal Numbers and Booleans Too

```typescript
type Quarter = 1 | 2 | 3 | 4;
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
type LightSwitch = true;   // can only be true
```

---

### Step 3: Enums (The Older Way)

```typescript
enum LessonStatus {
  Locked = "locked",
  Available = "available",
  Completed = "completed"
}

const status: LessonStatus = LessonStatus.Available;

function color(s: LessonStatus): string {
  if (s === LessonStatus.Completed) return "green";
  if (s === LessonStatus.Available) return "blue";
  return "gray";
}
```

Enums create a real runtime object. Modern TypeScript teams often prefer **literal unions** because they're lighter:

```typescript
// Modern preferred:
type LessonStatus = "locked" | "available" | "completed";

const status: LessonStatus = "available";
```

### Step 4: `const enum` — Zero Runtime Cost

```typescript
const enum Direction {
  Up = "UP",
  Down = "DOWN"
}

const move = Direction.Up;   // compiles to: const move = "UP"
// No enum object in the output JavaScript
```

### Step 5: Discriminated Unions — The Power Pattern

Each variant has a **unique literal tag** TypeScript uses to narrow:

```typescript
interface PendingLesson {
  status: "pending";
  startDate: null;
}

interface ActiveLesson {
  status: "active";
  startDate: Date;
  progressPercent: number;
}

interface CompletedLesson {
  status: "completed";
  startDate: Date;
  completedAt: Date;
  xpEarned: number;
}

type Lesson = PendingLesson | ActiveLesson | CompletedLesson;

function render(lesson: Lesson) {
  switch (lesson.status) {
    case "pending":
      return "Not started";
    case "active":
      return `${lesson.progressPercent}% done`;
    case "completed":
      return `Done! +${lesson.xpEarned} XP`;   // ← TS knows xpEarned exists here!
  }
}
```

TypeScript narrows the type inside each `case`. Each branch only sees the properties of its variant.

This is THE pattern for modelling state machines, API responses, and form states.

---

### Step 6: Exhaustiveness Checking

Force TypeScript to error if you miss a case:

```typescript
function assertNever(x: never): never {
  throw new Error("unexpected: " + JSON.stringify(x));
}

function render(lesson: Lesson) {
  switch (lesson.status) {
    case "pending":   return "Not started";
    case "active":    return `${lesson.progressPercent}% done`;
    case "completed": return `Done! +${lesson.xpEarned} XP`;
    default:          return assertNever(lesson);   // ← compile error if a case is missing
  }
}
```

Add a new variant to `Lesson` and forget to handle it? The `default` case will fail to compile. Your future self gets a free reminder.

---

### Step 7: `as const` — Lock Inference

```typescript
const config = {
  status: "active",
  retries: 3
};
// Inferred: { status: string; retries: number }  ← too wide!

const config = {
  status: "active",
  retries: 3
} as const;
// Inferred: { readonly status: "active"; readonly retries: 3 }  ← precise!
```

`as const` tells TypeScript: "infer the most specific type you can." Great for config objects and lookup tables.

---

### Step 8: When To Use Each

| | Literal Union | String Enum | `as const` |
|---|---|---|---|
| Syntax | `"a" \| "b"` | `enum { A = "a" }` | `{ key: "a" } as const` |
| Runtime overhead | None | Object created | None |
| Autocomplete | ✅ | ✅ | ✅ |
| Plays well with Prisma/Zod | ✅ | ⚠️ | ✅ |
| Recommended for | Most cases | Large named sets | Config objects |

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Literal union:**
```typescript
// Define type Day = "Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat"|"Sun"
// Write isWeekend(day: Day): boolean
```

**Exercise 2 — Status workflow:**
```typescript
// type Status = "draft" | "review" | "published"
// Write transition(from: Status, to: Status): boolean
// Allowed: draft→review, review→published. Rejects everything else.
```

**Exercise 3 — Discriminated union:**
```typescript
// type Result = { ok: true; value: number } | { ok: false; error: string }
// Write describe(r: Result): string
// Use TypeScript narrowing in each case
```

**Exercise 4 — Exhaustive switch:**
```typescript
// type Shape = { kind: "circle"; radius: number } | { kind: "square"; side: number }
// Write area(s: Shape): number using switch + assertNever
// Then add { kind: "triangle"; base: number; height: number }
// Watch how the compiler tells you the function is now incomplete
```

**Exercise 5 — as const:**
```typescript
// Create a tracks object:
// const tracks = { web: "Web Dev", data: "Data Eng" }
// Without 'as const' the value is inferred as string
// Use 'as const' so the type is "Web Dev" | "Data Eng" precisely
```

**Exercise 6 — Mixed:**
```typescript
// Modelling an API response:
// type ApiResponse<T> = { status: "loading" } 
//                    | { status: "success"; data: T } 
//                    | { status: "error"; message: string }
// Write render<T>(r: ApiResponse<T>): string
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Typing strings instead of literals | Allow any value | Use literal union |
| Forgetting exhaustiveness check | New variant added → silent bug | Add `assertNever` default |
| Reaching for enum first | More verbose | Try literal union first |
| Missing `as const` on lookup objects | Inferred type too wide | Add `as const` |

---

## 🧠 Mental Model

```
Literal types lock values to specific options:
  "active" | "paused" | "completed"

Discriminated unions = union with a common "kind"/"status" field:
  { status: "loading" } | { status: "success"; data: X }

Pattern: switch on the discriminator → TypeScript narrows in each case
Add assertNever default → compiler enforces handling new cases
```

---

## 📝 Check Your Understanding

1. **Define:** What is a literal type? Give an example.
2. **Predict:**
   ```typescript
   type X = "a" | "b" | "c";
   const value: X = "d";   // does this compile?
   ```
3. **Find the bug:**
   ```typescript
   type Shape = { kind: "circle"; r: number } | { kind: "square"; side: number };
   function area(s: Shape) {
     if (s.kind === "circle") return Math.PI * s.r ** 2;
     return s.r * s.r;    // ← why does this fail?
   }
   ```
4. **Write it:** Model a button state with a discriminated union: idle, hover, pressed, disabled.
5. **Apply it:** Replace a magic string in a function signature you've written with a literal union.
6. **Reflect:** Exhaustiveness checking catches bugs at compile time that would otherwise hit production. Why isn't this enough to convince every team to adopt TypeScript?
