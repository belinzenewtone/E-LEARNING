# Zod Validation & Error Handling

## 🎯 By End of This Lesson You Will:
- Define schemas with Zod for input validation
- Use `parse` and `safeParse` correctly
- Extract TypeScript types from your schemas

---

## 🌍 Real-World Analogy First

Imagine a **bouncer at a club door**. Before anyone enters, they check IDs:

```
Real ID? Age 21+? Dress code? → Welcome in
Fake or wrong? → Rejected with a clear reason
```

Zod is the bouncer for **data entering your application**:

```
Submitted form? Validates → Welcome to the database
Invalid? → Rejected with field-by-field errors
```

You never want to write raw data to your DB without checking it first. Zod is how you check, in a way that's both runtime-safe AND type-safe.

---

## 📖 Start From Zero

### Your First Schema

```typescript
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().int().positive()
});

const valid = UserSchema.parse({
  name: "Alice",
  email: "alice@example.com",
  age: 25
});
// returns: { name: "Alice", email: "alice@example.com", age: 25 }
// fully typed!

UserSchema.parse({ name: "Bob" });
// ❌ throws ZodError: "email Required", "age Required"
```

`parse` validates AND returns the typed result. Throws on failure.

---

## 🔨 Level Up

### Step 1: Common Validators

```typescript
z.string()                  // any string
z.string().min(2)            // minimum length
z.string().max(100)          // maximum length
z.string().email()           // valid email
z.string().url()             // valid URL
z.string().uuid()
z.string().regex(/^[a-z]+$/)
z.string().trim()            // auto-trim
z.string().toLowerCase()      // auto-lowercase

z.number()
z.number().int()
z.number().positive()
z.number().min(0).max(100)

z.boolean()

z.date()
z.literal("specific")
z.enum(["active", "paused", "done"])
z.array(z.string())
z.object({ /* ... */ })
z.union([z.string(), z.number()])
z.tuple([z.string(), z.number()])
```

---

### Step 2: Optional and Default

```typescript
const Schema = z.object({
  name: z.string(),
  bio: z.string().optional(),      // bio?: string
  active: z.boolean().default(true), // active: boolean — defaults to true
  notes: z.string().nullish()      // string | null | undefined
});
```

### Step 3: parse vs safeParse

```typescript
// parse — throws on failure
try {
  const data = UserSchema.parse(input);
  // use data
} catch (err) {
  // err is a ZodError
}

// safeParse — returns a result object (no throw)
const result = UserSchema.safeParse(input);
if (result.success) {
  // result.data is typed
} else {
  // result.error is a ZodError
}
```

Use `safeParse` in API handlers and Server Actions — it gives you structured error info without throwing.

---

### Step 4: Custom Error Messages

```typescript
const Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be 8+ characters")
});
```

### Step 5: Refinements — Custom Logic

```typescript
const PasswordSchema = z.object({
  password: z.string().min(8),
  confirm: z.string()
}).refine(data => data.password === data.confirm, {
  message: "Passwords don't match",
  path: ["confirm"]    // attach the error to the `confirm` field
});
```

### Step 6: Type Inference

```typescript
const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().int()
});

type User = z.infer<typeof UserSchema>;
// User is: { name: string; email: string; age: number }

// Use it anywhere:
function greet(user: User): string {
  return `Hello, ${user.name}`;
}
```

One schema = both runtime validation AND TypeScript type. Single source of truth.

---

### Step 7: Coercion — Parse Strings to Numbers

When data comes from form inputs, everything is a string:

```typescript
// Form data: { age: "25" }

const Schema = z.object({
  age: z.coerce.number()
});

const result = Schema.parse({ age: "25" });
// result.age is now 25 (number)
```

Coercion is especially useful in Server Actions where FormData values are strings.

---

### Step 8: Server Action Pattern

```typescript
"use server";
import { z } from "zod";

const CreateLessonSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters/digits/dashes"),
  title: z.string().min(3),
  estimatedMinutes: z.coerce.number().int().positive()
});

export async function createLesson(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const result = CreateLessonSchema.safeParse(raw);

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  await db.lesson.create({ data: result.data });
  revalidatePath("/lessons");
  return { success: true };
}
```

`flatten().fieldErrors` returns `{ fieldName: string[] }` — perfect for showing per-field errors in the UI.

---

### Step 9: Nested Schemas

```typescript
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zip: z.string()
});

const UserSchema = z.object({
  name: z.string(),
  address: AddressSchema,
  socialLinks: z.array(z.string().url()).optional()
});

type User = z.infer<typeof UserSchema>;
// { name: string; address: { street; city; zip }; socialLinks?: string[] }
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Basic schema:**
```typescript
// LessonSchema: slug (lowercase letters/digits/dashes), title (>=3), xp (positive int)
```

**Exercise 2 — Parse:**
```typescript
// Try parse() with valid input — see typed result
// Try with invalid input — catch ZodError, print field errors
```

**Exercise 3 — safeParse:**
```typescript
// Same as above but with safeParse
// Use the result object instead of try/catch
```

**Exercise 4 — Type infer:**
```typescript
// Get a TypeScript type from your schema
// Use it as the parameter type of a function
```

**Exercise 5 — Coerce:**
```typescript
// Build a FormData input schema where numbers come as strings
// Use z.coerce.number() and z.coerce.boolean()
```

**Exercise 6 — Refine:**
```typescript
// Password + confirm fields that must match
// Attach the error to the confirm field
```

**Exercise 7 — Real action:**
```typescript
// Server Action that:
// 1. Validates the form input with Zod
// 2. Returns field errors if validation fails
// 3. Creates the record if it succeeds
// 4. Returns success
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Using `parse` in API handler | Throws on bad input, returns 500 | Use `safeParse` and return 400 |
| Forgetting `.coerce` for form data | "expected number, got string" | Use `z.coerce.number()` |
| Inconsistent error shape | UI handling fragile | Always return `flatten().fieldErrors` |
| Defining types separately from schema | Drift over time | Use `z.infer<typeof Schema>` |
| Validating only on frontend | Bad data still hits DB | ALWAYS validate on the server |

---

## 🧠 Mental Model

```
Schema = runtime validator + TypeScript type

  z.string()            ←  validators
   .min(2).email()      ←  chained constraints
  z.object({ ... })     ←  composite shapes
  z.infer<typeof X>     ←  derive type from schema

Validation:
  parse(input)          throws on failure
  safeParse(input)      returns { success, data | error }

Single source of truth: define ONE schema, use it for validation AND TS types.
```

---

## 📝 Check Your Understanding

1. **Define:** What is the difference between `parse` and `safeParse`?
2. **Predict:**
   ```typescript
   const Schema = z.object({ age: z.coerce.number() });
   const result = Schema.parse({ age: "25" });
   ```
   What is `result.age` and its type?
3. **Find the bug:**
   ```typescript
   const Schema = z.object({ email: z.string() });
   Schema.parse({ email: "notanemail" });   // passes — why?
   ```
4. **Write it:** A schema for a sign-up form with name, email, password (≥8), confirm password (must match).
5. **Apply it:** Add Zod to a Server Action you previously wrote that lacked validation.
6. **Reflect:** Why is "validate on the server, even if you validate on the client" a critical rule?
