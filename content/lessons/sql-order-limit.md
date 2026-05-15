# ORDER BY & LIMIT

## 🎯 By End of This Lesson You Will:
- Sort results using `ORDER BY` ascending or descending
- Sort by multiple columns to break ties
- Use `LIMIT` and `OFFSET` to paginate results

---

## 🌍 Real-World Analogy First

When you scroll Instagram, posts are **ordered by recency** (newest first). When you search Amazon, products are **ordered by relevance** or **price**. Whatever the app, someone wrote `ORDER BY` to control how the data shows up.

```
Without ORDER BY → results come in unpredictable order
With ORDER BY    → you decide the sort
```

And `LIMIT` is the "only show me the first N results" feature — like Instagram showing 20 posts before you scroll for more.

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

### Your First ORDER BY

```sql
SELECT title, salary
FROM jobs
ORDER BY salary;
```

Result (sorted by salary, **ascending by default**):
```
title                 salary
────────────────────  ──────
QA Engineer            70000
Data Analyst           80000
Data Engineer          95000
Backend Developer     105000
Frontend Developer    110000
Software Engineer     120000
Product Manager       130000
```

---

## 🔨 Level Up

### Step 1: ASC vs DESC

```sql
-- Ascending (smallest first) — default
SELECT title, salary FROM jobs ORDER BY salary ASC;

-- Descending (largest first) — explicit
SELECT title, salary FROM jobs ORDER BY salary DESC;
```

Most "top N" queries use DESC:
```sql
-- Highest paid jobs first
SELECT title, salary FROM jobs ORDER BY salary DESC;
```

---

### Step 2: Order by Multiple Columns (Tie-Breaking)

```sql
SELECT title, company, salary
FROM jobs
ORDER BY company ASC, salary DESC;
```

This sorts:
1. **First** by company alphabetically (Andela → M-Pesa → Safaricom)
2. **Then** for jobs at the same company, by salary highest first

Result:
```
title                 company     salary
────────────────────  ──────────  ──────
Software Engineer     Andela      120000
Frontend Developer    Andela      110000
Product Manager       M-Pesa      130000
Backend Developer     M-Pesa      105000
Data Engineer         Safaricom    95000
Data Analyst          Safaricom    80000
QA Engineer           Safaricom    70000
```

---

### Step 3: ORDER BY with Text

```sql
SELECT title FROM jobs ORDER BY title ASC;
-- Returns alphabetically: Backend, Data Analyst, Data Engineer, Frontend, ...
```

Text sorts alphabetically. Uppercase comes before lowercase in default sort:
```
'Alice'   ← uppercase A
'alice'   ← lowercase a
```

---

### Step 4: LIMIT — Top N Results

```sql
-- Top 3 highest-paid jobs
SELECT title, salary
FROM jobs
ORDER BY salary DESC
LIMIT 3;
```

Result:
```
title                 salary
────────────────────  ──────
Product Manager       130000
Software Engineer     120000
Frontend Developer    110000
```

> **Order matters:** `LIMIT 3` without `ORDER BY` gives you 3 RANDOM rows. Always pair LIMIT with ORDER BY to get the "top 3 by something."

---

### Step 5: OFFSET — Pagination

```sql
-- Rows 4-6 of jobs sorted by salary DESC (skip first 3, take next 3)
SELECT title, salary
FROM jobs
ORDER BY salary DESC
LIMIT 3 OFFSET 3;
```

Result:
```
title                 salary
────────────────────  ──────
Backend Developer     105000
Data Engineer          95000
Data Analyst           80000
```

**The pagination pattern:**
```
Page 1: LIMIT 10 OFFSET 0   (rows 1-10)
Page 2: LIMIT 10 OFFSET 10  (rows 11-20)
Page 3: LIMIT 10 OFFSET 20  (rows 21-30)

General formula:
Page N: LIMIT [pageSize] OFFSET [pageSize * (N - 1)]
```

---

### Step 6: NULL Sorting

NULL values are handled specially. In PostgreSQL:

```sql
SELECT title, manager_id
FROM jobs
ORDER BY manager_id ASC;
-- NULLs come LAST by default (DESC reverses this)

-- Explicit control:
ORDER BY manager_id ASC NULLS FIRST
ORDER BY manager_id DESC NULLS LAST
```

---

### Step 7: Complete Query Order

```sql
SELECT title, salary
FROM jobs
WHERE company = 'Safaricom'  -- filter first
ORDER BY salary DESC          -- then sort
LIMIT 3;                      -- then limit

-- The order in the QUERY:
-- SELECT → FROM → WHERE → ORDER BY → LIMIT
```

Each clause must appear in this order, even though they execute in a slightly different order internally.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Basic ORDER BY:**
```sql
-- Sort all jobs by title alphabetically
```

**Exercise 2 — DESC:**
```sql
-- Find the highest-paying job (just 1 row)
-- Hint: ORDER BY ... DESC LIMIT 1
```

**Exercise 3 — Multi-column sort:**
```sql
-- Sort jobs by location alphabetically,
-- then within each location by salary highest first
```

**Exercise 4 — Top 3:**
```sql
-- Show the top 3 highest-paid jobs in Nairobi
```

**Exercise 5 — Pagination:**
```sql
-- You're building a paginated job listing showing 2 per page
-- Write the query for page 2 (rows 3-4 by salary descending)
```

**Exercise 6 — Combine all:**
```sql
-- Show: Top 5 jobs (title, company, salary)
-- WHERE: salary > 80000
-- ORDER: by salary DESC
-- Result: only the top 5
```

**Exercise 7 — Lowest:**
```sql
-- Find the LOWEST-paying job
-- (Same idea as top — just ASC instead of DESC)
```

**Exercise 8 — Build a "leaderboard":**
```sql
-- Pretend you have a "users" table with name and xp columns
-- Write a query showing the top 10 users by XP, highest first
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| `LIMIT 10` without `ORDER BY` | Random 10 rows each time | Always pair LIMIT with ORDER BY |
| Forgetting ASC/DESC default | Sometimes ascending isn't what you want | Be explicit: write `ASC` or `DESC` |
| OFFSET on huge tables | Very slow on millions of rows | Use cursor-based pagination instead |
| Sorting on unindexed column | Slow queries | Add an index on frequently-sorted columns |
| `ORDER BY` before `WHERE` | Syntax error | WHERE → ORDER BY → LIMIT, always |

---

## 🧠 Mental Model

```
SELECT [columns]
FROM   [table]
WHERE  [filter conditions]
ORDER BY [column1] [ASC|DESC], [column2] [ASC|DESC]
LIMIT  [N]
OFFSET [skip M]

→ WHERE filters which rows
→ ORDER BY sorts them
→ LIMIT picks the first N from sorted results
→ OFFSET skips ahead for pagination

Pattern: "Top N by X" = ORDER BY X DESC LIMIT N
```

---

## 📝 Check Your Understanding

1. **Define:** What does `ORDER BY salary DESC` do?
2. **Predict:** What rows come back from `SELECT * FROM jobs ORDER BY company, salary DESC LIMIT 2;`?
3. **Find the bug:**
   ```sql
   SELECT * FROM jobs LIMIT 5 ORDER BY salary;  -- why is this wrong?
   ```
4. **Write it:** Show the 2 highest-paid jobs in each location. (Hint: this is actually tricky — for now, just find the 2 highest-paid in Nairobi.)
5. **Apply it:** Build a query for page 3 of a results list with 20 items per page, sorted by date created descending.
6. **Reflect:** Why is `LIMIT 100` without `ORDER BY` a bug waiting to happen in production?
