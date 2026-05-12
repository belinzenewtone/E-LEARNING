# Relational Database Design Principles

## Why This Matters

A badly designed database causes pain forever — duplicate data, inconsistent updates, queries that need 5 JOINs for simple questions. Good schema design prevents these problems before they happen. The principles you learn here apply to PostgreSQL, MySQL, SQL Server, and every other relational database.

## Core Concepts

### Entities and Relationships

Every database models real-world entities and how they relate:

- **One-to-Many**: One company has many jobs. Foreign key on the "many" side.
- **Many-to-Many**: A lesson has many tags; a tag belongs to many lessons. Junction table.
- **One-to-One**: A user has one profile. Unique foreign key.

### Primary Keys

```sql
-- Surrogate key (recommended — auto-generated, no business meaning)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,  -- PostgreSQL auto-increment
  name TEXT NOT NULL
);

-- Natural key (use when the data has a natural unique identifier)
CREATE TABLE countries (
  code CHAR(2) PRIMARY KEY,  -- 'KE', 'US', 'GB'
  name TEXT NOT NULL
);
```

### Foreign Keys

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),  -- foreign key
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Foreign keys enforce referential integrity — you can't create an order for a non-existent user.

### Data Types

| Type | Use for |
|---|---|
| `INTEGER` / `SERIAL` | IDs, counts, ages |
| `BIGINT` | Large numbers (XP totals) |
| `DECIMAL(10,2)` | Money, precise calculations |
| `TEXT` / `VARCHAR(n)` | Names, descriptions |
| `BOOLEAN` | True/false flags |
| `TIMESTAMP` / `DATE` | Dates and times |
| `JSONB` | Semi-structured data, arrays of objects |
| `UUID` | Distributed system IDs |

### Constraints

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,          -- can't be null, can't duplicate
  age INTEGER CHECK (age >= 13),      -- must satisfy condition
  role TEXT DEFAULT 'user',           -- default value
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Try It Yourself

1. Design tables for a library system: books, authors, members, loans.
2. Draw the relationships between them.
3. Write CREATE TABLE statements with proper keys and constraints.
4. Add CHECK constraints for business rules (e.g., loan date must be before return date).

## Common Mistakes

- **Using VARCHAR without limit**: `VARCHAR` without length is just TEXT in PostgreSQL. Be explicit.
- **Storing calculated values**: Don't store `total_price` if you have `quantity` and `unit_price`. Compute it.
- **No foreign keys**: Without FKs, you can have orphaned records. Always add them after designing relationships.

## Checkpoint

1. What is a composite primary key and when would you use one?
2. What's the difference between a natural and surrogate key?
3. What constraint prevents duplicate email addresses?
4. **Reflection**: Review your Learning OS schema. Any design improvements?
