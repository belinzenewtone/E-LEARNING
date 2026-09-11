# CloudOS — Personal Command Center

> IT Support → Cloud Engineering · 12-month sprint (2026)

Built with **Nuxt 4.5** · **Supabase** · **Nuxt UI v4** · **Tailwind CSS v4** · Deployed on **Vercel**

---

## Features

| Module | What it does |
|---|---|
| **Dashboard** | Overview stats, quick nav, recent daily logs |
| **Certifications** | Track AWS SAA → Terraform → CKA path |
| **Projects** | 8-step checklist per project (idea → portfolio-ready) |
| **Learning** | Python · Bash · Nuxt · Cloud/AWS topic tracker |
| **Jobs Pipeline** | Full Kanban: Saved → Applied → Screening → Interview → Offer |
| **Runway** | Financial burn rate, savings, months remaining |
| **Checkpoints** | Month 3 / 6 / 9 / 10 milestone gates with criteria |
| **Daily Log** | Track outputs (not hours) with energy level |
| **Case Studies** | Write up what you built and learned |

---

## Setup

### 1. Clone & Install

```bash
git clone <repo>
cd cloudos
npm install
```

### 2. Supabase

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → create a project
2. Copy your **Project URL** and **anon/public key** from Settings → API
3. Open the SQL editor and run [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql)
4. Create your user: Authentication → Users → Invite user (use your email)

### 3. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_KEY=your-anon-public-key
```

### 4. Run Dev

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push to GitHub
2. Import into Vercel
3. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
4. Deploy — done ✅

---

## After DB is Live — Regenerate Types

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > types/database.types.ts
```

Then remove all `// eslint-disable-next-line @typescript-eslint/no-explicit-any` and `as any` casts — the full type safety kicks in.

---

## Tech Stack

- **Nuxt 4.5.2** — Vue 3 meta-framework
- **@nuxtjs/supabase 1.5** — Auth + DB
- **Nuxt UI 4.11** — 110+ components
- **Pinia** — State management
- **Tailwind CSS 4** — Utility styles
- **TypeScript** — Type safety
- **Vercel** — Hosting
