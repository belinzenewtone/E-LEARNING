# Orchestration Concepts: Airflow Overview

## 🎯 By End of This Lesson You Will:
- Explain what a workflow orchestrator does
- Recognize DAGs, tasks, schedules, and operators in Airflow
- Compare Airflow to alternatives (Prefect, Dagster, GitHub Actions)

---

## 🌍 Real-World Analogy First

A workflow orchestrator is like a **chef coordinating multiple stoves**:

```
Recipe for dinner:
  1. Boil pasta (10 min)
  2. Make sauce (8 min)  ← can run alongside pasta!
  3. Grate cheese (2 min) ← can run alongside both
  4. Combine all three when ALL are done

The chef:
  - Starts tasks at the right time
  - Waits for dependencies
  - Retries if something fails
  - Notifies you if the meal can't be served
```

In data, you have many "tasks" — extract X, load Y, transform Z, send report — that need to run in the right order, on schedule, with error handling. That's what Airflow does.

---

## 📖 Start From Zero

### Key Terms

```
DAG     = Directed Acyclic Graph — your workflow as a diagram of tasks
Task    = one unit of work (run a SQL query, call an API, etc.)
Operator = the type of task (BashOperator, PythonOperator, etc.)
Schedule = when the DAG should run (daily, hourly, cron expression)
Run     = a single execution of the DAG
```

```
A simple DAG:
  ┌──────────┐    ┌────────────┐    ┌──────────────┐
  │ extract  │ ─► │ transform  │ ─► │ load_report  │
  └──────────┘    └────────────┘    └──────────────┘
```

---

## 🔨 Level Up

### Step 1: A Minimal Airflow DAG

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

def extract():
    print("Extracting from source...")

def transform():
    print("Cleaning data...")

def load():
    print("Loading into warehouse...")

with DAG(
    dag_id="daily_etl",
    start_date=datetime(2026, 1, 1),
    schedule="@daily",
    catchup=False
) as dag:
    t1 = PythonOperator(task_id="extract", python_callable=extract)
    t2 = PythonOperator(task_id="transform", python_callable=transform)
    t3 = PythonOperator(task_id="load", python_callable=load)

    t1 >> t2 >> t3   # task chain: t1 must complete before t2 before t3
```

The `>>` operator declares dependencies — `t1 >> t2` means "t2 runs after t1 succeeds."

---

### Step 2: Parallel Tasks

```python
with DAG(...) as dag:
    extract_db = PythonOperator(...)
    extract_api = PythonOperator(...)
    transform = PythonOperator(...)
    load = PythonOperator(...)

    [extract_db, extract_api] >> transform >> load
    # Both extracts run in parallel, then transform, then load
```

Airflow runs independent tasks in parallel automatically — saving total time.

---

### Step 3: Schedules

```python
schedule="@daily"          # midnight UTC
schedule="@hourly"
schedule="0 9 * * *"        # 9 AM UTC every day (cron syntax)
schedule="*/15 * * * *"     # every 15 minutes
schedule=None               # manual trigger only
schedule=timedelta(hours=6) # every 6 hours
```

### Step 4: Operators — Different Task Types

```python
from airflow.operators.bash import BashOperator
from airflow.providers.postgres.operators.postgres import PostgresOperator
from airflow.providers.http.operators.http import SimpleHttpOperator

# Shell command
t1 = BashOperator(task_id="run_script", bash_command="python /opt/scripts/etl.py")

# SQL on Postgres
t2 = PostgresOperator(
    task_id="aggregate",
    postgres_conn_id="warehouse",
    sql="INSERT INTO daily_summary SELECT ... FROM raw_events;"
)

# HTTP call
t3 = SimpleHttpOperator(
    task_id="send_to_api",
    http_conn_id="my_api",
    endpoint="/webhook",
    method="POST"
)
```

There's an operator for almost everything — S3, BigQuery, dbt, Slack, Snowflake, you name it.

---

### Step 5: Retries and Failure Handling

```python
PythonOperator(
    task_id="flaky_task",
    python_callable=do_thing,
    retries=3,
    retry_delay=timedelta(minutes=5),
    on_failure_callback=notify_slack,
    email_on_failure=True
)
```

When `do_thing` fails, Airflow retries up to 3 times, with 5 minutes between, then notifies Slack and email.

---

### Step 6: XCom — Passing Data Between Tasks

```python
def extract():
    return {"row_count": 1000}

def report(**context):
    rows = context["task_instance"].xcom_pull(task_ids="extract")
    print(f"Extracted {rows['row_count']} rows")

t1 = PythonOperator(task_id="extract", python_callable=extract)
t2 = PythonOperator(task_id="report", python_callable=report)
```

XCom is small messages between tasks. Keep them tiny (IDs, counts) — not big payloads.

---

### Step 7: Branching

```python
from airflow.operators.python import BranchPythonOperator

def choose_path(**context):
    if context["data_interval_start"].day == 1:
        return "monthly_report"
    return "skip_monthly"

branch = BranchPythonOperator(
    task_id="choose",
    python_callable=choose_path
)

branch >> [monthly_report_task, skip_monthly_task]
```

The branch decides which downstream task to execute.

---

### Step 8: Alternatives to Airflow

| Tool | Sweet Spot |
|---|---|
| **Airflow** | Industry standard, huge ecosystem |
| **Prefect** | Modern Python-native, cleaner code |
| **Dagster** | Asset-focused, great for data + ML |
| **Temporal** | Long-running workflows with state |
| **GitHub Actions** | Small/simple scheduled tasks |
| **Cloud schedulers** | Single tasks (AWS EventBridge, GCP Scheduler) |

For learning data engineering, Airflow knowledge is essential — it's what most teams use.

---

### Step 9: Modern Airflow Best Practices

```
✅ DO:
  - Keep tasks small and idempotent
  - Pass small data via XCom, big data via warehouse / S3
  - Use connections / variables, not hardcoded credentials
  - Use catchup=False unless backfilling on purpose
  - Set start_date in the past, never `datetime.now()`

❌ DON'T:
  - Run heavy compute IN the Airflow worker (offload to a real engine)
  - Use Airflow for tasks under 1 minute (overkill)
  - Build monolithic DAGs with 100 tasks (split them)
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Draw a DAG:**
```
Draw the DAG diagram for:
1. extract_users
2. extract_orders (parallel to #1)
3. transform_data (after both)
4. send_report (after transform)
```

**Exercise 2 — Write the DAG:**
```python
# Write the Python code for the above
# Use PythonOperator placeholders for each task
```

**Exercise 3 — Add schedule:**
```
Make the DAG run at 7 AM every weekday (Mon-Fri)
```

**Exercise 4 — Add retry:**
```
Make extract_orders retry 3 times with 2-minute delay
Notify Slack on permanent failure
```

**Exercise 5 — Branching:**
```
Add a BranchPythonOperator at the start that decides between two paths
based on whether it's the first day of the month
```

**Exercise 6 — Real scenario:**
```
Design a DAG for the Learning OS daily analytics:
- Pull yesterday's study logs
- Compute daily summaries per user
- Update streak status
- Send "you broke your streak" emails
```

**Exercise 7 — Compare:**
```
For each task, would you use Airflow or a simpler tool?
1. Run a backup every night
2. Process payment webhooks (real-time)
3. Daily 10-step data pipeline
4. Hourly metric calculation
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| `start_date=datetime.now()` | DAG never runs | Always use a fixed past date |
| `catchup=True` by mistake | Backfills ALL past dates | Default to `catchup=False` |
| Huge XCom payloads | Slow scheduler | Pass references, not data |
| Tasks that share global state | Race conditions | Make each task idempotent |
| No retries on flaky external APIs | Pipeline fails on hiccups | Add retries with backoff |

---

## 🧠 Mental Model

```
DAG = workflow as graph
  Tasks (nodes) + Dependencies (edges)
  Tasks run when their upstream tasks succeed

Schedule defines when the DAG runs.
Operators define what each task does.
Retries / alerts handle failures.

Default: tasks idempotent, small data via XCom,
heavy compute pushed to actual engines (warehouse, Spark).
```

---

## 📝 Check Your Understanding

1. **Define:** What does DAG stand for and why must it be acyclic?
2. **Predict:** Given `[a, b] >> c >> d`, what runs first? In parallel?
3. **Find the bug:** A DAG has `start_date=datetime.now()` and never runs. Why?
4. **Write it:** Sketch a DAG for a daily Stripe → BigQuery pipeline with quality checks.
5. **Apply it:** Outline an Airflow DAG for the Learning OS nightly stats job.
6. **Reflect:** Airflow has been around 10+ years. Why do newer tools like Prefect/Dagster keep being created?
