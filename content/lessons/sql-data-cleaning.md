# Data Cleaning in SQL

## 🎯 By End of This Lesson You Will:
- Find and fix common data quality issues in tables
- Use SQL string functions to standardize messy text
- Identify duplicates and decide how to handle them

---

## 🌍 Real-World Analogy First

Real-world data is **always messy**. The same person can appear as:

```
"Alice Smith"
"alice smith"
"  Alice Smith  "        ← trailing/leading spaces
"Alice  Smith"           ← double space
"Alice.Smith@MAIL.com"
"alice.smith@mail.com"
```

To the database, these are 6 different people. To a human, they're one. **Data cleaning** is the work of normalizing your data so analysis is correct.

A data engineer's most common task isn't fancy ML — it's making the data trustworthy.

---

## 🗃️ Practice Data (Messy on Purpose)

```
customers (raw):
┌────┬────────────────────┬────────────────────┬────────────┐
│ id │ name               │ email              │ phone      │
├────┼────────────────────┼────────────────────┼────────────┤
│  1 │  alice smith       │ ALICE@MAIL.com     │ 0712345678 │
│  2 │ Alice Smith        │ alice@mail.com     │ +254712345678│
│  3 │ Bob  Jones         │ bob@mail.com       │ NULL       │
│  4 │ bob jones          │ bob@mail.COM       │ 0723456789 │
│  5 │ Carol Watson       │ NULL               │ 0789876543 │
│  6 │ NULL               │ test@test.com      │ 999        │
└────┴────────────────────┴────────────────────┴────────────┘
```

Issues:
- Mixed case in names and emails
- Leading/trailing whitespace
- Double spaces
- Phone numbers in different formats
- NULLs
- Test/junk data (id 6)
- Duplicates (Alice appears twice, Bob twice)

---

## 📖 Start From Zero

### Step 1: TRIM, UPPER, LOWER

```sql
-- Remove leading/trailing spaces
SELECT TRIM(name) FROM customers;

-- Standardize email case
SELECT LOWER(email) FROM customers;

-- All caps for codes/IDs
SELECT UPPER(country_code) FROM customers;

-- Combined cleanup
SELECT
  TRIM(LOWER(email)) AS clean_email
FROM customers;
```

---

## 🔨 Level Up

### Step 2: REPLACE — Replace Substrings

```sql
-- Remove double spaces
SELECT REPLACE(name, '  ', ' ') AS clean_name FROM customers;

-- Remove all spaces from phone numbers
SELECT REPLACE(REPLACE(phone, ' ', ''), '-', '') AS digits_only
FROM customers;
```

For more complex patterns, use `REGEXP_REPLACE`:

```sql
-- Replace any whitespace (including tabs, newlines) with a single space
SELECT REGEXP_REPLACE(name, '\s+', ' ', 'g') FROM customers;

-- Keep only digits (strip non-digits from phone)
SELECT REGEXP_REPLACE(phone, '[^0-9]', '', 'g') AS digits FROM customers;
```

---

### Step 3: Standardize Phone Numbers

```sql
SELECT
  id,
  phone,
  -- Strip all non-digits
  REGEXP_REPLACE(phone, '[^0-9]', '', 'g') AS digits,
  -- Convert to international format
  CASE
    WHEN REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE '254%'
      THEN '+' || REGEXP_REPLACE(phone, '[^0-9]', '', 'g')
    WHEN REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE '0%'
      THEN '+254' || SUBSTRING(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 2)
    ELSE NULL
  END AS standardized_phone
FROM customers;
```

---

### Step 4: CAST and Type Conversion

```sql
-- Convert string to number
SELECT CAST('42' AS INTEGER);              -- 42
SELECT '42'::INTEGER;                       -- PostgreSQL shorthand: 42

-- Convert number to text
SELECT CAST(42 AS TEXT);                    -- "42"
SELECT 42::TEXT;                            -- "42"

-- Convert text to date
SELECT '2026-05-15'::DATE;                 -- date type

-- Defensive: avoid errors with bad data using NULLIF
SELECT NULLIF(TRIM(input), '')::INTEGER;
```

---

### Step 5: Identifying Duplicates

```sql
-- Find duplicate emails (after cleaning)
SELECT
  LOWER(TRIM(email)) AS clean_email,
  COUNT(*) AS occurrences
FROM customers
GROUP BY LOWER(TRIM(email))
HAVING COUNT(*) > 1;
```

Result reveals which records to merge.

### Step 6: Find Duplicates Across Multiple Fields

```sql
-- Likely duplicates: same name + email
SELECT
  LOWER(TRIM(name)) AS name_clean,
  LOWER(TRIM(email)) AS email_clean,
  COUNT(*) AS dupes,
  STRING_AGG(id::TEXT, ', ') AS ids
FROM customers
GROUP BY LOWER(TRIM(name)), LOWER(TRIM(email))
HAVING COUNT(*) > 1;
```

`STRING_AGG` builds a comma-separated list of IDs — useful for showing which records are duplicates.

---

### Step 7: Filter Out Junk Data

```sql
-- Remove obviously test data
SELECT * FROM customers
WHERE name NOT ILIKE '%test%'
  AND email NOT ILIKE '%test%'
  AND email NOT ILIKE '%@example.%'
  AND LENGTH(REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) >= 7;
```

### Step 8: Building a "Clean View"

Combine all transformations into a clean query:

```sql
WITH cleaned AS (
  SELECT
    id,
    TRIM(REGEXP_REPLACE(name, '\s+', ' ', 'g')) AS name,
    LOWER(TRIM(email)) AS email,
    REGEXP_REPLACE(phone, '[^0-9]', '', 'g') AS phone_digits,
    CASE
      WHEN name ILIKE '%test%' OR email ILIKE '%test%' THEN FALSE
      ELSE TRUE
    END AS is_real
  FROM customers
)
SELECT *
FROM cleaned
WHERE is_real
  AND email IS NOT NULL
  AND phone_digits LIKE '254%' OR phone_digits LIKE '0%';
```

This pattern — **CTE that cleans, then a final filter** — is the standard data cleaning recipe.

---

### Step 9: Common String Functions Reference

```sql
LENGTH(s)              -- character count
LEFT(s, n)             -- first n chars
RIGHT(s, n)            -- last n chars
SUBSTRING(s, start, n) -- portion (1-based)
POSITION('x' IN s)     -- find substring
UPPER(s), LOWER(s)     -- case
TRIM(s), LTRIM(s), RTRIM(s)
REPLACE(s, old, new)
CONCAT(a, b, c)        -- combine
a || b                 -- concat (PostgreSQL)
INITCAP(s)             -- "title case" each word
SPLIT_PART(s, '-', 2)  -- get nth part split by delimiter
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Trim and lowercase:**
```sql
-- Show name with trimmed whitespace and lowercased
```

**Exercise 2 — Strip non-digits:**
```sql
-- Show phone with only digits (no spaces, plus signs, dashes)
```

**Exercise 3 — Find email duplicates:**
```sql
-- Find emails that appear more than once (after cleaning)
```

**Exercise 4 — Detect test data:**
```sql
-- Find rows where the name OR email contains "test" (case-insensitive)
```

**Exercise 5 — Standardize phone:**
```sql
-- Convert all phones to +254 international format
-- Reject phones with fewer than 9 digits
```

**Exercise 6 — Find near-duplicates:**
```sql
-- Two rows are likely duplicates if their cleaned names match
-- AND their cleaned emails match
-- Find all such pairs
```

**Exercise 7 — Build a clean view:**
```sql
-- Write a CTE that produces a clean version of customers:
-- - trimmed, lowercased name
-- - lowercased email
-- - digits-only phone
-- - excludes test data and rows with missing critical fields
```

**Exercise 8 — Document findings:**
```
Write 5 sentences describing:
- How many duplicates you found
- What patterns of bad data exist
- Which records you'd merge
- Which records you'd delete
- What process would prevent future issues
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Cleaning data destructively without backup | Lose original | Always work on copies, use CTE views |
| `TRIM` doesn't fix double spaces inside | "Alice  Smith" stays | Add REGEXP_REPLACE for internal whitespace |
| Case-sensitive duplicate check | "ALICE" vs "alice" treated different | Always LOWER both sides |
| Comparing NULL to anything | Returns nothing | Use IS NULL or COALESCE |
| CAST on bad data | Errors out | Validate before casting |

---

## 🧠 Mental Model

```
Cleaning pipeline:
  1. TRIM whitespace
  2. LOWER/UPPER for case
  3. REPLACE / REGEXP_REPLACE for patterns
  4. CAST types correctly
  5. NULLIF / COALESCE for missing
  6. GROUP BY + HAVING to find duplicates
  7. CTE wraps it all into a clean source

Rule: Build a clean version as a VIEW or CTE — don't UPDATE original data.
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between `TRIM` and `REPLACE`?
2. **Predict:** What does this return?
   ```sql
   SELECT LOWER(TRIM('  HELLO World  '));
   ```
3. **Find the bug:**
   ```sql
   SELECT * FROM customers WHERE email = 'BOB@MAIL.com';
   -- Bob does exist in our data but the query returns nothing. Why?
   ```
4. **Write it:** Find all rows where the name has more than one space anywhere inside it.
5. **Apply it:** Build a clean version of `customers` that you could safely run aggregates on.
6. **Reflect:** Why is it better to clean data with a CTE/VIEW than with UPDATE statements?
