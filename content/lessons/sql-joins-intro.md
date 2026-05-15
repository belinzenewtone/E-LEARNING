# INNER JOIN & LEFT JOIN

## 🎯 By End of This Lesson You Will:
- Combine rows from two related tables using INNER JOIN
- Use LEFT JOIN to keep rows even when there's no match
- Choose the correct JOIN type for the question being asked

---

## 🌍 Real-World Analogy First

Imagine two filing cabinets:
- **Cabinet A**: customers (their names, emails)
- **Cabinet B**: orders (what each order contains)

You can't answer **"Which customer ordered this?"** by looking at only one cabinet. You need to **match orders to customers** — that's exactly what a JOIN does.

```
customers           orders                joined result
┌────┬────────┐    ┌─────┬───────┐    ┌────────┬───────┐
│ 1  │ Alice  │    │ 101 │ cust 1│    │ Alice  │ 101   │
│ 2  │ Bob    │    │ 102 │ cust 2│ →  │ Bob    │ 102   │
│ 3  │ Carol  │    │ 103 │ cust 1│    │ Alice  │ 103   │
└────┴────────┘    └─────┴───────┘    └────────┴───────┘
```

JOINs are the heart of relational databases — they let you ask questions that span multiple tables.

---

## 🗃️ Practice Data

```
users:
┌────┬──────────┐
│ id │  name    │
├────┼──────────┤
│ 1  │ Alice    │
│ 2  │ Belinze  │
│ 3  │ Carol    │  ← Carol has no posts
└────┴──────────┘

posts:
┌────┬─────────────┬──────────┐
│ id │  title      │ user_id  │
├────┼─────────────┼──────────┤
│ 10 │ My first    │    1     │  ← Alice's
│ 11 │ SQL is fun  │    1     │  ← Alice's
│ 12 │ DOM basics  │    2     │  ← Belinze's
│ 13 │ Anonymous   │   NULL   │  ← No author!
└────┴─────────────┴──────────┘
```

---

## 📖 Start From Zero

### Your First JOIN

```sql
SELECT users.name, posts.title
FROM users
INNER JOIN posts ON posts.user_id = users.id;
```

Result:
```
name      title
────────  ─────────────
Alice     My first
Alice     SQL is fun
Belinze   DOM basics
```

Read this as:
- **FROM users** — start with the users table
- **INNER JOIN posts** — connect to the posts table
- **ON posts.user_id = users.id** — match rows where the user_id matches the user's id

Carol is excluded (no posts). Post 13 is excluded (NULL user_id, no match).

---

## 🔨 Level Up

### Step 1: INNER JOIN — Only Matches

INNER JOIN returns **only rows where the match exists in BOTH tables**.

```
users    posts    INNER JOIN
  1   ←→  10  ✓    (match)
  1   ←→  11  ✓    (match)
  2   ←→  12  ✓    (match)
  3        ✗       (Carol has no posts → excluded)
       ←  13  ✗    (NULL user_id → excluded)
```

```sql
SELECT u.name, p.title
FROM users u
INNER JOIN posts p ON p.user_id = u.id;
```

**Aliases make JOINs readable:** `u` for users, `p` for posts — much cleaner than repeating the full names.

---

### Step 2: LEFT JOIN — Keep Everyone From the Left

```sql
SELECT u.name, p.title
FROM users u
LEFT JOIN posts p ON p.user_id = u.id;
```

Result:
```
name      title
────────  ─────────────
Alice     My first
Alice     SQL is fun
Belinze   DOM basics
Carol     NULL          ← Carol kept, but no post → NULL
```

LEFT JOIN says: **"Keep every row from the left table (users). Show matching posts where they exist; show NULL for the columns from the right table where they don't."**

```
users    posts    LEFT JOIN
  1   ←→  10  ✓    (match)
  1   ←→  11  ✓    (match)
  2   ←→  12  ✓    (match)
  3        →       (Carol kept, post columns = NULL)
```

---

### Step 3: When to Use Which

```
INNER JOIN: "Show me rows that have matches in BOTH tables"
LEFT JOIN:  "Show me ALL rows from the left, with optional matches"
```

**Real examples:**

```sql
-- "List all users WHO HAVE submitted at least one post"
-- → INNER JOIN (must have a post)
SELECT u.name FROM users u
INNER JOIN posts p ON p.user_id = u.id;

-- "List ALL users, with their post count (including 0)"
-- → LEFT JOIN (keep users with no posts)
SELECT u.name, COUNT(p.id) AS post_count
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
GROUP BY u.name;
```

---

### Step 4: Selecting From Both Tables

```sql
SELECT
  u.id AS user_id,
  u.name AS user_name,
  p.id AS post_id,
  p.title AS post_title
FROM users u
INNER JOIN posts p ON p.user_id = u.id;
```

Use aliases (`AS user_id`) when columns from both tables share names (like `id`).

---

### Step 5: Combining JOIN with WHERE

```sql
-- Get Belinze's posts only
SELECT u.name, p.title
FROM users u
INNER JOIN posts p ON p.user_id = u.id
WHERE u.name = 'Belinze';
```

The `JOIN` defines HOW tables relate; the `WHERE` filters the joined result.

---

### Step 6: JOIN + GROUP BY (The Power Combo)

```sql
-- How many posts per user (including users with zero posts)
SELECT
  u.name,
  COUNT(p.id) AS post_count
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
GROUP BY u.id, u.name
ORDER BY post_count DESC;
```

Result:
```
name      post_count
────────  ──────────
Alice         2
Belinze       1
Carol         0   ← visible thanks to LEFT JOIN
```

> **Important:** Use `COUNT(p.id)` not `COUNT(*)`. With `COUNT(*)` Carol would count as 1 (because she has 1 row from the LEFT JOIN with a NULL). `COUNT(p.id)` counts only non-NULL post IDs.

---

### Step 7: Joining 3+ Tables

JOINs can chain:

```sql
SELECT
  u.name,
  p.title,
  c.text AS comment
FROM users u
INNER JOIN posts p ON p.user_id = u.id
INNER JOIN comments c ON c.post_id = p.id
WHERE u.id = 1;
```

This finds Alice's posts AND their comments.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Basic INNER JOIN:**
```sql
-- Show all users with their posts
-- (Use INNER JOIN — only users who have posted)
```

**Exercise 2 — LEFT JOIN:**
```sql
-- Same as above, but include users with no posts (show NULL for title)
```

**Exercise 3 — Filtered JOIN:**
```sql
-- Show only Alice's posts (use a WHERE clause)
```

**Exercise 4 — Count per user:**
```sql
-- Show each user's name and how many posts they have
-- Should include Carol with 0 posts
-- Hint: LEFT JOIN + GROUP BY + COUNT(p.id)
```

**Exercise 5 — Users with no posts:**
```sql
-- Find users who have ZERO posts
-- Hint: LEFT JOIN, then WHERE p.id IS NULL
```

**Exercise 6 — Three tables (conceptual):**
```sql
-- Imagine tables: users, lessons, completions (links them)
-- Write a query to show each user and the lessons they've completed
```

**Exercise 7 — Aliases:**
```sql
-- Rewrite this with cleaner aliases:
SELECT users.name, posts.title FROM users JOIN posts ON posts.user_id = users.id;
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Missing `ON` clause | Cartesian product — every row paired with every row | Always specify the join condition |
| `COUNT(*)` with LEFT JOIN | Counts NULL rows as 1 | Use `COUNT(p.id)` (count of joined-table id) |
| Forgetting alias when columns share names | Ambiguous column error | Use `u.id, p.id` instead of just `id` |
| Confusing INNER vs LEFT | Missing or extra rows | INNER = matches only; LEFT = keep all from left |
| WHERE filtering the right side of LEFT JOIN | Acts like INNER JOIN | Move that condition to the ON clause |

---

## 🧠 Mental Model

```
INNER JOIN:  ●━━━━●      only the overlap
LEFT JOIN:   ●━━━━●  +   keep all of LEFT, even if no match on right

Pattern:
  FROM   left_table
  JOIN   right_table ON how they connect
  WHERE  conditions on the joined result

Aliases (use them always):
  FROM users u INNER JOIN posts p ON p.user_id = u.id
```

---

## 📝 Check Your Understanding

1. **Define:** What is the difference between INNER JOIN and LEFT JOIN?
2. **Predict:** Given the users/posts tables in this lesson, what does this return?
   ```sql
   SELECT u.name, COUNT(p.id) FROM users u LEFT JOIN posts p ON p.user_id = u.id GROUP BY u.id;
   ```
3. **Find the bug:**
   ```sql
   SELECT * FROM users JOIN posts;   -- what's missing? what does it do?
   ```
4. **Write it:** Find all posts along with author names, sorted by author alphabetically.
5. **Apply it:** Write a query that lists users who have NEVER posted.
6. **Reflect:** When would `INNER JOIN` accidentally hide important data? Give a real-world example.
