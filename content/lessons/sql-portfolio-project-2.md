# SQL Portfolio Project 2: Learning Analytics Schema

## 🎯 By End of This Lesson You Will:
- Design a star schema for learning analytics
- Create fact and dimension tables in PostgreSQL
- Write analytical queries across your schema
- Document your design decisions

## 🌍 Real-World Analogy First

Your Learning OS has an operational database (transactions: log study, mark done). But for analytics — "how many hours per week per track?" — you need a different structure. It's like the difference between a cash register (item-by-item) and the end-of-day report (totals, trends). The star schema IS that report.

## 📖 Start From Zero

```sql
-- Fact table: one row per user per day per track
CREATE TABLE fact_study_sessions (
  date_id INTEGER REFERENCES dim_date(id),
  user_id INTEGER REFERENCES dim_user(id),
  track_id INTEGER REFERENCES dim_track(id),
  minutes INTEGER NOT NULL,
  sessions INTEGER DEFAULT 1,
  xp_earned INTEGER DEFAULT 0,
  PRIMARY KEY (date_id, user_id, track_id)
);

-- Dimension: dates
CREATE TABLE dim_date (
  id SERIAL PRIMARY KEY,
  full_date DATE NOT NULL,
  day_of_week TEXT,
  week_number INTEGER,
  month TEXT,
  is_weekday BOOLEAN
);
```

## 🔨 Level Up — Key Deliverables

1. **Star schema DDL** — CREATE TABLE statements for facts + 4 dimension tables
2. **ERD diagram** — Visual showing relationships
3. **Design document** — Explain your grain, SCD choices, indexes
4. **Sample queries** — 5 queries proving the schema works
5. **Portfolio README** — Professional documentation

## 🧪 Practice — Try Each Step

1. Define the grain of your fact table (one row = what?).
2. Design 3+ dimension tables that answer analytical questions.
3. Write CREATE TABLE statements with proper constraints.
4. Populate dim_date with a year's worth of dates.
5. Write queries: weekly study hours, XP by track, completion rate.
6. Add indexes for your most common queries.

## ⚠️ Common Mistakes

| Mistake | The Fix |
|---|---|
| Unclear grain | Write down: "one row = one user per day per track" |
| Too many dimensions | Start with 3-4 core dimensions; add more when needed |
| No indexes | Add indexes on foreign keys and date columns |
| Mixing grains | Every row in a fact table must represent the same thing |

## 🧠 Mental Model — One Sentence

Star schema: fact tables store measurements (minutes, XP), dimension tables describe the context (when, who, what track) — join them to answer any analytical question.

## 📝 Check Your Understanding

- **Define**: What is the "grain" of a fact table?
- **Write it**: Create a fact_daily_progress table with appropriate grain.
- **Apply it**: Design indexes for your 3 most common queries.
- **Reflect**: What was the hardest design decision in your schema?

## 🚀 What This Unlocks

Every data warehouse uses star schemas. This project proves you can design one — a skill that data engineering interviews test directly.
