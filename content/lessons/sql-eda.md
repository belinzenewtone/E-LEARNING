# Exploratory Data Analysis with SQL

## Why This Matters

EDA is the detective work of data — you explore a dataset without a specific hypothesis, looking for patterns, anomalies, and insights. Before building any model or dashboard, you need to understand the shape, quality, and story of your data.

## Core Concepts

### The EDA Framework

Every EDA follows this sequence:

1. **Size & Shape** — How much data? How many columns?
2. **Completeness** — Where are the NULLs?
3. **Distribution** — What do the values look like?
4. **Relationships** — How do columns relate?
5. **Outliers** — What doesn't fit?
6. **Insights** — What surprising things did you find?

### Size & Shape

```sql
-- Dataset overview
SELECT
  COUNT(*) AS total_rows,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'jobs') AS total_columns
FROM jobs;

-- Cardinality (unique values per column)
SELECT
  COUNT(DISTINCT company) AS unique_companies,
  COUNT(DISTINCT location) AS unique_locations,
  COUNT(DISTINCT title) AS unique_titles
FROM jobs;
```

### Distribution Analysis

```sql
-- Numeric distribution
SELECT
  MIN(salary) AS min_val,
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY salary) AS q1,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY salary) AS median,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY salary) AS q3,
  MAX(salary) AS max_val,
  ROUND(AVG(salary), 0) AS mean,
  ROUND(STDDEV(salary), 0) AS stddev
FROM jobs;

-- Categorical distribution
SELECT experience_level, COUNT(*) AS count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct
FROM jobs
GROUP BY experience_level
ORDER BY count DESC;
```

### Finding Relationships

```sql
-- Does salary vary by experience?
SELECT experience_level,
  COUNT(*) AS jobs,
  ROUND(AVG(salary), 0) AS avg_salary,
  MIN(salary) AS min_salary,
  MAX(salary) AS max_salary
FROM jobs
WHERE salary IS NOT NULL
GROUP BY experience_level
ORDER BY avg_salary DESC;

-- Which companies pay the most?
SELECT company,
  COUNT(*) AS postings,
  ROUND(AVG(salary), 0) AS avg_salary
FROM jobs
WHERE salary IS NOT NULL
GROUP BY company
HAVING COUNT(*) >= 5
ORDER BY avg_salary DESC
LIMIT 10;
```

### Outlier Detection

```sql
-- IQR method
WITH quartiles AS (
  SELECT
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY salary) AS q1,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY salary) AS q3
  FROM jobs
)
SELECT title, company, salary
FROM jobs, quartiles
WHERE salary < q1 - 1.5 * (q3 - q1)  -- below lower fence
   OR salary > q3 + 1.5 * (q3 - q1); -- above upper fence
```

### Documenting Findings

Every EDA should produce:
- A README with key findings
- Summary statistics (the profile queries above)
- 3-5 interesting insights
- At least one visualization idea
- Data quality issues found

## Try It Yourself

1. Run the EDA framework on the jobs dataset.
2. Find the distribution of salaries by experience level.
3. Identify top-paying companies with statistical summary.
4. Write a findings document with 3 insights.

## Common Mistakes

- **Jumping to conclusions from small samples**: 5 rows averaging 100k is very different from 500 rows averaging 100k. Show COUNT with every AVG.
- **Ignoring NULLs in distributions**: `AVG(salary)` skips NULLs. Your 20-row average might represent 10 rows.
- **Finding patterns but no insights**: "Salaries range from 30k-200k" is a pattern. "Senior roles earn 3x more than entry roles" is an insight.

## Checkpoint

1. What SQL queries do you always run first on a new dataset?
2. What's the difference between a pattern and an insight?
3. How do you detect outliers using IQR?
4. **Reflection**: Run EDA on your study_logs. What surprises you?
