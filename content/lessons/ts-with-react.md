# TypeScript with React

## 🎯 By End of This Lesson You Will:
- Type React component props, including children
- Type `useState`, `useRef`, and event handlers
- Type React Context safely

---

## 🌍 Real-World Analogy First

In a JavaScript React app, every prop is implicit — you guess what each component expects. In a TypeScript React app, the **component header is a contract**:

```
"This Button needs:
  - label (string, required)
  - onClick (function with no args, required)
  - variant (optional: primary | secondary | danger)"
```

Pass the wrong type, miss a required prop, or typo a name — and the compiler tells you BEFORE your app crashes in the browser.

---

## 📖 Start From Zero

### Your First Typed Component

```typescript
type ButtonProps = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

export function Button({ label, onClick, variant = "primary", disabled = false }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
```

Reading it:
- `ButtonProps` defines the shape of props
- The destructured parameters get full type info
- Required props (without `?`) must be passed
- Optional props with defaults are inferred properly

---

## 🔨 Level Up

### Step 1: Children Prop

```typescript
import type { ReactNode } from "react";

type CardProps = {
  title: string;
  children: ReactNode;     // any valid JSX/React content
  footer?: ReactNode;
};

export function Card({ title, children, footer }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
```

`ReactNode` is the broadest valid type for children — accepts strings, numbers, elements, fragments, arrays, etc.

---

### Step 2: useState — When to Annotate

```typescript
import { useState } from "react";

// Inferred — works for simple values:
const [count, setCount] = useState(0);             // number
const [name, setName] = useState("Alice");          // string

// Annotate when initial value is misleading:
const [user, setUser] = useState<User | null>(null);

// Array state:
const [lessons, setLessons] = useState<Lesson[]>([]);

// Union state:
type Status = "idle" | "loading" | "success" | "error";
const [status, setStatus] = useState<Status>("idle");
```

Rule: annotate when the initial value doesn't communicate the full type (e.g., `null`, empty arrays).

---

### Step 3: useRef

```typescript
import { useRef, useEffect } from "react";

// DOM ref — type with the element type
function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();   // optional chain — starts as null
  }, []);

  return <input ref={inputRef} />;
}

// Mutable value ref (not a DOM node):
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

---

### Step 4: Event Handlers

```typescript
import type { ChangeEvent, MouseEvent, FormEvent, KeyboardEvent } from "react";

function SearchForm() {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log(e.currentTarget.id);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // ...
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} onKeyDown={handleKeyDown} />
      <button id="search" onClick={handleClick}>Search</button>
    </form>
  );
}
```

The pattern: `EventName<HTMLElementType>` — for example `ChangeEvent<HTMLInputElement>`.

---

### Step 5: React Context

```typescript
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// 1. Define the shape
type ThemeContextValue = {
  theme: "light" | "dark";
  toggleTheme: () => void;
};

// 2. Create with undefined default — forces use within Provider
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// 3. Custom hook with runtime guard
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

// 4. Typed provider
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

The `| undefined` default forces consumers to use the safe custom hook, not raw `useContext`.

---

### Step 6: useReducer with Discriminated Unions

```typescript
type Action =
  | { type: "increment"; amount: number }
  | { type: "decrement"; amount: number }
  | { type: "reset" };

type State = { count: number; history: number[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { count: state.count + action.amount, history: [...state.history, state.count] };
    case "decrement":
      return { count: state.count - action.amount, history: [...state.history, state.count] };
    case "reset":
      return { count: 0, history: [] };
  }
}

// In a component:
const [state, dispatch] = useReducer(reducer, { count: 0, history: [] });
dispatch({ type: "increment", amount: 5 });        // ✅
// dispatch({ type: "increment", amount: "five" }); // ❌
```

Discriminated unions for actions + exhaustive switch = type-safe state management.

---

### Step 7: Polymorphic Components (Advanced)

Components that can be different HTML elements:

```typescript
import type { ElementType, ComponentPropsWithoutRef } from "react";

type ButtonProps<As extends ElementType = "button"> = {
  as?: As;
  children: ReactNode;
} & ComponentPropsWithoutRef<As>;

function Button<As extends ElementType = "button">(
  { as, children, ...rest }: ButtonProps<As>
) {
  const Component = as || "button";
  return <Component {...rest}>{children}</Component>;
}

<Button>Default button</Button>
<Button as="a" href="/home">Link button</Button>
<Button as="div" onClick={() => {}}>Div button</Button>
```

This is how libraries like Radix/Chakra type their flexible primitives.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Typed component:**
```typescript
// type AvatarProps = { src: string; alt: string; size?: number }
// Build the component with defaultSize 40
```

**Exercise 2 — Children:**
```typescript
// type SectionProps = { title: string; children: ReactNode }
// Render a heading + body
```

**Exercise 3 — useState union:**
```typescript
// State of fetch:
// type FetchState<T> = { status: "idle" } | { status: "loading" } | { status: "success"; data: T } | { status: "error"; message: string }
// Build a hook useFetch<T>(url): FetchState<T>
```

**Exercise 4 — useRef:**
```typescript
// Typed input ref that programmatically focuses on mount
```

**Exercise 5 — Event:**
```typescript
// Form with email + password
// Type the change handler and submit handler properly
```

**Exercise 6 — Typed context:**
```typescript
// AuthContext with user (User | null) and login/logout methods
// Custom hook useAuth() that throws if not within Provider
```

**Exercise 7 — useReducer:**
```typescript
// Build a todo list reducer:
// Actions: ADD, TOGGLE, DELETE, CLEAR_COMPLETED
// State: { todos: { id; text; done }[] }
// Use discriminated union + exhaustive switch
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Using `any` for event types | Lose type safety | Use `ChangeEvent<HTMLInputElement>` etc. |
| Forgetting to annotate useState for null/empty | Type is too narrow | `useState<T \| null>(null)` |
| Default `createContext(null)` without guard | Crashes if used outside Provider | Custom hook with runtime guard |
| Treating React.FC as the only way | FC has quirks | Just use plain function with typed props |
| Passing wrong children type | Confusing errors | Use `ReactNode` for general children |

---

## 🧠 Mental Model

```
Props:      type Props = { ... }
Children:   children: ReactNode
useState:   useState<T>(initial)
useRef:     useRef<HTMLInputElement>(null)
Events:     (e: ChangeEvent<HTMLInputElement>) => void
Context:    createContext<T | undefined>(undefined) + custom hook
Reducer:    discriminated-union actions, exhaustive switch
```

---

## 📝 Check Your Understanding

1. **Define:** Why use `ReactNode` instead of `JSX.Element` for children?
2. **Predict:** Why does this fail?
   ```typescript
   const [user, setUser] = useState(null);
   setUser({ name: "Alice" });
   ```
3. **Find the bug:**
   ```typescript
   const ref = useRef<HTMLInputElement>(null);
   ref.current.focus();
   ```
4. **Write it:** A typed `Tabs` component where each tab knows its parent's selected state.
5. **Apply it:** Type a previously written React component thoroughly. Where did you have implicit `any`?
6. **Reflect:** TypeScript and React are often described as "made for each other." What makes them complementary?
