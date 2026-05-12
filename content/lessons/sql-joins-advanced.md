# RIGHT JOIN, FULL JOIN & Self-Joins

## Why This Matters

INNER and LEFT JOIN cover 90% of cases, but sometimes you need the other side. RIGHT JOIN flips the perspective. FULL JOIN shows everything — matched and unmatched from both tables. Self-joins let a table relate to itself (employees and their managers, lessons and their prerequisites).

## Core Concepts

### RIGHT JOIN

```sql
-- Show all modules, even those with no lessons yet
SELECT m.title AS module, l.title AS lesson
FROM lessons l
RIGHT JOIN modules m ON l.module_id = m.id;
-- Modules with no lessons show NULL for lesson title
```

RIGHT JOIN is rarely needed because you can swap table order: `A RIGHT JOIN B` = `B LEFT JOIN A`. Use LEFT JOIN for readability.

### FULL OUTER JOIN

```sql
-- Everything: matched rows + unmatched from both sides
SELECT u.name AS user, s.date AS study_date
FROM users u
FULL JOIN study_logs s ON u.id = s.user_id;
-- Users with no logs (NULL date) + logs for deleted users (NULL name)
```

FULL JOIN is useful for finding orphaned records or auditing data integrity.

### Self-Join

```sql
-- Employees table with manager_id referencing the same table
SELECT
  e.name AS employee,
  m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;

-- Finding prerequisite chains
SELECT
  l1.title AS lesson,
  l2.title AS prerequisite
FROM lessons l1
JOIN lesson_prerequisites lp ON l1.id = lp.lesson_id
JOIN lessons l2 ON lp.prerequisite_id = l2.id;
```

### CROSS JOIN

```sql
-- Every combination (Cartesian product) — use with caution
SELECT c.name AS color, s.name AS size
FROM colors c
CROSS JOIN sizes s;
-- 5 colors × 3 sizes = 15 rows
```

## Try It Yourself

1. Use FULL JOIN to find study logs without users (data integrity check).
2. Write a self-join on employees to show each person and their manager.
3. Create a CROSS JOIN of two small tables and observe the result.

## Common Mistakes

- **RIGHT JOIN confusion**: Most developers stick to LEFT JOIN for consistency. If you need RIGHT, swap the tables and use LEFT.
- **Self-join without aliases**: `FROM employees JOIN employees` is ambiguous. Always use aliases: `FROM employees e1 JOIN employees e2`.
- **CROSS JOIN accidentally**: Forgetting ON in a JOIN produces a cross join. A 1000-row table crossed with another 1000-row table = 1 million rows.

## Checkpoint

1. Give a real-world example where you'd use a self-join.
2. Why is RIGHT JOIN rarely used in practice?
3. What does a FULL OUTER JOIN return?
4. **Reflection**: Where could a self-join help in your Learning OS schema?
