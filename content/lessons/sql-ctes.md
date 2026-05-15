# CTEs: WITH Clause

## 🎯 By End of This Lesson You Will:
- Use `WITH` to break complex queries into readable named steps
- Chain multiple CTEs together
- Recognize when CTEs make queries clearer than subqueries

---

## 🌍 Real-World Analogy First

A **CTE (Common Table Expression)** is like writing **named scratch work** before the final answer.

Without CTEs, you nest subqueries inside subqueries inside subqueries — a wall of parentheses that nobody can read. With CTEs, you can write:

```
Step 1: Find all big spenders
Step 2: From those, get the ones with subscriptions
Step 3: Show their names
```

```sql
WITH 
  big_spenders AS (
    SELECT user_id FROM orders WHERE amount > 1000
  ),
  subscribed AS (
    SELECT user_id FROM subscriptions WHERE status = 'active'
  )
SELECT u.name
FROM users u
JOIN big_spenders b ON b.user_id = u.id
JOIN subscribed s ON s.user_id = u.id;
```

Each step is named. Each step is readable. Each step can be tested independently.

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
```

---

## 📖 Start From Zero

### Your First CTE

```sql
WITH dept_stats AS (
  SELECT dept_id, AVG(salary) AS avg_salary, COUNT(*) AS emp_count
  FROM employees
  GROUP BY dept_id
)
SELECT *
FROM dept_stats
WHERE avg_salary > 80000;
```

Reading it:
- `WITH dept_stats AS (...)` — defines a CTE called `dept_stats`
- Inside the parens — the query that produces it
- After the closing paren — the main query that uses it

The CTE acts like a temporary, named table you can query.

---

## 🔨 Level Up

### Step 1: Multiple CTEs (Comma-Separated)

```sql
WITH 
  high_earners AS (
    SELECT * FROM employees WHERE salary > 90000
  ),
  dept_high_count AS (
    SELECT dept_id, COUNT(*) AS num
    FROM high_earners
    GROUP BY dept_id
  )
SELECT *
FROM dept_high_count
WHERE num >= 1;
```

Read as a recipe:
1. **First**, define `high_earners` = employees with salary > 90,000
2. **Then**, define `dept_high_count` = count high earners per department
3. **Finally**, the main SELECT filters that result

Notice CTE #2 can reference CTE #1. They flow top-to-bottom.

---

### Step 2: CTE vs Subquery

Same query, two styles:

```sql
-- Subquery (compact but harder to read)
SELECT name FROM employees
WHERE dept_id IN (
  SELECT dept_id FROM employees
  WHERE salary > 90000
  GROUP BY dept_id
  HAVING COUNT(*) >= 1
);

-- CTE (more lines, much clearer)
WITH high_paying_depts AS (
  SELECT dept_id
  FROM employees
  WHERE salary > 90000
  GROUP BY dept_id
  HAVING COUNT(*) >= 1
)
SELECT name FROM employees
WHERE dept_id IN (SELECT dept_id FROM high_paying_depts);
```

> **Rule of thumb:** If your query has more than 2 levels of nested parens, refactor to CTEs.

---

### Step 3: CTEs Can Be Referenced Multiple Times

```sql
WITH avg_salary AS (
  SELECT AVG(salary) AS amount FROM employees
)
SELECT
  name,
  salary,
  (SELECT amount FROM avg_salary) AS company_avg,
  salary - (SELECT amount FROM avg_salary) AS difference
FROM employees;
```

The CTE is computed once (in good DB engines) and reused — clearer than repeating the subquery 3 times.

---

### Step 4: Real-World Pattern — Step-by-Step Analysis

```sql
WITH 
  recent_orders AS (
    SELECT * FROM orders
    WHERE created_at > CURRENT_DATE - INTERVAL '30 days'
  ),
  customer_totals AS (
    SELECT customer_id, SUM(amount) AS total
    FROM recent_orders
    GROUP BY customer_id
  ),
  top_customers AS (
    SELECT customer_id, total
    FROM customer_totals
    WHERE total > 10000
    ORDER BY total DESC
    LIMIT 10
  )
SELECT
  u.name,
  u.email,
  tc.total
FROM top_customers tc
JOIN users u ON u.id = tc.customer_id
ORDER BY tc.total DESC;
```

Each step is named. Each step is reviewable. Six months later, you can read this and understand it immediately.

---

### Step 5: Recursive CTEs (Brief Intro)

CTEs can also reference themselves — for hierarchies and traversals:

```sql
-- Walk up an employee hierarchy
WITH RECURSIVE chain AS (
  -- starting point
  SELECT id, name, manager_id, 1 AS level
  FROM employees
  WHERE id = 5

  UNION ALL

  -- recursive step
  SELECT e.id, e.name, e.manager_id, c.level + 1
  FROM employees e
  JOIN chain c ON e.id = c.manager_id
)
SELECT * FROM chain;
```

You'll see this in advanced lessons. Just know it exists — useful for org charts, comment threads, file trees.

---

### Step 6: CTE Best Practices

```
✅ DO:
  • Name CTEs descriptively (top_customers, not t1)
  • Keep each CTE focused on one logical step
  • Use CTEs to clean up queries with > 2 levels of nesting
  • Use line breaks generously — readability matters

❌ DON'T:
  • Create CTEs for trivial 1-line transformations
  • Make 20-step chains nobody can follow
  • Use CTEs when a simple SELECT would do
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Your first CTE:**
```sql
-- Use a CTE to:
-- 1. Define "high_earners" as employees with salary > 80,000
-- 2. Then select all rows from high_earners
```

**Exercise 2 — Per-department stats:**
```sql
-- CTE: department stats (dept_id, avg_salary, total_salary)
-- Main: show departments where avg_salary > 80,000
```

**Exercise 3 — Two-step:**
```sql
-- CTE 1: employees above 90,000
-- CTE 2: count those per department
-- Main: show departments with at least 1 high earner
```

**Exercise 4 — Comparison:**
```sql
-- Show each employee with their salary, the company avg,
-- and how much above/below avg they are
-- Use a CTE for company avg
```

**Exercise 5 — Refactor:**
```sql
-- Refactor this nested mess into CTEs:
SELECT name FROM employees
WHERE salary > (
  SELECT AVG(salary) FROM employees
  WHERE dept_id IN (
    SELECT id FROM departments WHERE name LIKE 'E%'
  )
);
```

**Exercise 6 — Chain CTEs:**
```sql
-- Pretend you have:
-- - orders(id, customer_id, amount, date)
-- - customers(id, name)

-- Build a query with CTEs:
-- 1. recent_orders (last 90 days)
-- 2. customer_totals (sum per customer)
-- 3. final: top 10 customers with their names
```

**Exercise 7 — Recursive (challenge):**
```sql
-- Generate numbers 1 to 10 using a recursive CTE
-- (No table needed — purely synthetic)
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Forgetting comma between CTEs | Syntax error | `WITH cte1 AS (...), cte2 AS (...)` |
| Reference a CTE that's defined later | "table not found" | Order matters — earlier CTEs can't see later ones |
| `WITH` followed by `;` before main query | Incomplete query | CTE must be followed by SELECT/UPDATE/etc. |
| Using CTE for a single trivial step | Over-engineered | Use only when it clarifies |
| Confusing CTE with VIEW | They look similar | CTE is per-query; VIEW is persistent |

---

## 🧠 Mental Model

```
WITH cte1 AS ( query ),
     cte2 AS ( query referring to cte1 ),
     cte3 AS ( query referring to cte1 or cte2 )
SELECT ...
FROM cte1 / cte2 / cte3 / regular tables;

Think of CTEs as named scratch work:
  Step 1: Get the customers
  Step 2: Filter to active ones
  Step 3: Join with orders
  Step 4: Final SELECT picks what to show
```

---

## 📝 Check Your Understanding

1. **Define:** What's the main benefit of a CTE over a subquery?
2. **Predict:** What does this return on our employees table?
   ```sql
   WITH big AS (SELECT * FROM employees WHERE salary > 80000)
   SELECT COUNT(*) FROM big;
   ```
3. **Find the bug:**
   ```sql
   WITH a AS (SELECT 1) WITH b AS (SELECT 2) SELECT * FROM a, b;
   -- Why does this fail?
   ```
4. **Write it:** Using CTEs, find the average salary per department, then show only departments with avg > 80,000.
5. **Apply it:** Take a complex query you wrote earlier and refactor it to use CTEs. Did it become clearer?
6. **Reflect:** Why do experienced SQL developers prefer CTEs over deep subquery nesting?
