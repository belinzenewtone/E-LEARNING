# Deploying Next.js to Vercel

## 🎯 By End of This Lesson You Will:
- Deploy a Next.js app to Vercel from GitHub
- Configure environment variables and a Neon Postgres database
- Run migrations and seed against your production DB

---

## 🌍 Real-World Analogy First

Vercel is the **Apple Store of Next.js apps**. They built Next.js, so deploying to Vercel is the most frictionless path:

```
local code  →  push to GitHub  →  Vercel auto-detects  →  live URL
```

No Docker. No servers to configure. Push code, get a URL. For a learning project (or even a small startup), this is the fastest path from `npm run dev` to "I have a website."

---

## 📖 Start From Zero

### Prerequisites

- Code on GitHub (any repo, public or private)
- A Vercel account (free at vercel.com)
- A Neon Postgres database (free at neon.tech) — or any Postgres provider

---

## 🔨 Level Up

### Step 1: Connect Your Repo

1. Go to vercel.com → Add New → Project
2. Import your GitHub repo (authorize Vercel if first time)
3. Vercel auto-detects Next.js — no config needed
4. Click "Deploy"

In ~2 minutes you'll have a URL like `my-app.vercel.app`.

### Step 2: Get a Postgres Database (Neon)

1. Go to neon.tech → Create a new project
2. Copy the connection string — it looks like:
   ```
   postgresql://user:pass@ep-abc-123.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```
3. This is your `DATABASE_URL`.

> **Neon's free tier** gives you ~3GB and is perfect for learning projects.

### Step 3: Add Environment Variables in Vercel

In Vercel: Project Settings → Environment Variables. Add:

```
DATABASE_URL = postgresql://...
NEXTAUTH_SECRET = (generate: openssl rand -base64 32)
NEXTAUTH_URL = https://your-app.vercel.app
```

Required for our Learning OS stack. Different projects may need different vars — check your `.env.example`.

**Make sure to add them to all three environments**: Production, Preview, Development (or at minimum Production and Preview).

### Step 4: Run Migrations Against Production DB

From your local machine, pointing at the production DB:

```bash
DATABASE_URL="postgresql://prod-url..." npx prisma migrate deploy
```

This applies all your migrations. The `migrate deploy` command is for production (no prompts, no auto-generated migrations).

### Step 5: Seed Production DB

```bash
DATABASE_URL="postgresql://prod-url..." npm run db:seed
```

⚠️ Only seed once — running it again will duplicate data or fail on unique constraints.

---

### Step 6: Configure Your Domain (Optional)

In Vercel: Settings → Domains. Add a custom domain like `learning-os.com`. Vercel walks you through DNS setup — usually a CNAME or A record. SSL is automatic.

---

### Step 7: Preview Deployments

Every PR you open in GitHub gets its own preview URL automatically:

```
PR #14 → my-app-pr-14.vercel.app
PR #15 → my-app-pr-15.vercel.app
```

Click the URL in the PR conversation to test the change live before merging.

---

### Step 8: View Logs and Analytics

Vercel Dashboard shows:
- **Real-time logs** — see runtime errors as they happen
- **Build logs** — debug build failures
- **Analytics** — page load times, requests per route
- **Speed Insights** — performance scoring per page

Always check logs when something goes wrong in production.

---

### Step 9: package.json Build Hook (Prisma Generate)

Add to your scripts:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

This ensures Prisma client is regenerated during Vercel's build. Without this, you may see "PrismaClient is not generated" errors.

---

### Step 10: vercel.json (Optional Overrides)

Most projects don't need this, but for advanced cases:

```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["bom1"],  
  "functions": {
    "app/api/**/*.ts": { "maxDuration": 30 }
  }
}
```

For example, setting `regions` to Mumbai if you're targeting users in East Africa cuts latency dramatically.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Push and deploy:**
```bash
# Make sure your code is on GitHub
git push origin main

# In Vercel: Import the repo, click Deploy
# Visit the URL
```

**Exercise 2 — Database setup:**
```
# Sign up at neon.tech, create a project
# Copy the DATABASE_URL
```

**Exercise 3 — Env vars:**
```
# Add DATABASE_URL and NEXTAUTH_SECRET in Vercel
# Redeploy
# Visit a page that needs the DB — does it work?
```

**Exercise 4 — Migrations:**
```bash
# DATABASE_URL="prod-url" npx prisma migrate deploy
# Check the Vercel app — schema should now exist
```

**Exercise 5 — Seed:**
```bash
# DATABASE_URL="prod-url" npm run db:seed
# Login to your live app with the seed credentials
```

**Exercise 6 — Preview:**
```
# Make a PR with a small text change
# Wait for Vercel to deploy a preview
# Visit the preview URL — should show your change
```

**Exercise 7 — Custom domain (optional):**
```
# If you own a domain, attach it in Vercel
# Wait for DNS propagation (~5 minutes)
# Visit your custom URL
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Forgetting Prisma generate in build | "Prisma client not generated" | Add to `scripts.build` |
| Wrong DATABASE_URL format | Connection error | Verify with local connection first |
| Committing `.env` | Secrets leaked publicly | Always in `.gitignore` |
| Missing NEXTAUTH_SECRET | Auth crashes | Generate with `openssl rand -base64 32` |
| Running seed twice | Duplicate data | Run once or use upsert |
| Not setting env vars for Preview | Previews show errors | Add to all environments |

---

## 🧠 Mental Model

```
GitHub repo  ──→  Vercel detects push  ──→  builds  ──→  deploys
                  ↑                                       ↓
            env vars / DB URL                    https://your-app.vercel.app

Prisma flow:
  local schema → migrations committed → migrate deploy on production DB

Every PR = a free preview deployment URL
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between `prisma migrate dev` and `prisma migrate deploy`?
2. **Predict:** You add a new env var locally to `.env` but don't add it to Vercel. What happens in production?
3. **Find the bug:** Your build fails with "PrismaClient is not generated." Why?
4. **Write it:** Outline the 5 steps to take a new Next.js + Prisma app from local to live.
5. **Apply it:** Deploy your Learning OS project. Document each step you took.
6. **Reflect:** Vercel removes most deployment friction. What's a downside of leaning entirely on one provider?
