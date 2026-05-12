# dbt Concepts: Transform in the Warehouse

## Why This Matters

dbt (data build tool) revolutionized how data teams work. Instead of writing Python transformation scripts, you write SQL — and dbt handles dependency management, testing, documentation, and version control. It's the standard tool for the T in ELT.

## Core Concepts

### Models — SQL Files That Become Tables

```sql
-- models/daily_study_summary.sql
WITH logs AS (
  SELECT
    user_id,
    DATE(date) AS study_date,
    track_id,
    SUM(minutes) AS total_minutes,
    COUNT(*) AS sessions
  FROM {{ ref('raw_study_logs') }}
  GROUP BY user_id, DATE(date), track_id
)
SELECT * FROM logs
```

`{{ ref('raw_study_logs') }}` tells dbt: "This model depends on `raw_study_logs`. Build that first."

### How dbt Works

```
raw_study_logs (source table)
       ↓
daily_study_summary (model) ← dependency managed automatically
       ↓
weekly_user_report (model)
```

When you run `dbt run`:
1. dbt figures out the dependency order
2. Executes each model's SQL in the right order
3. Creates/updates tables and views in your warehouse

### Sources

```yaml
# models/sources.yml
sources:
  - name: learning_os
    tables:
      - name: study_logs
      - name: xp_events
      - name: progress
```

```sql
-- Reference a source
SELECT * FROM {{ source('learning_os', 'study_logs') }}
```

### Tests in dbt

```yaml
# models/schema.yml
models:
  - name: daily_study_summary
    columns:
      - name: user_id
        tests:
          - not_null
          - relationships:
              to: ref('users')
              field: id
      - name: total_minutes
        tests:
          - not_null
          - dbt_utils.expression_is_true:
              expression: ">= 0 AND <= 1440"
```

`dbt test` runs all tests. Failed tests = data quality issues found.

### Materializations

```sql
-- config block at top of model
{{ config(materialized='table') }}     -- drop and recreate (slow, clean)
{{ config(materialized='view') }}       -- no storage, always fresh (fast query)
{{ config(materialized='incremental') }} -- append new rows (fast, for big tables)
{{ config(materialized='ephemeral') }}   -- CTE-like, not stored
```

### The dbt Workflow

```bash
dbt run        # build all models
dbt test       # run all tests
dbt docs generate  # generate documentation site
dbt docs serve     # view docs in browser
```

## Try It Yourself

1. Write a dbt model that aggregates study_logs to daily summaries.
2. Add not_null and uniqueness tests to the model.
3. Use `ref()` to create a model that depends on another model.

## Common Mistakes

- **Circular references**: Model A refs B, B refs A. dbt catches this at compile time.
- **Too many materialized='table'**: Tables are rebuilt from scratch every run. Use incremental for large datasets.
- **SQL without tests**: Every model should have at least `not_null` and `unique` tests on primary keys.

## Checkpoint

1. How does dbt change the way data teams write SQL transformations?
2. What does {{ ref() }} do?
3. What's the difference between table and incremental materialization?
4. **Reflection**: How would dbt fit into your Learning OS pipeline?
