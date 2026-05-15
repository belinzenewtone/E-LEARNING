# Data Quality: Checks & Assertions

## 🎯 By End of This Lesson You Will:
- Define common data quality dimensions
- Write SQL checks for common quality issues
- Use dbt tests to enforce quality automatically

---

## 🌍 Real-World Analogy First

A factory has **quality control inspectors** who check products before shipping:

```
"Does it have all the parts?" → completeness
"Is the wood the right type?" → validity  
"Is the size correct?"        → accuracy
"Did we make 100 today?"      → volume
"Same as yesterday's?"        → consistency
```

Data quality checks do the same for your data. Without them, bad data flows downstream and corrupts dashboards, reports, and decisions.

---

## 📖 Start From Zero

### The 6 Data Quality Dimensions

| Dimension | Question |
|---|---|
| **Completeness** | Are required fields populated? |
| **Uniqueness** | Are duplicates absent where they shouldn't exist? |
| **Validity** | Do values conform to expected formats/ranges? |
| **Consistency** | Does the same data agree across sources? |
| **Accuracy** | Does it reflect reality? |
| **Timeliness** | Is the data fresh? |

Every check you write addresses one of these.

---

## 🔨 Level Up

### Step 1: Completeness Checks

```sql
-- How many rows have missing user_id?
SELECT COUNT(*) AS missing_user
FROM orders
WHERE user_id IS NULL;

-- Should be 0 — alert if > 0
```

### Step 2: Uniqueness Checks

```sql
-- Are there duplicate order IDs?
SELECT id, COUNT(*) AS occurrences
FROM orders
GROUP BY id
HAVING COUNT(*) > 1;

-- Should return zero rows
```

### Step 3: Validity Checks

```sql
-- Are amounts positive?
SELECT COUNT(*) AS invalid_amount
FROM orders
WHERE amount <= 0;

-- Are emails formatted reasonably?
SELECT COUNT(*) AS invalid_email
FROM users
WHERE email NOT LIKE '%_@_%._%';

-- Is status in the valid set?
SELECT COUNT(*) AS invalid_status
FROM orders
WHERE status NOT IN ('pending', 'paid', 'cancelled', 'refunded');
```

### Step 4: Consistency Checks

```sql
-- Do order totals match the sum of line items?
SELECT
  o.id,
  o.total AS order_total,
  SUM(oi.quantity * oi.unit_price) AS computed_total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, o.total
HAVING o.total != SUM(oi.quantity * oi.unit_price);
```

### Step 5: Volume Checks

```sql
-- Sudden drop in daily volume?
WITH counts AS (
  SELECT DATE(created_at) AS day, COUNT(*) AS rows
  FROM events
  GROUP BY DATE(created_at)
)
SELECT *
FROM counts
WHERE rows < (SELECT AVG(rows) * 0.5 FROM counts);
-- Days with less than 50% of average volume
```

### Step 6: Timeliness Checks

```sql
-- How fresh is the data?
SELECT
  MAX(created_at) AS latest_event,
  EXTRACT(EPOCH FROM (NOW() - MAX(created_at))) / 60 AS minutes_old
FROM events;

-- Alert if no event in the last 60 minutes
```

---

### Step 7: dbt Tests — Codify Your Checks

In dbt, tests are reusable assertions:

```yaml
# schema.yml
version: 2
models:
  - name: orders
    columns:
      - name: id
        tests:
          - unique
          - not_null
      - name: amount
        tests:
          - not_null
      - name: status
        tests:
          - accepted_values:
              values: ['pending', 'paid', 'cancelled', 'refunded']
```

Run them:
```bash
dbt test
# Each test runs as a SQL query — should return 0 rows
# If it returns any rows, the test fails
```

Custom tests:
```sql
-- tests/positive_amounts.sql
SELECT * FROM {{ ref('orders') }}
WHERE amount <= 0
```

---

### Step 8: Alerts and Monitoring

A check is useless if no one looks at it. Common patterns:

```
1. Run all checks after every pipeline run
2. Fail the pipeline if any check fails
3. Send alert (Slack/email) to data team
4. Show check status on a dashboard

Tools:
  - dbt-cloud + dbt tests
  - Elementary, re_data — open source observability
  - Great Expectations — Python-based assertions
```

The goal: **catch bad data before it reaches dashboards**.

---

### Step 9: A Quality Check Pattern

```sql
-- Reusable pattern: each check returns rows ONLY when failing

-- Check 1: no nulls in critical columns
SELECT 'orders.user_id_null' AS check_name, COUNT(*) AS failures
FROM orders WHERE user_id IS NULL
HAVING COUNT(*) > 0

UNION ALL

-- Check 2: no duplicates
SELECT 'orders.duplicate_ids', COUNT(*)
FROM (SELECT id FROM orders GROUP BY id HAVING COUNT(*) > 1) dups
HAVING COUNT(*) > 0

UNION ALL

-- Check 3: amounts positive
SELECT 'orders.negative_amount', COUNT(*)
FROM orders WHERE amount <= 0
HAVING COUNT(*) > 0;
```

Run this. If it returns rows → something failed. Easy to integrate into any orchestrator.

---

### Step 10: A "Data Quality SLO"

For mature teams, set explicit Service Level Objectives:

```
Daily orders fact table:
  - Freshness: max 2 hours behind source
  - Completeness: < 0.1% missing user_id
  - Validity: < 0.01% rows fail status check
  - Volume: within 20% of 7-day moving average
```

When a check breaches the SLO, someone is paged.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Completeness:**
```sql
-- Write a check for: every row in study_logs has a user_id
```

**Exercise 2 — Uniqueness:**
```sql
-- Check for duplicate user emails
```

**Exercise 3 — Validity:**
```sql
-- Check that minutes in study_logs is between 1 and 600
```

**Exercise 4 — Consistency:**
```sql
-- Check that user.total_xp = SUM(xp_events.amount) for that user
```

**Exercise 5 — Volume:**
```sql
-- Check that today's events count is within 50%-150% of 7-day average
```

**Exercise 6 — dbt test:**
```yaml
# Write a dbt schema.yml with tests for the study_logs table
```

**Exercise 7 — Build a dashboard:**
```
Pick 5 critical data quality checks for Learning OS.
Outline what each checks, what passes, what fails, and the alert action.
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Running checks but ignoring results | Bad data still flows | Wire alerts to actionable channels |
| Only checking on demand | Issues found too late | Run after every pipeline |
| Overly strict checks | False alarms, ignored | Set sensible thresholds |
| No volume / freshness checks | Silent data outages | Always check volume + freshness |
| Tests only on production | Issues in dev → production | Run tests in CI too |

---

## 🧠 Mental Model

```
6 dimensions:
  Completeness, Uniqueness, Validity, Consistency, Accuracy, Timeliness

Pattern:
  Every check is a SQL query that returns ROWS on failure.
  Pipeline runs all checks → fails / alerts on bad rows.

Tools:
  dbt tests for column-level assertions
  Custom SQL for business rules
  Great Expectations / Elementary for richer observability
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between completeness and validity?
2. **Predict:** What does this check fail on?
   ```sql
   SELECT * FROM orders WHERE amount <= 0;
   ```
3. **Find the bug:** A pipeline appends to a fact table. Quality checks pass but rows are duplicated. What's missing?
4. **Write it:** A SQL check that confirms every order has at least one order item.
5. **Apply it:** Define 5 quality checks for your Learning OS study_logs table.
6. **Reflect:** Why do data teams who skip quality checks always regret it? Give 2 concrete bad outcomes.
