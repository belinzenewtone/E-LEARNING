# INNER JOIN & LEFT JOIN

## Why This Matters

Real data lives in multiple tables. JOIN is how you combine them to answer questions that span tables — "Show me each student with their completed lessons" or "List orders with customer details." Without JOINs, you're limited to one table at a time.

## Core Concepts

### INNER JOIN — Only Matching Rows

```sql
-- Match lessons with their modules
SELECT
  lessons.title AS lesson_title,
  modules.title AS module_title
FROM lessons
INNER JOIN modules ON lessons.module_id = modules.id;
```

```
lessons                      modules
┌────┬──────────┬───────────┐  ┌────┬────────────────────┐
│ id │ title    │ module_id │  │ id │ title              │
├────┼──────────┼───────────┤  ├────┼────────────────────┤
│ 1  │ Variables│ 1         │  │ 1  │ JS Foundations     │
│ 2  │ Promises │ 1         │  │ 2  │ Advanced SQL       │
│ 3  │ CTEs     │ 2         │  └────┴────────────────────┘
└────┴──────────┴───────────┘

INNER JOIN result:
┌──────────────┬─────────────────┐
│ lesson_title │ module_title    │
├──────────────┼─────────────────┤
│ Variables    │ JS Foundations  │
│ Promises     │ JS Foundations  │
│ CTEs         │ Advanced SQL    │
└──────────────┴─────────────────┘
```

### LEFT JOIN — Keep All Left Rows

```sql
-- All lessons, even those without a module (shouldn't happen but shows the concept)
SELECT
  lessons.title,
  modules.title AS module_title
FROM lessons
LEFT JOIN modules ON lessons.module_id = modules.id;
```

An INNER JOIN drops rows without a match. A LEFT JOIN keeps all rows from the left table, filling unmatched columns with NULL.

### Visual Comparison

```
Table A: {1, 2, 3}     Table B: {2, 3, 4}

INNER JOIN: {2, 3}              — only what exists in both
LEFT JOIN:  {1, 2, 3}           — all of A, NULLs for unmatched B
RIGHT JOIN: {2, 3, 4}           — all of B, NULLs for unmatched A
FULL JOIN:  {1, 2, 3, 4}        — everything, NULLs where unmatched
```

### Joining Multiple Tables

```sql
-- User → Study Log → Track
SELECT
  users.name,
  study_logs.date,
  study_logs.minutes,
  tracks.name AS track_name
FROM study_logs
JOIN users ON study_logs.user_id = users.id
JOIN tracks ON study_logs.track_id = tracks.id
WHERE study_logs.date >= CURRENT_DATE - INTERVAL '7 days';
```

### Table Aliases

```sql
-- Cleaner with aliases
SELECT
  l.title AS lesson,
  m.title AS module,
  w.title AS week
FROM lessons l                 -- l is alias for lessons
JOIN modules m ON l.module_id = m.id
JOIN week_sprints w ON l.week_id = w.id
ORDER BY w.week_number, l.order;
```

## Try It Yourself

1. JOIN jobs with companies to show job title and company name.
2. Use LEFT JOIN to find users who haven't logged study time.
3. Join progress with lessons and modules to show completion status.
4. Write a 3-table JOIN: study_logs → users → tracks.

## Common Mistakes

- **Forgetting the ON clause**: `FROM a JOIN b` without ON creates a cross join (every row × every row).
- **INNER JOIN when you need LEFT**: If users without orders should still appear, use LEFT JOIN.
- **Ambiguous column names**: If both tables have `id`, use `lessons.id` to be explicit.

## Checkpoint

1. What does a LEFT JOIN return that INNER JOIN does not?
2. What happens if you forget the ON clause?
3. Write a JOIN query for your Learning OS data.
4. **Reflection**: When would you use LEFT JOIN over INNER JOIN?
