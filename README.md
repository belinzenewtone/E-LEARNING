# Personal Learning OS

A personal e-learning platform for one user — built to upskill in **Data Engineering** and **JavaScript / TypeScript / Next.js** over 22 weeks (May 11 – October 11, 2026).

This is not a public LMS. It is a personal learning operating system inspired by ALX, DataCamp, Codecademy, freeCodeCamp, and roadmap.sh.

> This platform is itself a portfolio project demonstrating full-stack proficiency in Next.js, TypeScript, PostgreSQL, Prisma, and learning analytics.

---

## Features

- **22-week structured roadmap** — Web (JS → TS → Next.js → Node.js) + Data Engineering (SQL → ETL → Warehousing)
- **Weekly sprints** — ALX-style rhythm: Saturday start, Friday deadline, retrospective on completion
- **Lesson view** — source links, personal notes, checkpoint questions, reflection, completion gating
- **Assignment system** — rubric, deliverables, GitHub/deployment/SQL/screenshot proof, self-scoring
- **XP & streak engine** — lessons (+20), checkpoints (+10), assignments (+80), retro (+30), study logs (+10), capstone (+150)
- **Analytics dashboard** — study hours, XP over time, track progress, streak history (Recharts)
- **Portfolio page** — aggregates completed proof-of-work into a career-ready portfolio
- **AI Coach panel** — 7 coaching actions with graceful disabled state when no API key
- **Notes system** — Markdown notes linked to lessons/assignments/weeks; tags, pin, review-later, confusing flags
- **Study logs** — daily logging with mood, energy, blockers, tomorrow's plan

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4, shadcn/ui |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Database | PostgreSQL (Supabase or Neon) |
| ORM | Prisma |
| Auth | NextAuth v5 (credentials) |
| Hosting | Vercel |
| Testing | Playwright (E2E) |

---

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database (Supabase or Neon recommended, or local Docker)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/learning_os"
NEXTAUTH_SECRET="your-secret-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="you@example.com"
ADMIN_PASSWORD="yourpassword"
ADMIN_NAME="Your Name"
ANTHROPIC_API_KEY=""   # Optional — enables real AI coaching
```

### 3. Set up the database

```bash
npm run db:push     # Push schema to database
npm run db:seed     # Seed 22-week curriculum + sample data
```

### 4. Start development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — login with your ADMIN_EMAIL and ADMIN_PASSWORD.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create and apply migration |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset database and re-seed |
| `npm test` | Run Playwright E2E tests |

---

## Deployment to Vercel

1. Push to GitHub
2. Import in Vercel dashboard
3. Set environment variables (same as `.env`)
4. Deploy — Vercel auto-detects Next.js
5. Run `npm run db:seed` once after deployment

---

## Project Structure

```
learning-os/
├── app/
│   ├── (dashboard)/      # Protected routes
│   │   ├── dashboard/
│   │   ├── roadmap/
│   │   ├── weeks/
│   │   ├── lessons/
│   │   ├── assignments/
│   │   ├── notes/
│   │   ├── study-log/
│   │   ├── analytics/
│   │   ├── portfolio/
│   │   └── settings/
│   ├── api/              # Route handlers
│   └── login/
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Sidebar, topbar
│   ├── dashboard/        # AI coach, dashboard widgets
│   └── shared/           # Stat cards, progress ring, empty states
├── lib/                  # DB client, auth, XP, utilities
├── server/
│   ├── actions/          # Server Actions (mutations)
│   └── queries/          # DB read queries
├── prisma/
│   ├── schema.prisma
│   └── seed.ts           # 22-week curriculum seed
├── tests/                # Playwright + unit tests
└── docs/                 # Architecture and curriculum docs
```

---

## 22-Week Curriculum Overview

| Phase | Weeks | Web | Data |
|---|---|---|---|
| Foundations | 1–4 | JS basics, DOM, Git | SQL SELECT/WHERE/JOIN/GROUP |
| Deeper | 5–8 | ES6+, async, OOP, modules | CTEs, window functions, data cleaning |
| TypeScript & Design | 9–12 | TypeScript, Next.js intro | Data modelling, star schema |
| Build | 13–17 | Next.js full-stack, Prisma | ETL, dbt, Airflow concepts |
| Polish & Ship | 18–22 | Testing, deployment, capstone | Analytics pipeline, portfolio |

---

## Copyright Notice

No copyrighted course content is stored. All lesson source links point to official open documentation (MDN, TypeScript Handbook, Next.js docs, PostgreSQL docs, etc.). Personal notes are your own.
