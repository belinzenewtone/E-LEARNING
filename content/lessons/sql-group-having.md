# GROUP BY & HAVING

## 🎯 By End of This Lesson You Will:
- Use `GROUP BY` to summarise data per category
- Combine `WHERE` (filter rows) and `HAVING` (filter groups)
- Understand exactly when each clause runs

---

## 🌍 Real-World Analogy First

`GROUP BY` is the SQL equivalent of **"split into piles, then count each pile."**

```
All employees (1 big pile)
        │
        ▼ GROUP BY department
   ┌───────────┬───────────┬───────────┐
   │ Sales (8) │ Eng (15)  │ HR (3)    │
   └───────────┴───────────┴───────────┘
```

Excel users: this is what **Pivot Tables** do. You take a flat list and produce per-category summaries:
- Sales by region
- Orders per customer
- Average salary per company
- Lessons completed per user

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

### Your First GROUP BY

```sql
SELECT company, COUNT(*) AS job_count
FROM jobs
GROUP BY company;
```

Result:
```
company      job_count
──────────   ─────────
Safaricom        3
Andela           2
M-Pesa           2
```

Read this as: **"For each company, count how many jobs."**

The database:
1. Looked at every row
2. Sorted them into piles by `company`
3. Ran `COUNT(*)` on each pile separately
4. Returned one row per pile

---

## 🔨 Level Up

### Step 1: The Rule of GROUP BY

> **Critical rule:** Every column in `SELECT` must either:
> 1. Appear in the `GROUP BY`, OR
> 2. Be inside an aggregate function (COUNT, SUM, AVG, etc.)

```sql
-- ❌ Wrong — title is not grouped or aggregated
SELECT company, title, COUNT(*) FROM jobs GROUP BY company;

-- ✅ Right — every column is grouped or aggregated
SELECT company, COUNT(*) AS jobs FROM jobs GROUP BY company;
```

Why? When you group by company, each company has MANY titles. SQL doesn't know which title to show. So it forces you to be explicit.

---

### Step 2: Group by Multiple Columns

```sql
SELECT company, location, COUNT(*) AS count
FROM jobs
GROUP BY company, location
ORDER BY company, location;
```

Result (groups by EACH unique combination of company + location):
```
company      location    count
──────────   ──────────  ─────
Andela       Remote        2
M-Pesa       Nairobi       2
Safaricom    Mombasa       1
Safaricom    Nairobi       2
```

---

### Step 3: Multiple Aggregates Per Group

```sql
SELECT
  company,
  COUNT(*) AS jobs,
  AVG(salary) AS avg_salary,
  MIN(salary) AS min_salary,
  MAX(salary) AS max_salary
FROM jobs
GROUP BY company
ORDER BY avg_salary DESC;
```

Result:
```
company      jobs   avg_salary   min_salary   max_salary
──────────   ────   ──────────   ──────────   ──────────
M-Pesa         2    117500.0      105000        130000
Andela         2    115000.0      110000        120000
Safaricom      3     81666.7       70000         95000
```

One query, one row per company, full statistics on each.

---

### Step 4: HAVING — Filter the Groups

`WHERE` filters rows **before** grouping.  
`HAVING` filters groups **after** grouping.

```sql
-- Only companies with more than 2 jobs
SELECT company, COUNT(*) AS jobs
FROM jobs
GROUP BY company
HAVING COUNT(*) > 2;
```

Result:
```
company      jobs
──────────   ────
Safaricom      3
```

> **The clean rule:**
> - `WHERE` works on **individual rows** (you can't use aggregates here)
> - `HAVING` works on **aggregated groups** (you can use aggregates here)

---

### Step 5: WHERE vs HAVING — Side by Side

```sql
-- WHERE: filter rows BEFORE aggregating
-- HAVING: filter groups AFTER aggregating

SELECT company, AVG(salary) AS avg_salary
FROM jobs
WHERE location = 'Nairobi'       -- filter rows: only Nairobi jobs
GROUP BY company
HAVING AVG(salary) > 90000;       -- filter groups: only high-paying ones
```

Order of operations:
```
1. FROM   → grab all rows
2. WHERE  → remove rows that don't match (location = 'Nairobi')
3. GROUP BY → put remaining rows into piles (by company)
4. aggregates run (per pile)
5. HAVING → remove piles that don't match (AVG > 90000)
6. SELECT → choose what to show
7. ORDER BY → sort the result
```

---

### Step 6: Real-World Pattern — Top N per Category

```sql
-- "Companies hiring the most"
SELECT company, COUNT(*) AS total_jobs
FROM jobs
GROUP BY company
ORDER BY total_jobs DESC
LIMIT 5;
```

```sql
-- "Locations with the highest average salary"
SELECT location, ROUND(AVG(salary)) AS avg_salary
FROM jobs
GROUP BY location
ORDER BY avg_salary DESC;
```

```sql
-- "Find big spenders" — customers with >10 orders worth >$1000 each
SELECT customer_id, COUNT(*) AS orders, SUM(amount) AS total
FROM orders
WHERE amount > 1000              -- only count orders over $1000 each
GROUP BY customer_id
HAVING COUNT(*) > 10              -- only customers with 10+ such orders
ORDER BY total DESC;
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Group by one column:**
```sql
-- Count jobs per location
```

**Exercise 2 — Group by + sort:**
```sql
-- Count jobs per company, ordered from most jobs to fewest
```

**Exercise 3 — Multiple aggregates:**
```sql
-- For each location, return: count of jobs, average salary, max salary
```

**Exercise 4 — Group by two columns:**
```sql
-- Count jobs grouped by both company AND location
-- (Each unique combination = one row)
```

**Exercise 5 — HAVING:**
```sql
-- Find companies with an average salary above 100,000
```

**Exercise 6 — WHERE + HAVING:**
```sql
-- For Nairobi jobs only, find companies whose average salary in Nairobi
-- is above 90,000
```

**Exercise 7 — Tricky:**
```sql
-- Spot the bug:
SELECT company, title, COUNT(*)
FROM jobs
GROUP BY company;

-- Why does it fail? How would you fix it?
```

**Exercise 8 — Real question:**
```sql
-- "Which company has the most variety in salary?"
-- Hint: variety = MAX - MIN. Group by company, calculate the range.
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Non-aggregated column in SELECT | Error: must appear in GROUP BY | Add it to GROUP BY or wrap in aggregate |
| Using WHERE for aggregate condition | Error: aggregate not allowed in WHERE | Use HAVING |
| Filtering after GROUP BY with WHERE | Syntactically valid but wrong logic | Use HAVING for post-aggregation filtering |
| GROUP BY before WHERE in query | Syntax error | Order: WHERE → GROUP BY → HAVING |
| Confusing what HAVING runs on | Returns wrong groups | HAVING runs on AGGREGATED results |

---

## 🧠 Mental Model

```
Step 1: FROM     → fetch all rows
Step 2: WHERE    → remove rows you don't want   (per-row filter)
Step 3: GROUP BY → split into piles by column
Step 4: aggregates run on each pile (COUNT, SUM, AVG, etc.)
Step 5: HAVING   → remove piles you don't want  (per-group filter)
Step 6: SELECT   → pick columns/aggregates to show
Step 7: ORDER BY → sort
Step 8: LIMIT    → top N

Rule: Every SELECT column must be GROUPED or AGGREGATED.
Rule: WHERE filters rows, HAVING filters groups.
```

---

## 📝 Check Your Understanding

1. **Define:** What is the difference between WHERE and HAVING?
2. **Predict:** What does this return?
   ```sql
   SELECT location, COUNT(*) FROM jobs GROUP BY location;
   ```
3. **Find the bug:**
   ```sql
   SELECT company, AVG(salary) FROM jobs WHERE COUNT(*) > 2 GROUP BY company;
   -- What's wrong? How do you fix it?
   ```
4. **Write it:** Find the average salary per location, only showing locations with at least 2 jobs.
5. **Apply it:** You have a `study_logs` table with `user_id` and `minutes`. Write a query showing total study minutes per user, sorted from most to least.
6. **Reflect:** Why does SQL force you to use GROUP BY when mixing aggregates with regular columns? What problem does this prevent?
