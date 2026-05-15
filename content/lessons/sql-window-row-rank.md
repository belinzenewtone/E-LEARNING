# Window Functions: ROW_NUMBER & RANK

## 🎯 By End of This Lesson You Will:
- Explain what a window function is and how it differs from GROUP BY
- Use `ROW_NUMBER`, `RANK`, and `DENSE_RANK` to number/rank rows
- Use `PARTITION BY` to rank within groups

---

## 🌍 Real-World Analogy First

Imagine a class with 30 students. You want to:
- Give each student their **rank in the class** by exam score
- Give each student their **rank in their study group**
- Show each student **how far they are from the class average**

`GROUP BY` collapses the class into summary numbers — losing each student.  
**Window functions** let you compute group statistics WHILE keeping every row visible.

```
GROUP BY  →  one row per group (summary)
WINDOW    →  every row kept, with group calculations attached
```

This is one of SQL's most powerful features — and what data engineers reach for daily.

---

## 🗃️ Practice Data

```
sales:
┌─────────┬──────────┬──────────┬─────────┐
│ region  │  rep     │  amount  │  date   │
├─────────┼──────────┼──────────┼─────────┤
│ East    │ Alice    │  5000    │ Mar-01  │
│ East    │ Belinze  │  7000    │ Mar-02  │
│ East    │ Carol    │  3000    │ Mar-03  │
│ West    │ Dave     │  9000    │ Mar-01  │
│ West    │ Eve      │  4000    │ Mar-02  │
│ West    │ Frank    │  6000    │ Mar-03  │
└─────────┴──────────┴──────────┴─────────┘
```

---

## 📖 Start From Zero

### `ROW_NUMBER()` — Give Each Row a Position

```sql
SELECT
  rep,
  amount,
  ROW_NUMBER() OVER (ORDER BY amount DESC) AS rank_position
FROM sales;
```

Result:
```
rep        amount   rank_position
─────────  ──────   ─────────────
Dave        9000          1
Belinze     7000          2
Frank       6000          3
Alice       5000          4
Eve         4000          5
Carol       3000          6
```

Reading the syntax:
- `ROW_NUMBER()` — the window function
- `OVER (...)` — defines the "window" of rows to operate on
- `ORDER BY amount DESC` — orders rows within the window

---

## 🔨 Level Up

### Step 1: PARTITION BY — Rank WITHIN Groups

```sql
SELECT
  region,
  rep,
  amount,
  ROW_NUMBER() OVER (PARTITION BY region ORDER BY amount DESC) AS rank_in_region
FROM sales;
```

Result (rank restarts within each region):
```
region   rep        amount   rank_in_region
───────  ─────────  ──────   ──────────────
East     Belinze     7000          1
East     Alice       5000          2
East     Carol       3000          3
West     Dave        9000          1   ← rank starts over
West     Frank       6000          2
West     Eve         4000          3
```

`PARTITION BY region` = "treat each region as its own group for ranking."

---

### Step 2: RANK vs DENSE_RANK vs ROW_NUMBER

When there are ties, the three behave differently:

```sql
-- Test data with ties:
-- Alice: 100, Bob: 100, Carol: 95, Dave: 90

SELECT
  name,
  score,
  ROW_NUMBER() OVER (ORDER BY score DESC) AS row_num,
  RANK() OVER (ORDER BY score DESC) AS rank_with_gaps,
  DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank
FROM scores;
```

Result:
```
name     score  row_num  rank_with_gaps  dense_rank
─────    ─────  ───────  ──────────────  ──────────
Alice     100      1           1             1
Bob       100      2           1             1
Carol      95      3           3             2    ← RANK skips 2
Dave       90      4           4             3
```

```
ROW_NUMBER  — always unique, ignores ties
RANK        — ties get same number, then SKIPS (1, 1, 3, 4)
DENSE_RANK  — ties get same number, NO skips (1, 1, 2, 3)
```

**When to use each:**
- `ROW_NUMBER` — need a unique sequence number (e.g., pagination)
- `RANK` — Olympics-style (two silvers, then directly to 4th place)
- `DENSE_RANK` — university grading (no gaps between ranks)

---

### Step 3: Top N Per Group (Classic Pattern)

A common question: "Top 2 sales reps in each region."

```sql
SELECT *
FROM (
  SELECT
    region, rep, amount,
    ROW_NUMBER() OVER (PARTITION BY region ORDER BY amount DESC) AS rn
  FROM sales
) ranked
WHERE rn <= 2;
```

Result:
```
region   rep        amount   rn
───────  ─────────  ──────   ──
East     Belinze     7000     1
East     Alice       5000     2
West     Dave        9000     1
West     Frank       6000     2
```

This pattern is used everywhere in analytics — leaderboards, top products per category, latest order per customer, etc.

---

### Step 4: NTILE — Distribute into N Buckets

```sql
SELECT
  rep, amount,
  NTILE(4) OVER (ORDER BY amount DESC) AS quartile
FROM sales;
```

Result:
```
rep        amount   quartile
─────────  ──────   ────────
Dave        9000        1     ← top 25%
Belinze     7000        1
Frank       6000        2
Alice       5000        2
Eve         4000        3
Carol       3000        4     ← bottom 25%
```

Useful for percentile/quartile/decile analysis.

---

### Step 5: Combining Window with Other Aggregates

```sql
SELECT
  rep,
  region,
  amount,
  -- Each row's amount
  amount,
  -- Group's average (window aggregate)
  AVG(amount) OVER (PARTITION BY region) AS region_avg,
  -- This row's amount vs region average
  amount - AVG(amount) OVER (PARTITION BY region) AS above_avg
FROM sales;
```

Every row is kept, AND you can see the regional average alongside it. GROUP BY can't do this — it collapses rows.

---

### Step 6: GROUP BY vs Window — Side by Side

```sql
-- GROUP BY: collapse into one row per group
SELECT region, AVG(amount) FROM sales GROUP BY region;
-- Result: 2 rows (one per region)

-- Window: keep ALL rows, attach group avg to each
SELECT rep, region, amount,
       AVG(amount) OVER (PARTITION BY region) AS region_avg
FROM sales;
-- Result: 6 rows (all original) with extra column
```

Use whichever fits your question:
- "What's the average?" → GROUP BY
- "How does each row compare to its group's average?" → Window

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Basic ROW_NUMBER:**
```sql
-- Number every sale 1..6, ordered by amount descending
```

**Exercise 2 — PARTITION BY:**
```sql
-- Number sales 1..N within each region, by amount descending
```

**Exercise 3 — Top 1 per region:**
```sql
-- Show only the top-selling rep in each region
```

**Exercise 4 — Top 2 per region:**
```sql
-- Show the top 2 reps in each region (use the subquery + WHERE rn <= 2 pattern)
```

**Exercise 5 — RANK with ties:**
```sql
-- Imagine reps have these amounts:
-- Alice 100, Bob 100, Carol 90, Dave 80
-- Predict what ROW_NUMBER, RANK, DENSE_RANK would each show
-- Then run it (create the data if you can)
```

**Exercise 6 — Quartile:**
```sql
-- Divide sales reps into 4 quartiles by amount using NTILE(4)
```

**Exercise 7 — Compare to group average:**
```sql
-- Show each sale with its region's average sale amount as an extra column
```

**Exercise 8 — Real question:**
```sql
-- "Which rep is the highest seller in their region — and by how much more than #2?"
-- Hint: combine ranking with LAG (next lesson)
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Window without ORDER BY | Order is undefined | Always ORDER BY inside OVER for ranking |
| Using ROW_NUMBER for "rank with ties" | Ties get different numbers | Use RANK or DENSE_RANK |
| Filtering with WHERE on a window result | Can't filter window in same query | Wrap in subquery/CTE, then WHERE |
| Forgetting PARTITION BY | Ranks across all rows globally | Add PARTITION BY for per-group ranking |
| Confusing window with GROUP BY | Wrong row count | Window keeps rows; GROUP BY collapses |

---

## 🧠 Mental Model

```
function() OVER (
  PARTITION BY column   ← split rows into groups
  ORDER BY column       ← order within each group
)

ROW_NUMBER  → 1, 2, 3, 4, 5 (always unique)
RANK        → 1, 1, 3, 4, 5 (ties skip)
DENSE_RANK  → 1, 1, 2, 3, 4 (no skips)
NTILE(N)    → split into N buckets

Window functions = "keep every row, but add a group-aware column"
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between `ROW_NUMBER`, `RANK`, and `DENSE_RANK`?
2. **Predict:** With our sales table, what does this return?
   ```sql
   SELECT rep, amount,
          ROW_NUMBER() OVER (ORDER BY amount DESC) AS rn
   FROM sales;
   ```
3. **Find the bug:**
   ```sql
   SELECT rep, ROW_NUMBER() OVER () AS rn FROM sales;
   -- What's missing? What's the result?
   ```
4. **Write it:** Find the top 3 sales by amount within each region.
5. **Apply it:** You have a leaderboard with users and XP. Write a query showing top 10 users along with their rank (ties allowed).
6. **Reflect:** When would you choose a window function over GROUP BY? Give a real business question.
