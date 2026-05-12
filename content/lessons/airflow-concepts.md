# Orchestration Concepts: Airflow Overview

## Why This Matters

Individual scripts and queries are easy. But a real data pipeline has dozens of interdependent steps — extract from API, validate, load to staging, transform, aggregate, update dimensions, refresh dashboards. If step 3 fails, steps 4-9 shouldn't run. Orchestration tools manage these dependencies automatically.

## Core Concepts

### What is a DAG?

A **Directed Acyclic Graph** is a workflow where tasks have defined dependencies and no circular references.

```
extract_logs → validate_logs → load_staging → transform_daily
                                                   ↓
extract_xp   → validate_xp   → load_staging → aggregate_weekly
```

Each box is a **task**. Arrows are **dependencies**. The graph is "acyclic" — no loops.

### How Airflow Works

Airflow has three components:

1. **Scheduler**: Watches DAGs and triggers tasks when their dependencies are met
2. **Executor**: Runs the actual tasks (locally, Kubernetes, Celery workers)
3. **Web Server**: UI for monitoring, triggering, and debugging DAGs

### DAG Definition (Python)

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    "owner": "data-team",
    "retries": 3,
    "retry_delay": timedelta(minutes=5),
}

with DAG(
    "learning_os_analytics",
    default_args=default_args,
    schedule_interval="0 6 * * *",  # daily at 6 AM
    start_date=datetime(2026, 5, 11),
    catchup=False,
) as dag:

    extract = PythonOperator(task_id="extract_logs", python_callable=extract_fn)
    validate = PythonOperator(task_id="validate", python_callable=validate_fn)
    load = PythonOperator(task_id="load_warehouse", python_callable=load_fn)
    transform = PythonOperator(task_id="transform", python_callable=transform_fn)

    extract >> validate >> load >> transform  # defines the pipeline order
```

### Scheduling

```python
# Cron-style scheduling
schedule_interval="0 6 * * *"     # daily at 6 AM
schedule_interval="0 */6 * * *"   # every 6 hours
schedule_interval="@daily"        # midnight
schedule_interval="@weekly"       # Sunday midnight
schedule_interval=None            # manual trigger only
```

### Key Airflow Concepts

| Concept | What it is |
|---|---|
| DAG | The workflow definition (tasks + dependencies) |
| Task | One unit of work (Python function, SQL query, etc.) |
| Operator | Defines what a task does (PythonOperator, PostgresOperator) |
| Sensor | Waits for external condition (file exists, API responds) |
| XCom | Cross-communication between tasks (pass small data) |
| Backfill | Run DAG for historical dates |

### Why Orchestration Matters

Without orchestration:
- "Did the daily load run?" → Check logs manually
- "Load failed at step 3" → Steps 4-10 still ran, producing garbage
- "Retry the pipeline" → Rerun everything manually

With orchestration:
- "Did the daily load run?" → Check Airflow UI
- "Load failed at step 3" → Only step 3 is red. Steps 4-10 never started.
- "Retry the pipeline" → Click "Clear" on the failed task

## Try It Yourself

1. Draw a DAG for the Learning OS analytics pipeline.
2. Identify 5 tasks and their dependencies.
3. Write pseudo-code for the task functions.

## Common Mistakes

- **DAGs that run forever**: Always add `dagrun_timeout`. A hung task blocks the schedule.
- **Too many tasks in one DAG**: Split into multiple DAGs by domain (logs, XP, assignments).
- **No alerting on failure**: If a DAG fails silently for a month, you have a month of bad data.

## Checkpoint

1. What is a DAG and why is it useful for pipeline scheduling?
2. What happens to downstream tasks if an upstream task fails?
3. Name 4 types of Airflow operators.
4. **Reflection**: What would your Learning OS DAG look like?
