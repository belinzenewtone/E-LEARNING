# Learning Analytics Pipeline Design

## Why This Matters

The analytics dashboard doesn't query your operational database directly — that would slow down the app. Instead, data flows through a pipeline: operational DB → staging → transformed tables → dashboard queries. Designing this pipeline forces you to think about data as a product, not a byproduct.

## Core Concepts

### Pipeline Architecture

```
┌──────────────┐    ┌──────────┐    ┌──────────────┐    ┌───────────┐
│ Learning OS  │───→│ Staging  │───→│ Star Schema  │───→│ Dashboard │
│ (PostgreSQL) │    │ Tables   │    │ (facts/dims) │    │ (Recharts)│
└──────────────┘    └──────────┘    └──────────────┘    └───────────┘
       ↑                  ↑                ↑                  ↑
   Raw events      Raw data,     Clean, modeled     User-facing
   (XP, logs)      as-loaded     analytics data     visualisations
```

### Data Sources

| Source | Table | Refresh |
|---|---|---|
| Study sessions | `study_logs` | Daily |
| XP earned | `xp_events` | Daily |
| Lesson progress | `progress` | Daily |
| Assignment submissions | `submissions` | Weekly |
| Notes created | `notes` | Weekly |

### Staging Layer

```sql
-- staging.study_logs_daily — clean, validated copy
CREATE TABLE staging.study_logs_daily AS
SELECT
  user_id,
  DATE(date) AS study_date,
  track_id,
  SUM(minutes) AS total_minutes,
  COUNT(*) AS sessions,
  AVG(energy) AS avg_energy,
  MODE() WITHIN GROUP (ORDER BY mood) AS dominant_mood
FROM study_logs
WHERE date BETWEEN $start_date AND $end_date
  AND minutes BETWEEN 1 AND 720
  AND user_id IS NOT NULL
GROUP BY user_id, DATE(date), track_id;
```

### Star Schema

```sql
-- fact_daily_study — one row per user per day per track
INSERT INTO fact_daily_study (date_id, user_id, track_id, minutes, sessions, avg_energy)
SELECT
  d.id AS date_id,
  s.user_id,
  COALESCE(s.track_id, 0),
  s.total_minutes,
  s.sessions,
  s.avg_energy
FROM staging.study_logs_daily s
JOIN dim_date d ON s.study_date = d.full_date;
```

### Dashboard Queries

```sql
-- Weekly study hours per track (powers the bar chart)
SELECT
  d.week_number,
  t.name AS track,
  SUM(f.minutes) / 60.0 AS hours
FROM fact_daily_study f
JOIN dim_date d ON f.date_id = d.id
JOIN dim_track t ON f.track_id = t.id
WHERE d.year = 2026
GROUP BY d.week_number, t.name
ORDER BY d.week_number;
```

## Try It Yourself

1. Map out the full data flow from study_logs to dashboard chart.
2. Write the SQL for each pipeline stage.
3. Design refresh schedules for each data source.
4. Add data quality checks between each stage.

## Checkpoint

1. Map out the full data flow from study logs to the analytics dashboard.
2. What data sources feed your analytics pipeline?
3. How often should each source refresh?
4. **Reflection**: What's the hardest part of building this pipeline?
