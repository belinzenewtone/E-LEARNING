# Window Functions: LAG, LEAD & SUM OVER

## Why This Matters

Ranking tells you position. LAG and LEAD tell you change over time — "What was yesterday's study time?" "How did XP grow week-over-week?" Running totals with SUM OVER show cumulative progress. These are the building blocks of every time-series dashboard.

## Core Concepts

### LAG — Look Backward

```sql
-- Compare each day's study time with the previous day
SELECT
  DATE(date) AS study_date,
  SUM(minutes) AS minutes_today,
  LAG(SUM(minutes)) OVER (ORDER BY DATE(date)) AS minutes_yesterday,
  SUM(minutes) - LAG(SUM(minutes)) OVER (ORDER BY DATE(date)) AS change
FROM study_logs
GROUP BY DATE(date)
ORDER BY study_date;
```

```
study_date  | today | yesterday | change
2026-05-11  | 150   | NULL      | NULL
2026-05-12  | 120   | 150       | -30
2026-05-13  | 180   | 120       | +60
```

LAG(column, N) — looks N rows back. LAG(column, 1) is the default.

### LEAD — Look Forward

```sql
-- Show each week with the next week's target
SELECT
  week_number,
  SUM(minutes) AS this_week,
  LEAD(SUM(minutes)) OVER (ORDER BY week_number) AS next_week
FROM study_logs
GROUP BY week_number;
```

### Running Totals with SUM OVER

```sql
-- Cumulative XP over time
SELECT
  created_at::date AS day,
  points,
  SUM(points) OVER (ORDER BY created_at) AS cumulative_xp
FROM xp_events
WHERE user_id = 1
ORDER BY created_at;
```

```sql
-- Running total per category
SELECT
  track_id,
  created_at,
  points,
  SUM(points) OVER (
    PARTITION BY track_id
    ORDER BY created_at
  ) AS track_cumulative_xp
FROM xp_events;
```

### Window Frame — ROWS BETWEEN

```sql
-- Moving average (last 7 days)
SELECT
  DATE(date) AS study_date,
  SUM(minutes) AS daily_minutes,
  AVG(SUM(minutes)) OVER (
    ORDER BY DATE(date)
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS moving_avg_7day
FROM study_logs
GROUP BY DATE(date);

-- Running total from beginning to current
SUM(points) OVER (
  ORDER BY created_at
  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
)
```

### Practical Analytics Patterns

```sql
-- Week-over-week growth
WITH weekly AS (
  SELECT
    DATE_TRUNC('week', created_at) AS week,
    SUM(points) AS weekly_xp
  FROM xp_events
  GROUP BY DATE_TRUNC('week', created_at)
)
SELECT
  week,
  weekly_xp,
  LAG(weekly_xp) OVER (ORDER BY week) AS prev_week_xp,
  ROUND((weekly_xp - LAG(weekly_xp) OVER (ORDER BY week)) * 100.0 /
    NULLIF(LAG(weekly_xp) OVER (ORDER BY week), 0), 1) AS growth_pct
FROM weekly;

-- Streak detection
WITH daily AS (
  SELECT
    DATE(date) AS study_date,
    1 AS studied
  FROM study_logs
  WHERE user_id = 1
  GROUP BY DATE(date)
)
SELECT
  study_date,
  SUM(studied) OVER (
    ORDER BY study_date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS last_7_days
FROM daily;
```

## Try It Yourself

1. Use LAG to calculate day-over-day change in study minutes.
2. Calculate a 7-day moving average of XP earned.
3. Use SUM OVER to show cumulative study hours over the entire program.
4. Compute week-over-week XP growth percentage.

## Common Mistakes

- **Forgetting ORDER BY in LAG/LEAD**: Without ORDER BY, "previous row" is meaningless.
- **NULL first row**: LAG returns NULL for the first row. Handle with COALESCE or in application code.
- **Default frame misunderstanding**: SUM OVER with ORDER BY defaults to `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` (cumulative). Without ORDER BY, it sums everything.

## Checkpoint

1. How would you use LAG to calculate week-over-week growth?
2. What does the window frame `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` do?
3. What does LAG return for the first row?
4. **Reflection**: What time-series analytics would your dashboard need?
