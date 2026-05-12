# OLTP vs OLAP Design

## Why This Matters

The database that runs your app (OLTP) is terrible at analytics. The database that runs your reports (OLAP) is terrible at transactions. Understanding this distinction is why every company has both operational and analytical databases — and why data engineering exists as a field.

## Core Concepts

### OLTP — Online Transaction Processing

The database powering your application. Optimized for:
- Thousands of small, fast read/write operations
- Point queries (`WHERE id = 123`)
- Data integrity (ACID transactions)
- Current state ("What's Alice's XP right now?")

Example: Your Learning OS PostgreSQL database handling logins, lesson progress, XP events.

### OLAP — Online Analytical Processing

The database powering reports and dashboards. Optimized for:
- Few large, complex read queries
- Scanning millions of rows
- Aggregations across dimensions
- Historical analysis ("How did XP grow over 22 weeks?")

Example: A data warehouse with pre-aggregated study metrics by week, track, and module.

### The Design Differences

| Aspect | OLTP | OLAP |
|---|---|---|
| Normalization | Highly normalized (3NF) | Denormalized (star schema) |
| Queries | Simple, known in advance | Complex, ad-hoc |
| Data volume | Current (days/weeks) | Historical (months/years) |
| Updates | Frequent small writes | Bulk loads, few updates |
| Users | Application (1000s) | Analysts (10s) |
| Example query | `UPDATE progress SET status = 'done'` | `SELECT AVG(minutes) BY week, track` |

### ETL — The Bridge

```
OLTP Database ──(extract)──→ Staging ──(transform)──→ OLAP Warehouse
                                              └──(load)──→ Star Schema
```

Data flows from operational systems (OLTP) to analytical systems (OLAP) through ETL/ELT pipelines.

### Why You Need Both

- Your app needs fast reads/writes → OLTP
- Your dashboard needs complex aggregations → OLAP
- Your OLTP queries shouldn't slow down the app → separate databases
- Your analytics queries need historical data → OLAP stores it

## Try It Yourself

1. Classify these queries as OLTP or OLAP: "Get user by ID", "Average XP per week per track", "Insert study log", "Top 10 most active users"
2. Look at your Prisma schema. Which tables are OLTP-style? Which could be OLAP?
3. Design a simple OLAP table for weekly study summaries.

## Common Mistakes

- **Running analytics queries on OLTP**: `SELECT AVG(minutes) FROM study_logs` on a billion-row table slows down the app for everyone.
- **Designing OLAP like OLTP**: A star schema with 30 normalized dimension tables defeats the purpose.
- **No data retention policy**: OLTP purges old data. OLAP keeps it. Plan your data lifecycle.

## Checkpoint

1. Which system is optimized for many small read/write transactions?
2. What's the main design difference between OLTP and OLAP schemas?
3. When would an analytics query cause problems on an OLTP system?
4. **Reflection**: What analytics questions can't your current schema answer efficiently?
