# Cloud Data Platforms: BigQuery & Snowflake Overview

## 🎯 By End of This Lesson You Will:
- Explain what a cloud data warehouse is
- Compare BigQuery, Snowflake, and Redshift at a high level
- Understand serverless vs cluster-based pricing

---

## 🌍 Real-World Analogy First

```
On-prem warehouse (old way):
  Buy your own servers.
  Maintain them.
  Pay for capacity even when idle.
  Scale by buying more hardware → weeks.

Cloud warehouse (modern way):
  Use a vendor's cluster.
  They handle hardware/maintenance.
  Pay only for what you use (or compute time).
  Scale up in seconds.
```

In 2026, you almost never build your own warehouse — you use a cloud platform. Knowing the trade-offs lets you pick the right one for your project.

---

## 📖 Start From Zero

### The Big 3 Cloud Data Warehouses

| | BigQuery | Snowflake | Redshift |
|---|---|---|---|
| Cloud | Google Cloud | Multi-cloud (GCP/AWS/Azure) | AWS |
| Pricing | Per byte scanned | Per second of compute | Per cluster hour |
| Setup | Instant — zero admin | Quick — virtual warehouses | More admin needed |
| Scaling | Automatic | Manual scale virtual warehouses | Resize cluster |
| Best for | Spiky analytic loads | Mixed workloads, multi-cloud | AWS-native shops |

There's no objectively "best" — it depends on your situation.

---

## 🔨 Level Up

### Step 1: BigQuery — Serverless Warehouse

```
You don't manage anything.
You write SQL.
Google charges per byte your query scans.

Pros:
  - Zero ops
  - Massive scale automatically
  - Pay only for actual queries

Cons:
  - Per-byte pricing means expensive `SELECT *` queries
  - Less control over performance tuning
  - GCP-only
```

```sql
-- BigQuery SQL — standard ANSI with some extensions
SELECT
  DATE(event_time) AS day,
  COUNT(*) AS events
FROM `myproject.events.raw_events`
WHERE DATE(event_time) >= "2026-05-01"
GROUP BY day
ORDER BY day;
```

Always include a partition filter (`WHERE DATE(...)`) — otherwise you scan the whole table and pay for everything.

---

### Step 2: Snowflake — Compute / Storage Separated

```
Two billing axes:
  1. Storage: cheap, per TB stored
  2. Compute: pay-per-second when a "virtual warehouse" is running

You can have multiple warehouses for different workloads:
  - small_wh for analyst queries
  - large_wh for nightly jobs
  - x_large_wh for heavy ML training

Each scales independently.

Pros:
  - Predictable cost (you control which warehouse runs)
  - Multi-cloud (AWS/Azure/GCP)
  - Auto-pauses warehouses when idle
  - Time-travel queries (query data as of N hours ago)

Cons:
  - More to learn than BigQuery
  - Pricing requires planning
```

```sql
-- Snowflake SQL — similar to PostgreSQL
SELECT
  DATE_TRUNC('day', event_time) AS day,
  COUNT(*) AS events
FROM events.raw_events
WHERE event_time >= '2026-05-01'
GROUP BY day;
```

---

### Step 3: Redshift — Cluster-Based

```
You provision a CLUSTER of nodes:
  e.g., 4 nodes of ra3.4xlarge

The cluster runs 24/7 (whether you query or not).
You pay for the cluster, not per query.

Pros:
  - Predictable monthly cost
  - Deep AWS integration (S3, IAM, etc.)
  - Decent performance once tuned

Cons:
  - Always-on cost (even idle)
  - More admin (vacuum, encoding, sort keys)
  - Lower ceiling than Snowflake/BigQuery for raw scale
```

Modern Redshift Serverless mode addresses some of these by going pay-per-use, similar to BigQuery.

---

### Step 4: A Mental Comparison Table

| Question | BigQuery | Snowflake | Redshift |
|---|---|---|---|
| "I'm a startup — easiest start?" | ✅ | ✅ | ⚠️ |
| "I'm on AWS already" | ⚠️ | ✅ | ✅ |
| "I need multi-cloud" | ❌ | ✅ | ❌ |
| "I want predictable cost" | ⚠️ | ✅ | ✅ |
| "I want zero admin" | ✅ | ⚠️ | ❌ |
| "I do unpredictable queries" | ⚠️ | ✅ | ❌ |
| "I need huge scale" | ✅ | ✅ | ✅ |

---

### Step 5: Cost Patterns to Watch

**BigQuery:**
```
❌ SELECT * FROM huge_table        → scans full table, $$$
❌ Querying unpartitioned tables   → full-table scans

✅ Partition by date
✅ Cluster by frequent filter columns
✅ Use `--dry-run` to see bytes scanned before running
✅ Set query cost limits per project
```

**Snowflake:**
```
❌ Leaving virtual warehouse running idle  → burns credits
❌ Using larger warehouse than needed       → 2× cost for 1.2× speed

✅ Set auto-suspend to 60s
✅ Right-size warehouses per workload
✅ Use multi-cluster for concurrency, not size
```

**Redshift:**
```
❌ Cluster always-on even at night         → 24/7 cost
❌ Bad sort keys / dist keys                → slow queries

✅ Pause cluster when idle (or use Serverless)
✅ Choose sort keys matching common filters
✅ Use materialized views for hot queries
```

---

### Step 6: Choosing for Learning OS

Imagine you have:
- 10k users
- ~5GB of analytical data
- Spiky usage (mostly nights for ETL, ad-hoc queries during day)

```
Recommended for learning: BigQuery (or Snowflake on GCP)
  - Free tier handles your scale
  - Zero admin
  - Pay-per-query suits spiky load

Snowflake makes sense if:
  - You're already on AWS or want multi-cloud
  - You want predictability via fixed warehouse sizes

Redshift makes sense if:
  - Your team is deeply in AWS
  - You have a dedicated data engineer for tuning
```

---

### Step 7: Beyond the Big 3

```
ClickHouse   — open source, blazing fast for analytics
DuckDB       — embedded analytics DB (think SQLite for OLAP)
Trino/Presto — query engines on top of data lakes
Databricks   — lakehouse + ML platform on top of Spark
Apache Iceberg / Delta Lake / Hudi — open table formats
```

The space is evolving fast. The fundamentals (columnar storage, partitioning, SQL) are the same — the products are just packaging.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Match scenario to platform:**
```
1. Startup, 3 engineers, GCP, low budget         → ?
2. Mid-size company, AWS-only, AWS-native team   → ?
3. Multi-cloud SaaS company with growing data    → ?
4. Solo founder needing fastest start             → ?
```

**Exercise 2 — Cost optimization:**
```
A teammate runs `SELECT * FROM events;` in BigQuery
on a 100M-row table daily. Suggest 3 optimizations.
```

**Exercise 3 — Snowflake warehouse sizing:**
```
You have:
- 5 analysts running ad-hoc queries during the day
- 1 nightly ETL job
- Weekly heavy ML training

Sketch how many warehouses, what size each.
```

**Exercise 4 — BigQuery partition:**
```sql
-- Write a query against:
-- `myproject.events.user_events` (partitioned by DATE(timestamp))
-- to count events from last 7 days, scanning as few bytes as possible.
```

**Exercise 5 — Compare pricing:**
```
For 10TB of storage + ~100 queries per day on 1GB scanned each,
estimate the monthly cost for BigQuery, Snowflake, Redshift.
(Check their pricing pages — numbers change)
```

**Exercise 6 — Migration thought experiment:**
```
You're moving from Redshift to BigQuery. List 4 things you'd watch out for.
```

**Exercise 7 — Tool selection writeup:**
```
For Learning OS (hypothetical company with 50k users, modest data),
pick a cloud warehouse and write 5 sentences justifying the choice.
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| `SELECT *` on big tables in BigQuery | Massive bill | Specify columns; filter on partitions |
| Warehouse always-on in Snowflake | Wasted credits | Auto-suspend at 60s |
| Untuned Redshift cluster | Slow queries | Set sort keys, run VACUUM/ANALYZE |
| No cost monitoring | Surprise bill | Set alerts and budgets |
| Picking by hype | Wrong tool for your team | Match to YOUR situation |

---

## 🧠 Mental Model

```
BigQuery   = Serverless, per-query pricing → simplest, spiky workloads
Snowflake  = Compute/storage split → flexible, predictable
Redshift   = Cluster → AWS-native, traditional shops

ALL are columnar, SQL-based, designed for analytics.
The differences are operational: how you scale, how you pay.

Pick based on YOUR team's expertise and cloud preference,
not on benchmarks or marketing.
```

---

## 📝 Check Your Understanding

1. **Define:** What does "serverless" mean for BigQuery vs Snowflake's "virtual warehouse"?
2. **Predict:** You run `SELECT *` on a 1TB table in BigQuery (no partition filter). What's the impact?
3. **Find the bug:** A Snowflake account is burning credits at night. The warehouse has auto-suspend off. What's happening?
4. **Write it:** A query that uses partitioning + clustering to minimize cost in BigQuery.
5. **Apply it:** Pick the right warehouse for a fictional startup with: AWS, 5 engineers, $500/month budget, mixed workloads. Justify.
6. **Reflect:** Why has the cloud warehouse market changed more in the last 8 years than the previous 30 of databases?
