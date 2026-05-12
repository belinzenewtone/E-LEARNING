# Portfolio Data Project Documentation

## Why This Matters

Your projects are only as valuable as your ability to communicate them. A hiring manager spends 30 seconds scanning a GitHub repo. Professional documentation — README, schema diagrams, findings summaries — makes those 30 seconds count.

## Core Concepts

### README Structure

```markdown
# Project Name
One-line summary of what this project is and why it matters.

## Quick Links
- [Live Demo](#) | [SQL Scripts](./queries/) | [Schema Diagram](./schema.png)

## What I Built
2-3 sentences describing the project. What problem does it solve?

## Technical Stack
- PostgreSQL 16
- Window functions, CTEs, recursive queries
- IQR outlier detection, time-series analysis

## Key Findings
1. **Finding headline**: Evidence and implications (1-2 sentences)
2. **Finding headline**: Evidence and implications

## How to Run
\`\`\`bash
psql -d mydb -f schema.sql
psql -d mydb -f analysis.sql
\`\`\`

## What I Learned
Honest reflection on challenges and growth.

## Skills Demonstrated
- [ ] Complex SQL (window functions, CTEs)
- [ ] Data modeling (star schema)
- [ ] Data quality (validation, cleaning)
- [ ] Documentation (README, diagrams)
```

### Schema Diagrams

Tools for creating diagrams:
- **dbdiagram.io** — draw with code (recommended)
- **Draw.io** — free, visual editor
- **DBeaver** — auto-generate from existing DB

### Documenting Your Analysis

Every SQL file should have a header:
```sql
-- ============================================
-- File: analysis/03_trend_analysis.sql
-- Purpose: 7-day moving average of study hours
-- Dependencies: staging.daily_summary
-- Author: Belinze
-- Date: 2026-05-11
-- ============================================
```

### GitHub Best Practices

- **Pin your best repos** to your profile
- **Use topics** (sql, data-engineering, postgresql, analytics)
- **Clean commit history** with conventional commits
- **No credentials** — check .gitignore before pushing

## Checkpoint

1. What would you want a hiring manager to see first in your data portfolio?
2. What makes a README professional vs amateur?
3. List 3 repos you should pin to your GitHub profile.
4. **Reflection**: Write the README for your best data project.
