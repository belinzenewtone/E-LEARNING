# WHERE: Filtering Rows

## 🎯 By End of This Lesson You Will:
- Filter rows using `WHERE` with comparison and logical operators
- Combine multiple conditions with `AND`, `OR`, `NOT`
- Use `BETWEEN`, `IN`, and `LIKE` for advanced filtering

---

## 🌍 Real-World Analogy First

`SELECT` is asking "**what columns do you want?**"  
`WHERE` is asking "**which rows do you want?**"

Imagine you have a folder with 10,000 job listings. Without `WHERE`, you get all 10,000. With `WHERE`, you say:

> "Only the ones in Nairobi"  
> "Only ones paying over 100,000"  
> "Only the ones at Safaricom or M-Pesa"

`WHERE` is your filter.

---

## 🗃️ The Jobs Table (Practice Data)

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

### Your First WHERE

```sql
SELECT title, salary
FROM jobs
WHERE salary > 100000;
```

Result:
```
title                 salary
────────────────────  ──────
Software Engineer     120000
Frontend Developer    110000
Product Manager       130000
Backend Developer     105000
```

Read it as: **"Give me title and salary, from jobs, WHERE the salary is greater than 100000."**

---

## 🔨 Level Up

### Step 1: Comparison Operators

```sql
WHERE salary = 80000     -- equals    (one = in SQL, not ==)
WHERE salary != 80000    -- not equal
WHERE salary <> 80000    -- not equal (alternative syntax)
WHERE salary >  100000   -- greater than
WHERE salary <  100000   -- less than
WHERE salary >= 100000   -- greater than or equal
WHERE salary <= 100000   -- less than or equal
```

> **Note:** SQL uses a single `=` for equality (unlike JavaScript's `===`). And uses `!=` or `<>` for not-equal.

### Step 2: Filtering Text

```sql
-- Exact match (case-sensitive in PostgreSQL)
SELECT * FROM jobs WHERE company = 'Safaricom';

-- Returns 3 rows: Data Analyst, Data Engineer, QA Engineer
```

> **Important:** Text values use **single quotes** `'Safaricom'`, not double quotes. Double quotes have a different meaning in SQL.

---

### Step 3: Combining with AND / OR / NOT

```sql
-- AND — both must be true
SELECT * FROM jobs
WHERE company = 'Safaricom' AND location = 'Nairobi';
-- Returns 2 rows: Data Analyst (Nairobi), Data Engineer (Nairobi)

-- OR — at least one must be true
SELECT * FROM jobs
WHERE company = 'Safaricom' OR company = 'M-Pesa';
-- Returns 5 rows

-- NOT — flip the condition
SELECT * FROM jobs
WHERE NOT location = 'Remote';
-- Returns 5 non-remote rows
```

### Step 4: Combining Multiple Operators

```sql
-- High salary in Nairobi specifically
SELECT title, salary
FROM jobs
WHERE salary >= 90000 AND location = 'Nairobi';
-- 4 rows: Data Engineer, Product Manager, Backend Developer
-- (Data Analyst at 80000 excluded — too low)
```

> **Tip:** Use parentheses when mixing AND and OR — they remove ambiguity for both you and SQL:
> ```sql
> WHERE (company = 'Safaricom' OR company = 'M-Pesa') AND salary > 80000
> ```

---

### Step 5: BETWEEN — Range Filtering

```sql
-- Salaries between 90,000 and 110,000 (inclusive)
SELECT title, salary FROM jobs
WHERE salary BETWEEN 90000 AND 110000;

-- Equivalent to:
WHERE salary >= 90000 AND salary <= 110000
```

---

### Step 6: IN — Multiple Possible Values

```sql
-- Companies in a specific set
SELECT * FROM jobs
WHERE company IN ('Safaricom', 'M-Pesa');

-- Equivalent to:
WHERE company = 'Safaricom' OR company = 'M-Pesa'
-- But cleaner when checking many values
```

You can also use `NOT IN`:
```sql
WHERE company NOT IN ('Andela', 'TechCo');
```

---

### Step 7: LIKE — Pattern Matching

```sql
-- Jobs with "Engineer" in the title
SELECT title FROM jobs
WHERE title LIKE '%Engineer%';
-- Returns: Software Engineer, Data Engineer, QA Engineer

-- Jobs starting with "Data"
SELECT title FROM jobs
WHERE title LIKE 'Data%';
-- Returns: Data Analyst, Data Engineer
```

**Wildcards:**
- `%` = any number of characters (including zero)
- `_` = exactly one character

```sql
WHERE title LIKE 'D___ %'   -- 4-letter word then space then anything
```

For case-insensitive matching, use `ILIKE` (PostgreSQL):
```sql
WHERE title ILIKE '%engineer%'   -- matches Engineer, ENGINEER, engineer
```

---

### Step 8: NULL — The "No Value" Check

```sql
-- ❌ This DOESN'T work for NULL:
WHERE manager_id = NULL
-- Returns nothing! NULL can't be compared with =

-- ✅ Correct way:
WHERE manager_id IS NULL
WHERE manager_id IS NOT NULL
```

NULL means "missing" or "unknown" — it's a special value with special syntax.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Basic filter:**
```sql
-- Write a query: Show all jobs with salary above 100000
```

**Exercise 2 — Text filter:**
```sql
-- Write a query: Show all jobs at Safaricom
```

**Exercise 3 — AND:**
```sql
-- Show jobs at M-Pesa located in Nairobi
```

**Exercise 4 — IN:**
```sql
-- Show jobs at either Safaricom, M-Pesa, or Andela
-- Use IN for cleaner code
```

**Exercise 5 — BETWEEN:**
```sql
-- Show jobs with salary between 80000 and 110000 inclusive
```

**Exercise 6 — LIKE:**
```sql
-- Show all jobs with "Developer" in their title
-- Then: show all jobs whose title starts with "Data"
```

**Exercise 7 — Combine:**
```sql
-- Show jobs that are either:
--   (a) At Safaricom or M-Pesa, AND
--   (b) Pay more than 90000
-- Use parentheses!
```

**Exercise 8 — NULL handling:**
```sql
-- Imagine jobs table also has a column "remote_allowed" that can be true, false, or NULL
-- Write a query to find jobs where remote_allowed is NOT set yet (NULL)
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| `=` for null | Returns nothing | Use `IS NULL` |
| Double quotes around text | SQL thinks it's a column name | Use single quotes `'text'` |
| Forgetting parens with AND/OR | Wrong rows returned | Always parenthesize mixed logic |
| Case-sensitive text issues | "Safaricom" ≠ "safaricom" | Use `ILIKE` for case-insensitive |
| `WHERE` after `ORDER BY` | Syntax error | WHERE always comes before ORDER BY |

---

## 🧠 Mental Model

```
SELECT [columns]
FROM   [table]
WHERE  [conditions to filter rows]

Operators:
  =, !=, <, >, <=, >=          → compare values
  AND, OR, NOT                  → combine conditions
  BETWEEN x AND y               → range (inclusive)
  IN (v1, v2, v3)               → match any value in list
  LIKE 'pattern%'               → pattern match (%, _)
  IS NULL / IS NOT NULL         → check for missing values

Order in a query: SELECT → FROM → WHERE → ORDER BY → LIMIT
```

---

## 📝 Check Your Understanding

1. **Define:** What does `WHERE` do? How is it different from `SELECT`?
2. **Predict:** What will this return on our jobs table?
   ```sql
   SELECT title FROM jobs WHERE salary > 100000 AND location = 'Nairobi';
   ```
3. **Find the bug:**
   ```sql
   SELECT * FROM jobs WHERE company = "Safaricom";
   -- Why might this fail?
   ```
4. **Write it:** Find all jobs in Nairobi OR Mombasa with salary above 75000.
5. **Apply it:** Find all jobs whose title contains "Data" but NOT at Safaricom.
6. **Reflect:** Why must `IS NULL` exist as separate syntax? Why doesn't `= NULL` work?
