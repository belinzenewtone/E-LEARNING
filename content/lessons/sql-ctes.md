# CTEs: WITH Clause

## Why This Matters

Complex queries become unreadable when you nest subquery inside subquery. Common Table Expressions (CTEs) let you name intermediate results and build queries step by step — like variables for SQL. A 50-line monster becomes 5 clear, named steps.

## Core Concepts

### Basic CTE

```sql
WITH high_paying_jobs AS (
  SELECT title, company, salary
  FROM jobs
  WHERE salary > 80000
)
SELECT * FROM high_paying_jobs
ORDER BY salary DESC;
```

Think of a CTE as a temporary view that exists only for this query.

### Multiple CTEs

```sql
WITH
  job_counts AS (
    SELECT company, COUNT(*) AS total_jobs
    FROM jobs GROUP BY company
  ),
  high_avg AS (
    SELECT company, ROUND(AVG(salary), 0) AS avg_salary
    FROM jobs WHERE salary IS NOT NULL
    GROUP BY company
  )
SELECT
  jc.company,
  jc.total_jobs,
  ha.avg_salary
FROM job_counts jc
JOIN high_avg ha ON jc.company = ha.company
WHERE jc.total_jobs > 3
ORDER BY ha.avg_salary DESC;
```

### CTE vs Subquery

```sql
-- Subquery version (harder to read)
SELECT company, total_jobs, avg_salary
FROM (
  SELECT company, COUNT(*) AS total_jobs FROM jobs GROUP BY company
) jc JOIN (
  SELECT company, AVG(salary) AS avg_salary FROM jobs GROUP BY company
) ha ON jc.company = ha.company
WHERE total_jobs > 3;
```

The CTE version tells a story. The subquery version makes you work for it.

### Recursive CTEs

```sql
-- Generate a series of dates (recursive CTE)
WITH RECURSIVE dates AS (
  SELECT '2026-05-11'::date AS date  -- base case
  UNION ALL
  SELECT date + 1                     -- recursive case
  FROM dates
  WHERE date < '2026-05-17'
)
SELECT * FROM dates;
-- Returns May 11 through May 17

-- Organizational hierarchy
WITH RECURSIVE org_chart AS (
  SELECT id, name, manager_id, 1 AS level
  FROM employees WHERE manager_id IS NULL  -- CEO
  UNION ALL
  SELECT e.id, e.name, e.manager_id, oc.level + 1
  FROM employees e
  JOIN org_chart oc ON e.manager_id = oc.id
)
SELECT * FROM org_chart ORDER BY level, name;
```

### Practical CTEs

```sql
-- Weekly study summary for dashboard
WITH
  study_by_day AS (
    SELECT
      DATE(date) AS study_date,
      SUM(minutes) AS total_minutes,
      COUNT(*) AS sessions
    FROM study_logs
    WHERE user_id = 1 AND date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY DATE(date)
  ),
  streak_check AS (
    SELECT
      COUNT(*) AS days_studied,
      MAX(study_date) AS last_study_date
    FROM study_by_day
  )
SELECT
  sb.days_studied,
  CASE
    WHEN sc.days_studied = 7 THEN 'Perfect week!'
    WHEN sc.days_studied >= 5 THEN 'Good week'
    ELSE 'Needs improvement'
  END AS assessment
FROM study_by_day sb, streak_check sc;
```

## Try It Yourself

1. Write a CTE that finds high-salary jobs, then query the CTE.
2. Use multiple CTEs to compute company size and average salary separately, then join them.
3. Write a recursive CTE that generates numbers 1 through 10.
4. Refactor a complex JOIN query to use CTEs.

## Common Mistakes

- **CTE referenced only once preferring subqueries**: If used once, either is fine. CTEs shine with multiple references.
- **Recursive CTE without termination**: The WHERE clause in the recursive part MUST eventually become false. Infinite recursion crashes.
- **CTE as optimization**: PostgreSQL materializes CTEs by default. For large CTEs, this can be slower than subqueries.

## Checkpoint

1. How does using a CTE improve query readability over a nested subquery?
2. What's the difference between a regular and recursive CTE?
3. Write a CTE-based query for your dashboard.
4. **Reflection**: Which of your complex queries would benefit from CTEs?
