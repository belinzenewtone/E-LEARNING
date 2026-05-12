# NULL Handling in SQL

## Why This Matters

NULL means "unknown" or "missing" — not zero, not empty string. SQL's treatment of NULL is counterintuitive: NULL = NULL is false, NULL + 1 is NULL. Mishandling NULLs is the #1 source of wrong query results. Getting it right separates careful analysts from sloppy ones.

## Core Concepts

### The Three-Valued Logic

SQL uses three-valued logic: TRUE, FALSE, and UNKNOWN (NULL).

```sql
-- NULL comparisons always return UNKNOWN (treated as FALSE)
NULL = NULL    -- UNKNOWN
NULL != 'hello' -- UNKNOWN
NULL > 5       -- UNKNOWN

-- The ONLY way to check for NULL
WHERE column IS NULL
WHERE column IS NOT NULL
```

### COALESCE — Provide Fallback Values

```sql
-- Use display_name, fall back to username, fall back to 'Anonymous'
SELECT COALESCE(display_name, username, 'Anonymous') AS name FROM users;

-- Replace NULL salary with 0 (careful — changes averages!)
SELECT COALESCE(salary, 0) AS salary FROM jobs;

-- Practical: show "Not set" instead of NULL
SELECT COALESCE(bio, 'No bio yet') AS bio FROM users;
```

### NULLIF — Turn Values into NULL

```sql
-- Turn 0 into NULL (avoid division by zero)
SELECT score / NULLIF(attempts, 0) AS average FROM results;

-- Treat empty string as NULL
SELECT NULLIF(email, '') FROM users;
```

### NULL Propagation

```sql
-- Operations with NULL produce NULL
SELECT 5 + NULL;        -- NULL
SELECT 'Hello ' || NULL; -- NULL (string concatenation)
SELECT AVG(salary);     -- ignores NULLs (this one is safe)

-- Aggregates skip NULLs (except COUNT(*))
SELECT SUM(salary) FROM jobs; -- sum of non-NULL salaries only
```

### NULL in JOINs

```sql
-- NULL doesn't match anything, not even another NULL
-- This is why INNER JOIN drops rows with NULL foreign keys

-- To include them, use LEFT JOIN
SELECT u.name, s.date
FROM users u
LEFT JOIN study_logs s ON u.id = s.user_id;
-- Users with no study_logs will have NULL date
```

## Try It Yourself

1. Write a query using COALESCE to replace NULL with a default value.
2. Use NULLIF to prevent division by zero.
3. Find all rows where a specific column is NULL.
4. Observe how aggregates handle NULL vs how arithmetic operations do.

## Common Mistakes

- **Using = NULL**: Always use `IS NULL`. `WHERE column = NULL` returns 0 rows.
- **Forgetting NULL in NOT IN**: `WHERE id NOT IN (1, 2, NULL)` returns 0 rows if NULL is in the list.
- **String concatenation with NULL**: `'Name: ' || NULL` returns NULL. Use `CONCAT('Name: ', name)` or `COALESCE`.

## Checkpoint

1. Why does NULL = NULL return false in SQL?
2. What's the difference between COALESCE and NULLIF?
3. How do aggregates handle NULL values?
4. **Reflection**: Where might NULLs cause bugs in your Learning OS queries?
