# SQL Basics: What is a Database?

## 🎯 By End of This Lesson You Will:
- Explain what a database, table, row, and column are
- Describe what SQL is and why it's used everywhere
- Identify when to use a database vs a spreadsheet

---

## 🌍 Real-World Analogy First

A **database** is like a digital filing cabinet. Inside:

```
┌─────────────────────────────────────────┐
│       📦 DATABASE: learning_os           │
│                                         │
│  ┌────────────┐  ┌────────────┐         │
│  │ 📁 users   │  │ 📁 lessons │         │
│  │  (table)   │  │  (table)   │         │
│  └────────────┘  └────────────┘         │
│  ┌────────────┐  ┌────────────┐         │
│  │ 📁 notes   │  │ 📁 xp_logs │         │
│  └────────────┘  └────────────┘         │
└─────────────────────────────────────────┘
```

- **Database** = the entire filing cabinet
- **Tables** = the folders inside (one per type of thing)
- **Rows** = individual files inside a folder (one per item)
- **Columns** = the labelled fields on each file

A spreadsheet stores one type of data per sheet. A database does the same, but at much larger scale, with **rules**, **relationships**, and **a language to query it (SQL)**.

---

## 📖 Start From Zero

### What's Inside a Table?

A table is a grid of **rows** and **columns**:

```
users table:
┌─────┬──────────┬──────────────────┬─────┐
│ id  │  name    │      email       │ xp  │
├─────┼──────────┼──────────────────┼─────┤
│  1  │ Alice    │ alice@x.com      │ 350 │  ← row 1
│  2  │ Belinze  │ b@jtl.co.ke      │ 500 │  ← row 2
│  3  │ Carol    │ carol@x.com      │ 120 │  ← row 3
└─────┴──────────┴──────────────────┴─────┘
   ↑      ↑            ↑              ↑
column  column      column         column
```

- **Each column** has a name and a type (text, number, etc.)
- **Each row** is one user — a complete record
- **Every row** has the same columns

---

## 🔨 Level Up

### Step 1: What is SQL?

**SQL** = **S**tructured **Q**uery **L**anguage. It's how you talk to databases.

You don't browse a database visually like a spreadsheet. You **ask questions in SQL**:

```sql
-- "Show me all users"
SELECT * FROM users;

-- "Show me users with more than 200 XP"
SELECT name, xp FROM users WHERE xp > 200;

-- "How many users are there?"
SELECT COUNT(*) FROM users;
```

Every SQL question follows the pattern:
```
What do I want?  →  From where?  →  What conditions?
   SELECT             FROM            WHERE
```

---

### Step 2: Why Databases Beat Spreadsheets

| Spreadsheet (Excel/Sheets) | Database (PostgreSQL/MySQL) |
|---|---|
| Up to ~1 million rows | Billions of rows |
| One person at a time | Thousands of users at once |
| Manual formulas | Built-in queries |
| Risk of bad data | Strict data types & rules |
| Slow searches | Indexed — milliseconds |
| Hard to combine sheets | JOIN tables easily |
| Crash on big files | Built for scale |

Every app you use — Instagram, M-Pesa, Safaricom self-care — is backed by a database. Spreadsheets are great for small lists; databases run the world.

---

### Step 3: PostgreSQL — Your Tool of Choice

In this curriculum, you'll use **PostgreSQL** (often called "Postgres"). It's:

- 🆓 Free and open source
- 🏆 The most professional choice (used by Apple, Netflix, Instagram)
- 📜 Has 30+ years of development behind it
- 🔧 Has every feature you'll need

Other SQL databases (MySQL, SQL Server, SQLite) use almost the same SQL language. Learn Postgres first, and 90% of your knowledge transfers.

---

### Step 4: The 4 Operations — CRUD

Every database operation falls into one of 4 categories:

```
C  CREATE  (INSERT)  → add new data
R  READ    (SELECT)  → get existing data  ← you'll spend 80% of time here
U  UPDATE  (UPDATE)  → change existing data
D  DELETE  (DELETE)  → remove data
```

```sql
-- CREATE — add a new row
INSERT INTO users (name, email) VALUES ('Belinze', 'b@jtl.co.ke');

-- READ — fetch rows
SELECT * FROM users WHERE id = 1;

-- UPDATE — modify existing rows
UPDATE users SET xp = xp + 50 WHERE id = 1;

-- DELETE — remove rows
DELETE FROM users WHERE id = 99;
```

We start with **SELECT** because reading is what you do most often.

---

### Step 5: Data Types — Each Column Has a Type

```sql
users table columns and their types:
─────────────────────────────────────────────────
  id       INTEGER       -- whole number (auto-incremented)
  name     VARCHAR(100)  -- text up to 100 characters
  email    VARCHAR(255)  -- text up to 255 characters
  xp       INTEGER       -- whole number
  created  TIMESTAMP     -- date and time
  active   BOOLEAN       -- true or false
  bio      TEXT          -- unlimited text
─────────────────────────────────────────────────
```

Types protect your data — you can't put `"hello"` into an `xp INTEGER` column. The database rejects bad data automatically.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Identify parts:**
```
posts table:
┌────┬─────────────┬───────────┬────────────────────┐
│ id │   title     │  user_id  │  published_at      │
├────┼─────────────┼───────────┼────────────────────┤
│  1 │ My first    │     2     │  2026-01-15 10:00  │
│  2 │ SQL is fun  │     2     │  2026-01-20 14:30  │
└────┴─────────────┴───────────┴────────────────────┘

Answer:
- How many rows are there?
- How many columns?
- Name all columns.
- What type might `user_id` be?
```

**Exercise 2 — Match CRUD:**
```
Match each phrase to CREATE, READ, UPDATE, or DELETE:
- "Show me all my notes from this week"
- "Add a new study log entry"
- "Mark this lesson as complete"
- "Remove my account permanently"
```

**Exercise 3 — Database vs spreadsheet:**
```
For each scenario, would you use a spreadsheet or database?
- Tracking 10 monthly expenses
- Storing data for an app with 50,000 users
- A grocery shopping list
- A school's student records (5,000 students)
```

**Exercise 4 — Read a query:**
```sql
SELECT name, xp FROM users WHERE xp >= 100;

In plain English, what is this query asking for?
```

**Exercise 5 — Identify column types:**
```
For each, suggest a SQL type (INTEGER, VARCHAR, BOOLEAN, TIMESTAMP, TEXT):
- A user's age
- A user's full name
- Whether they're subscribed
- The date they signed up
- A long biography paragraph
- A phone number
```

**Exercise 6 — Set up Postgres:**
```
Action exercise:
1. Install PostgreSQL on your machine (free)
2. Open pgAdmin or psql
3. Connect to a local database
4. Try: SELECT version();
5. You should see Postgres version info — that confirms it's working
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Confusing database with table | "Send me the database" — too vague | Always say which table you mean |
| Storing text as text when it's a number | Can't do math, can't sort correctly | Use INTEGER for numbers |
| Thinking SQL is case-sensitive | `select` and `SELECT` both work | Keywords UPPERCASE by convention (readability) |
| Storing dates as text | Can't filter by date ranges | Use TIMESTAMP or DATE type |

---

## 🧠 Mental Model

```
Database = filing cabinet
  Tables = folders inside (users, lessons, notes, etc.)
    Rows  = individual records (one user, one lesson)
      Columns = labelled fields with strict types

SQL = the language you use to ask the database questions
  SELECT (read)   ← you'll do this most often
  INSERT (create)
  UPDATE (modify)
  DELETE (remove)
```

---

## 📝 Check Your Understanding

1. **Define:** What is the difference between a row and a column?
2. **Predict:** If a `users` table has 100 rows and 5 columns, how many "cells" of data does it hold?
3. **Find the issue:** A friend stores user ages as `VARCHAR(3)`. What problems will they face?
4. **Write it:** In plain English, write a SQL query in pseudocode that fetches all lessons completed today.
5. **Apply it:** Design a `study_logs` table — name 4-5 columns and their types.
6. **Reflect:** Why is SQL still so important after 50+ years? What makes it last?
