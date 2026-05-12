# GROUP BY & HAVING

## Why This Matters

Aggregates without GROUP BY give you one number for everything. GROUP BY gives you breakdowns — "Sales by region," "XP by week," "Users by signup month." Every dashboard and report relies on GROUP BY. HAVING filters those groups the way WHERE filters rows.

## Core Concepts

### GROUP BY Basics

```sql
-- Count jobs by company
SELECT company, COUNT(*) AS job_count
FROM jobs
GROUP BY company
ORDER BY job_count DESC;
```

**Rule**: Every column in SELECT must either be in GROUP BY or wrapped in an aggregate function.

```sql
-- WRONG: location isn't in GROUP BY
SELECT company, location, COUNT(*) FROM jobs GROUP BY company;

-- RIGHT
SELECT company, COUNT(*), AVG(salary) FROM jobs GROUP BY company;
```

### Multiple Columns

```sql
-- Count by company AND location
SELECT company, location, COUNT(*) AS count
FROM jobs
GROUP BY company, location
ORDER BY count DESC;
```

### HAVING vs WHERE

```sql
-- WHERE filters ROWS before grouping
-- HAVING filters GROUPS after grouping

-- Companies with more than 5 job postings
SELECT company, COUNT(*) AS job_count
FROM jobs
GROUP BY company
HAVING COUNT(*) > 5;

-- Both together
SELECT company, location, AVG(salary) AS avg_salary
FROM jobs
WHERE salary IS NOT NULL           -- filter rows first
GROUP BY company, location
HAVING AVG(salary) > 70000        -- filter groups after
ORDER BY avg_salary DESC;
```

### Common GROUP BY Patterns

```sql
-- Study hours by day
SELECT DATE(date) AS study_date, SUM(minutes) AS total_minutes
FROM study_logs
GROUP BY DATE(date)
ORDER BY study_date;

-- XP earned by week
SELECT
  DATE_TRUNC('week', created_at) AS week,
  SUM(points) AS weekly_xp
FROM xp_events
GROUP BY DATE_TRUNC('week', created_at);

-- Progress by module
SELECT module_id, COUNT(*) FILTER (WHERE status = 'completed') AS completed
FROM progress
GROUP BY module_id;
```

### FILTER Clause (PostgreSQL)

```sql
-- Count completions and total per module in one query
SELECT
  module_id,
  COUNT(*) AS total_lessons,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed,
  COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress
FROM progress
GROUP BY module_id;
```

## Try It Yourself

1. Group jobs by location and count how many in each.
2. Find the average salary by experience level.
3. Use HAVING to show only locations with more than 10 jobs.
4. Group study logs by day and sum the minutes.

## Common Mistakes

- **Column not in GROUP BY**: `SELECT name, COUNT(*) FROM users GROUP BY id` — name is neither in GROUP BY nor an aggregate. Error.
- **WHERE instead of HAVING on aggregates**: `WHERE COUNT(*) > 5` is invalid. Use `HAVING COUNT(*) > 5`.
- **Forgetting ORDER BY**: GROUP BY doesn't sort. Add ORDER BY if you want sorted results.

## Checkpoint

1. When do you use HAVING instead of WHERE?
2. What's wrong with `SELECT name, COUNT(*) FROM users GROUP BY id`?
3. Write a query showing study minutes per day, sorted by date.
4. **Reflection**: What GROUP BY queries would power your analytics dashboard?
