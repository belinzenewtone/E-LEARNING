# Aggregate Functions

## 🎯 By End of This Lesson You Will:
- Use COUNT, SUM, AVG, MIN, MAX to summarise data
- Combine aggregates with WHERE to compute filtered summaries
- Understand how aggregates handle NULL values

---

## 🌍 Real-World Analogy First

You have a folder of 1,000 receipts. Someone asks:
- "How many receipts?" → **COUNT**
- "What's the total spending?" → **SUM**
- "Average receipt amount?" → **AVG**
- "Cheapest receipt?" → **MIN**
- "Most expensive?" → **MAX**

You don't read each receipt — you compute one number that summarises all of them. That's what aggregate functions do.

```
Many rows ─────────► One number
   ↑                    ↑
all jobs            avg salary
```

---

## 🗃️ Practice Data

```
jobs:
┌─────┬───────────────────────┬─────────────┬──────────┬──────────┐
│ id  │ title                 │ company     │ location │ salary   │
├─────┼───────────────────────┼─────────────┼──────────┼──────────┤
│  1  │ Data Analyst          │ Safaricom   │ Nairobi  │  80000   │
│  2  │ Software Engineer     │ Andela      │ Remote   │ 120000   │
│  3  │ Data Engineer         │ Safaricom   │ Nairobi  │  95000   │
│  4  │ Frontend Developer    │ Andela      │ Remote   │ 110000   │
│  5  │ Product Manager       │ M-Pesa      │ Nairobi  │ 130000   │
│  6  │ Backend Developer     │ M-Pesa      │ Nairobi  │ 105000   │
│  7  │ QA Engineer           │ Safaricom   │ Mombasa  │  70000   │
└─────┴───────────────────────┴─────────────┴──────────┴──────────┘
```

---

## 📖 Start From Zero

### COUNT — How Many?

```sql
SELECT COUNT(*) FROM jobs;
```

Result:
```
count
─────
  7
```

`COUNT(*)` counts ALL rows in the table.

---

## 🔨 Level Up

### Step 1: The 5 Core Aggregates

```sql
SELECT
  COUNT(*) AS total_jobs,
  SUM(salary) AS total_salary_budget,
  AVG(salary) AS average_salary,
  MIN(salary) AS lowest_paid,
  MAX(salary) AS highest_paid
FROM jobs;
```

Result:
```
total_jobs   total_salary_budget   average_salary   lowest_paid   highest_paid
──────────   ───────────────────   ──────────────   ───────────   ────────────
    7            710000              101428.57         70000         130000
```

One row. Five summaries. That's the power of aggregates.

---

### Step 2: COUNT(*) vs COUNT(column)

```sql
SELECT
  COUNT(*) AS all_rows,           -- counts every row
  COUNT(manager_id) AS with_manager  -- counts only NON-NULL values
FROM jobs;
```

**Critical distinction:**
- `COUNT(*)` — every row, including those with NULLs
- `COUNT(column)` — only rows where that column has a value (skips NULLs)
- `COUNT(DISTINCT column)` — only counts UNIQUE values

```sql
-- How many UNIQUE companies?
SELECT COUNT(DISTINCT company) FROM jobs;
-- Result: 3 (Safaricom, Andela, M-Pesa)
```

---

### Step 3: Combining Aggregates with WHERE

```sql
-- Average salary for Nairobi jobs only
SELECT AVG(salary) AS avg_nairobi_salary
FROM jobs
WHERE location = 'Nairobi';

-- Result: average of jobs in Nairobi (80000, 95000, 130000, 105000) = 102500
```

```sql
-- Count of high-paying jobs
SELECT COUNT(*) AS high_paying_count
FROM jobs
WHERE salary > 100000;

-- Result: 4
```

---

### Step 4: Aliases — Cleaner Output

Without aliases, the column names are auto-generated and ugly:
```sql
SELECT AVG(salary) FROM jobs;
-- column header: "avg"  (not helpful)

SELECT AVG(salary) AS average_salary FROM jobs;
-- column header: "average_salary"  (much better)
```

Always alias your aggregate columns. Your future self will thank you.

---

### Step 5: Math Expressions in Aggregates

```sql
-- Monthly salary statistics
SELECT
  AVG(salary / 12) AS avg_monthly,
  MAX(salary / 12) AS max_monthly,
  SUM(salary * 0.16) AS total_tax_estimated
FROM jobs;
```

---

### Step 6: NULL Handling

Aggregates **ignore NULLs by default** (except COUNT(*)):

```sql
-- If 2 jobs have NULL salary out of 100 jobs:
SELECT
  COUNT(*) AS all_rows,         -- 100 (counts everything)
  COUNT(salary) AS with_salary, -- 98  (skips NULLs)
  AVG(salary) AS avg_salary,    -- average of the 98 non-NULL salaries
  SUM(salary) AS total_salary   -- sum of the 98 non-NULL salaries
FROM jobs;
```

This is usually what you want, but be aware of it. If you want NULLs to count as 0:
```sql
SELECT AVG(COALESCE(salary, 0)) FROM jobs;  -- treats NULL as 0
```

---

### Step 7: Rounding for Cleaner Output

```sql
SELECT
  AVG(salary) AS exact_avg,                 -- 101428.5714285714
  ROUND(AVG(salary)) AS rounded_avg,        -- 101429
  ROUND(AVG(salary), 2) AS two_decimals     -- 101428.57
FROM jobs;
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Basic count:**
```sql
-- How many jobs are there in total?
```

**Exercise 2 — SUM:**
```sql
-- What's the total salary budget for all jobs?
```

**Exercise 3 — MIN and MAX:**
```sql
-- What are the lowest and highest salaries?
-- Return both in one query with aliases
```

**Exercise 4 — Filtered aggregate:**
```sql
-- What's the average salary for Safaricom jobs?
```

**Exercise 5 — DISTINCT count:**
```sql
-- How many distinct locations are there?
```

**Exercise 6 — Combined:**
```sql
-- For jobs in Nairobi, return: count, average salary, max salary
-- All in one query
```

**Exercise 7 — Rounding:**
```sql
-- Calculate the average salary, rounded to 2 decimal places
```

**Exercise 8 — Real question:**
```sql
-- "What percentage of jobs pay over 100,000?"
-- Hint: COUNT high-paying / COUNT total, multiplied by 100
-- You'll need to use math expressions
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Mixing aggregates with non-aggregate columns | SQL error | Use GROUP BY (next lesson) |
| Forgetting NULL handling | Aggregates skip NULLs, COUNT(*) doesn't | Be explicit if NULLs matter |
| No alias on aggregate | Ugly column names | Always alias with `AS` |
| `WHERE COUNT(*) > 5` | Syntax error | Filter aggregates with HAVING (next lesson) |
| Dividing integers | Loses decimals | `salary * 1.0 / count` to force decimal |

---

## 🧠 Mental Model

```
Many rows → ONE summary number

Functions:
  COUNT(*)         → how many rows total
  COUNT(column)    → how many non-NULL values
  COUNT(DISTINCT)  → how many unique values
  SUM(column)      → add them up
  AVG(column)      → average
  MIN(column)      → smallest
  MAX(column)      → largest

Pattern: SELECT [aggregates] FROM [table] WHERE [filter rows first]
```

---

## 📝 Check Your Understanding

1. **Define:** What is the difference between `COUNT(*)` and `COUNT(column)`?
2. **Predict:** If 5 rows have salary NULL, what does `AVG(salary)` do?
3. **Find the bug:**
   ```sql
   SELECT title, AVG(salary) FROM jobs;
   -- Why does this fail?
   ```
4. **Write it:** Find the total salary cost of jobs at Safaricom AND the count of those jobs in one query.
5. **Apply it:** Suppose you have a `study_logs` table with a `minutes` column. Write a query that returns: total study time, average session length, longest session.
6. **Reflect:** Aggregates collapse many rows into one number. What information do you LOSE by aggregating? When is that a problem?
