# Window Functions: ROW_NUMBER & RANK

## Why This Matters

GROUP BY collapses rows into groups. Window functions don't collapse — they compute values across rows while keeping every row. Ranking, running totals, moving averages — these are impossible with GROUP BY alone. Window functions are what turn SQL from a query language into an analytics engine.

## Core Concepts

### The OVER Clause

```sql
-- Compare: aggregate vs window
SELECT SUM(salary) FROM jobs;  -- one number

SELECT
  title,
  salary,
  SUM(salary) OVER () AS total_salary  -- same total on every row
FROM jobs;
```

OVER defines the "window" of rows the function operates on.

### ROW_NUMBER() — Sequential Numbers

```sql
-- Number rows 1, 2, 3, ...
SELECT
  ROW_NUMBER() OVER (ORDER BY salary DESC) AS rank,
  title,
  salary
FROM jobs
LIMIT 10;

-- Number within groups
SELECT
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank,
  name,
  department,
  salary
FROM employees;
```

### RANK() and DENSE_RANK()

```sql
SELECT
  name,
  salary,
  RANK() OVER (ORDER BY salary DESC) AS rank,
  DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rank
FROM employees;
```

```
name    salary  rank  dense_rank
Alice   100k    1     1
Bob     100k    1     1          ← tie: both rank #1
Charlie 90k     3     2          ← RANK skips 2, DENSE_RANK doesn't
Dave    85k     4     3
```

**RANK** leaves gaps after ties. **DENSE_RANK** doesn't. Use RANK for "top N" queries (you want to know if there's a tie for 3rd). Use DENSE_RANK for "give me the 2nd highest" (dense).

### PARTITION BY — Reset Per Group

```sql
-- Rank within each department
SELECT
  name,
  department,
  salary,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank
FROM employees;
-- Ranking resets for each department
```

### Practical Applications

```sql
-- Top 3 highest paid in each department
WITH ranked AS (
  SELECT
    name, department, salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rnk
  FROM employees
)
SELECT * FROM ranked WHERE rnk <= 3;

-- Latest log per user
SELECT DISTINCT ON (user_id)
  user_id, date, minutes
FROM study_logs
ORDER BY user_id, date DESC;
```

### NTILE — Divide into Buckets

```sql
-- Divide employees into 4 salary quartiles
SELECT
  name, salary,
  NTILE(4) OVER (ORDER BY salary DESC) AS quartile
FROM employees;
```

## Try It Yourself

1. Use ROW_NUMBER to rank jobs by salary.
2. Use RANK with PARTITION BY to rank jobs within each company.
3. Find the top 3 highest-paying jobs in each location.
4. Use NTILE to divide students into 5 XP groups.

## Common Mistakes

- **Forgetting ORDER BY in window functions**: `ROW_NUMBER() OVER ()` gives arbitrary numbering. Always add ORDER BY.
- **Confusing RANK and ROW_NUMBER**: ROW_NUMBER never ties. RANK does. Choose based on whether ties matter.
- **Window functions in WHERE**: You can't filter on window function results directly. Wrap in a CTE first.

## Checkpoint

1. What's the difference between RANK and DENSE_RANK?
2. What does PARTITION BY do in a window function?
3. Write a query ranking study log entries by date per user.
4. **Reflection**: Where would ranking help in your Learning OS?
