# Subqueries

## Why This Matters

Sometimes one query isn't enough. You need the result of one query as input to another: "Find users who logged more than the average study time." Subqueries let you nest queries inside SELECT, FROM, or WHERE — turning complex logic into composable pieces.

## Core Concepts

### Subqueries in WHERE

```sql
-- Jobs with salary above the overall average
SELECT title, salary
FROM jobs
WHERE salary > (SELECT AVG(salary) FROM jobs);

-- Users who have submitted assignments
SELECT name, email
FROM users
WHERE id IN (SELECT DISTINCT user_id FROM submissions);
```

### Subqueries in SELECT (Scalar Subqueries)

```sql
-- Show each job with how far its salary is from average
SELECT
  title,
  salary,
  salary - (SELECT AVG(salary) FROM jobs) AS diff_from_avg
FROM jobs;
-- Scalar = returns exactly 1 row, 1 column
```

### Subqueries in FROM (Derived Tables)

```sql
-- Treat a subquery result as a temporary table
SELECT company, avg_salary
FROM (
  SELECT company, AVG(salary) AS avg_salary
  FROM jobs
  GROUP BY company
) AS company_stats
WHERE avg_salary > 80000;
```

### Correlated Subqueries

```sql
-- A subquery that references the outer query
-- "Show employees earning more than their department average"
SELECT name, salary, department
FROM employees e
WHERE salary > (
  SELECT AVG(salary)
  FROM employees
  WHERE department = e.department  -- references outer 'e'
);
```

Correlated subqueries run once per outer row — they can be slow on large datasets.

### EXISTS and NOT EXISTS

```sql
-- Users who have at least one study log
SELECT name FROM users u
WHERE EXISTS (
  SELECT 1 FROM study_logs WHERE user_id = u.id
);

-- Users who have NEVER logged study time
SELECT name FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM study_logs WHERE user_id = u.id
);
```

EXISTS checks whether the subquery returns ANY rows. It stops at the first match — very efficient.

### ANY and ALL

```sql
-- Salary greater than ANY entry-level salary
SELECT title, salary FROM jobs
WHERE salary > ANY (SELECT salary FROM jobs WHERE experience_level = 'entry');

-- Salary greater than ALL entry-level salaries
SELECT title, salary FROM jobs
WHERE salary > ALL (SELECT salary FROM jobs WHERE experience_level = 'entry');
```

## Try It Yourself

1. Find jobs where salary is above average.
2. Use a correlated subquery to find employees earning above their department's average.
3. Use EXISTS to find users who have completed at least one lesson.
4. Use a derived table to create a summary, then query the summary.

## Common Mistakes

- **Scalar subquery returning multiple rows**: `= (SELECT ...)` must return exactly one row. Use `IN` for multiple.
- **Correlated subquery performance**: On large tables, correlated subqueries are slow. Consider JOINs or CTEs instead.
- **NOT IN with NULL**: `WHERE id NOT IN (SELECT id FROM table)` returns 0 rows if the subquery contains NULL.

## Checkpoint

1. What's the difference between a correlated and non-correlated subquery?
2. When would you use EXISTS instead of IN?
3. What happens if a scalar subquery returns multiple rows?
4. **Reflection**: Find a query in your app that could use a subquery.
