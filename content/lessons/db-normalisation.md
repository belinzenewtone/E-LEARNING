# Normalisation: 1NF, 2NF, 3NF

## Why This Matters

Without normalisation, the same data appears in multiple places. Update it in one place, forget the other — now your data is inconsistent. Normalisation rules eliminate redundancy systematically. Most production databases aim for 3NF (Third Normal Form).

## Core Concepts

### First Normal Form (1NF)

**Rule**: Each cell contains exactly one value. No repeating groups.

```sql
-- VIOLATES 1NF: multiple values in one column
student | courses
Alice   | Math, Physics, Chemistry

-- 1NF: one value per cell
student | course
Alice   | Math
Alice   | Physics
Alice   | Chemistry
```

Also: no arrays or JSON objects in columns (unless you explicitly need them for performance).

### Second Normal Form (2NF)

**Rule**: 1NF + no partial dependencies. Every non-key column depends on the ENTIRE primary key.

```sql
-- VIOLATES 2NF: instructor depends only on course_id, not the full key
enrollment (student_id, course_id, course_name, instructor, grade)
-- course_name and instructor depend only on course_id (partial dependency)

-- 2NF: split into two tables
enrollment (student_id, course_id, grade)
course (course_id, course_name, instructor)
```

### Third Normal Form (3NF)

**Rule**: 2NF + no transitive dependencies. Non-key columns depend only on the key, not on other non-key columns.

```sql
-- VIOLATES 3NF: city_population depends on city, which depends on zip_code
address (zip_code, city, city_population, street)
-- city depends on zip_code (non-key → non-key dependency)

-- 3NF: split
address (zip_code, city, street)
city_info (city, city_population)
```

### When to Denormalise

Sometimes breaking 3NF is intentional for performance:

```sql
-- Denormalised: storing calculated total for fast queries
orders (id, user_id, total)  -- total = SUM(order_items.price)
order_items (order_id, product_id, quantity, price)

-- Trade-off: faster reads, risk of inconsistent total
```

**Rule**: Start normalised. Denormalise only when you've measured a performance problem.

## Try It Yourself

1. Take a spreadsheet with repeating groups and convert to 1NF.
2. Identify partial dependencies in a table and split to 2NF.
3. Find transitive dependencies and split to 3NF.
4. Design a normalised schema for an e-commerce order system.

## Checkpoint

1. What does 1NF require that a spreadsheet often violates?
2. What's a partial dependency? Give an example.
3. When is it acceptable to denormalize?
4. **Reflection**: Is your Learning OS schema in 3NF? Prove it.
