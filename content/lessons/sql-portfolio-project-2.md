# SQL Portfolio Project 2: Learning Analytics Schema

## Why This Matters

Designing a schema for your own Learning OS is the ultimate test of everything you've learned. You're not working with a made-up dataset — you're building the database that powers your own learning platform. This project demonstrates data modeling skill in a way that generic tutorials never can.

## Project Specs

### Deliverables
1. A star schema design for learning analytics
2. CREATE TABLE statements (DDL) in PostgreSQL
3. An ERD or diagram of your schema
4. A design document explaining your decisions
5. Sample queries proving the schema works

### Requirements

Your star schema must include:

**Fact Tables** (at least one):
- `fact_study_sessions` — grain: one row per user per day per track
- Columns: study_date_id, user_id, track_id, total_minutes, sessions, xp_earned

**Dimension Tables** (at least three):
- `dim_date` — date attributes (day, week, month, quarter, year, is_weekday)
- `dim_user` — user attributes (name, email, signup_date, current_streak)
- `dim_track` — track attributes (name, slug, target_hours)
- `dim_lesson` — lesson attributes (title, difficulty, estimated_minutes)

### Design Document Requirements

Answer these questions:
1. What is the grain of your fact table and why?
2. Which dimensions are SCD Type 1 vs Type 2?
3. What indexes would you add for common queries?
4. What aggregations would you pre-compute?
5. How does this schema differ from your OLTP schema?

### Sample Queries

Write 5 queries that prove your schema works:
1. Total study minutes by track and month
2. Average XP per day, with 7-day moving average
3. Weekly completion rate by module
4. Top 5 most active days with study session count
5. Year-over-year comparison (if you have enough data)

### Reflection

Document:
1. What were the hardest design decisions?
2. What would you do differently with more time?
3. What surprised you about schema design?
4. How does this project demonstrate your data engineering skills?

## Checkpoint

1. What is the grain of your fact table?
2. Which dimension is most complex and why?
3. Write a sample query from your schema.
4. **Reflection**: What was the hardest design decision in your schema?
