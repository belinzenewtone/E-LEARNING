# Product Requirements Document

**Platform:** Personal Learning OS  
**User:** Single user (personal use only)  
**Timeline:** May 11 – October 11, 2026 (22 weeks)  
**Goal:** Upskill in Data Engineering and JavaScript/TypeScript/Next.js with structured sprints, real assignments, and portfolio proof.

---

## Core User Flows

### Daily Flow
1. Open dashboard → see today's tasks
2. See active week/sprint and upcoming deadline
3. Choose a lesson → open external source material
4. Take notes inside the platform
5. Complete checkpoint questions
6. Mark lesson done (gated: source reviewed + checkpoint + reflection)
7. Work on weekly assignment
8. Submit proof (GitHub link, SQL script, screenshot, deployment link, reflection)
9. XP, streak, progress update automatically
10. Friday: complete retrospective

### Core Loop
**Learn → Build → Submit → Review → Improve**

---

## Features

### A. Dashboard
- Current week/sprint context
- XP, streak, overall progress
- Today's learning plan
- Track progress (Web + Data)
- Recent activity timeline
- Quick actions: Start Lesson, Add Study Log, View Roadmap, Add Note

### B. Roadmap
- Two tracks side by side
- Week grouping with phase labels
- Module cards: title, hours, status, lesson count
- Status filters: All | Active | Completed | Locked
- Click module → details with lesson list

### C. Weekly Sprint
- ALX-style weekly rhythm (Saturday open, Friday deadline)
- Goals, lessons, assignment, stretch tasks
- Friday deadline indicator
- Retrospective section (30 XP on completion)
- Status: Locked | Active | Completed

### D. Lesson View
- Three-column layout: Info | Study | Progress
- External source link (opens new tab)
- Personal notes editor
- Checkpoint questions with answers
- Reflection fields (understood / confused / apply)
- Completion button (gated)
- Next lesson button

### E. Assignment System
- Rubric with max points per criterion
- Required deliverables checklist
- Submission fields: GitHub, deployment, SQL script, screenshot, notes, reflection, self-score (1–10)
- Status flow: Not started → In progress → Submitted → Reviewed → Completed
- Completion gated: must have proof link + reflection + self-score

### F. Notes
- Linked to: lesson, assignment, week, or track
- Markdown content
- Tags (array)
- Flags: pinned, reviewLater, confusing
- Full-text search

### G. Study Logs
- Date, track, minutes
- Mood (great/good/neutral/tired/frustrated)
- Energy (1–5)
- Learned, blockers, next step
- Contributes to streak (≥30 minutes = active day)

### H. Progress Engine
- XP: append-only events, cumulative total
- Streak: consecutive days with ≥30 min logged
- Weekly score: 40% lessons + 40% assignments + 10% study + 10% retro
- Overdue: past dueDate with no submission
- Progress snapshots: daily snapshot for analytics

### I. Analytics
- Study hours by week (bar chart)
- XP over time (area chart)
- Lessons completed over time (line chart)
- Track progress comparison
- Activity heatmap (last 60 days)

### J. AI Coach
- 7 actions: explain concept, generate quiz, summarize week, suggest next, help with blocker, review reflection, CV bullets
- Demo mode without API key (mock responses)
- Real mode with ANTHROPIC_API_KEY
- Context: user's notes + progress + current assignment

### K. Portfolio
- Aggregates completed assignments
- Shows GitHub links, live demos, SQL scripts
- Skills section (by completed modules)
- CV bullet point generator

---

## Business Logic Rules

### Lesson Completion
Requires ALL of:
1. User confirmed they reviewed the source material
2. At least one checkpoint question answered
3. Reflection added (at least one field)

### Assignment Submission
Requires ALL of:
1. At least one proof link (GitHub, deployment, SQL, or screenshot)
2. Reflection filled
3. Self-score set (1–10)

### Week Completion
Requires ALL of:
1. All required lessons completed
2. Required assignment submitted
3. Weekly retrospective completed

### Streak
- Increments: ≥30 minutes logged OR lesson completed OR assignment update
- Today's missing log does not immediately break streak (forgiveness window)
- Resets: gap of >1 day with no qualifying activity

### Overdue Detection
- Any assignment past `dueDate` with status not `submitted`, `reviewed`, or `completed`
- Previous-week lessons not completed = "behind schedule"

---

## Acceptance Criteria

1. Can log in ✓
2. Can see the full 22-week roadmap ✓
3. Can view both learning tracks ✓
4. Can open lessons and external source links ✓
5. Can take notes (Markdown) ✓
6. Can complete checkpoint questions ✓
7. Can submit weekly assignments with proof ✓
8. XP updates after meaningful activity ✓
9. Streak calculates correctly ✓
10. Dashboard shows accurate progress ✓
11. Analytics page shows charts ✓
12. Portfolio page shows completed proof ✓
13. Seeded curriculum is realistic ✓
14. UI is premium and consistent ✓
15. Works on desktop and mobile ✓
16. README and docs are complete ✓
17. Playwright tests pass ✓
18. No copied copyrighted content ✓
19. Can deploy to Vercel ✓
