# RIGHT JOIN, FULL JOIN & Self-Joins

## 🎯 By End of This Lesson You Will:
- Use RIGHT JOIN, FULL OUTER JOIN, and CROSS JOIN appropriately
- Self-join a table to find relationships within it (e.g. employees and their managers)
- Recognize which JOIN type fits each business question

---

## 🌍 Real-World Analogy First

In the last lesson you learned **INNER** (overlap only) and **LEFT** (keep all of left). Here are the rest of the family:

```
A   B           INNER:   ●━━━━●       (overlap only)
                LEFT:    ●━━━━●        + keep all of A
                RIGHT:   ●━━━━●        + keep all of B
                FULL:    ●━━━━●        + keep all of BOTH

CROSS JOIN:   every row from A paired with every row from B
SELF JOIN:    a table joined with ITSELF
```

You'll use INNER and LEFT in 90% of real queries. The others have specific uses — knowing when to reach for each is the skill.

---

## 🗃️ Practice Data

```
users:                          posts:
┌────┬──────────┐               ┌────┬─────────────┬──────────┐
│ id │  name    │               │ id │  title      │ user_id  │
├────┼──────────┤               ├────┼─────────────┼──────────┤
│ 1  │ Alice    │               │ 10 │ My first    │    1     │
│ 2  │ Belinze  │               │ 11 │ SQL is fun  │    1     │
│ 3  │ Carol    │  ← no posts   │ 12 │ DOM basics  │    2     │
└────┴──────────┘               │ 13 │ Anonymous   │   NULL   │  ← no author
                                └────┴─────────────┴──────────┘

employees (for self-join examples):
┌────┬──────────┬─────────────┐
│ id │  name    │ manager_id  │
├────┼──────────┼─────────────┤
│ 1  │ Alice    │   NULL      │  ← CEO
│ 2  │ Belinze  │     1       │  ← Alice's report
│ 3  │ Carol    │     1       │  ← Alice's report
│ 4  │ Dave     │     2       │  ← Belinze's report
└────┴──────────┴─────────────┘
```

---

## 📖 Start From Zero

### RIGHT JOIN — Keep Everyone From the Right

```sql
SELECT u.name, p.title
FROM users u
RIGHT JOIN posts p ON p.user_id = u.id;
```

Result:
```
name      title
────────  ─────────────
Alice     My first
Alice     SQL is fun
Belinze   DOM basics
NULL      Anonymous     ← post with no author
```

> **Note:** `RIGHT JOIN` is rarely used in practice. Most teams write `LEFT JOIN` by reversing the table order — it's the same result and easier to read.

```sql
-- These are equivalent:
A LEFT JOIN B   ⟺   B RIGHT JOIN A
```

---

## 🔨 Level Up

### Step 1: FULL OUTER JOIN — Keep Everyone

```sql
SELECT u.name, p.title
FROM users u
FULL OUTER JOIN posts p ON p.user_id = u.id;
```

Result (combines LEFT + RIGHT):
```
name      title
────────  ─────────────
Alice     My first
Alice     SQL is fun
Belinze   DOM basics
Carol     NULL          ← user with no posts (from LEFT side)
NULL      Anonymous     ← post with no author (from RIGHT side)
```

Use when you want to find **all relationships AND all orphans on either side**.

---

### Step 2: Real Use of FULL OUTER JOIN

Common pattern — finding inconsistencies between two tables:

```sql
-- Find users without posts AND posts without users
SELECT u.id AS user_id, u.name, p.id AS post_id, p.title
FROM users u
FULL OUTER JOIN posts p ON p.user_id = u.id
WHERE u.id IS NULL OR p.id IS NULL;
```

Returns only the "orphans" — rows missing from one side or the other.

---

### Step 3: CROSS JOIN — Every Combination

```sql
SELECT u.name, p.title
FROM users u
CROSS JOIN posts p;
```

CROSS JOIN ignores any relationship — it just produces every possible pairing. With 3 users × 4 posts = **12 rows**.

```
Alice     My first
Alice     SQL is fun
Alice     DOM basics
Alice     Anonymous
Belinze   My first
... (all combinations)
```

**When to use:** rarely. Some legitimate uses:
- Generating combinations (sizes × colors × styles)
- Pairing every product with every region
- Calendar tables × every department

---

### Step 4: Self JOIN — A Table Joined With Itself

To answer **"Show each employee with their manager's name"** — both are in the same table:

```sql
SELECT
  e.name AS employee,
  m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id;
```

Result:
```
employee   manager
─────────  ─────────
Alice      NULL        ← CEO
Belinze    Alice
Carol      Alice
Dave       Belinze
```

**How it works:** the database reads the `employees` table twice — once aliased as `e` (the employee row), once as `m` (the manager row). Then it matches them on `m.id = e.manager_id`.

Aliases are required for self-joins. Without them, SQL can't tell the two "copies" apart.

---

### Step 5: Find Direct Reports of Each Manager

```sql
-- Each manager and how many direct reports they have
SELECT
  m.name AS manager,
  COUNT(e.id) AS reports
FROM employees m
LEFT JOIN employees e ON e.manager_id = m.id
GROUP BY m.id, m.name
HAVING COUNT(e.id) > 0;
```

Result:
```
manager   reports
────────  ───────
Alice        2
Belinze      1
```

---

### Step 6: A Visual Decision Guide

```
Do you need rows that match in BOTH tables?
  └─ Yes → INNER JOIN

Do you need ALL rows from one specific table, with optional matches?
  └─ Yes → LEFT JOIN (with the "all" table first)

Do you need rows from BOTH tables, including orphans?
  └─ Yes → FULL OUTER JOIN

Do you need every possible combination (regardless of relationship)?
  └─ Yes → CROSS JOIN  (you'll rarely need this)

Is the relationship within a single table (employees → manager)?
  └─ Yes → SELF JOIN (alias the table twice)
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — RIGHT JOIN:**
```sql
-- Using users + posts: list all posts even if they have no user
-- (use RIGHT JOIN this time)
-- Then rewrite the same query using LEFT JOIN by reversing the order
```

**Exercise 2 — FULL OUTER JOIN:**
```sql
-- List ALL users AND ALL posts, matching where possible
```

**Exercise 3 — Find orphans:**
```sql
-- Find users with NO posts AND posts with NO user
-- (one query using FULL OUTER JOIN)
```

**Exercise 4 — Self JOIN:**
```sql
-- Using employees table:
-- List each employee and their manager's name
-- Include the CEO (manager = NULL)
```

**Exercise 5 — Self JOIN with filter:**
```sql
-- List employees who report to Alice (manager_id = 1)
-- Show employee name and "Alice" as manager
```

**Exercise 6 — Manager count:**
```sql
-- For each employee, show how many people they manage (direct reports)
```

**Exercise 7 — Decide the join:**
```
For each business question, pick INNER, LEFT, FULL, or SELF:

1. "Show all customers with their order totals (including those with no orders)"
2. "Show all employees with their managers (managers also from employees)"
3. "Find duplicate accounts where email matches but ID differs"
4. "Show all books with their authors (only books that have authors assigned)"
5. "Audit: show every user-product combination to check for missing inventory"
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Self-join without aliases | "Column 'id' is ambiguous" | Always alias `t1`, `t2` for self-joins |
| Forgetting RIGHT JOIN reverses naturally | Confusing query | Use LEFT JOIN by reversing table order |
| CROSS JOIN by accident (no ON clause) | Massive result | Always include an ON clause for JOINs |
| FULL OUTER on MySQL | Not supported in some MySQL versions | Use UNION of LEFT + RIGHT instead |
| Self-join with wrong direction | Wrong manager-employee relationship | Carefully match `manager_id = m.id` |

---

## 🧠 Mental Model

```
INNER:        keep only matching rows from both
LEFT:         keep all from left table  + matches from right
RIGHT:        keep all from right table + matches from left (rarely used)
FULL OUTER:   keep ALL rows from BOTH (including orphans)
CROSS:        every combination (no condition)
SELF:         a table joined with itself (aliased twice)

Self-join syntax:
  FROM employees e
  LEFT JOIN employees m ON m.id = e.manager_id
```

---

## 📝 Check Your Understanding

1. **Define:** When would you use FULL OUTER JOIN instead of LEFT JOIN?
2. **Predict:** With the employees table, how many rows does this return?
   ```sql
   SELECT e.name, m.name FROM employees e LEFT JOIN employees m ON m.id = e.manager_id;
   ```
3. **Find the bug:**
   ```sql
   SELECT * FROM employees JOIN employees ON id = manager_id;
   -- Two errors. What are they?
   ```
4. **Write it:** Find every pair of employees who share the same manager (siblings in the hierarchy).
5. **Apply it:** A `comments` table has a `parent_comment_id` (for replies). Write a self-join showing comments with their parent comment text.
6. **Reflect:** Why is RIGHT JOIN considered "stylistically inferior" by most SQL teams?
