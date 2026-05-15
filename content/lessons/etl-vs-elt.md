# ETL vs ELT Patterns

## 🎯 By End of This Lesson You Will:
- Distinguish ETL from ELT
- Identify which to use for a given data project
- Recognize modern data pipeline architecture

---

## 🌍 Real-World Analogy First

You're moving from one house to another. Two strategies:

```
ETL = Transform first, then load
  Pack & sort everything into labelled boxes at OLD HOUSE
  → Move sorted boxes → put away in NEW HOUSE
  Pro: arrival is tidy
  Con: takes longer to start moving

ELT = Load first, then transform
  Throw everything into a truck
  → Move it all → sort & put away in NEW HOUSE
  Pro: started moving immediately
  Con: need space at destination to sort
```

Modern data teams overwhelmingly choose **ELT** — they "throw it all in" the warehouse and clean it up there.

---

## 📖 Start From Zero

### ETL — The Classic Way

```
SOURCE → [extract] → STAGING (transform) → WAREHOUSE (clean, ready)
```

Steps:
1. **Extract** from sources (databases, APIs, files)
2. **Transform** outside the warehouse (Python scripts, dedicated tools)
3. **Load** the clean result into the warehouse

This was standard before ~2015. Warehouses were expensive and slow; you didn't want to put raw data in them.

---

### ELT — The Modern Way

```
SOURCE → [extract] → WAREHOUSE (raw) → [transform with SQL/dbt] → WAREHOUSE (clean)
```

Steps:
1. **Extract** from sources
2. **Load** raw data directly into the warehouse
3. **Transform** inside the warehouse using SQL

Modern cloud warehouses (BigQuery, Snowflake) make this faster AND cheaper. You can keep raw data forever and re-transform anytime.

---

## 🔨 Level Up

### Step 1: Why ELT Won

**ETL drawbacks:**
- Transform logic lives in scripts → hard to test, hard to share
- Raw data not preserved → can't reprocess later
- Slow to onboard new sources

**ELT benefits:**
- Raw data preserved → reprocess anytime
- Transforms in SQL → simpler, more maintainable
- Tools like **dbt** make transformations modular and tested
- Cloud warehouses are powerful enough to handle it

---

### Step 2: A Typical Modern Pipeline

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Sources     │   │   Loader     │   │  Warehouse   │   │  dbt (SQL)   │
│              │ → │  (Airbyte,   │ → │  (BigQuery,  │ → │  Transforms  │
│  Postgres,   │   │  Fivetran)   │   │  Snowflake)  │   │  to clean    │
│  Stripe,     │   │              │   │  raw schema  │   │  marts       │
│  Shopify     │   │              │   │              │   │              │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

- **Sources** → operational databases, SaaS APIs
- **Loader** → tools that handle "extract + load" for you (Airbyte, Fivetran, Stitch)
- **Warehouse** → cloud columnar storage
- **dbt** → SQL-based transformations into "data marts" (clean reporting tables)

You don't write extract code anymore — managed connectors handle it. Your job is the transformations.

---

### Step 3: Raw → Staging → Marts

Modern projects typically have 3 layers:

```
raw                staging              marts
─────              ────────              ──────
1-to-1 from        light cleaning        business-ready
source             rename, cast          aggregated by use case
(don't touch       fix types             "daily_active_users"
manually)          dedupe                 "monthly_revenue_per_country"
```

```sql
-- raw layer (loaded as-is)
raw_orders: { JSON columns straight from Stripe }

-- staging (clean field names, types)
stg_orders: { order_id, customer_id, amount_usd, created_at }

-- marts (analytics-ready)
fct_orders: { date_id, customer_id, country, total }
dim_customers: { id, name, country, signup_date, lifetime_value }
```

dbt makes this layering structure standard.

---

### Step 4: Idempotency — Re-Run Safely

A pipeline run should be **idempotent**: running it twice gives the same result as once.

```
NOT idempotent: APPEND new rows blindly
  → run twice = duplicates

Idempotent: TRUNCATE + INSERT for the partition
  → run twice = same result

OR
Idempotent: INSERT only rows that don't exist (UPSERT)
  → run twice = same result
```

Idempotent pipelines are easier to fix when failures happen at 3 AM.

---

### Step 5: Incremental vs Full Refresh

```
Full refresh:    Rebuild entire table every run
                 Simple. Slow for big tables.

Incremental:     Only process new/changed rows
                 Faster. Trickier to get right.
```

dbt makes incremental models easy:
```sql
{{ config(materialized='incremental', unique_key='id') }}

SELECT * FROM raw.orders
{% if is_incremental() %}
  WHERE created_at > (SELECT MAX(created_at) FROM {{ this }})
{% endif %}
```

---

### Step 6: Reverse ETL (Bonus)

Once data is in the warehouse, sometimes you push it BACK out to operational tools:

```
Warehouse → CRM (HubSpot)
Warehouse → Marketing (Customer.io)
Warehouse → Support (Zendesk)
```

This is called **reverse ETL** — taking enriched data back to where teams use it.

Tools: Hightouch, Census.

---

### Step 7: Choosing ETL vs ELT in 2026

```
Use ELT when:
  - Cloud warehouse (BigQuery, Snowflake)
  - Many sources with managed connectors available
  - Modern team using dbt
  → 95% of cases

Use ETL when:
  - Highly regulated data that can't enter warehouse raw
  - Massive transformations that exceed warehouse cost budget
  - On-prem legacy environments
  → niche cases
```

Default to ELT. Switch to ETL only with a specific reason.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Identify pattern:**
```
For each, ETL or ELT?
1. Python script reads Postgres → cleans data → writes to S3 Parquet
2. Airbyte loads Stripe → BigQuery raw schema → dbt transforms
3. Fivetran loads Salesforce → Snowflake → analyst writes SQL in dbt
```

**Exercise 2 — Design pipeline:**
```
Outline a modern ELT pipeline for a SaaS company:
- Sources: app database + Stripe + HubSpot
- Goal: unified analytics in Snowflake
```

**Exercise 3 — Layering:**
```
For "raw → staging → marts":
- raw_users from Stripe webhook
- What lives in stg_users? In dim_users?
```

**Exercise 4 — Idempotency:**
```
A pipeline appends new rows daily. Run twice by mistake → duplicates.
How would you make it idempotent?
```

**Exercise 5 — Incremental model:**
```
You have 500M historical rows in raw_events.
Design an incremental dbt model that only processes new rows.
```

**Exercise 6 — Reverse ETL scenario:**
```
You computed "customer health score" in the warehouse.
Where might you push it for the team to act on?
```

**Exercise 7 — Tool selection:**
```
For a startup with 5 sources and basic Postgres + BigQuery setup, recommend:
- Extract/Load tool: ?
- Transform tool: ?
- Warehouse: ?
Justify each choice in 1 sentence.
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Transforming before loading (in 2026) | Slower, harder to test | Use ELT — transform in warehouse with SQL |
| No raw layer | Can't re-process | Always keep raw immutable |
| Non-idempotent pipelines | Duplicates / data loss on re-run | Design for re-runs from day one |
| Skipping staging layer | Marts contain typos and renames | Clean in staging first |
| Manual SQL for transforms | Untested, hard to maintain | Use dbt for repeatable, testable transforms |

---

## 🧠 Mental Model

```
ELT pipeline:
  Sources → Load tool → Warehouse (RAW) → dbt → Warehouse (CLEAN)
                                              ↓
                                          Reverse ETL → Tools

Three layers:
  raw      — untouched from source
  staging  — typed, renamed, light cleaning
  marts    — business-ready aggregates

Idempotent + Incremental = production-grade pipelines
```

---

## 📝 Check Your Understanding

1. **Define:** What's the key difference between ETL and ELT?
2. **Predict:** A daily pipeline runs twice by mistake. What's the impact on a non-idempotent pipeline?
3. **Find the bug:** A teammate writes:
   ```python
   stripe_data.transform_in_python().save_to_csv().load_to_warehouse()
   ```
   What pattern is this? Why might it be suboptimal in 2026?
4. **Write it:** Outline an ELT pipeline for a Learning OS metrics platform.
5. **Apply it:** Design how you'd extract daily learning data into a warehouse + a daily summary table.
6. **Reflect:** What changed in the 2010s that made ELT viable when ETL had been standard for decades?
