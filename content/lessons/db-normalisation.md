# Normalisation: 1NF, 2NF, 3NF

## 🎯 By End of This Lesson You Will:
- Identify violations of 1NF, 2NF, and 3NF
- Refactor a denormalized schema into 3NF
- Know when (and why) to intentionally denormalize

---

## 🌍 Real-World Analogy First

Imagine an Excel sheet where every row repeats the same customer info for every order:

```
order_id  customer_name   customer_email      product   qty
─────────  ──────────────  ──────────────────  ───────   ───
   1       Alice Smith     alice@x.com         Book        2
   2       Alice Smith     alice@x.com         Pen         5
   3       Alice Smith     alice@x.com         Note        1
   4       Bob Jones       bob@x.com           Book        1
```

Problems:
- Update Alice's email → must change in 3 rows (and miss one = bug)
- Delete an order → might lose customer info
- 100 orders by Alice = 100 copies of her email

**Normalisation** removes this redundancy by splitting data into multiple tables linked by IDs.

---

## 📖 Start From Zero

### The Normal Forms (1NF → 2NF → 3NF)

Think of these as **three increasingly strict rules** for storing data without redundancy.

```
1NF: each cell has ONE value, each row is unique
2NF: 1NF + every non-key column depends on the WHOLE key
3NF: 2NF + no transitive dependencies
```

We'll go through each with examples.

---

## 🔨 Level Up

### Step 1: First Normal Form (1NF)

**Rule:** Each cell holds one value. Each row is unique.

```
❌ NOT 1NF:
order_id  items
─────────  ─────────────────────
   1       Book, Pen, Notebook
   2       Mouse, Keyboard

Cells hold multiple values — can't query "how many Pens were ordered?" easily.
```

```
✅ 1NF:
order_id  item
─────────  ────────
   1       Book
   1       Pen
   1       Notebook
   2       Mouse
   2       Keyboard

One value per cell. Now you can COUNT, GROUP BY, etc.
```

### Step 2: Second Normal Form (2NF)

**Rule:** 1NF + every non-key column depends on the WHOLE primary key.

This matters when you have a **composite primary key** (multiple columns together):

```
❌ NOT 2NF (composite PK: order_id + product_id):

order_id  product_id  product_name   qty   customer_name
─────────  ──────────  ─────────────  ───   ──────────────
   1       p-100       Book              2   Alice
   1       p-200       Pen               5   Alice  ← redundant
   2       p-100       Book              1   Bob

`product_name` depends on product_id only (not order_id).
`customer_name` depends on order_id only.
Both partial dependencies → not 2NF.
```

```
✅ 2NF:
orders               order_items              products
─────────────────    ──────────────────────   ────────────────────
order_id  customer    order_id  product_id qty   product_id  name
   1      Alice          1       p-100       2     p-100    Book
   2      Bob            1       p-200       5     p-200    Pen
                         2       p-100       1
```

Each column depends on its full key, not part of it.

---

### Step 3: Third Normal Form (3NF)

**Rule:** 2NF + no transitive dependencies (non-key columns depending on OTHER non-key columns).

```
❌ NOT 3NF:

employees
─────────────────────────────────────
emp_id  name      dept_id  dept_name
─────────────────────────────────────
   1    Alice       D1     Engineering
   2    Bob         D1     Engineering   ← department repeats
   3    Carol       D2     Sales

dept_name depends on dept_id (NOT on emp_id directly).
If dept name changes, must update many rows.
```

```
✅ 3NF:

employees                departments
─────────────────────    ─────────────────────
emp_id  name   dept_id    dept_id  dept_name
   1    Alice    D1         D1     Engineering
   2    Bob      D1         D2     Sales
   3    Carol    D2

Each non-key column depends DIRECTLY on the PK only.
Department name lives in one place.
```

---

### Step 4: Practical Recipe for Normalising

```
1. Are there repeating groups or lists in a cell?
   → Split into separate rows (1NF)

2. Is there a composite key where some columns depend on only part of it?
   → Split into separate tables (2NF)

3. Are there non-key columns that depend on other non-key columns?
   → Move those to their own table (3NF)
```

---

### Step 5: Real-World Example — Online Store

**Before (denormalized):**

```
orders:
id  customer_name  customer_email  product   product_price  qty  date
─────────────────────────────────────────────────────────────────────
1   Alice          alice@x.com     Book         500            2   May 1
2   Alice          alice@x.com     Pen          50             5   May 2
3   Bob            bob@x.com       Book         500            1   May 3
```

**After (3NF):**

```
customers (3NF):           products (3NF):
─────────────────          ────────────────────
id  name    email          id   name    price
1   Alice   alice@x.com    p1   Book    500
2   Bob     bob@x.com      p2   Pen     50

orders (3NF):                  order_items (3NF):
────────────────────────       ─────────────────────────────
id  customer_id  date          order_id  product_id  qty
1   1            May 1         1         p1          2
2   1            May 2         2         p2          5
3   2            May 3         3         p1          1
```

Now if Alice updates her email, ONE row changes. Product prices are stored once. Each row has a clear single responsibility.

---

### Step 6: When To Denormalize

3NF is a *guideline*, not a religion. Sometimes denormalization makes sense:

**OK to denormalize when:**
- Read performance matters more than write integrity (analytics dashboards)
- Aggregates are computed often (cached totals)
- The denormalized field is updated rarely (historical snapshots)

```sql
-- Denormalized for analytics speed:
CREATE TABLE order_summaries (
  order_id    UUID PRIMARY KEY,
  customer_name TEXT,    -- denormalized for fast reporting
  order_total  DECIMAL,   -- precomputed sum
  item_count   INT
);
```

Always start normalized. Denormalize only when there's a real performance problem and you measure the trade-off.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Spot 1NF violations:**
```
Given this table, what's wrong? How to fix?
contacts: { id, name, phones: "0712345, 0723456, 0734567" }
```

**Exercise 2 — Spot 2NF violations:**
```
class_enrollments (composite PK: student_id + course_id):
  student_id, course_id, student_name, course_name, grade
What's the 2NF violation?
```

**Exercise 3 — Spot 3NF violations:**
```
employees: id, name, dept_id, dept_name, dept_manager
Why is this not 3NF? Refactor it.
```

**Exercise 4 — Full normalization:**
```
Given this:
bookings:
  id, customer_name, customer_phone, room_id, room_type, room_price, check_in, check_out
Normalize to 3NF
```

**Exercise 5 — Identify the form:**
```
For each schema, which normal form is it in?
1. customers + orders + products + order_items (linked properly)
2. users with "tags" stored as comma-separated string
3. employees with both dept_id and dept_name columns
```

**Exercise 6 — When NOT to normalize:**
```
Give a real example where you'd intentionally denormalize.
What's the trade-off?
```

**Exercise 7 — Design exercise:**
```
Design a 3NF schema for a school: students, courses, instructors, enrollments.
Draw the ER diagram.
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| CSV/list in a cell | Can't query efficiently | Split into rows (1NF) |
| Duplicated info on every row | Update bugs | Extract to its own table |
| Missing FK constraints | Orphan data | Always add REFERENCES |
| Over-normalizing for analytics | Slow reports | Denormalize summary tables for read perf |
| Normalizing for the sake of it | Complex JOINs everywhere | Stop at 3NF unless there's a real reason to go further |

---

## 🧠 Mental Model

```
1NF: one value per cell
2NF: 1NF + each non-key column depends on the FULL key
3NF: 2NF + no non-key column depends on another non-key column

Default rule: start normalized (3NF).
Denormalize ONLY when you measure a real performance problem.
```

---

## 📝 Check Your Understanding

1. **Define:** What is the difference between 2NF and 3NF?
2. **Predict:** Is this table in 1NF?
   ```
   id  | name  | favorite_colors
   1   | Alice | "red, blue, green"
   ```
3. **Find the bug:**
   ```
   employees: id, name, dept_id, dept_name
   The same dept_name appears in 50 rows. What's wrong?
   ```
4. **Write it:** Normalize a flat bookings table to 3NF.
5. **Apply it:** Audit the Learning OS schema — is it in 3NF? Where (if anywhere) does it deviate? Why?
6. **Reflect:** Why is normalization considered a foundation, even though real systems often denormalize for performance?
