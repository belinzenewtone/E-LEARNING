# Deploying Next.js to Vercel

## Why This Matters

Code that only runs on your laptop isn't software — it's a hobby project. Deploying makes your work accessible to the world. Vercel (the company behind Next.js) offers the smoothest deployment experience: push to GitHub, and your app is live in minutes with automatic SSL, CDN, and serverless functions.

## Core Concepts

### Deployment Checklist

1. **Environment variables**: All secrets go in Vercel dashboard, never in code
2. **Database**: Must be accessible from the internet (Supabase, Neon, etc.)
3. **Build passes**: `npm run build` must succeed locally first
4. **Seed data**: Database must be seeded for the app to show content

### Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Encryption key for auth tokens |
| `NEXTAUTH_URL` | Your Vercel deployment URL |
| `NEXT_PUBLIC_APP_URL` | Public-facing URL (same as NEXTAUTH_URL) |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `ADMIN_NAME` | Your display name |

### Database Setup

Option 1 — Supabase (used in Learning OS):
1. Create a Supabase project
2. Get the "Session pooler" connection string (port 5432)
3. Run `npx prisma db push` against the remote database
4. Run `npm run db:seed` to populate data

Option 2 — Vercel Postgres or Neon:
1. Create database from Vercel dashboard
2. Connection string is auto-added as an env var
3. Run migrations via `npx prisma db push`

### Deployment Methods

**Git Integration** (recommended):
Every push to `main` triggers a new deployment. Set up in Vercel dashboard.

**CLI**:
```bash
vercel             # preview deployment
vercel --prod      # production deployment
```

### Common Issues and Fixes

| Issue | Solution |
|---|---|
| "PrismaClient not found" | Add `prisma generate` to build (auto via `postinstall`) |
| "Auth not working" | Check `NEXTAUTH_URL` matches deployment URL |
| "Database connection failed" | Connection string has correct credentials and is accessible |
| "Icons missing" | Make sure icon library is installed in dependencies |
| "Styles broken" | Tailwind is properly configured in postcss |

### Production Readiness

Before declaring your app "production ready":

- [ ] All environment variables are set
- [ ] Database is migrated and seeded
- [ ] Build passes with no errors or warnings
- [ ] Authentication works end-to-end
- [ ] At least 5 Playwright tests pass
- [ ] README documents the deployment
- [ ] Custom domain configured (optional)

## Try It Yourself

Deploy your Learning OS:
1. Push your code to GitHub
2. Import the repo in Vercel dashboard
3. Set all environment variables
4. Run database migrations against production DB
5. Run the seed script
6. Test the live site

## Checkpoint

1. What environment variables must be set for the app to work in production?
2. What does `postinstall` in package.json do for Prisma?
3. How do you run database migrations on a remote database?
4. **Reflection**: What issues did you encounter during deployment?
