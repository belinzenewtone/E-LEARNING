# Cloud Data Platforms: BigQuery & Snowflake Overview

## Why This Matters

Traditional databases run on one server. Cloud data warehouses run on hundreds — separating compute from storage so 100 analysts can query simultaneously without affecting each other. BigQuery (Google) and Snowflake are the two dominant platforms. Understanding their architecture helps you design systems that scale.

## Core Concepts

### Columnar Storage

Traditional databases store rows together. Columnar storage stores columns together:

```
Row-based:    [Alice, 30, a@x.com] [Bob, 25, b@x.com]
Column-based: [Alice, Bob] [30, 25] [a@x.com, b@x.com]
```

Why columnar is faster for analytics:
- `SELECT AVG(age)` reads only the age column, not all columns
- Better compression (similar values group together)
- Vectorized processing (operate on batches, not one row at a time)

### Compute/Storage Separation

```
┌─────────────────────────────────┐
│  Cloud Storage (cheap, durable) │  ← your data lives here
│  S3 / GCS / Azure Blob          │
└────────────┬────────────────────┘
             │
    ┌────────┴────────┬────────────┐
    │  Compute A      │ Compute B  │  ← elastic, on-demand
    │  (analyst query)│ (dashboard)│     pay per query
    └─────────────────┴────────────┘
```

You can spin up 100 compute clusters or 0. Storage is always there. You pay for queries, not servers.

### BigQuery Basics

- Serverless — no clusters to manage
- Pay per query (bytes scanned) or slot-based pricing
- Standard SQL with extensions (arrays, structs, geospatial)
- Built-in ML (BigQuery ML)
- Real-time streaming ingest

### Snowflake Architecture

- Virtual warehouses (compute clusters that wake up in seconds)
- Time Travel (query data as it was at any point in the past 90 days)
- Zero-copy cloning (create dev/test environments instantly)
- Data sharing (share live data across organizations without copying)
- Multi-cloud (AWS, Azure, GCP)

### When to Use Each

| Scenario | Best fit |
|---|---|
| Already on GCP, serverless preferred | BigQuery |
| Need multi-cloud, data sharing, time travel | Snowflake |
| Simple analytics on small data | PostgreSQL (not cloud DW) |
| Petabyte-scale, cost-sensitive | BigQuery (flat-rate slots) |
| Enterprise with governance requirements | Snowflake |

### The Cost Model

Cloud warehouses change how you think about cost:

```sql
-- Expensive: SELECT * on a 10 TB table
-- Cheap: SELECT COUNT(DISTINCT user_id) — scans less data

-- BigQuery cost optimization:
-- 1. Partition tables by date
-- 2. Cluster by frequently filtered columns
-- 3. Use SELECT column, not SELECT *
-- 4. Set max bytes billed per query
```

## Try It Yourself

1. Compare the pricing pages for BigQuery and Snowflake.
2. Write a query that would be fast on columnar storage but slow on row-based.
3. Design a partitioning strategy for study_logs by date.

## Common Mistakes

- **SELECT * on big tables**: Scanning 10 TB costs money and time. Select specific columns.
- **No partitioning**: Full table scans on every query. Partition by date.
- **Treating cloud DW like PostgreSQL**: Different optimization strategies. What's fast on PostgreSQL might be expensive on BigQuery.

## Checkpoint

1. What is columnar storage and why is it better for analytics?
2. What does compute/storage separation mean?
3. How does BigQuery's pricing model affect query design?
4. **Reflection**: Would BigQuery or Snowflake be better for your Learning OS analytics?
