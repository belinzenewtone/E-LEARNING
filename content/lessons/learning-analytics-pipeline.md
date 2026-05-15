# Learning Analytics Pipeline Design

## 🎯 By End of This Lesson You Will:
- Design an end-to-end analytics pipeline for a learning platform
- Identify metrics that matter for measuring learning effectiveness
- Sketch the data model from raw events to dashboard

---

## 🌍 Real-World Analogy First

Building a learning analytics pipeline is like **running a school's report card system**:

```
1. Capture every student action      (attended class, submitted homework)
2. Roll up into daily/weekly metrics  (hours studied, % complete)
3. Compare to goals/peers              ("you're behind on Math")
4. Surface to the student & teacher    (report card, dashboard)
```

The same pattern applies to any learning platform — yours, Coursera, Duolingo, Khan Academy. The metrics differ; the architecture is the same.

---

## 📖 Start From Zero

### What Metrics Matter?

Before designing data, decide what you'll measure. For a learner-facing system:

```
Engagement metrics:
  - Daily active learners (DAL)
  - Sessions per week
  - Average session length
  - Streak length

Progress metrics:
  - Lessons completed per week
  - XP earned per week
  - Assignments submitted
  - Module completion rate

Quality metrics:
  - Checkpoint pass rate
  - Time spent per lesson
  - Lessons revisited
  - Self-reported mood

Outcome metrics:
  - Course completion rate
  - Skills demonstrated
  - Portfolio artifacts created
```

A platform without metrics is a platform that can't learn.

---

## 🔨 Level Up

### Step 1: The Pipeline Stages

```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│  OLTP DB   │ →  │   Loader   │ →  │  Warehouse │ →  │  Dashboard │
│ (live app) │    │ (cron/ELT) │    │  (cloud)   │    │  (Recharts)│
└────────────┘    └────────────┘    └────────────┘    └────────────┘
   Postgres        Airbyte etc.     BigQuery / dbt    Next.js UI
```

Stage 1 captures every event. Stage 2 moves data to the warehouse. Stage 3 transforms it. Stage 4 surfaces insights.

---

### Step 2: Event-Level Capture

Every learner action becomes an event:

```typescript
// In your Next.js app
await trackEvent({
  type: "lesson_completed",
  userId: user.id,
  lessonId: lesson.id,
  trackId: lesson.module.trackId,
  duration_minutes: 45,
  xp_earned: 50,
  mood: "good",
  occurred_at: new Date()
});
```

Events go into a single `events` table:

```sql
CREATE TABLE events (
  id          UUID PRIMARY KEY,
  user_id     UUID NOT NULL,
  type        TEXT NOT NULL,
  properties  JSONB,
  occurred_at TIMESTAMP NOT NULL
);
```

Why event-based? You can derive ANY metric later by replaying events — you're future-proofed.

---

### Step 3: Daily Snapshot Table

For dashboards, queries need to be fast. Pre-aggregate daily:

```sql
-- raw events → daily summary per user
CREATE TABLE daily_user_stats AS
SELECT
  user_id,
  DATE(occurred_at) AS date,
  SUM(CASE WHEN type = 'study_session' THEN (properties->>'minutes')::INT ELSE 0 END) AS minutes_studied,
  SUM(CASE WHEN type = 'xp_earned' THEN (properties->>'amount')::INT ELSE 0 END) AS xp_earned,
  COUNT(*) FILTER (WHERE type = 'lesson_completed') AS lessons_completed,
  COUNT(*) FILTER (WHERE type = 'checkpoint_correct') AS questions_correct,
  COUNT(*) FILTER (WHERE type = 'checkpoint_wrong') AS questions_wrong
FROM events
GROUP BY user_id, DATE(occurred_at);
```

Now dashboards query this small table, not the huge events table.

---

### Step 4: Streak Calculation

A streak = consecutive days with study activity. SQL using window functions:

```sql
WITH daily_activity AS (
  SELECT DISTINCT user_id, DATE(occurred_at) AS day
  FROM events
  WHERE type = 'study_session'
),
ranked AS (
  SELECT
    user_id,
    day,
    day - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY day) * INTERVAL '1 day' AS grp
  FROM daily_activity
)
SELECT
  user_id,
  COUNT(*) AS streak_length,
  MIN(day) AS streak_start,
  MAX(day) AS streak_end
FROM ranked
GROUP BY user_id, grp
ORDER BY user_id, streak_end DESC;
```

The "islands" trick — group consecutive days into runs, count each run.

---

### Step 5: Cohort Analysis

A cohort = users who started in the same period. Cohort analysis answers: "do new users stick around?"

```sql
WITH cohorts AS (
  SELECT
    user_id,
    DATE_TRUNC('week', MIN(occurred_at)) AS cohort_week
  FROM events
  GROUP BY user_id
)
SELECT
  c.cohort_week,
  EXTRACT(WEEK FROM e.occurred_at - c.cohort_week) AS weeks_since_signup,
  COUNT(DISTINCT e.user_id) AS active_users
FROM cohorts c
JOIN events e USING (user_id)
GROUP BY c.cohort_week, weeks_since_signup
ORDER BY c.cohort_week, weeks_since_signup;
```

Visualize as a cohort table — week N retention.

---

### Step 6: Star Schema for the Warehouse

```
fact_study_sessions:
  date_id, user_id, lesson_id, track_id, minutes, xp, mood

dim_date:    id, year, week, day_of_week, is_weekend
dim_user:    id, signup_date, cohort_week, primary_track
dim_lesson:  id, slug, title, module, difficulty
dim_track:   id, name, target_hours
```

This is the structure your dashboards query. Built nightly by dbt (or hourly for fresher data).

---

### Step 7: Sample Dashboard Queries

```sql
-- "What did I do this week?"
SELECT
  d.day_of_week,
  SUM(f.minutes) AS minutes,
  SUM(f.xp) AS xp
FROM fact_study_sessions f
JOIN dim_date d ON f.date_id = d.id
WHERE f.user_id = :me
  AND d.date >= CURRENT_DATE - 7
GROUP BY d.day_of_week
ORDER BY d.day_of_week;

-- "How am I trending across the cohort?"
SELECT
  u.cohort_week,
  AVG(f.minutes) AS avg_minutes
FROM fact_study_sessions f
JOIN dim_user u ON f.user_id = u.id
JOIN dim_date d ON f.date_id = d.id
WHERE d.date >= CURRENT_DATE - 30
GROUP BY u.cohort_week
ORDER BY u.cohort_week;
```

---

### Step 8: Privacy and Ethics

Learner data is sensitive. Always:

```
✅ Aggregate before sharing with anyone outside the user
✅ Anonymize user IDs in analytics dashboards
✅ Get explicit consent for tracking
✅ Allow data export/deletion (GDPR)
✅ Don't use learner data to embarrass them ("you've been stuck on lesson 3 for 30 days")

❌ Surface raw mood/activity to teachers without consent
❌ Use analytics for surveillance
❌ Sell or share learner-level data
```

A learning platform's trust is everything.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Metric inventory:**
```
For Learning OS, list the 10 metrics you'd want to track.
Categorize: engagement / progress / quality / outcome.
```

**Exercise 2 — Event design:**
```typescript
// Design the event payload for "lesson_completed"
// What fields? What types?
```

**Exercise 3 — Daily aggregation:**
```sql
-- Write a query that produces daily_user_stats
-- (start from events table)
```

**Exercise 4 — Streak SQL:**
```sql
-- Write a query that calculates the current streak for one user
-- (consecutive days with at least one study session)
```

**Exercise 5 — Star schema:**
```
Sketch fact_study_sessions and 4 dimensions
Define the grain
```

**Exercise 6 — Dashboard query:**
```sql
-- "Show me my XP trend over the last 8 weeks, week by week"
```

**Exercise 7 — Privacy review:**
```
List 5 ways the Learning OS analytics could harm learners
For each, write a mitigating design decision.
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Tracking too few events | Can't answer questions later | Capture everything in raw events |
| Aggregating too early | Loses flexibility | Keep raw events + derive daily summaries |
| Counting "engaged" wrong | Vanity metrics | Pick meaningful definitions explicitly |
| No streak edge cases | Off-by-one bugs | Test with: empty days, future days, time zones |
| Forgetting privacy | Trust lost | Consent + anonymisation + deletion always |

---

## 🧠 Mental Model

```
Capture (raw events) → Load (to warehouse) → Transform (dbt) → Surface (dashboard)

Layers:
  events         — every action, immutable
  daily_*        — pre-aggregated per user per day
  weekly_*       — rolled up further
  fact + dim     — star schema for slice/dice

Metrics buckets:
  engagement   (are they showing up?)
  progress     (are they advancing?)
  quality      (are they actually learning?)
  outcome      (did they reach their goal?)
```

---

## 📝 Check Your Understanding

1. **Define:** Why capture raw events instead of just storing the daily summary?
2. **Predict:** A streak calculation that uses `MAX(date) - MIN(date)` instead of consecutive days — what does it fail on?
3. **Find the bug:** A dashboard shows "minutes studied today" but always lags by 24h. What in the pipeline is likely?
4. **Write it:** SQL for "average lesson completion time per difficulty level."
5. **Apply it:** Sketch the full Learning OS analytics pipeline — sources, stages, schema, sample queries.
6. **Reflect:** What's the difference between metrics that motivate learners and metrics that overwhelm them?
