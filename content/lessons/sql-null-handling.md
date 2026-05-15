# NULL Handling in SQL

## 🎯 By End of This Lesson You Will:
- Explain what NULL means and how it differs from 0 or ""
- Use `IS NULL`, `IS NOT NULL`, and `COALESCE` correctly
- Avoid the common bugs caused by NULL comparisons

---

## 🌍 Real-World Analogy First

**NULL means "unknown" or "missing".** It's NOT the same as zero, an empty string, or false.

```
0        = "I know the value, it's zero"
""       = "I know the value, it's empty"
NULL     = "I don't know the value at all"
```

Imagine a form with a "Spouse Name" field:
- If filled with "Alice" → known value
- If filled with "" → user entered nothing (still known: empty)
- If left blank entirely → NULL (we don't know if they have a spouse or not)

**Key insight:** Because NULL means "unknown," any comparison with NULL is **also unknown**. SQL treats this specially.

---

## 🗃️ Practice Data

```
employees:
┌────┬──────────┬─────────────┬──────────┬─────────────┐
│ id │  name    │  salary     │ bonus    │ manager_id  │
├────┼──────────┼─────────────┼──────────┼─────────────┤
│ 1  │ Alice    │   100000    │  20000   │   NULL      │  ← CEO, no manager
│ 2  │ Belinze  │    80000    │  NULL    │     1       │  ← no bonus yet
│ 3  │ Carol    │    70000    │   5000   │     1       │
│ 4  │ Dave     │   NULL      │  NULL    │     2       │  ← salary TBD
└────┴──────────┴─────────────┴──────────┴─────────────┘
```

---

## 📖 Start From Zero

### NULL is NOT Equal to Anything

```sql
-- ❌ This returns nothing!
SELECT name FROM employees WHERE bonus = NULL;

-- ❌ This also returns nothing!
SELECT name FROM employees WHERE bonus != NULL;
```

Why? `NULL = NULL` is itself NULL (unknown). And `WHERE` only keeps rows where the condition is TRUE.

---

## 🔨 Level Up

### Step 1: IS NULL and IS NOT NULL

The correct way:

```sql
-- Find employees with no bonus
SELECT name FROM employees WHERE bonus IS NULL;
-- Returns: Belinze, Dave

-- Find employees WITH a bonus
SELECT name FROM employees WHERE bonus IS NOT NULL;
-- Returns: Alice, Carol
```

`IS NULL` and `IS NOT NULL` are the **only correct way** to check for NULL.

---

### Step 2: NULL in Arithmetic — Contagious

```sql
SELECT name, salary + bonus AS total FROM employees;
```

Result:
```
name      total
────────  ──────
Alice     120000
Belinze   NULL    ← bonus was NULL → total is NULL
Carol      75000
Dave      NULL    ← both NULL → total is NULL
```

**Any math with NULL produces NULL.** This is dangerous if you're computing averages or sums — one NULL can break your dashboard.

---

### Step 3: COALESCE — Provide a Fallback

`COALESCE` returns the **first non-NULL value** from its arguments:

```sql
SELECT
  name,
  salary,
  bonus,
  COALESCE(bonus, 0) AS bonus_safe,
  salary + COALESCE(bonus, 0) AS total
FROM employees;
```

Result:
```
name      salary   bonus    bonus_safe   total
────────  ───────  ───────  ──────────   ──────
Alice     100000   20000      20000      120000
Belinze    80000   NULL           0       80000  ← fixed!
Carol      70000    5000        5000      75000
Dave        NULL   NULL           0           0  ← also needs COALESCE on salary
```

```sql
-- Defensive math:
SELECT
  name,
  COALESCE(salary, 0) + COALESCE(bonus, 0) AS total
FROM employees;
```

`COALESCE` can take multiple arguments:
```sql
COALESCE(preferred_name, full_name, email, 'Unknown')
-- Returns the first non-NULL value, walking left to right
```

---

### Step 4: NULLIF — The Opposite

`NULLIF` returns NULL when two values match. Useful to convert a sentinel value back to NULL:

```sql
-- If the database stores 0 for "no bonus" (instead of NULL), normalise it:
SELECT NULLIF(bonus, 0) AS clean_bonus FROM employees;
-- 0 becomes NULL; everything else stays
```

```sql
-- Avoid division by zero:
SELECT 100 / NULLIF(divisor, 0) FROM math_table;
-- If divisor is 0, you get NULL instead of an error
```

---

### Step 5: NULL in Aggregates

Aggregates **ignore NULLs by default** (except `COUNT(*)`):

```sql
SELECT
  COUNT(*) AS all_rows,         -- 4 (counts every row)
  COUNT(bonus) AS with_bonus,   -- 2 (only Alice and Carol have bonus)
  AVG(bonus) AS avg_bonus,      -- (20000 + 5000) / 2 = 12500 (skips NULLs!)
  SUM(bonus) AS total_bonus     -- 25000 (skips NULLs)
FROM employees;
```

> **Watch out:** `AVG(bonus)` is the average of NON-NULL bonuses. If you wanted "average across all employees, treating NULL as 0":
> ```sql
> SELECT AVG(COALESCE(bonus, 0)) FROM employees;
> -- 25000 / 4 = 6250
> ```

---

### Step 6: NULL in ORDER BY

```sql
-- NULLs come LAST by default in ascending sort
SELECT name, bonus FROM employees ORDER BY bonus ASC;
-- 5000, 20000, NULL, NULL

-- Control NULL position explicitly
SELECT name, bonus FROM employees ORDER BY bonus ASC NULLS FIRST;
SELECT name, bonus FROM employees ORDER BY bonus DESC NULLS LAST;
```

---

### Step 7: NULL in Joins

A LEFT JOIN can produce NULLs in the right-side columns when there's no match:

```sql
SELECT u.name, p.title
FROM users u
LEFT JOIN posts p ON p.user_id = u.id;
-- Users with no posts get NULL for p.title
```

To find rows that have no matches:
```sql
-- Find users with NO posts
SELECT u.name
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
WHERE p.id IS NULL;
```

---

### Step 8: NULL in WHERE Logic

`AND` / `OR` with NULL follow special rules:

```
TRUE  AND NULL → NULL  (not TRUE)
FALSE AND NULL → FALSE
TRUE  OR  NULL → TRUE
FALSE OR  NULL → NULL  (not FALSE)
NOT NULL       → NULL
```

In WHERE, only rows where the condition is `TRUE` are kept. NULL is treated as "not true" → excluded.

```sql
-- ❌ This misses Dave (NULL salary)
SELECT * FROM employees WHERE salary > 50000 OR salary < 50000;

-- ✅ Be explicit:
SELECT * FROM employees WHERE salary > 50000 OR salary < 50000 OR salary IS NULL;
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Find NULLs:**
```sql
-- Find employees who don't have a bonus
```

**Exercise 2 — Find non-NULLs:**
```sql
-- Find employees who DO have a manager
```

**Exercise 3 — COALESCE:**
```sql
-- Show each employee with their bonus, defaulting to 0 if NULL
```

**Exercise 4 — Safe math:**
```sql
-- Compute total compensation (salary + bonus), treating NULLs as 0 for both
```

**Exercise 5 — Aggregate gotcha:**
```sql
-- What does this return on the employees table?
SELECT AVG(bonus) FROM employees;
-- And this?
SELECT AVG(COALESCE(bonus, 0)) FROM employees;
-- Explain the difference
```

**Exercise 6 — NULLIF:**
```sql
-- Imagine a salaries table where 0 is used as "not yet set"
-- Use NULLIF to convert 0 to NULL for proper AVG behaviour
```

**Exercise 7 — NULL ordering:**
```sql
-- Sort employees by bonus descending with NULLs at the end
```

**Exercise 8 — Real bug:**
```sql
-- A teammate writes:
-- SELECT * FROM employees WHERE bonus != 5000;
-- They expected to see everyone except Carol.
-- What actually happens? How do you fix it?
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| `WHERE col = NULL` | Returns nothing | Use `IS NULL` |
| Math with NULL | Result becomes NULL | Wrap with `COALESCE(col, 0)` |
| `AVG(col)` with NULLs | Excludes NULL rows from avg | Use `COALESCE(col, 0)` if you want NULLs as 0 |
| `WHERE col != X` excluding NULLs | NULLs treated as "not true" | Add `OR col IS NULL` if needed |
| Forgetting NULLs in JOINs | Missing rows | Use LEFT JOIN with `WHERE x IS NULL` for orphans |

---

## 🧠 Mental Model

```
NULL = "unknown" — different from 0 or ""

Checking:    col IS NULL  /  col IS NOT NULL
Replacing:   COALESCE(col, fallback, fallback2, ...)
Converting:  NULLIF(col, value)    (returns NULL if col = value)
Aggregates:  ignore NULL by default (except COUNT(*))
WHERE:       NULL is treated as "not true" → excluded

Rule: any operation involving NULL → produces NULL (it's contagious)
```

---

## 📝 Check Your Understanding

1. **Define:** What is the difference between `NULL`, `0`, and `""`?
2. **Predict:** What does this return on the employees table?
   ```sql
   SELECT name FROM employees WHERE bonus = NULL;
   ```
3. **Find the bug:**
   ```sql
   SELECT name, salary - bonus AS take_home FROM employees;
   -- Why is take_home NULL for Belinze and Dave?
   ```
4. **Write it:** Compute the total compensation for each employee, treating any NULL as 0.
5. **Apply it:** A `lessons` table has a `completed_at` column (NULL = not completed). Write a query to find lessons completed last month.
6. **Reflect:** NULL is sometimes called "the billion-dollar mistake." Why might that be? What problems does it cause?
