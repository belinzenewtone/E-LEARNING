# Star Schema: Facts & Dimensions

## Why This Matters

The star schema is the standard pattern for analytical databases. It organizes data into facts (measurable events you want to analyze) and dimensions (descriptive attributes you want to slice by). Every data warehouse at every company uses this pattern.

## Core Concepts

### Fact Tables

Facts are the events you measure — orders, study sessions, XP events:

```sql
CREATE TABLE fact_study_sessions (
  study_date_id INTEGER REFERENCES dim_date(id),
  user_id INTEGER REFERENCES dim_user(id),
  track_id INTEGER REFERENCES dim_track(id),
  minutes INTEGER NOT NULL,     -- measure
  xp_earned INTEGER DEFAULT 0,  -- measure
  sessions INTEGER DEFAULT 1    -- measure
);
```

**Key properties of fact tables**:
- Contains quantitative measures (numbers you can sum, average, count)
- Mostly foreign keys to dimensions
- Usually very large (millions/billions of rows)
- Each row = one event or one aggregation

### Dimension Tables

Dimensions describe the "who, what, where, when" of your facts:

```sql
CREATE TABLE dim_date (
  id INTEGER PRIMARY KEY,
  full_date DATE NOT NULL,
  day_of_week TEXT,
  week_number INTEGER,
  month TEXT,
  quarter INTEGER,
  year INTEGER,
  is_weekday BOOLEAN
);

CREATE TABLE dim_user (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT,
  signup_date DATE,
  track TEXT  -- 'web' or 'data'
);

CREATE TABLE dim_track (
  id INTEGER PRIMARY KEY,
  name TEXT,
  slug TEXT
);
```

### The Grain

The **grain** is what one row in the fact table represents. It's the most important decision in star schema design:

- Grain = "one study session" → row per session, millions of rows
- Grain = "one user per day" → row per user per day, thousands of rows
- Grain = "one user per week" → row per user per week, hundreds of rows

```sql
-- Grain: user per day per track
-- This means there can be at most one row per (user, date, track) combination
CREATE UNIQUE INDEX ON fact_study_sessions (user_id, study_date_id, track_id);
```

### A Star Schema for Learning Analytics

```
         dim_date
             ↓
dim_user → fact_study_sessions ← dim_track
             ↓
       dim_lesson
```

```sql
-- Query: total study minutes by track and month
SELECT
  t.name AS track,
  d.month,
  SUM(f.minutes) AS total_minutes,
  AVG(f.minutes) AS avg_minutes_per_session
FROM fact_study_sessions f
JOIN dim_date d ON f.study_date_id = d.id
JOIN dim_track t ON f.track_id = t.id
GROUP BY t.name, d.month, d.month_order
ORDER BY d.month_order;
```

## Try It Yourself

1. Define the grain for a study analytics fact table.
2. Design 3 dimension tables that describe your facts.
3. Write a query across your star schema.
4. Draw your star schema as a diagram.

## Common Mistakes

- **Unclear grain**: If you can't say what one row means in one sentence, your grain needs work.
- **Mixing grains**: Some rows = daily, some = weekly. Inconsistent grain = wrong aggregations.
- **Dimensions without all attributes**: Date dimension without week_number means you can't aggregate by week.

## Checkpoint

1. What is the 'grain' of a fact table and why does it matter?
2. What's the difference between a fact and a dimension?
3. Design a star schema for your Learning OS analytics.
4. **Reflection**: What grain is right for your study analytics?
