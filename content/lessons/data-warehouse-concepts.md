# Data Warehouse Concepts

## 🎯 By End of This Lesson You Will:
- Define data warehouse, data lake, and lakehouse
- Explain partitioning, clustering, and materialized views
- Identify when to use each storage pattern

---

## 🌍 Real-World Analogy First

Think of these three storage approaches like **how a library organizes books**:

```
📚 Data Warehouse:    Curated library
                      - Books are catalogued
                      - Categorized on shelves
                      - Hard to add raw stuff
                      - Fast to find specific things

📦 Data Lake:         Warehouse of boxes
                      - Everything dumped in raw
                      - Boxes labelled but not opened
                      - Cheap to store anything
                      - Slow to find specifics

🏢 Lakehouse:         Modern library + warehouse
                      - Raw storage cheap
                      - Cataloging + indexing on top
                      - Best of both worlds
```

Each makes trade-offs. Knowing them lets you pick the right tool.

---

## 📖 Start From Zero

### Three Storage Patterns

| Pattern | Schema | Cost | Best For |
|---|---|---|---|
| **Warehouse** | Strict, declared up front | Higher | Curated analytics |
| **Data Lake** | None — store raw files | Lowest | Cheap storage, exploration |
| **Lakehouse** | Both — raw + tables on top | Middle | Modern unified analytics |

Examples:
- Warehouse: BigQuery, Snowflake, Redshift
- Lake: AWS S3, Google Cloud Storage with raw CSV/Parquet/JSON
- Lakehouse: Databricks, Snowflake (newer features), Iceberg-based stacks

---

## 🔨 Level Up

### Step 1: Partitioning — Split Tables by a Column

Huge tables are split into smaller chunks by a column value (usually a date):

```sql
-- Partitioned by created_at (BigQuery example)
CREATE TABLE events (
  id        STRING,
  user_id   STRING,
  action    STRING,
  created_at TIMESTAMP
)
PARTITION BY DATE(created_at);
```

When you query `WHERE DATE(created_at) = '2026-05-01'`, the warehouse reads only THAT day's partition — not the whole table.

**Without partitioning:** scan 1 billion rows.  
**With partitioning by day:** scan 3 million rows (one day's worth).

> **Rule:** Always partition large fact tables by date. Always filter queries by the partition column.

---

### Step 2: Clustering — Sort Within Partitions

Clustering physically sorts data by a column to speed lookups:

```sql
CREATE TABLE events
PARTITION BY DATE(created_at)
CLUSTER BY user_id;
```

Now `WHERE user_id = 'x'` is fast because rows for the same user are stored together.

**Partition** = which file(s) to read.
**Cluster** = which rows within those files.

Use both together for huge tables.

---

### Step 3: Materialized Views — Precomputed Results

A materialized view stores the result of a query so future reads are instant:

```sql
CREATE MATERIALIZED VIEW daily_revenue AS
SELECT
  DATE(created_at) AS day,
  product_id,
  SUM(amount) AS total
FROM orders
GROUP BY day, product_id;
```

Querying `daily_revenue` is now reading a small pre-computed table — much faster than re-aggregating the source.

Trade-off: materialized views must be **refreshed** when source data changes. Many warehouses do this automatically (incrementally).

---

### Step 4: Columnar vs Row Storage

OLTP databases store data **row by row** (good for "give me one user's full record"):
```
Row 1: [id=1, name="Alice", age=25, country="KE"]
Row 2: [id=2, name="Bob",   age=30, country="US"]
```

Data warehouses store data **column by column** (good for "give me the average age"):
```
id:      [1, 2, 3, ...]
name:    ["Alice", "Bob", ...]
age:     [25, 30, ...]
country: ["KE", "US", ...]
```

For analytics, you usually want one or two columns from millions of rows. Reading just those columns is way faster than reading whole rows.

---

### Step 5: Common File Formats

```
CSV         — text, no compression, no schema. Easy but bloated.
JSON Lines  — text, flexible schema. OK for raw logs.
Parquet     — binary, columnar, compressed. Standard for warehouses/lakes.
ORC         — similar to Parquet, slightly different optimizations.
Avro        — row-based binary with schema. Good for streaming.
```

**Parquet is the modern default** for analytical data — efficient AND splittable for parallel processing.

---

### Step 6: Data Lake — When To Use It

```
Use a lake when:
  - You need to store raw data cheaply
  - Schema isn't fully known yet ("dump first, structure later")
  - Many sources writing simultaneously
  - You'll re-process the same raw data multiple ways

Avoid lake-only when:
  - Queries must be fast and consistent
  - You need ACID transactions across tables
  - Schema enforcement matters
```

A lake stores **files** in a folder structure on cheap object storage (S3, GCS). Tools like AWS Athena or DuckDB let you query the files in place.

---

### Step 7: ETL vs ELT in Warehouses

In old systems (data warehouses pre-2015):
```
SOURCE → ETL (transform first) → WAREHOUSE (clean, ready)
```

In modern systems:
```
SOURCE → ELT (load raw) → WAREHOUSE (transform with SQL/dbt later)
```

Modern warehouses are powerful enough to handle the transform step. ELT is faster to onboard new data and lets you transform incrementally.

We cover this more in the ETL vs ELT lesson.

---

### Step 8: Cost Models

Cloud warehouses bill differently:

```
BigQuery:     per byte scanned (filter to reduce cost!)
Snowflake:    per second of compute (auto-pauses when idle)
Redshift:     per cluster (charged whether you query or not)
```

Always read the pricing docs. A naive `SELECT *` query on a partitioned BigQuery table can cost dollars per run.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Pick a pattern:**
```
For each scenario, choose Warehouse / Lake / Lakehouse:
1. Quarterly board reports from cleaned data
2. Storing all raw event logs cheaply
3. Modern unified platform for both raw and curated
```

**Exercise 2 — Partition decision:**
```
You have 5 years of order data, 50M rows.
Which column would you partition by? Why?
```

**Exercise 3 — Clustering decision:**
```
On the orders table partitioned by date, what column would you cluster by
to speed up "all orders for customer X"?
```

**Exercise 4 — Materialized view:**
```
Write a CREATE MATERIALIZED VIEW for:
"Daily active users (DAU) — count of unique user_ids per day from events"
```

**Exercise 5 — Cost optimization:**
```
A teammate runs SELECT * FROM events; on a 100M-row partitioned table daily.
Their BigQuery bill is $200/day. Suggest 2 fixes.
```

**Exercise 6 — File format choice:**
```
For each, pick CSV, JSON Lines, or Parquet:
1. Daily export to share with finance team (humans will open in Excel)
2. Streaming log archive from app servers
3. Analytical fact table updated nightly
```

**Exercise 7 — Schema migration:**
```
You have raw JSON in S3. You want to turn it into Parquet partitioned
by date. Outline the steps.
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Querying without partition filter | Full-table scan + huge cost | Always filter on partition column |
| Choosing CSV for analytics data | Slow scans, no compression | Use Parquet |
| Lake-only without metadata catalog | Forgotten data, schema chaos | Use Glue/Iceberg catalog |
| Treating warehouse like an OLTP DB | High latency, high cost | Use OLTP for live queries |
| Materialized view without refresh | Stale data | Auto-refresh or schedule refreshes |

---

## 🧠 Mental Model

```
OLTP DB           OLAP Warehouse              Data Lake
─────────         ──────────────              ──────────
Postgres          BigQuery / Snowflake         S3 + Parquet files
Live app data     Curated analytics            Raw, cheap storage

Optimizations:
  Partition by date  → scan less
  Cluster by user    → group lookups
  Materialized view  → precompute heavy queries
  Columnar format    → read only needed columns
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between a data lake and a data warehouse?
2. **Predict:** A 100M-row table partitioned by day. You query without filtering by date. What's the cost impact?
3. **Find the bug:**
   ```
   CREATE TABLE events ( ... ) — no partition
   ```
   You'll soon hit costs of $X per query. Why?
4. **Write it:** A partitioned + clustered table definition for daily user events.
5. **Apply it:** Design the warehouse layer for Learning OS analytics — what tables, partitions, clusters?
6. **Reflect:** Why has the lakehouse pattern grown in popularity in the last few years?
