# Exploratory Data Analysis with SQL

## 🎯 By End of This Lesson You Will:
- Run a systematic first-look at any new dataset
- Spot quality issues, outliers, and interesting patterns
- Document findings clearly so others can build on your work

---

## 🌍 Real-World Analogy First

When a doctor sees a new patient, they don't immediately recommend treatment. They:
1. Take vital signs (height, weight, blood pressure)
2. Ask questions (history, symptoms)
3. Look for red flags (anything unusual)
4. Then form a working hypothesis

**Exploratory Data Analysis (EDA)** is the same process for data. You don't dive into building dashboards or models on day one — you first **get to know the data**:

- What does the data actually contain?
- Is it complete and consistent?
- What's normal, what's unusual?
- What questions can it answer?

A senior data engineer spends 60-70% of project time on EDA. It's not optional — it's where you find the bugs, the surprises, and the real insight.

---

## 🗃️ Practice Data — `study_logs`

Imagine you've been given a new dataset to analyze:

```
study_logs:
columns: id, user_id, date, minutes, mood, track_id, learned_text
~10,000 rows spanning 6 months
```

You've never seen this data before. Where do you start?

---

## 📖 The 6-Step EDA Checklist

### Step 1: How Big Is It?

```sql
SELECT COUNT(*) AS total_rows FROM study_logs;
-- 10247
```

### Step 2: What's the Shape (Columns + Types)?

```sql
-- PostgreSQL: information_schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'study_logs';
```

Result:
```
column_name    data_type  is_nullable
─────────────  ─────────  ───────────
id             integer    NO
user_id        text       NO
date           date       NO
minutes        integer    YES
mood           text       YES
track_id       integer    YES
learned_text   text       YES
```

Now you know what columns exist and which can be NULL.

---

### Step 3: How Many NULLs Per Column?

```sql
SELECT
  COUNT(*) AS total,
  COUNT(*) - COUNT(minutes) AS null_minutes,
  COUNT(*) - COUNT(mood) AS null_mood,
  COUNT(*) - COUNT(track_id) AS null_track,
  COUNT(*) - COUNT(learned_text) AS null_learned
FROM study_logs;
```

Result:
```
total   null_minutes  null_mood  null_track  null_learned
─────   ────────────  ─────────  ──────────  ────────────
10247         12          543       1287         3401
```

Interpretation:
- minutes is rarely null (12) — good
- mood often missing (~5%) — manageable
- track_id missing (~12.5%) — concerning
- learned_text often missing (~33%) — expected (optional field)

---

### Step 4: Date Range and Distribution

```sql
SELECT
  MIN(date) AS earliest,
  MAX(date) AS latest,
  (MAX(date) - MIN(date)) AS span_days,
  COUNT(DISTINCT date) AS unique_dates
FROM study_logs;
```

```
earliest    latest      span_days  unique_dates
──────────  ──────────  ─────────  ────────────
2026-01-01  2026-06-30      181         180
```

So data spans ~6 months with one missing day. Worth investigating which day is missing.

### Step 5: Distribution of Key Columns

For numeric (`minutes`):

```sql
SELECT
  COUNT(*) AS rows,
  MIN(minutes) AS min,
  MAX(minutes) AS max,
  AVG(minutes) AS avg,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY minutes) AS median,
  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY minutes) AS p90,
  STDDEV(minutes) AS stdev
FROM study_logs
WHERE minutes IS NOT NULL;
```

```
rows    min   max    avg    median   p90    stdev
─────  ───  ────   ─────  ──────   ───    ─────
10235   0   720    47.3    45      90      28
```

Red flags:
- `min = 0` → 0-minute sessions? Probably bad data
- `max = 720` → 12-hour session? Outlier or real?

### Step 6: Categorical Distribution

For text (`mood`):

```sql
SELECT
  mood,
  COUNT(*) AS rows,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM study_logs
GROUP BY mood
ORDER BY rows DESC;
```

```
mood       rows   pct
────────   ────   ────
good      4200   41.0
neutral   3100   30.2
great     1200   11.7
bad        900    8.8
NULL       543    5.3
GREAT       50    0.5     ← inconsistent casing!
"good"      40    0.4     ← quoted variant
amazing     20    0.2     ← unexpected value
...
```

You've found data quality issues: mixed case, quoted values, freeform entries. Time to clean.

---

## 🔨 Level Up

### Step 7: Find the Outliers

```sql
-- Sessions that are unusually long
SELECT *
FROM study_logs
WHERE minutes > (
  SELECT AVG(minutes) + 3 * STDDEV(minutes) FROM study_logs
)
ORDER BY minutes DESC;
```

Sessions more than 3 standard deviations above the mean. Investigate each — bug, data entry error, or genuine?

### Step 8: Per-User Distribution

```sql
-- Top users by total study time
SELECT
  user_id,
  COUNT(*) AS sessions,
  SUM(minutes) AS total_minutes,
  ROUND(AVG(minutes), 1) AS avg_session
FROM study_logs
WHERE minutes IS NOT NULL
GROUP BY user_id
ORDER BY total_minutes DESC
LIMIT 10;
```

```
user_id   sessions  total_minutes  avg_session
──────    ────────  ─────────────  ───────────
u-12          180         9000         50.0
u-44          156         7440         47.7
u-7           150         7100         47.3
...
```

Is the data skewed by a few power users?

### Step 9: Time-Series Pattern

```sql
-- Daily session count over time
SELECT
  date,
  COUNT(*) AS sessions
FROM study_logs
GROUP BY date
ORDER BY date;
```

Look at this in a chart — are there weekend drops? Big spikes (campaigns)? Outages (zero-row days)?

### Step 10: Cross-Tabs (Two Variables)

```sql
-- Average session length by mood
SELECT
  mood,
  COUNT(*) AS rows,
  ROUND(AVG(minutes), 1) AS avg_minutes
FROM study_logs
WHERE mood IS NOT NULL AND minutes IS NOT NULL
GROUP BY mood
ORDER BY avg_minutes DESC;
```

```
mood     rows   avg_minutes
─────    ────   ───────────
great    1200       63.4
good     4200       50.1
neutral  3100       42.0
bad       900       28.7
```

Pattern: better mood correlates with longer sessions. Insight you can act on.

---

## 🧪 Practice — Pick Any Dataset

**Exercise 1 — Row count and shape:**
```sql
-- Get the total row count and the column list with types for any table
```

**Exercise 2 — NULL audit:**
```sql
-- For each column, count how many NULLs there are
-- Express as a percentage of total rows
```

**Exercise 3 — Date range:**
```sql
-- Find the earliest and latest dates in a date column
-- How many distinct dates appear?
```

**Exercise 4 — Numeric distribution:**
```sql
-- For a numeric column, get min, max, mean, median, p90, std
-- Identify any values > 3 std devs from the mean
```

**Exercise 5 — Categorical distribution:**
```sql
-- For a text column, show frequency of each value
-- Calculate the percentage each represents
-- Look for casing inconsistencies, unexpected values
```

**Exercise 6 — Time series:**
```sql
-- Plot row counts per day for the last 30 days
-- Look for missing days or unusual spikes
```

**Exercise 7 — Per-group summary:**
```sql
-- Group by a category column (e.g., track, status) and show:
-- - count
-- - avg of a numeric column
-- - min/max
```

**Exercise 8 — Document findings:**
```
Write a Markdown report:
## Dataset Overview
- N rows, M columns, date range X to Y
## Data Quality Issues
- [list issues found with counts]
## Interesting Patterns
- [3 insights worth investigating]
## Recommendations
- [what to clean, what to ask the data owner]
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Trusting averages alone | Outliers skew them badly | Always check median, p90, p99 too |
| Ignoring NULLs in analysis | Aggregates skip them silently | Count NULLs explicitly |
| Looking at only top values | Miss the long tail | Look at distribution shape |
| Skipping the date check | Miss data gaps / fresh-data issues | Always verify date range |
| Not documenting findings | Repeat the work next time | Write a findings README |

---

## 🧠 Mental Model

```
The 6-step EDA recipe (always start here):
  1. COUNT(*)               How big?
  2. column list + types     What's the shape?
  3. NULL counts             Where is data missing?
  4. Date range              What time period?
  5. Distribution            What's normal vs unusual?
  6. Categorical breakdown   What categories exist?

Then dig deeper:
  • Outliers (mean ± 3 std)
  • Per-user / per-group breakdowns
  • Time series (look for gaps and spikes)
  • Cross-tabs (one variable vs another)

Result: a written findings report + a list of cleaning tasks.
```

---

## 📝 Check Your Understanding

1. **Define:** What does EDA stand for and why do data engineers spend so much time on it?
2. **Predict:** A `minutes` column has min=0 and max=720. What might these values represent? How would you investigate?
3. **Find the bug:** You see "GREAT" and "great" both appearing in the mood column. What's the data quality issue? How do you find all variants?
4. **Write it:** Write a single query that returns total rows, NULL count, min, max, and mean for a numeric column.
5. **Apply it:** Apply the 6-step EDA checklist to a real dataset you have access to. Document findings.
6. **Reflect:** Why is EDA more important than fancy modeling for most real business problems?
