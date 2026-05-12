# WHERE: Filtering Rows

## Why This Matters

SELECT without WHERE returns everything — all rows, all at once. Real questions need filters: "Show me high-paying jobs in Nairobi." "Which users signed up this month?" WHERE transforms SELECT from a dump truck into a scalpel.

## Core Concepts

### Comparison Operators

```sql
-- Basic comparisons
SELECT * FROM jobs WHERE salary > 80000;
SELECT * FROM jobs WHERE company = 'Acme Corp';
SELECT * FROM jobs WHERE experience_level != 'entry';

-- Multiple conditions with AND/OR
SELECT * FROM jobs
WHERE salary > 80000 AND location = 'Nairobi';

SELECT * FROM jobs
WHERE location = 'Remote' OR company = 'Google';
```

### BETWEEN — Range Checks

```sql
-- Salary between 50000 and 100000
SELECT * FROM jobs WHERE salary BETWEEN 50000 AND 100000;
-- Equivalent to: salary >= 50000 AND salary <= 100000

-- Date ranges
SELECT * FROM orders WHERE order_date BETWEEN '2026-01-01' AND '2026-03-31';
```

### IN — Match Any in List

```sql
-- Jobs in specific locations
SELECT * FROM jobs
WHERE location IN ('Nairobi', 'Lagos', 'Cape Town');

-- Equivalent to: location = 'Nairobi' OR location = 'Lagos' OR location = 'Cape Town'

-- Combine with NOT
SELECT * FROM jobs WHERE status NOT IN ('closed', 'cancelled');
```

### LIKE — Pattern Matching

```sql
-- Contains 'engineer' anywhere
SELECT * FROM jobs WHERE title LIKE '%engineer%';

-- Starts with 'Senior'
SELECT * FROM jobs WHERE title LIKE 'Senior%';

-- Exact 5 letters followed by 'Data'
SELECT * FROM jobs WHERE title LIKE '_____Data%';  -- 5 underscores

-- Case-insensitive (PostgreSQL)
SELECT * FROM jobs WHERE title ILIKE '%engineer%';
```

### NULL Handling

```sql
-- Find rows where a column IS NULL
SELECT * FROM jobs WHERE salary IS NULL;

-- Find rows where it's NOT NULL
SELECT * FROM jobs WHERE salary IS NOT NULL;

-- NEVER use = NULL — it always returns false
SELECT * FROM jobs WHERE salary = NULL; -- WRONG! Returns 0 rows
```

### Combining Filters

```sql
SELECT title, company, salary, location
FROM jobs
WHERE
  salary > 70000
  AND (location = 'Remote' OR location = 'Nairobi')
  AND title ILIKE '%engineer%'
  AND salary IS NOT NULL
ORDER BY salary DESC
LIMIT 20;
```

## Try It Yourself

1. Find all jobs with salary above 100,000.
2. Find entry-level jobs in "Nairobi" or "Remote".
3. Find jobs where the title contains "Data" but not "Senior".
4. Find the 10 highest-paying jobs that don't have a NULL salary.

## Common Mistakes

- **Using = with NULL**: `WHERE salary = NULL` returns 0 rows. Always use `IS NULL`.
- **AND/OR precedence**: `a OR b AND c` is `a OR (b AND c)`. Use parentheses to be explicit.
- **Single quotes for strings**: `WHERE company = "Acme"` works sometimes but `'Acme'` is SQL standard. Use single quotes.

## Checkpoint

1. Write a query to find all employees earning between 50000 and 80000.
2. What's the difference between `=` and `LIKE`?
3. Why does `WHERE name = NULL` not work?
4. **Reflection**: What filters would you need for your study log queries?
