# Zod Validation & Error Handling

## Why This Matters

Never trust user input. Zod gives you runtime validation with TypeScript types generated automatically. Combined with Server Actions, you get end-to-end type safety: the form, the validation, the database write, and the response are all typed. This eliminates the #1 source of production bugs.

## Core Concepts

### Schema Definition

```typescript
import { z } from "zod";

const UserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  age: z.number().min(13, "Must be at least 13").max(120),
  role: z.enum(["user", "admin"]).default("user"),
});

// Infer TypeScript type from schema
type User = z.infer<typeof UserSchema>;
// { name: string; email: string; age: number; role: "user" | "admin" }
```

### Validation with safeParse

```typescript
// safeParse — returns result object (never throws)
const result = UserSchema.safeParse({
  name: "Alice",
  email: "not-an-email",
  age: 150,
});

if (!result.success) {
  console.log(result.error.flatten().fieldErrors);
  // {
  //   email: ["Invalid email address"],
  //   age: ["Must be at least 13 and at most 120"]
  // }
}

// parse — throws on error (use when failure is exceptional)
const user = UserSchema.parse(validData);
```

### Server Action with Zod

```tsx
"use server";
import { z } from "zod";

const StudyLogSchema = z.object({
  date: z.string().min(1, "Date is required"),
  minutes: z.coerce.number().min(1).max(720),
  mood: z.enum(["great", "good", "okay", "bad"]).optional(),
  energy: z.coerce.number().min(1).max(5).optional(),
  learned: z.string().optional(),
});

export async function createStudyLog(
  prevState: { error?: Record<string, string[]>; success?: boolean },
  formData: FormData
) {
  const raw = Object.fromEntries(formData);

  const validated = StudyLogSchema.safeParse(raw);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  await db.studyLog.create({
    data: { ...validated.data, userId: "..." },
  });

  revalidatePath("/study-log");
  return { success: true };
}
```

### Common Zod Validators

```typescript
z.string().min(1)            // non-empty string
z.string().max(200)          // max length
z.string().email()           // email format
z.string().url()             // URL format
z.string().uuid()            // UUID format
z.string().regex(/^[a-z]+$/) // custom regex

z.number().min(0)            // positive number
z.number().max(100)          // max value
z.number().int()             // integer only

z.coerce.number()            // convert string "42" to number 42
z.coerce.date()              // convert ISO string to Date

z.enum(["a", "b", "c"])     // one of several values
z.boolean()
z.optional()                 // allows undefined
z.nullable()                 // allows null
z.array(z.string())          // array of strings
z.record(z.string(), z.number()) // { [key: string]: number }
```

### Client-Side Validation Integration

```tsx
"use client";
import { useActionState } from "react";

export function StudyLogForm() {
  const [state, formAction, pending] = useActionState(createStudyLog, {});

  return (
    <form action={formAction}>
      <input name="date" type="date" />
      {state.error?.date && <p className="text-red-500 text-sm">{state.error.date[0]}</p>}

      <input name="minutes" type="number" />
      {state.error?.minutes && <p className="text-red-500 text-sm">{state.error.minutes[0]}</p>}

      <select name="mood">
        <option value="">Select mood</option>
        <option value="great">Great</option>
        <option value="good">Good</option>
      </select>

      <button disabled={pending}>{pending ? "Saving..." : "Save"}</button>

      {state.success && <p className="text-green-500">Logged successfully!</p>}
    </form>
  );
}
```

## Try It Yourself

1. Create a Zod schema for a form in your app.
2. Add validation to a Server Action using `safeParse`.
3. Display field-level errors in your form.
4. Use `z.coerce` to handle FormData string-to-number conversion.

## Common Mistakes

- **Server-only validation without client feedback**: Return errors to the client so users know what to fix.
- **Using `parse` instead of `safeParse`**: `parse` throws, which means you need try/catch. `safeParse` is cleaner for form validation.
- **Forgetting `z.coerce`**: FormData values are always strings. `z.coerce.number()` handles the conversion.

## Checkpoint

1. Why is server-side validation necessary even with client-side validation?
2. What's the difference between `parse` and `safeParse`?
3. What does `z.coerce.number()` do?
4. **Reflection**: Add Zod validation to one of your existing forms.
