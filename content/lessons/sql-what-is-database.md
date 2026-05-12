# SQL Basics: What is a Database?

## Why This Matters

Every app you've ever used stores data somewhere — user profiles, orders, messages — in a database. SQL (Structured Query Language) is how you talk to that database. It's been the universal language of data for 50 years, and it's not going anywhere. Every data engineer, backend developer, and analyst uses SQL daily.

## Core Concepts

### Relational Databases

A relational database organizes data into **tables** (like spreadsheets) with **rows** (records) and **columns** (fields). Tables relate to each other through keys.

```
┌─────────────────────────┐     ┌──────────────────────────┐
│        users            │     │        orders             │
├────┬─────────┬──────────┤     ├────┬──────────┬───────────┤
│ id │ name    │ email    │     │ id │ user_id  │ total     │
├────┼─────────┼──────────┤     ├────┼──────────┼───────────┤
│ 1  │ Alice   │ a@x.com  │◄────│ 1  │ 1        │ $50       │
│ 2  │ Bob     │ b@x.com  │     │ 2  │ 1        │ $30       │
└────┴─────────┴──────────┘     │ 3  │ 2        │ $80       │
                                └────┴──────────┴───────────┘
```
Alice (id=1) has two orders. The `user_id` column connects orders to users.

### Key Terminology

| Term | Definition |
|---|---|
| Table | A collection of related data (e.g., `users`, `orders`) |
| Row / Record | One entry in a table |
| Column / Field | A property of each record (e.g., `name`, `email`) |
| Primary Key | Unique identifier for each row (usually `id`) |
| Foreign Key | Column that references a primary key in another table |
| Schema | The structure of the database (tables, columns, types) |

### PostgreSQL vs MySQL

Both are excellent open-source relational databases. PostgreSQL is generally preferred for:
- Complex queries (better query optimizer)
- Data engineering (JSON support, window functions, CTEs)
- Strict standards compliance

### Your First Query

```sql
-- Retrieve all columns from the users table
SELECT * FROM users;

-- Retrieve specific columns
SELECT name, email FROM users;

-- Count rows
SELECT COUNT(*) FROM users;
```

### Connecting to a Database

PostgreSQL runs as a service. You connect to it with:
- **psql** — command-line tool (`psql -h localhost -U postgres -d mydb`)
- **GUI tools** — pgAdmin, DBeaver, TablePlus
- **Application code** — Prisma, pg (Node.js), psycopg2 (Python)

## Try It Yourself

1. Install PostgreSQL locally or use the Supabase SQL editor
2. Create a database called `practice`
3. Create a `users` table with `id`, `name`, and `email` columns
4. Insert 3 rows and query them with `SELECT *`

## Common Mistakes

- **Forgetting the semicolon**: SQL statements end with `;`. Missing it causes errors or silent hangs.
- **Using SELECT * in production**: It returns all columns, which is wasteful. Select only what you need.
- **Confusing row and column**: Rows go across, columns go down. In SQL, columns have names; rows don't.

## Checkpoint

1. What is the difference between a row and a column?
2. What is a foreign key?
3. Why is PostgreSQL preferred for complex queries?
4. **Reflection**: What database have you interacted with without realizing it?
