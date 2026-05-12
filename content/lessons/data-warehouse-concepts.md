# Data Warehouse Concepts

## Why This Matters

A data warehouse is the central repository where all your company's data lives for analysis. It's not one technology — it's an architecture pattern. Understanding warehouses is the difference between a data engineer who runs SQL queries and one who designs data platforms.

## Core Concepts

### What is a Data Warehouse?

> A subject-oriented, integrated, time-variant, non-volatile collection of data for decision support.

- **Subject-oriented**: Organized around business subjects (sales, learning, users)
- **Integrated**: Data from multiple sources, unified
- **Time-variant**: Historical data, not just current state
- **Non-volatile**: Data is appended, not updated in place

### ETL vs ELT

```
ETL (traditional):     Source → Transform → Load → Warehouse
ELT (modern):          Source → Load → Transform (in Warehouse)
```

**ETL**: Transform before loading. Good when transformations are complex and compute is expensive.
**ELT**: Load raw data first, transform in the warehouse. Good with cloud warehouses (BigQuery, Snowflake) that have massive compute.

### Warehouse Architecture

```
┌─────────────┐   ┌──────────┐   ┌──────────────┐   ┌──────────┐
│ Source      │   │ Staging  │   │ Data         │   │ Data     │
│ Systems ────→  │ Area ───→   │ Warehouse ───→   │ Marts   │
│ (OLTP, APIs)│   │ (raw)    │   │ (star schema)│   │ (views)  │
└─────────────┘   └──────────┘   └──────────────┘   └──────────┘
```

1. **Source Systems**: Your app's database, third-party APIs, CSV exports
2. **Staging Area**: Raw data, as-is from sources. No transformations yet.
3. **Data Warehouse**: Cleaned, integrated, modeled data (star schemas)
4. **Data Marts**: Department-specific views (marketing mart, learning analytics mart)

### Slowly Changing Dimensions (SCD)

Dimensions change over time. How do you handle it?

```sql
-- Type 1: Overwrite (lose history)
UPDATE dim_user SET name = 'Robert' WHERE id = 1;

-- Type 2: Add new row (preserve history)
INSERT INTO dim_user (id, name, valid_from, valid_to, is_current)
VALUES (1, 'Robert', NOW(), NULL, true);
UPDATE dim_user SET valid_to = NOW(), is_current = false WHERE id = 1 AND is_current = true;
```

### Data Warehouse vs Data Lake

| Data Warehouse | Data Lake |
|---|---|
| Structured, processed data | Raw data in any format |
| Schema-on-write | Schema-on-read |
| SQL queries | Spark, Python, SQL |
| Business analysts | Data scientists, engineers |
| PostgreSQL, BigQuery, Snowflake | S3, GCS, Azure Blob |

## Try It Yourself

1. Map your Learning OS data flow from source to dashboard.
2. Design a staging table for raw study log imports.
3. Classify your dimension tables as SCD Type 1 or Type 2.

## Common Mistakes

- **Loading raw data into fact tables**: Always stage first. Clean and validate before loading.
- **No data lineage**: Can't trace where a number came from. Document the flow.
- **Warehouse as backup**: The warehouse is for analytics, not disaster recovery.

## Checkpoint

1. What's the difference between a data warehouse and a data lake?
2. What are slowly changing dimensions? Name the two main types.
3. Why has ELT become more popular than ETL?
4. **Reflection**: Design the data flow for your Learning OS analytics.
