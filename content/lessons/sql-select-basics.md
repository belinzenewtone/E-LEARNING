# SELECT: Reading Data

## 🎯 By End of This Lesson You Will:
- Write `SELECT` queries to retrieve data from a table
- Use column aliases to rename output columns
- Use `DISTINCT` to remove duplicate rows
- Write expressions and `CASE` logic in SELECT

---

## 🌍 Real-World Analogy First

Imagine you have a **massive Excel spreadsheet** with 50,000 job listings. You want to answer questions like:
- "Show me just the job title and salary from every row"
- "Show me only unique company names"
- "What's the annual salary converted to monthly?"

SQL's `SELECT` is how you answer these questions. Instead of scrolling through 50,000 rows in Excel, you write a precise instruction and the database gives you exactly what you asked for.

---

## 🗃️ The Jobs Table — Your Practice Data

Think of this as the spreadsheet you're working with:

```
jobs table:
┌─────┬───────────────────────┬─────────────┬────────────┬──────────┐
│ id  │ title                 │ company     │ location   │ salary   │
├─────┼───────────────────────┼─────────────┼────────────┼──────────┤
│  1  │ Data Analyst          │ Safaricom   │ Nairobi    │ 80000    │
│  2  │ Software Engineer     │ Andela      │ Remote     │ 120000   │
│  3  │ Data Engineer         │ Safaricom   │ Nairobi    │ 95000    │
│  4  │ Frontend Developer    │ Andela      │ Remote     │ 110000   │
│  5  │ Product Manager       │ M-Pesa      │ Nairobi    │ 130000   │
│  6  │ Backend Developer     │ M-Pesa      │ Nairobi    │ 105000   │
└─────┴───────────────────────┴─────────────┴────────────┴──────────┘
```

---

## 📖 Start From Zero

### The Simplest Query

```sql
SELECT title FROM jobs;
```

Read this as: **"Give me the `title` column from the `jobs` table."**

Result:
```
title
───────────────────────
Data Analyst
Software Engineer
Data Engineer
Frontend Developer
Product Manager
Backend Developer
```

---

### Get Multiple Columns

```sql
SELECT title, salary FROM jobs;
```

Result:
```
title                   salary
──────────────────────  ──────
Data Analyst            80000
Software Engineer       120000
Data Engineer           95000
Frontend Developer      110000
Product Manager         130000
Backend Developer       105000
```

---

### Get All Columns

```sql
SELECT * FROM jobs;
```

The `*` means "give me everything." This returns all 5 columns for every row.

> **When to use `*`:** In learning/exploration, `SELECT *` is fine. In real applications, always list specific columns — `*` breaks if columns are added or removed.

---

## 🔨 Level Up

### Column Aliases — Rename Output Columns

The `AS` keyword renames a column **in the output** (not in the database):

```sql
SELECT
  title AS job_title,
  salary AS annual_pay,
  company AS employer
FROM jobs;
```

Result:
```
job_title               annual_pay   employer
──────────────────────  ──────────   ────────
Data Analyst            80000        Safaricom
Software Engineer       120000       Andela
...
```

The table itself is unchanged — AS only affects what you see in the results.

---

### Expressions — Calculate in SELECT

You can do math directly in SELECT:

```sql
SELECT
  title,
  salary,
  salary / 12 AS monthly_salary,
  salary * 1.1 AS with_10_percent_raise
FROM jobs;
```

Result:
```
title              salary   monthly_salary   with_10_percent_raise
──────────────────  ──────   ──────────────   ─────────────────────
Data Analyst        80000    6666.67          88000
Software Engineer   120000   10000.00         132000
...
```

---

### DISTINCT — Remove Duplicates

```sql
-- Without DISTINCT — shows all companies including duplicates
SELECT company FROM jobs;
```
```
company
─────────
Safaricom
Andela
Safaricom      ← duplicate
Andela         ← duplicate
M-Pesa
M-Pesa         ← duplicate
```

```sql
-- With DISTINCT — unique values only
SELECT DISTINCT company FROM jobs;
```
```
company
─────────
Safaricom
Andela
M-Pesa
```

---

### CASE — Conditional Logic in SELECT

Like `if/else` in JavaScript, but written in SQL:

```sql
SELECT
  title,
  salary,
  CASE
    WHEN salary >= 120000 THEN 'High'
    WHEN salary >= 90000  THEN 'Mid'
    ELSE 'Entry'
  END AS pay_band
FROM jobs;
```

Result:
```
title               salary   pay_band
──────────────────  ──────   ────────
Data Analyst        80000    Entry
Software Engineer   120000   High
Data Engineer       95000    Mid
Frontend Developer  110000   Mid
Product Manager     130000   High
Backend Developer   105000   Mid
```

---

### LIMIT — Control How Many Rows

```sql
SELECT title, salary FROM jobs LIMIT 3;
```

Result (first 3 rows only):
```
title              salary
──────────────────  ──────
Data Analyst        80000
Software Engineer   120000
Data Engineer       95000
```

---

### Putting It All Together

```sql
SELECT
  title AS job_title,
  company,
  salary,
  salary / 12 AS monthly_pay,
  CASE
    WHEN salary >= 120000 THEN '💰 High'
    WHEN salary >= 90000  THEN '📊 Mid'
    ELSE '📌 Entry'
  END AS tier
FROM jobs
LIMIT 5;
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Basic columns:**
```sql
-- Select only the title and company columns from jobs
```

**Exercise 2 — All columns:**
```sql
-- Select all columns from jobs
-- How many rows are returned?
```

**Exercise 3 — Alias:**
```sql
-- Select title aliased as "position" and salary aliased as "annual_salary"
```

**Exercise 4 — Math:**
```sql
-- Select title, salary, and a column called "monthly" that is salary divided by 12
-- Also add a column called "weekly" that is salary divided by 52
```

**Exercise 5 — DISTINCT:**
```sql
-- How many unique locations are there in the jobs table?
-- Use DISTINCT to find out
```

**Exercise 6 — CASE:**
```sql
-- Add a "remote_friendly" column:
-- If location = 'Remote' → 'Yes'
-- Otherwise → 'No'
-- Show title, location, and remote_friendly
```

**Exercise 7 — Real question:**
```sql
-- Which jobs have a salary above 100,000?
-- Hint: You learned about WHERE in the next lesson, but try:
-- Can you use a CASE to label them "Above 100k" vs "Below 100k"?
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| `SELECT *` always | Fragile — breaks when columns change | List specific columns |
| Alias without `AS` | `SELECT salary monthly` — confusing | Always write `AS` |
| Forgetting commas between columns | `SyntaxError` | `SELECT col1, col2, col3` |
| CASE without END | `SyntaxError` | Always close CASE with `END` |

---

## 🧠 Mental Model

```
SELECT [what columns to show]
FROM [which table]

Column tricks:
  column AS alias        → rename in output
  column * 1.1           → math expression
  DISTINCT column        → unique values only
  CASE WHEN ... END      → conditional column
  LIMIT n                → only first n rows

SQL answers the question: "Show me ____ from the ____ table"
```

---

## 📝 Check Your Understanding

1. **Define:** What does `DISTINCT` do? When would you use it?
2. **Predict:** What does `SELECT salary / 12 FROM jobs` return?
3. **Find the bug:**
   ```sql
   SELECT title company FROM jobs;
   -- What's missing? What does this actually do?
   ```
4. **Write it:** Select job title, company, and a calculated column showing how much above/below 100,000 each salary is (call it `salary_diff`).
5. **Apply it:** Write a query that labels each job as "Nairobi" or "Remote" in a column called `work_type`, using CASE.
6. **Reflect:** What questions would you most want to ask the jobs table? Write them in plain English, then try to write the SQL for them.
