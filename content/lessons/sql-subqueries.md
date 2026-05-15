# Subqueries

## 🎯 By End of This Lesson You Will:
- Write subqueries inside `WHERE`, `SELECT`, and `FROM`
- Distinguish correlated from non-correlated subqueries
- Use `EXISTS` and `NOT EXISTS` for membership checks

---

## 🌍 Real-World Analogy First

A **subquery** is a question inside another question.

```
"Show me all employees who earn more than the average."
                                              ↑
                              "What is the average?" ← a sub-question
```

You can't answer the outer question without first answering the inner one. SQL handles this by letting you nest queries:

```sql
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
                ↑──── subquery — runs first ────↑
```

The subquery in parentheses runs first, returns a single value (e.g. 80,000), then the outer query uses that value.

---

## 🗃️ Practice Data

```
employees:
┌────┬──────────┬─────────────┬─────────────┐
│ id │  name    │   salary    │  dept_id    │
├────┼──────────┼─────────────┼─────────────┤
│  1 │ Alice    │  100000     │      1      │
│  2 │ Belinze  │   80000     │      1      │
│  3 │ Carol    │   70000     │      2      │
│  4 │ Dave     │  120000     │      2      │
│  5 │ Eve      │   60000     │      3      │
└────┴──────────┴─────────────┴─────────────┘

departments:
┌────┬────────────┐
│ id │   name     │
├────┼────────────┤
│  1 │ Engineering│
│  2 │ Sales      │
│  3 │ HR         │
└────┴────────────┘
```

Average salary = (100000 + 80000 + 70000 + 120000 + 60000) / 5 = **86,000**

---

## 📖 Start From Zero

### Subquery in WHERE — Scalar (returns one value)

```sql
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
```

Result (employees earning above 86,000):
```
name      salary
────────  ──────
Alice     100000
Dave      120000
```

---

## 🔨 Level Up

### Step 1: Subquery in WHERE — Returns a List with IN

```sql
-- Find employees in departments whose name starts with 'E'
SELECT name FROM employees
WHERE dept_id IN (
  SELECT id FROM departments WHERE name LIKE 'E%'
);
```

The subquery returns `[1]` (Engineering's id). Then outer query uses `WHERE dept_id IN (1)`.

Result:
```
name
────────
Alice
Belinze
```

---

### Step 2: Subquery in SELECT — Per-Row Calculation

```sql
SELECT
  name,
  salary,
  (SELECT AVG(salary) FROM employees) AS company_avg,
  salary - (SELECT AVG(salary) FROM employees) AS above_avg_by
FROM employees;
```

Result:
```
name      salary   company_avg   above_avg_by
────────  ──────   ───────────   ────────────
Alice     100000      86000          14000
Belinze    80000      86000          -6000
Carol      70000      86000         -16000
Dave      120000      86000          34000
Eve        60000      86000         -26000
```

The subquery runs once and returns one value, reused on every row.

---

### Step 3: Subquery in FROM — Derived Table

You can use a subquery's result as if it were a table:

```sql
SELECT dept_id, avg_salary
FROM (
  SELECT dept_id, AVG(salary) AS avg_salary
  FROM employees
  GROUP BY dept_id
) AS dept_avgs
WHERE avg_salary > 85000;
```

The inner query computes per-department averages. The outer query treats those results as a table and filters them.

---

### Step 4: Correlated Subqueries — Reference Outer Row

A **correlated subquery** references columns from the outer query and runs **once per row**:

```sql
-- Find each employee earning more than their department's average
SELECT name, salary, dept_id
FROM employees e1
WHERE salary > (
  SELECT AVG(salary)
  FROM employees e2
  WHERE e2.dept_id = e1.dept_id    -- references outer row's dept_id
);
```

For each row in `e1`, the subquery runs again with that row's `dept_id`. Slower than non-correlated subqueries — but very powerful.

---

### Step 5: EXISTS — Membership Check

```sql
-- Find departments that HAVE employees
SELECT name FROM departments d
WHERE EXISTS (
  SELECT 1 FROM employees e WHERE e.dept_id = d.id
);
```

`EXISTS (subquery)` is `true` if the subquery returns any rows. It's often more efficient than `IN` because it can short-circuit on the first match.

`NOT EXISTS` is the opposite:
```sql
-- Departments with NO employees
SELECT name FROM departments d
WHERE NOT EXISTS (
  SELECT 1 FROM employees e WHERE e.dept_id = d.id
);
```

---

### Step 6: When to Use Each Pattern

| Pattern | When |
|---|---|
| Subquery in `WHERE` with `IN` | Filtering on a list of values from another table |
| Subquery in `WHERE` with scalar | Comparing each row to one computed value |
| Subquery in `SELECT` | Adding a constant calculated value to every row |
| Subquery in `FROM` | Treating a query result as a table |
| Correlated subquery | Per-row comparisons (often replaceable by JOIN) |
| `EXISTS` / `NOT EXISTS` | Checking presence/absence (better than `IN` for big sets) |

---

### Step 7: Subquery vs JOIN

Many subqueries can be rewritten as JOINs — often faster and clearer:

```sql
-- Subquery version
SELECT name FROM employees
WHERE dept_id IN (SELECT id FROM departments WHERE name = 'Engineering');

-- JOIN version (often clearer + faster)
SELECT e.name
FROM employees e
JOIN departments d ON d.id = e.dept_id
WHERE d.name = 'Engineering';
```

Rule of thumb: when in doubt, prefer JOIN. Use subqueries when the logic genuinely is "use a computed value from another query."

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Scalar subquery in WHERE:**
```sql
-- Find employees earning more than 90,000
-- (use a hardcoded value first, then replace with a subquery for the avg)
```

**Exercise 2 — Subquery with IN:**
```sql
-- Find employees in the "Sales" department using a subquery
-- (find dept id first, then match)
```

**Exercise 3 — Subquery in SELECT:**
```sql
-- Show each employee with their salary AND the company maximum salary
```

**Exercise 4 — Difference from avg:**
```sql
-- Show each employee's salary and how it differs from the average (negative if below)
```

**Exercise 5 — Subquery in FROM:**
```sql
-- Find departments where avg salary > 85,000
-- Use a subquery in FROM that computes avg per department
```

**Exercise 6 — Correlated:**
```sql
-- Find employees who earn more than the average IN THEIR OWN DEPARTMENT
-- (correlated subquery)
```

**Exercise 7 — EXISTS:**
```sql
-- Find departments that have at least one employee earning > 100,000
```

**Exercise 8 — Subquery to JOIN:**
```sql
-- Rewrite this subquery as a JOIN:
SELECT name FROM employees
WHERE dept_id IN (SELECT id FROM departments WHERE name = 'Engineering');
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Subquery returns multiple rows in scalar context | "more than one row returned" error | Add LIMIT 1 or use IN |
| Comparing column to subquery returning many | "subquery returns more than one value" | Use IN, ANY, or ALL |
| NULL in NOT IN subquery | Returns nothing unexpectedly | Use NOT EXISTS instead |
| Correlated subquery on huge tables | Very slow (per-row execution) | Consider JOIN |
| Forgetting subquery alias in FROM | Syntax error | `FROM (subquery) AS alias` |

---

## 🧠 Mental Model

```
A subquery is a query nested inside another query.

Locations:
  WHERE x > (SELECT ...)        → compare against computed value
  WHERE x IN (SELECT ...)       → membership in a list
  SELECT (SELECT ...)            → per-row constant
  FROM (SELECT ...) AS alias     → use result as table
  WHERE EXISTS (SELECT ...)     → does any match exist?

Non-correlated: runs once
Correlated:     runs once per outer row (slower)

Often replaceable by JOIN — try both and see which is clearer.
```

---

## 📝 Check Your Understanding

1. **Define:** What is a subquery? What does "correlated" mean?
2. **Predict:** What does this return?
   ```sql
   SELECT name FROM employees
   WHERE salary = (SELECT MAX(salary) FROM employees);
   ```
3. **Find the bug:**
   ```sql
   SELECT name FROM employees
   WHERE salary = (SELECT salary FROM employees WHERE dept_id = 1);
   -- Error possibility?
   ```
4. **Write it:** Find departments where the highest-paid employee earns over 100,000.
5. **Apply it:** Rewrite this with `EXISTS`:
   ```sql
   SELECT name FROM departments
   WHERE id IN (SELECT dept_id FROM employees WHERE salary > 100000);
   ```
6. **Reflect:** When would you prefer a subquery over a JOIN, and vice versa?
