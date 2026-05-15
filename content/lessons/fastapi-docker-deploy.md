# FastAPI: Docker Deploy

## 🎯 By End of This Lesson You Will:
- Write a Dockerfile for FastAPI
- Create a docker-compose setup with PostgreSQL
- Run the app in production mode
- Understand container basics

## 🌍 Real-World Analogy First

Docker is like a shipping container. You pack your entire app — code, dependencies, Python version, config — into a standardized box. That box runs identically on your laptop, your teammate's Mac, the VPS in Nairobi, or AWS in Virginia. No more "but it works on my machine."

## 📖 Start From Zero

### Dockerfile

```dockerfile
# Dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t my-fastapi-app .
docker run -p 8000:8000 my-fastapi-app
```

**What just happened?** Docker created a container with Python 3.12, installed your dependencies, copied your code, and started uvicorn. Visit `http://localhost:8000`.

## 🔨 Level Up — Docker Compose

```yaml
# docker-compose.yml
version: "3.8"

services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+asyncpg://user:pass@db:5432/app_db
    depends_on:
      - db
    command: >
      sh -c "alembic upgrade head &&
             uvicorn main:app --host 0.0.0.0 --port 8000"

volumes:
  pgdata:
```

```bash
docker-compose up --build
```

One command starts both PostgreSQL AND your FastAPI app, connected and ready.

### .dockerignore

```
venv/
__pycache__/
*.pyc
.env
.git/
```

## 🧪 Practice — Try Each Step

1. Write a Dockerfile for your FastAPI app.
2. Build and run the container locally.
3. Create a docker-compose.yml with PostgreSQL.
4. Add automatic migrations on startup.
5. Use environment variables for database URL and secret key.
6. Add a volume for persistent PostgreSQL data.
7. Push to a container registry (Docker Hub or GitHub Container Registry).

## ⚠️ Common Mistakes — Catch These Early

| Mistake | What You See | The Fix |
|---|---|---|
| `localhost` in DATABASE_URL | Container can't connect to host | Use service name: `db:5432` not `localhost:5432` |
| No .dockerignore | `.git/` and `venv/` copied into image | Create .dockerignore to exclude unnecessary files |
| Running as root in container | Security risk | Add `USER 1000` at end of Dockerfile |
| Secrets in Dockerfile | Exposed in image layers | Use environment variables, never `ENV SECRET=...` |

## 🧠 Mental Model — One Sentence

Docker packages your entire app into a lightweight container that runs identically everywhere; Docker Compose orchestrates multiple containers (app + database + cache) with a single command.

## 📝 Check Your Understanding

- **Define**: What does `docker-compose up --build` do?
- **Predict**: If you delete a Docker container, do you lose the PostgreSQL data?
- **Find the bug**: `DATABASE_URL=localhost:5432` in docker-compose.yml — why won't it connect?
- **Write it**: Create a Dockerfile and docker-compose.yml for your FastAPI project.
- **Apply it**: Add a healthcheck to your Dockerfile.
- **Reflect**: How does Docker deployment compare to Vercel's serverless deployment?

## 🚀 What This Unlocks

Production deployment. Every cloud platform (AWS, GCP, Azure, DigitalOcean) runs Docker containers. This is how real apps ship.
