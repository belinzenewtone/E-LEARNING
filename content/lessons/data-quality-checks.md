# Data Quality: Checks & Assertions

## Why This Matters

Garbage in, garbage out. A dashboard showing "average study time: 2,147,483 minutes" because a NULL became MAX_INT is worse than no dashboard at all. Data quality checks catch these issues before they reach users.

## Core Concepts

### Null Checks

```sql
-- Which columns have unexpected NULLs?
SELECT
  COUNT(*) AS total,
  COUNT(user_id) AS valid_user_id,
  COUNT(minutes) AS valid_minutes,
  COUNT(mood) AS valid_mood
FROM study_logs;

-- Alert threshold example
-- If > 5% of rows have NULL minutes, something's wrong
SELECT CASE WHEN
  COUNT(*) FILTER (WHERE minutes IS NULL) * 100.0 / COUNT(*) > 5
  THEN 'ALERT: High NULL rate in minutes'
  ELSE 'OK'
END FROM study_logs;
```

### Uniqueness Checks

```sql
-- Primary keys must be unique
SELECT id, COUNT(*) FROM study_logs
GROUP BY id HAVING COUNT(*) > 1;

-- Business keys must be unique
SELECT user_id, DATE(date), COUNT(*)
FROM study_logs
GROUP BY user_id, DATE(date)
HAVING COUNT(*) > 1;
-- One study session per user per day? Check it.
```

### Range Validation

```sql
-- Minutes should be reasonable (1-720 minutes)
SELECT * FROM study_logs
WHERE minutes < 1 OR minutes > 720;

-- Energy scale is 1-5
SELECT * FROM study_logs
WHERE energy < 1 OR energy > 5;

-- Mood must be from the allowed set
SELECT * FROM study_logs
WHERE mood NOT IN ('great', 'good', 'okay', 'bad');
```

### Referential Integrity

```sql
-- Orphaned records: study_logs with no matching user
SELECT sl.id, sl.user_id
FROM study_logs sl
LEFT JOIN users u ON sl.user_id = u.id
WHERE u.id IS NULL;

-- Orphaned progress records
SELECT p.id, p.lesson_id
FROM progress p
LEFT JOIN lessons l ON p.lesson_id = l.id
WHERE l.id IS NULL AND p.lesson_id IS NOT NULL;
```

### Consistency Checks

```sql
-- XP total should match sum of XP events
WITH computed AS (
  SELECT user_id, SUM(points) AS computed_xp
  FROM xp_events GROUP BY user_id
),
stored AS (
  SELECT id, total_xp AS stored_xp FROM progress_snapshots
)
SELECT c.user_id, c.computed_xp, s.stored_xp
FROM computed c
JOIN stored s ON c.user_id = s.id
WHERE c.computed_xp != s.stored_xp;
```

### dbt Test Concepts

dbt has built-in test types that apply to any data pipeline:

| Test | What it checks |
|---|---|
| `unique` | Column has no duplicates |
| `not_null` | Column has no NULLs |
| `accepted_values` | Column values are in a list |
| `relationships` | Foreign keys reference existing rows |
| Custom | Any SQL that returns failing rows |

### Data Quality Dashboard

Every pipeline should log:
- Rows processed
- Rows rejected (and why)
- Validation failures (by check type)
- Run duration
- Last successful run timestamp

## Try It Yourself

1. Write NULL, uniqueness, and range checks for study_logs.
2. Check referential integrity between progress and lessons.
3. Create a data quality summary query that runs all checks.
4. Design a data quality dashboard for your pipeline.

## Common Mistakes

- **Checking only after loading**: Run checks before loading. Reject bad data, don't load it then clean it.
- **Soft failures**: A check that logs a warning but continues means bad data enters the system. Fail loudly.
- **No historical tracking**: Was quality better last week? Track metrics over time.

## Checkpoint

1. What data quality checks would you put on the study_logs table?
2. How do you verify referential integrity?
3. What's the difference between a range check and a consistency check?
4. **Reflection**: What quality issues might exist in your own study data?
