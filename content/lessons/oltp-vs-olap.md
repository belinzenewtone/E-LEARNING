# OLTP vs OLAP Design

## 🎯 By End of This Lesson You Will:
- Explain the difference between OLTP and OLAP systems
- Identify which one fits a given use case
- Recognize why they need different database designs

---

## 🌍 Real-World Analogy First

Imagine **two different stores**:

```
🏪 Convenience Store (OLTP):
   - Many tiny transactions per minute
   - Each transaction: 1 customer, 2-3 items
   - Speed matters per transaction
   
🏢 Wholesale Reporting Office (OLAP):
   - Few HUGE analyses per day
   - "How much did all stores sell last quarter?"
   - Speed matters across millions of rows
```

The same data, but completely different access patterns. You design the database differently for each.

---

## 📖 Start From Zero

### Definitions

| | OLTP | OLAP |
|---|---|---|
| Stands for | **O**nline **T**ransaction **P**rocessing | **O**nline **A**nalytical **P**rocessing |
| Purpose | Run the business (day-to-day) | Analyze the business |
| Typical query | "Add this order" | "Total sales per region this year" |
| Read vs write | Both, lots of writes | Mostly reads |
| Rows per query | Few (1-100) | Many (millions) |
| Latency expectation | Milliseconds | Seconds to minutes |
| Data freshness | Live | Often hourly/daily snapshot |
| Schema style | Normalized (3NF) | Denormalized (star schema) |

---

## 🔨 Level Up

### Step 1: OLTP — Built for Transactions

Your Learning OS database is OLTP:
- A user logs in → 1 row read
- User completes a lesson → 1 row insert
- User views their stats → 5-10 rows
- Concurrent users → hundreds simultaneously

**Design priorities:**
- Normalized tables (no redundancy → no update anomalies)
- Indexes on lookups (user_id, slug)
- ACID transactions (all-or-nothing writes)
- Many small reads/writes per second

**Tools:** PostgreSQL, MySQL, SQLite — traditional row-based RDBMS.

---

### Step 2: OLAP — Built for Analytics

A data warehouse is OLAP:
- "Total minutes studied per user, by week, for the last year"
- Scan millions of rows, return one summary
- Run by analysts/dashboards
- Don't write often, but read HUGE

**Design priorities:**
- Denormalized (joins are expensive)
- Star schema (fact + dimensions)
- Columnar storage (scan only the columns needed)
- Aggregation-friendly indexes

**Tools:** BigQuery, Snowflake, Redshift, ClickHouse, DuckDB.

---

### Step 3: Why Not One Database?

In theory you could run analytics queries on your OLTP database — but you'll learn quickly:

1. **Performance:** an analytical query (scan 10M rows) blocks production traffic
2. **Schema:** normalized tables require many joins for reporting
3. **Storage:** OLTP row-based formats are slow for column scans
4. **Cost:** running expensive aggregates on production hardware

That's why mature systems separate them:

```
┌─────────────┐         ETL/ELT          ┌────────────────┐
│  OLTP DB    │  ────────────────────►   │  OLAP DB       │
│ (Postgres)  │     daily / hourly        │  (Warehouse)   │
│ live app    │                            │  reports & ML  │
└─────────────┘                            └────────────────┘
```

---

### Step 4: Schema Comparison

**OLTP (3NF):**
```
users (id, name, email)
orders (id, user_id, created_at)
order_items (order_id, product_id, qty, unit_price)
products (id, name, category_id, price)
categories (id, name)
```

A "total revenue per category last quarter" query needs to JOIN 4 tables and scan millions of rows. Slow.

**OLAP (star schema):**
```
fact_sales:
  date_id, user_id, product_id, category_id, quantity, revenue

dim_date    (id, year, quarter, month, day)
dim_user    (id, name, country, signup_date)
dim_product (id, name, category, price)
```

One table with the facts, surrounded by dimension tables. Same revenue query: scan ONE table, GROUP BY category_id. Fast.

---

### Step 5: How the Same Data Differs

The same `Order` event:

**OLTP shape (normalized):**
```
INSERT INTO orders (id, user_id) VALUES (...);
INSERT INTO order_items (order_id, product_id, qty) VALUES (...);
```
Multiple tables, lots of FKs.

**OLAP shape (denormalized):**
```
INSERT INTO fact_orders (
  order_id, user_id, product_id, category_id, country,
  order_date, quantity, unit_price, total_revenue
) VALUES (...);
```
One wide row with everything pre-joined.

OLAP duplicates data on purpose — to avoid joins at query time.

---

### Step 6: When You Need Each

```
✅ Use OLTP for:
  - Web app backend
  - User-facing APIs
  - Anything with INSERT/UPDATE under user latency

✅ Use OLAP for:
  - Business intelligence dashboards
  - Analytics reports
  - Machine learning training data
  - Historical trend analysis
```

Small projects (under 1M rows) can get away with running analytics on OLTP. Above that, separation becomes essential.

---

### Step 7: Common Pattern — Read Replica

Before full OLAP, many teams add a **read replica** of their OLTP DB for heavy analytics:

```
Primary DB (writes + critical reads)
        │
        ▼ (streaming replication)
Replica (analytics queries only)
```

Same schema, separate hardware. The replica can be slow without affecting production.

---

### Step 8: Real Numbers — Why Each Excels

| Operation | OLTP (Postgres) | OLAP (BigQuery) |
|---|---|---|
| Insert 1 row | ~1ms | ~100ms (batched) |
| Read 1 row by PK | ~1ms | ~100ms |
| SUM 1B rows | minutes (terrible) | ~5 seconds |
| Update 1 row | ~5ms | not supported well |

Each is **good at what it's designed for, bad at the other**.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Classify:**
```
For each task, OLTP or OLAP?
1. Show a user their last 10 orders
2. Show a dashboard of revenue per country last year
3. Add a new product to the catalog
4. Email a user when their order ships
5. Predict next quarter's revenue using ML
```

**Exercise 2 — Schema choice:**
```
Design a sales tracker for an SME (small medium enterprise).
- ~1000 orders/day
- 5 employees use it concurrently
- They want a quarterly revenue report
What design do you choose? Why?
```

**Exercise 3 — Spot the bottleneck:**
```
A teammate runs:
SELECT category, SUM(price * qty) FROM order_items JOIN ...
on the live OLTP DB at 5pm. Site slows down.
Explain why and suggest a fix.
```

**Exercise 4 — Star schema:**
```
For the Learning OS, design a star schema for "study sessions" analytics:
- fact_study_sessions
- dim_user, dim_lesson, dim_date
What columns go in each?
```

**Exercise 5 — Migration plan:**
```
Outline 5 steps to move analytics off a Postgres production DB
to a cloud OLAP system like BigQuery.
```

**Exercise 6 — Cost vs simplicity:**
```
A startup with 10k users runs all queries on Postgres.
At what scale should they consider a separate analytics DB? Why?
```

**Exercise 7 — Tool choice:**
```
For each scenario, pick a tool:
1. Live chat app, 1k messages/min
2. Marketing dashboard from CSV exports
3. Real-time fraud detection on payments
4. Yearly board report from 5 years of data
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Running analytics queries on production OLTP | Slows the live app | Use a replica or warehouse |
| Designing everything in OLAP star schema | Bad transactional UX | OLTP for live; OLAP for reports |
| Mixing OLTP and OLAP in one DB at scale | Both suffer | Separate them above ~1M rows |
| Using a warehouse for real-time UI | High latency | Don't query OLAP synchronously from UX |

---

## 🧠 Mental Model

```
OLTP                                OLAP
  ────────────                        ────────────
  Many small queries                  Few huge queries
  Normalized                          Denormalized (star schema)
  Row-based (Postgres)                Columnar (BigQuery, Snowflake)
  ACID transactions                   Eventual consistency OK
  Powers the app                      Powers analytics/reports
```

---

## 📝 Check Your Understanding

1. **Define:** What does OLTP stand for and what's it optimized for?
2. **Predict:** Which is faster for "total revenue per category last year" — Postgres with 100M rows, or BigQuery? Why?
3. **Find the bug:** Why does running aggregate analytics queries on a production Postgres cause issues?
4. **Write it:** Outline a star schema for an e-commerce data warehouse.
5. **Apply it:** Where does your Learning OS sit — OLTP, OLAP, or both? Why?
6. **Reflect:** Could a single database ever be both OLTP and OLAP equally well? Modern hybrids (like CockroachDB) try — what's the trade-off?
