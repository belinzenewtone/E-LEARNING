# ETL vs ELT Patterns

## Why This Matters

Data doesn't magically appear in your warehouse. ETL (Extract, Transform, Load) and ELT (Extract, Load, Transform) are the two patterns for moving and processing data. Choosing the right pattern affects cost, speed, and data quality.

## Core Concepts

### The Three Steps

**Extract**: Pull data from source systems (APIs, databases, files)
**Transform**: Clean, validate, aggregate, join
**Load**: Write to the destination (warehouse, data mart)

### ETL — Transform First

Advantages: Data is clean before reaching the warehouse. Less storage needed.
Disadvantages: Slower (external transform step), lose raw data.

### ELT — Load First, Transform in Warehouse

Advantages: Faster ingestion, raw data preserved, leverages warehouse compute.
Disadvantages: Need a powerful warehouse, raw data takes more storage.

### Batch vs Streaming

| Batch | Streaming |
|---|---|
| Process at intervals (hourly, daily) | Process continuously (real-time) |
| Simpler to build and debug | Complex, requires message queues |
| Higher latency | Low latency (seconds) |

### Pipeline Tools

| Tool | Type | Use Case |
|---|---|---|
| Apache Airflow | Orchestration | Schedule and monitor batch pipelines |
| dbt | Transformation | SQL-based transformations in warehouse |
| Fivetran | Extraction | Managed connectors to source systems |
| Kafka | Streaming | Real-time event ingestion |

## Try It Yourself

1. Choose ETL or ELT for your Learning OS and justify.
2. Write a pipeline spec with extract, transform, and load steps.
3. Design a daily batch schedule for study log processing.

## Common Mistakes

- **Over-engineering**: Daily batch is fine for study logs. Don't build streaming for daily data.
- **No validation between stages**: Always validate after each step.
- **Silent failures**: Alert on pipeline failure immediately.

## Checkpoint

1. Why has ELT become more popular than ETL?
2. When would you use batch vs streaming?
3. What's the difference between Airflow and dbt?
4. **Reflection**: Design the pipeline for your study logs.
