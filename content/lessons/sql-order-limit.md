# ORDER BY & LIMIT

## Why This Matters

Raw query results come in arbitrary order. ORDER BY puts them in the sequence you need — newest first, highest paid, alphabetical. LIMIT prevents you from drowning in data. Together they're how you get precisely the slice of data you want.

## Core Concepts

### ORDER BY

```sql
-- Ascending (default)
SELECT title, salary FROM jobs ORDER BY salary;
-- Lowest salary first

-- Descending
SELECT title, salary FROM jobs ORDER BY salary DESC;
-- Highest salary first

-- Multiple columns
SELECT title, company, salary FROM jobs
ORDER BY company ASC, salary DESC;
-- Grouped by company, highest salary within each company first
```

### LIMIT and OFFSET

```sql
-- Top 10 highest salaries
SELECT title, salary FROM jobs ORDER BY salary DESC LIMIT 10;

-- Pagination: page 2 (rows 11-20)
SELECT title, salary FROM jobs ORDER BY salary DESC LIMIT 10 OFFSET 10;

-- Most recent 5 entries
SELECT * FROM study_logs ORDER BY created_at DESC LIMIT 5;
```

### NULLs in ORDER BY

```sql
-- NULLs last (PostgreSQL default for DESC)
SELECT * FROM jobs ORDER BY salary DESC NULLS LAST;

-- NULLs first
SELECT * FROM jobs ORDER BY salary ASC NULLS FIRST;
```

### Combining Everything

```sql
-- "Show me the 10 highest-paying remote Data jobs"
SELECT title, company, salary, location
FROM jobs
WHERE
  title ILIKE '%data%'
  AND location = 'Remote'
  AND salary IS NOT NULL
ORDER BY salary DESC
LIMIT 10;
```

### Practical Patterns

```sql
-- Leaderboard (top scores)
SELECT user_name, xp FROM users ORDER BY xp DESC LIMIT 10;

-- Recent activity
SELECT * FROM study_logs ORDER BY date DESC LIMIT 20;

-- Bottom performers (find issues)
SELECT * FROM lessons WHERE completion_rate < 0.5 ORDER BY completion_rate ASC LIMIT 5;
```

## Try It Yourself

1. List all jobs sorted by company name alphabetically.
2. Show the 5 most recent study log entries.
3. Find the 3 lowest-paying jobs (excluding NULL salaries).
4. Create a paginated query that returns rows 21-30.

## Common Mistakes

- **ORDER BY with large datasets without LIMIT**: Sorting a million rows is slow. Always add LIMIT when you don't need all results.
- **OFFSET without ORDER BY**: Without ORDER BY, row order is unpredictable. OFFSET only makes sense with ORDER BY.
- **LIMIT without ORDER BY**: You get arbitrary rows — different every time. Always sort first.

## Checkpoint

1. What does OFFSET do in a query?
2. How do you sort by multiple columns?
3. Write a query that shows the top 10 highest-paying jobs.
4. **Reflection**: How would you paginate a list of 100 lessons for a student?
