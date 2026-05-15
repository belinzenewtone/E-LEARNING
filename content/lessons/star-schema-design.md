# Star Schema: Facts & Dimensions

## 🎯 By End of This Lesson You Will:
- Identify fact tables and dimension tables for an analytical use case
- Define the "grain" of a fact table
- Design a star schema for the Learning OS analytics

---

## 🌍 Real-World Analogy First

A star schema is **one central table surrounded by lookup tables** that describe its rows:

```
                  ┌──────────────┐
                  │  dim_date    │
                  └──────┬───────┘
                         │
       ┌─────────────────┴──────────────────┐
       │                                     │
┌──────┴──────┐                       ┌──────┴──────┐
│  dim_user   │  ◄── fact_study ──►   │ dim_lesson  │
└─────────────┘                       └─────────────┘
                         │
                  ┌──────┴───────┐
                  │  dim_track   │
                  └──────────────┘
```

The center (the "fact") is the thing you measure. The points of the star (the "dimensions") are what you filter and group by.

---

## 📖 Start From Zero

### Two Kinds of Tables

| Type | Holds | Example |
|---|---|---|
| **Fact** | Numeric measurements + foreign keys to dimensions | study minutes per session |
| **Dimension** | Descriptive attributes | user info, lesson info, dates |

```
fact_study_sessions:
  date_id, user_id, lesson_id, track_id, minutes, xp_earned

dim_user:    id, name, country, joined_at
dim_lesson:  id, slug, title, difficulty
dim_track:   id, name, color
dim_date:    id, year, quarter, month, day, day_of_week
```

You query: "minutes studied per track per month" → JOIN fact ← dim_track + dim_date, GROUP BY track + month.

---

## 🔨 Level Up

### Step 1: Defining the Grain

**Grain** = what one row in the fact table represents.

```
Examples of different grains:
  - One row per STUDY SESSION         (most detailed)
  - One row per USER PER DAY           (rolled up)
  - One row per USER PER WEEK          (more rolled up)
```

The grain decides everything else:
- Finer grain (per session) → more rows, more flexibility, more storage
- Coarser grain (per week) → fewer rows, faster queries, less flexibility

> **Rule:** Declare the grain in writing BEFORE designing anything else. "One row per X."

---

### Step 2: Choosing Measurements

In a fact table, **measurements** are numeric columns you'll aggregate (SUM, AVG, COUNT):

```
fact_study_sessions
  measurements:
    minutes              (SUM, AVG)
    xp_earned            (SUM)
    questions_answered   (SUM)
    questions_correct    (SUM)
```

Plus foreign keys to dimensions:
```
  date_id     → dim_date
  user_id     → dim_user
  lesson_id   → dim_lesson
  track_id    → dim_track
```

---

### Step 3: Designing Dimensions

Each dimension table:
- Has a surrogate key (e.g., `id`)
- Has descriptive attributes
- Often denormalized (track name in dim_lesson, not a separate dim_track)

**dim_user:**
```
id, name, country, signup_cohort, primary_track, current_streak
```

Include user attributes that you might want to filter/group by. Yes, this duplicates some data from the OLTP source — that's the point.

**dim_lesson:**
```
id, slug, title, module, track_name, difficulty, estimated_minutes
```

`track_name` is included even though we have `dim_track` separately — it makes ad-hoc queries simpler.

**dim_date** is special:
```
id, date, year, quarter, month, month_name, week, day_of_week, is_weekend, is_holiday
```

One row per day. Always pre-built so queries can filter on "weekends only" or "Q1 2026" without complex date math.

---

### Step 4: A Real Query Example

```sql
-- "Total study minutes per track per month"
SELECT
  d.year,
  d.month_name,
  l.track_name,
  SUM(f.minutes) AS total_minutes
FROM fact_study_sessions f
JOIN dim_date d   ON f.date_id   = d.id
JOIN dim_lesson l ON f.lesson_id = l.id
GROUP BY d.year, d.month_name, l.track_name
ORDER BY d.year, d.month_name;
```

The star structure makes this query simple — one JOIN per dimension.

---

### Step 5: Star vs Snowflake

```
STAR SCHEMA:                    SNOWFLAKE SCHEMA:
  fact ── dim_lesson              fact ── dim_lesson ── dim_track
                                                    └── dim_difficulty
```

In a snowflake, dimensions are further normalized (dim_track is separate from dim_lesson).

**Star is usually preferred** because:
- Fewer joins → faster queries
- Easier for analysts to understand
- Modern columnar DBs handle the redundancy fine

Snowflake is occasionally used for huge dimensions that benefit from sub-tables.

---

### Step 6: Slowly Changing Dimensions (SCD)

What if a user's `country` changes? Three strategies:

```
SCD Type 1 — Overwrite (history lost)
  Just update dim_user.country. Past facts now appear in the new country.

SCD Type 2 — Add a new row (history preserved)
  dim_user gets a new row with the new country + valid_from/valid_to dates.
  Each fact links to the version active at that time.

SCD Type 3 — Add a column (limited history)
  dim_user has columns: current_country, previous_country.
```

Type 2 is the most common for analytics where history matters.

---

### Step 7: Designing for the Learning OS

**Goal:** "Study minutes per user per week per track."

**Grain:** one row per study session.

**fact_study_sessions:**
```
date_id, user_id, lesson_id, track_id, minutes, xp_earned, mood
```

**dim_user:** id, name, country, current_track, joined_at
**dim_lesson:** id, slug, title, module_name, track_name, difficulty
**dim_track:** id, name, target_hours
**dim_date:** id, date, year, week_of_year, day_of_week, is_weekend

With this design, you can answer:
- "Hours studied this week by track"
- "Most-studied lessons this month"
- "Weekend vs weekday study patterns"
- "User retention by signup cohort"

All with simple GROUP BYs.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Define the grain:**
```
"I want to analyze sales by region, product, and date."
What's the grain of your fact table?
```

**Exercise 2 — Identify facts vs dimensions:**
```
For an e-commerce data warehouse, label each as F or D:
- order amount
- customer name
- order date
- product price
- shipping country
- order_id
```

**Exercise 3 — Design fact:**
```
Design fact_orders for a sales warehouse.
What measurements? What FKs?
```

**Exercise 4 — Design dim_date:**
```
Write the columns you'd want in dim_date.
Why include redundant fields like both month_number AND month_name?
```

**Exercise 5 — Query practice:**
```sql
-- Write a query using the fact_study + dim_date + dim_track schema:
-- "Average study minutes per session, by track, by month"
```

**Exercise 6 — Slowly changing:**
```
A user's currentTrack changes from "web" to "data". How would SCD Type 2 handle this?
Sketch the new dim_user rows.
```

**Exercise 7 — Real design:**
```
Design a star schema for a streaming platform:
"What videos do users watch by genre, by day, by device?"
Identify fact, dimensions, grain.
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Mixing levels of grain | Inconsistent aggregations | One grain per fact table |
| Forgetting dim_date | Date arithmetic everywhere | Always have a dim_date |
| Overly normalized dimensions | Snowflake, slow queries | Denormalize for the star |
| Updates that lose history | Past facts become wrong | Use SCD Type 2 |
| Including non-additive measures unmarked | Wrong SUMs | Note semi/non-additive fields explicitly |

---

## 🧠 Mental Model

```
FACT TABLE (center):
  - One row per [grain]
  - Numeric measurements you'll aggregate
  - Foreign keys to dimensions

DIMENSION TABLES (points of the star):
  - One row per item being described
  - Descriptive text/categorical data
  - Often denormalized

ALWAYS:
  1. Declare the grain in writing first
  2. Always include dim_date
  3. Star (not snowflake) for most cases
  4. SCD Type 2 if history matters
```

---

## 📝 Check Your Understanding

1. **Define:** What is the "grain" of a fact table and why does it matter?
2. **Predict:** Which table holds the customer name in a star schema — fact or dim?
3. **Find the bug:**
   ```
   fact_orders: date, customer_name, country, amount
   ```
   What's wrong with this design?
4. **Write it:** Design a star schema for "user logins by country by hour."
5. **Apply it:** Sketch the Learning OS analytics star schema.
6. **Reflect:** Why does OLAP duplicate data on purpose, when OLTP works so hard to avoid duplication?
