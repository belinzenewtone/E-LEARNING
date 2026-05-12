# Aggregate Functions

## Why This Matters

Individual rows tell you about one thing. Aggregates tell you about everything — totals, averages, counts, extremes. "What's our total revenue?" "How many users signed up?" "What's the highest salary?" Every business question starts with an aggregate.

## Core Concepts

### The Five Aggregates

```sql
COUNT(*)        -- number of rows
COUNT(column)   -- number of non-NULL values in column
SUM(column)     -- total of all values
AVG(column)     -- average (mean)
MIN(column)     -- smallest value
MAX(column)     -- largest value
```

### COUNT — How Many?

```sql
-- Total number of jobs
SELECT COUNT(*) FROM jobs;
-- 500

-- Jobs with a known salary
SELECT COUNT(salary) FROM jobs;
-- 450 (50 jobs have NULL salary — COUNT ignores NULLs)

-- Distinct companies
SELECT COUNT(DISTINCT company) FROM jobs;
-- 85 unique companies
```

**Critical distinction**: `COUNT(*)` counts ALL rows. `COUNT(column)` counts rows where that column is NOT NULL.

### SUM — Add It All Up

```sql
-- Total XP earned
SELECT SUM(points) FROM xp_events WHERE user_id = 1;

-- Total study minutes this week
SELECT SUM(minutes) FROM study_logs
WHERE date >= '2026-05-11' AND date < '2026-05-18';
```

### AVG, MIN, MAX — Central Tendency

```sql
SELECT
  AVG(salary) AS average_salary,
  MIN(salary) AS lowest_salary,
  MAX(salary) AS highest_salary,
  -- Spread
  MAX(salary) - MIN(salary) AS salary_range
FROM jobs
WHERE salary IS NOT NULL;
```

### NULL Behavior

```sql
-- NULLs are completely ignored by aggregates (except COUNT(*))
SELECT AVG(salary) FROM jobs; -- average of non-NULL salaries only

-- Use COALESCE to replace NULL with a default
SELECT AVG(COALESCE(salary, 0)) FROM jobs;
-- Now NULLs are treated as 0 (usually wrong — be careful)
```

### Combining Aggregates

```sql
SELECT
  COUNT(*) AS total_jobs,
  COUNT(salary) AS jobs_with_salary,
  ROUND(AVG(salary), 0) AS avg_salary,
  MIN(salary) AS min_salary,
  MAX(salary) AS max_salary
FROM jobs;
```

## Try It Yourself

1. Count how many jobs are in the dataset.
2. Find the average, minimum, and maximum salary.
3. Count how many DISTINCT companies are hiring.
4. Sum the total study minutes logged this week.

## Common Mistakes

- **COUNT(column) vs COUNT(*)**: If you want total rows, use `COUNT(*)`. `COUNT(status)` skips NULLs.
- **AVG of small datasets**: 2 rows averaging to 100 is very different from 200 rows averaging to 100. Include COUNT too.
- **NULL math**: `SUM(salary + bonus)` where bonus is NULL returns NULL for that row. Use `SUM(COALESCE(salary, 0) + COALESCE(bonus, 0))`.

## Checkpoint

1. What's the difference between COUNT(*) and COUNT(column_name)?
2. How does AVG handle NULL values?
3. Write a query that counts total jobs, average salary, and salary range.
4. **Reflection**: What aggregates would your dashboard need?
