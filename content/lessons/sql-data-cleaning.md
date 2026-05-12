# Data Cleaning in SQL

## Why This Matters

Real-world data is dirty — missing values, typos, duplicates, inconsistent formats. 80% of a data engineer's time is cleaning data, not building models or dashboards. SQL is your first line of defense. Clean data = correct answers; dirty data = wrong decisions.

## Core Concepts

### String Cleaning

```sql
-- Remove whitespace
SELECT TRIM(company), LTRIM(company), RTRIM(company) FROM jobs;

-- Case normalization
SELECT UPPER(title), LOWER(title), INITCAP(title) FROM jobs;

-- Find and replace
SELECT REPLACE(title, 'Sr.', 'Senior') FROM jobs;
SELECT REGEXP_REPLACE(phone, '[^0-9]', '', 'g') FROM contacts; -- remove non-digits

-- Length checks
SELECT LENGTH(title) FROM jobs WHERE LENGTH(title) < 5; -- suspiciously short
```

### Type Conversion

```sql
-- Cast to different type
SELECT CAST(salary AS TEXT) FROM jobs;
SELECT salary::TEXT FROM jobs;  -- PostgreSQL shorthand

-- Parse dates
SELECT TO_DATE('2026-05-11', 'YYYY-MM-DD');
SELECT TO_TIMESTAMP(created_at, 'YYYY-MM-DD HH24:MI:SS');

-- Safe conversion with error handling
SELECT
  CASE
    WHEN salary ~ '^\d+$' THEN salary::INTEGER
    ELSE NULL
  END AS clean_salary
FROM raw_jobs;
```

### Handling Duplicates

```sql
-- Find duplicates
SELECT company, title, COUNT(*)
FROM jobs
GROUP BY company, title
HAVING COUNT(*) > 1;

-- Identify exact duplicates
SELECT *, COUNT(*) OVER (PARTITION BY title, company, location) AS cnt
FROM jobs
WHERE cnt > 1;

-- Remove duplicates (keep first by some criterion)
DELETE FROM jobs
WHERE id NOT IN (
  SELECT MIN(id)
  FROM jobs
  GROUP BY title, company, location
);
```

### Data Validation Checklist

```sql
-- Run these on every new dataset:

-- 1. Row count
SELECT COUNT(*) FROM table;

-- 2. NULL counts per column
SELECT
  COUNT(*) FILTER (WHERE column1 IS NULL) AS null_col1,
  COUNT(*) FILTER (WHERE column2 IS NULL) AS null_col2
FROM table;

-- 3. Distinct counts
SELECT COUNT(DISTINCT company) FROM jobs;

-- 4. Range checks
SELECT MIN(salary), MAX(salary), AVG(salary) FROM jobs;

-- 5. Value distribution
SELECT experience_level, COUNT(*) FROM jobs GROUP BY experience_level;

-- 6. Find outliers (IQR method)
WITH stats AS (
  SELECT
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY salary) AS q1,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY salary) AS q3
  FROM jobs
)
SELECT *
FROM jobs, stats
WHERE salary < q1 - 1.5 * (q3 - q1)
   OR salary > q3 + 1.5 * (q3 - q1);
```

### Data Cleaning Workflow

1. **Profile**: COUNT, DISTINCT, NULL counts, MIN/MAX/AVG
2. **Standardize**: TRIM, UPPER/LOWER, consistent date formats
3. **Validate**: Range checks, referential integrity, business rules
4. **Document**: What was wrong and how you fixed it
5. **Test**: Re-run profiling queries to verify fixes

## Try It Yourself

1. Take a messy dataset and run all 6 validation checks.
2. Standardize company names (trim whitespace, normalize case).
3. Find and document 3 data quality issues in a sample dataset.
4. Write a query to identify and remove duplicate rows.

## Common Mistakes

- **Deleting without backup**: Always `SELECT` before `DELETE`. Check your WHERE clause.
- **Over-cleaning**: Trimming "Data Scientist " is good. Renaming "Data Scientist" to "DS" loses information.
- **Silent NULLs**: `salary * 1.1` returns NULL if salary is NULL. Check for NULLs before computing.

## Checkpoint

1. What are the first 3 things you check when you receive a new dataset?
2. How do you find duplicate rows in a table?
3. What's the difference between TRIM and REPLACE?
4. **Reflection**: What data quality issues might exist in your study_logs?
