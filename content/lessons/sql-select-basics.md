# SELECT: Reading Data

## Why This Matters

SELECT is the workhorse of SQL — it's how you ask questions of your data. "Show me all users who signed up this week." "What's the average order value?" "Which products are out of stock?" Every answer starts with SELECT.

## Core Concepts

### Basic SELECT

```sql
-- All columns (use sparingly)
SELECT * FROM jobs;

-- Specific columns (preferred)
SELECT title, company, salary FROM jobs;

-- Column aliases
SELECT title AS job_title, salary AS annual_pay FROM jobs;

-- Expressions
SELECT title, salary * 1.1 AS salary_with_raise FROM jobs;
```

### DISTINCT — Remove Duplicates

```sql
-- Without DISTINCT — all rows, duplicates included
SELECT company FROM jobs;
-- Acme, Acme, Globex, Globex, Globex, Initech

-- With DISTINCT — unique companies only
SELECT DISTINCT company FROM jobs;
-- Acme, Globex, Initech

-- DISTINCT on multiple columns
SELECT DISTINCT company, location FROM jobs;
```

### Column Aliases with AS

```sql
-- Clean column names for output
SELECT
  job_title AS title,
  salary_range_max AS max_salary,
  -- Computed column
  salary_range_max - salary_range_min AS salary_spread
FROM jobs;
```

Aliases appear in query results. They don't change the underlying table.

### Expressions in SELECT

```sql
SELECT
  title,
  salary / 12 AS monthly_salary,
  -- CASE expressions
  CASE
    WHEN salary > 100000 THEN 'High'
    WHEN salary > 50000 THEN 'Medium'
    ELSE 'Low'
  END AS salary_bracket,
  -- String operations
  UPPER(company) AS company_name,
  CONCAT(title, ' at ', company) AS full_title
FROM jobs;
```

### LIMIT — Control Result Size

```sql
-- First 10 rows
SELECT * FROM jobs LIMIT 10;

-- First 5 highest salaries
SELECT title, salary FROM jobs ORDER BY salary DESC LIMIT 5;
```

## Try It Yourself

1. Select 3 specific columns from the `jobs` table.
2. Write a query that adds a 15% bonus column using an expression.
3. Use `DISTINCT` to find unique locations in the job listings.
4. Create a CASE expression that categorizes jobs by salary range.

## Common Mistakes

- **Using SELECT * in production queries**: It breaks when columns are added or removed. Always list columns explicitly.
- **Alias without AS**: `SELECT salary monthly` is valid but confusing. Use `AS` for clarity: `SELECT salary AS monthly`.
- **Forgetting DISTINCT for counts**: `SELECT company FROM jobs` gives duplicates. Use `SELECT DISTINCT company`.

## Checkpoint

1. Which keyword removes duplicate rows from results?
2. What does `SELECT title AS position` do?
3. Write a SELECT that shows job title and calculates monthly salary from annual.
4. **Reflection**: What question would you ask the `jobs` table right now?
