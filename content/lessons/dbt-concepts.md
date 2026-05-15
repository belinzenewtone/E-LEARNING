# dbt Concepts: Transform in the Warehouse

## 🎯 By End of This Lesson You Will:
- Explain what dbt is and why it's standard for transformations
- Write models, refs, tests, and seeds
- Use incremental models and macros for production patterns

---

## 🌍 Real-World Analogy First

dbt is like **version control + automated testing for your SQL**:

```
Without dbt:
  Analysts write ad-hoc SQL queries
  No tests
  No version control
  No documentation
  Same logic copied across 5 dashboards

With dbt:
  Each transform = a .sql file in Git
  Tests run on every change
  Dependencies tracked automatically
  Auto-generated docs
  Single source of truth
```

dbt brings software engineering discipline to analytics SQL — and changed the industry permanently.

---

## 📖 Start From Zero

### What dbt Does

```
RAW data in warehouse  →  dbt models (SQL files)  →  CLEAN tables/views
```

dbt:
1. Reads `.sql` files from your project
2. Compiles them into runnable SQL
3. Executes them in dependency order
4. Materializes results as tables/views
5. Runs tests to verify correctness

You write transforms in pure SQL. dbt handles the plumbing.

---

## 🔨 Level Up

### Step 1: A dbt Model

```sql
-- models/stg_orders.sql
SELECT
  id AS order_id,
  customer_id,
  total_amount,
  CAST(created_at AS DATE) AS order_date,
  LOWER(status) AS status
FROM {{ source('stripe', 'orders') }}
WHERE status != 'test'
```

Save this file. Run `dbt run`. dbt:
1. Sees the file `stg_orders.sql`
2. Replaces `{{ source(...) }}` with the actual warehouse table path
3. Wraps it: `CREATE TABLE my_schema.stg_orders AS SELECT ...`
4. Executes against the warehouse

You just wrote a SQL file. dbt made it a table.

---

### Step 2: ref() — Reference Other Models

```sql
-- models/fct_revenue.sql
SELECT
  order_date,
  SUM(total_amount) AS daily_revenue
FROM {{ ref('stg_orders') }}
WHERE status = 'paid'
GROUP BY order_date
```

`{{ ref('stg_orders') }}` says: "depend on the stg_orders model."

dbt:
- Builds a dependency graph
- Runs stg_orders FIRST (every time fct_revenue needs to run)
- Replaces with the right table name based on environment (dev/staging/prod)

You never write fully-qualified table names. dbt does it.

---

### Step 3: The Three Layers (Convention)

```
models/
├── staging/        ← clean source data, 1-to-1 with sources
│   ├── stg_orders.sql
│   ├── stg_customers.sql
│   └── stg_products.sql
├── intermediate/   ← join, enrich, prepare (optional layer)
│   └── int_orders_enriched.sql
└── marts/          ← business-ready tables
    ├── fct_revenue.sql
    └── dim_customers.sql
```

dbt-recommended structure. Names follow conventions: `stg_*`, `int_*`, `fct_*`, `dim_*`.

---

### Step 4: Tests — Automatic Quality Checks

```yaml
# models/marts/schema.yml
version: 2

models:
  - name: fct_revenue
    columns:
      - name: order_date
        tests:
          - not_null
          - unique
      - name: daily_revenue
        tests:
          - not_null
```

Run `dbt test`. dbt:
- Compiles each test into a SQL query
- Runs them against the database
- Fails if any test returns rows

Built-in tests: `not_null`, `unique`, `accepted_values`, `relationships`.

Custom SQL tests:
```sql
-- tests/no_negative_revenue.sql
SELECT * FROM {{ ref('fct_revenue') }}
WHERE daily_revenue < 0
```

If this query returns ANY rows, the test fails.

---

### Step 5: Seeds — CSVs as Tables

```
seeds/
└── countries.csv
```

```csv
code,name,region
US,United States,Americas
KE,Kenya,Africa
```

`dbt seed` loads each CSV as a table. Useful for static reference data.

```sql
SELECT u.*, c.region
FROM {{ ref('stg_users') }} u
LEFT JOIN {{ ref('countries') }} c ON c.code = u.country_code
```

---

### Step 6: Materializations

```sql
{{ config(materialized='table') }}
SELECT ...

-- table: rebuild fully on each run (default for facts/marts)
-- view: just a query, computed on demand (fast to build, slow at runtime)
-- incremental: only process new/changed rows
-- ephemeral: not stored — inlined into downstream models
```

```sql
-- Incremental
{{ config(materialized='incremental', unique_key='id') }}

SELECT * FROM {{ source('stripe', 'events') }}
{% if is_incremental() %}
  WHERE created_at > (SELECT MAX(created_at) FROM {{ this }})
{% endif %}
```

First run: full build. Future runs: only new rows.

---

### Step 7: Macros — Reusable SQL

```sql
-- macros/cents_to_dollars.sql
{% macro cents_to_dollars(column_name) %}
  ({{ column_name }} / 100.0)::NUMERIC(10, 2)
{% endmacro %}
```

Use it:
```sql
SELECT
  {{ cents_to_dollars('amount_cents') }} AS amount_dollars
FROM stg_orders
```

Macros are SQL templates with parameters. Used to dry up repeated logic.

---

### Step 8: Documentation

```yaml
models:
  - name: fct_revenue
    description: "Daily revenue per region"
    columns:
      - name: order_date
        description: "Calendar date of the order"
```

Run `dbt docs generate && dbt docs serve` → an interactive website with:
- Every model and column described
- Lineage graphs showing how models depend on each other
- Test results
- SQL behind each model

Best of all: it's generated FROM your code, so it's always up to date.

---

### Step 9: Production Flow

```
1. Developer writes/edits a model in branch
2. CI runs: dbt build (run + test) on a test schema
3. Pull request merged
4. Production run: scheduled via Airflow / dbt Cloud
5. Tests run after every production run
6. Stakeholders see fresh data in their dashboards
```

dbt + dbt Cloud (or dbt-core + Airflow) is the typical production stack.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Create a model:**
```sql
-- Create stg_users.sql that:
-- - selects from source('app', 'users')
-- - renames id to user_id
-- - converts email to lowercase
-- - excludes deleted users
```

**Exercise 2 — ref it:**
```sql
-- Create fct_active_users.sql that counts active users per day
-- Use {{ ref('stg_users') }}
```

**Exercise 3 — Tests:**
```yaml
# Write schema.yml tests for stg_users:
# - user_id is unique and not_null
# - email is not_null
# - status is one of ["active", "suspended", "deleted"]
```

**Exercise 4 — Seed:**
```csv
# Create seeds/track_codes.csv with track codes + names
# Use {{ ref('track_codes') }} in a model
```

**Exercise 5 — Materialization:**
```sql
-- Convert a slow daily aggregation into an incremental model
-- Use unique_key and is_incremental()
```

**Exercise 6 — Macro:**
```sql
-- Write a macro: format_currency(amount, currency_code)
-- Returns "$1,234.56" for USD, "Ksh 1,234.56" for KES
```

**Exercise 7 — Real project:**
```
Outline a dbt project structure for Learning OS:
- Which sources?
- Which staging models?
- Which marts (fct/dim)?
- What tests would be critical?
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Skipping `{{ ref() }}` | Hardcoded names break across environments | Always use `ref()` |
| No tests | Silent data quality issues | Add `not_null` + `unique` minimum |
| Big SELECT * in staging | Slow, costly | Select only needed columns |
| Forgetting to seed reference data | Missing joins | `dbt seed` before `dbt run` |
| Long ad-hoc SQL outside dbt | Goes stale, untested | Move all transformations into dbt |

---

## 🧠 Mental Model

```
dbt = SQL files + Jinja templating + DAG + tests

Files:
  models/ → SELECT statements that become tables/views
  tests/  → SELECT statements that should return 0 rows
  seeds/  → static CSVs loaded as tables
  macros/ → reusable SQL templates

Commands:
  dbt run    → build all models
  dbt test   → run all tests
  dbt build  → run + test + seed
  dbt docs   → generate documentation site

dbt brings SOFTWARE practices (Git, tests, docs) to analytics.
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between `{{ source() }}` and `{{ ref() }}`?
2. **Predict:** What happens when you change `stg_orders.sql` and run `dbt build`?
3. **Find the bug:**
   ```sql
   SELECT * FROM analytics.stg_orders
   ```
   Why is this problematic in a dbt project?
4. **Write it:** A dbt model `fct_daily_xp` aggregating xp_events per user per day.
5. **Apply it:** Sketch a dbt project for the Learning OS analytics — what models live where?
6. **Reflect:** Why did dbt become so popular so fast? What did it solve that data teams needed?
