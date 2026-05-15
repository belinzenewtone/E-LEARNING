# Window Functions: LAG, LEAD & SUM OVER

## 🎯 By End of This Lesson You Will:
- Use `LAG` and `LEAD` to access previous/next row values
- Calculate running totals with `SUM() OVER`
- Use `ROWS BETWEEN` to control window frames

---

## 🌍 Real-World Analogy First

Imagine your monthly bank statement:

```
Date         Deposit/Withdraw   Running Balance
─────────    ────────────────   ───────────────
Jan 1        +1000              1000
Jan 5        -200                800
Jan 10       +500               1300
Jan 15       -100               1200
```

The running balance on each line **depends on what was on the line before**. That's what `LAG` (look at previous row) and `SUM() OVER` (running totals) compute.

These functions answer the questions:
- "What changed from yesterday?" → LAG
- "How does this compare to last month?" → LAG
- "What's our cumulative total so far?" → SUM OVER
- "What's the next event after this?" → LEAD

---

## 🗃️ Practice Data

```
daily_xp:
┌──────────┬────────┐
│   date   │   xp   │
├──────────┼────────┤
│ 2026-05-01│   30  │
│ 2026-05-02│   50  │
│ 2026-05-03│   40  │
│ 2026-05-04│   80  │
│ 2026-05-05│   20  │
│ 2026-05-06│   90  │
└──────────┴────────┘
```

---

## 📖 Start From Zero

### `LAG` — Look at the Previous Row

```sql
SELECT
  date,
  xp,
  LAG(xp) OVER (ORDER BY date) AS previous_day_xp
FROM daily_xp;
```

Result:
```
date         xp    previous_day_xp
──────────  ───   ───────────────
2026-05-01   30      NULL          ← no previous day
2026-05-02   50       30
2026-05-03   40       50
2026-05-04   80       40
2026-05-05   20       80
2026-05-06   90       20
```

`LAG(column)` says: "for each row, also show me the value from the row before (in ORDER BY order)."

---

## 🔨 Level Up

### Step 1: Day-Over-Day Difference

```sql
SELECT
  date,
  xp,
  xp - LAG(xp) OVER (ORDER BY date) AS change_from_yesterday
FROM daily_xp;
```

Result:
```
date         xp    change
──────────  ───   ──────
2026-05-01   30    NULL
2026-05-02   50    +20
2026-05-03   40    -10
2026-05-04   80    +40
2026-05-05   20    -60
2026-05-06   90    +70
```

This is THE pattern for week-over-week, month-over-month, or year-over-year analysis.

---

### Step 2: LEAD — Look at the Next Row

```sql
SELECT
  date,
  xp,
  LEAD(xp) OVER (ORDER BY date) AS next_day_xp
FROM daily_xp;
```

Result:
```
date         xp    next_day_xp
──────────  ───   ───────────
2026-05-01   30        50
2026-05-02   50        40
2026-05-03   40        80
2026-05-04   80        20
2026-05-05   20        90
2026-05-06   90      NULL    ← no next day
```

Useful for things like "how long until the user's next action" or "next status change."

---

### Step 3: LAG/LEAD with Offset and Default

```sql
SELECT
  date,
  xp,
  LAG(xp, 1) OVER (ORDER BY date) AS yesterday,     -- default offset=1
  LAG(xp, 7) OVER (ORDER BY date) AS last_week,     -- 7 rows back
  LAG(xp, 1, 0) OVER (ORDER BY date) AS yest_or_0   -- default 0 if no row
FROM daily_xp;
```

`LAG(column, offset, default)` lets you control:
- How far back to look (offset)
- What to return if there is no such row (default — instead of NULL)

---

### Step 4: Running Total with SUM() OVER

```sql
SELECT
  date,
  xp,
  SUM(xp) OVER (ORDER BY date) AS running_total
FROM daily_xp;
```

Result:
```
date         xp    running_total
──────────  ───   ─────────────
2026-05-01   30       30
2026-05-02   50       80
2026-05-03   40      120
2026-05-04   80      200
2026-05-05   20      220
2026-05-06   90      310
```

The running total is "sum of all rows up to and including this one (in date order)."

---

### Step 5: Per-Group Running Total with PARTITION BY

```sql
-- Imagine xp data has a user_id column too
SELECT
  user_id,
  date,
  xp,
  SUM(xp) OVER (PARTITION BY user_id ORDER BY date) AS user_running_xp
FROM xp_log;
```

The running total restarts at the beginning of each user's history.

---

### Step 6: ROWS BETWEEN — Custom Window Frames

You can fine-tune which rows the window includes:

```sql
-- 3-day moving average (current + 2 previous)
SELECT
  date,
  xp,
  AVG(xp) OVER (
    ORDER BY date
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ) AS three_day_avg
FROM daily_xp;
```

Result:
```
date         xp    three_day_avg
──────────  ───   ─────────────
2026-05-01   30      30.00
2026-05-02   50      40.00     ← (30+50)/2
2026-05-03   40      40.00     ← (30+50+40)/3
2026-05-04   80      56.67     ← (50+40+80)/3
2026-05-05   20      46.67     ← (40+80+20)/3
2026-05-06   90      63.33     ← (80+20+90)/3
```

**Frame options:**
```
ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW   → running total (default for ORDER BY)
ROWS BETWEEN 2 PRECEDING AND CURRENT ROW          → 3-row moving window
ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING          → 3-row centered window
ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING  → tail-end sum
```

---

### Step 7: First and Last Value in Window

```sql
SELECT
  date,
  xp,
  FIRST_VALUE(xp) OVER (ORDER BY date) AS first_day_xp,
  LAST_VALUE(xp) OVER (
    ORDER BY date
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS last_day_xp
FROM daily_xp;
```

Get the first/last value of any column within the window. Useful for "did the value increase since the start?"

---

### Step 8: Real Pattern — Sessions and Gaps

You have a `study_logs` table and want to find the time between each user's sessions:

```sql
SELECT
  user_id,
  date,
  date - LAG(date) OVER (PARTITION BY user_id ORDER BY date) AS days_since_last
FROM study_logs;
```

If `days_since_last > 1`, the user skipped a day (streak broken). Powerful for streak/retention analysis.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — LAG basics:**
```sql
-- Show each date, xp, and the previous day's xp
```

**Exercise 2 — Day-over-day:**
```sql
-- Show the change in xp from the previous day
```

**Exercise 3 — LEAD:**
```sql
-- Show each date with the NEXT day's xp
```

**Exercise 4 — Running total:**
```sql
-- Show the cumulative XP earned to date
```

**Exercise 5 — Moving average:**
```sql
-- Compute a 3-day moving average of xp
```

**Exercise 6 — Per-user running total:**
```sql
-- Imagine an xp_log table with user_id, date, xp
-- Compute each user's running XP total
```

**Exercise 7 — Streak detection:**
```sql
-- Compute days_since_last_session for each row
-- Flag rows where days_since_last > 1 as "streak break"
```

**Exercise 8 — Year-over-year comparison:**
```sql
-- Given monthly revenue data spanning years, compute the % change
-- vs the same month last year
-- Hint: LAG(revenue, 12)
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| LAG without ORDER BY | Result is non-deterministic | Always specify ORDER BY in window |
| Calculating LAG over a unsorted column | Wrong "previous" row | Use the column you care about ordering |
| Forgetting NULL on first/last row | Calculation includes NULL | Use COALESCE or check for NULL |
| Using default LAST_VALUE | Default frame stops at current row | Specify UNBOUNDED FOLLOWING for the actual last |
| Confusing OVER scope | Window applies per-call | Each window function has its own OVER clause |

---

## 🧠 Mental Model

```
LAG(col, offset, default)  → look BACKWARDS
LEAD(col, offset, default) → look FORWARDS
SUM(col) OVER (...)        → running calculation
FIRST_VALUE / LAST_VALUE   → boundary values

Window frame:
  ROWS BETWEEN [n] PRECEDING AND [n] FOLLOWING
  Default with ORDER BY: UNBOUNDED PRECEDING to CURRENT ROW

These functions answer "compared to what came before/after" questions
WITHOUT collapsing rows like GROUP BY does.
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between `LAG` and `LEAD`?
2. **Predict:** What does this return for the 2nd row?
   ```sql
   SELECT date, xp, LAG(xp, 2) OVER (ORDER BY date) FROM daily_xp;
   ```
3. **Find the bug:**
   ```sql
   SELECT LAG(amount) OVER () FROM sales;
   -- What's wrong? Why might results be random?
   ```
4. **Write it:** Compute the daily change in XP. Show a `+` or `-` indicator column.
5. **Apply it:** For an `orders` table, calculate the time between each customer's consecutive orders (days_since_last_order).
6. **Reflect:** Window functions like LAG are how dashboards compute "WoW change" and "YoY growth." Why can't you do this with GROUP BY alone?
