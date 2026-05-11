import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { addDays, addWeeks } from "date-fns";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

// ─── Helpers ──────────────────────────────────────────────────────────────────
function weekStart(weekNum: number): Date {
  // Week 1 starts Saturday May 9 2026 (so Mon-Fri = May 11-15)
  const base = new Date("2026-05-09T00:00:00.000Z");
  return addWeeks(base, weekNum - 1);
}

function weekEnd(weekNum: number): Date {
  return addDays(weekStart(weekNum), 6);
}

function friday(weekNum: number): Date {
  return addDays(weekStart(weekNum), 6); // Friday = +5 from Saturday start
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding database…");

  // ── User ──────────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "changeme123", 12);
  const user = await db.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "belinze.newtone@jtl.co.ke" },
    update: {},
    create: {
      name: process.env.ADMIN_NAME ?? "Belinze",
      email: process.env.ADMIN_EMAIL ?? "belinze.newtone@jtl.co.ke",
      passwordHash: hash,
    },
  });
  console.log(`✅ User: ${user.email}`);

  // ── Tracks ─────────────────────────────────────────────────────────────────
  const webTrack = await db.track.upsert({
    where: { slug: "web" },
    update: {},
    create: {
      name: "Web Development",
      slug: "web",
      description:
        "Master modern JavaScript, TypeScript, React, Next.js, and Node.js — from fundamentals to production-grade full-stack apps.",
      color: "#22d3ee",
      icon: "Code2",
      targetHours: 240,
      order: 1,
    },
  });

  const dataTrack = await db.track.upsert({
    where: { slug: "data-engineering" },
    update: {},
    create: {
      name: "Data Engineering",
      slug: "data-engineering",
      description:
        "Build the SQL-first foundation then level up through data modelling, ETL/ELT, orchestration, warehousing, and cloud data pipelines.",
      color: "#34d399",
      icon: "Database",
      targetHours: 200,
      order: 2,
    },
  });
  console.log("✅ Tracks");

  // ── Modules ────────────────────────────────────────────────────────────────
  const webModules = [
    { title: "JavaScript Foundations", slug: "js-foundations", order: 1, estimatedHours: 30, status: "active", description: "Variables, data types, operators, control flow, functions — the absolute core of JavaScript." },
    { title: "JavaScript Deep Dive", slug: "js-deep-dive", order: 2, estimatedHours: 35, status: "locked", description: "ES6+, destructuring, spread/rest, closures, OOP, async JS, Promises, Fetch API, modules." },
    { title: "TypeScript Fundamentals", slug: "ts-fundamentals", order: 3, estimatedHours: 25, status: "locked", description: "Types, interfaces, generics, narrowing — write safer, self-documenting JavaScript." },
    { title: "Next.js & React", slug: "nextjs-react", order: 4, estimatedHours: 45, status: "locked", description: "App Router, layouts, server/client components, server actions, forms, routing, Prisma integration." },
    { title: "Node.js & Backend", slug: "nodejs-backend", order: 5, estimatedHours: 30, status: "locked", description: "Node.js runtime, APIs, middleware, authentication, file system, environment management." },
    { title: "Production & Deployment", slug: "production-deployment", order: 6, estimatedHours: 20, status: "locked", description: "Testing, performance, accessibility, SEO, caching, Vercel deployment, Playwright." },
  ];

  const createdWebModules: Record<string, string> = {};
  for (const mod of webModules) {
    const m = await db.module.upsert({
      where: { slug: mod.slug },
      update: {},
      create: { ...mod, trackId: webTrack.id },
    });
    createdWebModules[mod.slug] = m.id;
  }

  const dataModules = [
    { title: "SQL Foundations", slug: "sql-foundations", order: 1, estimatedHours: 28, status: "active", description: "SELECT, WHERE, ORDER BY, LIMIT, GROUP BY, HAVING, JOINs — essential SQL from scratch using real datasets." },
    { title: "Advanced SQL", slug: "advanced-sql", order: 2, estimatedHours: 30, status: "locked", description: "CTEs, window functions, subqueries, data cleaning, query organisation — production-grade SQL thinking." },
    { title: "Data Modelling", slug: "data-modelling", order: 3, estimatedHours: 20, status: "locked", description: "Normalisation, OLTP vs OLAP, star schema, fact/dimension tables — designing schemas that scale." },
    { title: "ETL & Pipelines", slug: "etl-pipelines", order: 4, estimatedHours: 25, status: "locked", description: "Batch processing, data quality, orchestration with Airflow concepts, dbt basics, ELT patterns." },
    { title: "Data Warehousing", slug: "data-warehousing", order: 5, estimatedHours: 20, status: "locked", description: "Warehouse concepts, partitioning, materialised views, query optimisation, cloud storage basics." },
    { title: "Capstone & Portfolio", slug: "data-capstone", order: 6, estimatedHours: 25, status: "locked", description: "End-to-end analytics pipeline, portfolio SQL projects, learning analytics dashboard, documentation." },
  ];

  const createdDataModules: Record<string, string> = {};
  for (const mod of dataModules) {
    const m = await db.module.upsert({
      where: { slug: mod.slug },
      update: {},
      create: { ...mod, trackId: dataTrack.id },
    });
    createdDataModules[mod.slug] = m.id;
  }
  console.log("✅ Modules");

  // ── Week Sprints ───────────────────────────────────────────────────────────
  const weeks = [
    // PHASE 1: Foundations (Weeks 1–4)
    {
      weekNumber: 1, title: "Week 1 — Hello, Foundation", theme: "JavaScript basics & SQL SELECT",
      phase: 1, estimatedHours: 22,
      goals: ["Understand JS variables, types, operators", "Write 20 basic SQL queries", "Set up local dev environment", "Complete first assignment"],
    },
    {
      weekNumber: 2, title: "Week 2 — Control Flow & Filtering", theme: "JS control flow, functions & SQL WHERE/ORDER",
      phase: 1, estimatedHours: 22,
      goals: ["Master if/else, loops, switch", "Write functions confidently", "Filter and sort SQL data", "Build a DOM task list"],
    },
    {
      weekNumber: 3, title: "Week 3 — Data Structures & Aggregations", theme: "Arrays, Objects & SQL GROUP BY + Joins",
      phase: 1, estimatedHours: 22,
      goals: ["Work with arrays and objects", "Use SQL GROUP BY, HAVING", "Understand INNER/LEFT/RIGHT JOINs", "Build array/object mini app"],
    },
    {
      weekNumber: 4, title: "Week 4 — Foundation Review & Git", theme: "Consolidation, Git workflow & combined assignment",
      phase: 1, estimatedHours: 22,
      goals: ["Review Phase 1 concepts", "Set up Git workflow", "Publish first GitHub repo", "Write combined markdown progress report"],
    },
    // PHASE 2: Deeper JS & Production SQL (Weeks 5–8)
    {
      weekNumber: 5, title: "Week 5 — ES6+ & CTEs", theme: "Modern JavaScript & SQL CTEs/Subqueries",
      phase: 2, estimatedHours: 23,
      goals: ["Use destructuring, spread, rest", "Master array methods (map, filter, reduce)", "Write CTEs and nested subqueries", "Build data-fetching JS app"],
    },
    {
      weekNumber: 6, title: "Week 6 — OOP, Modules & Window Functions", theme: "JavaScript classes, modules & SQL window functions",
      phase: 2, estimatedHours: 23,
      goals: ["Write OOP JavaScript with classes", "Use ES modules properly", "Apply ROW_NUMBER, RANK, LAG/LEAD", "Modularise JS project"],
    },
    {
      weekNumber: 7, title: "Week 7 — Async JS & Data Cleaning", theme: "Promises, Fetch API & SQL data quality",
      phase: 2, estimatedHours: 23,
      goals: ["Chain Promises and use async/await", "Handle loading and error states", "Write data cleaning SQL scripts", "Build async app with real API"],
    },
    {
      weekNumber: 8, title: "Week 8 — Tooling & SQL Portfolio Project 1", theme: "Git advanced, build tools & first SQL portfolio project",
      phase: 2, estimatedHours: 24,
      goals: ["Advanced Git: branching, PRs, commits", "Exploratory SQL analysis with README", "Package.json and npm fundamentals", "Publish SQL project to GitHub"],
    },
    // PHASE 3: TypeScript, React, Data Modelling (Weeks 9–12)
    {
      weekNumber: 9, title: "Week 9 — TypeScript Basics & Data Modelling", theme: "TypeScript everyday types & normalisation",
      phase: 3, estimatedHours: 23,
      goals: ["Understand TypeScript's type system", "Use interfaces, types, unions", "Understand 1NF, 2NF, 3NF", "Design first normalised schema"],
    },
    {
      weekNumber: 10, title: "Week 10 — TS Functions, Narrowing & Star Schema", theme: "Advanced TypeScript & OLAP design",
      phase: 3, estimatedHours: 23,
      goals: ["Type functions and return types", "Use type narrowing confidently", "Design fact and dimension tables", "Build star schema for learning analytics"],
    },
    {
      weekNumber: 11, title: "Week 11 — Generics, Next.js Intro & Warehouse", theme: "TypeScript generics & data warehouse concepts",
      phase: 3, estimatedHours: 23,
      goals: ["Use generics for reusable types", "Start Learn Next.js official course", "Understand partitioning and materialised views", "Create warehouse-style tables in PostgreSQL"],
    },
    {
      weekNumber: 12, title: "Week 12 — Combined: Schema Design for Learning OS", theme: "Design and document the Learning OS database",
      phase: 3, estimatedHours: 24,
      goals: ["Design complete database schema", "Write Prisma models", "Document relationships and decisions", "SQL Portfolio Project 2: schema deep dive"],
    },
    // PHASE 4: Build the Platform (Weeks 13–17)
    {
      weekNumber: 13, title: "Week 13 — App Shell & Navigation", theme: "Next.js App Router, layouts, routing",
      phase: 4, estimatedHours: 24,
      goals: ["Set up App Router project", "Build sidebar and navigation", "Implement authentication", "Server vs client components"],
    },
    {
      weekNumber: 14, title: "Week 14 — Roadmap & Lesson Pages", theme: "Dynamic routes, data fetching, UI components",
      phase: 4, estimatedHours: 24,
      goals: ["Build roadmap visual page", "Implement dynamic lesson routes", "Use Prisma for server-side data", "Build card and badge components"],
    },
    {
      weekNumber: 15, title: "Week 15 — Assignments & Submissions", theme: "Forms, server actions, file/link submissions",
      phase: 4, estimatedHours: 24,
      goals: ["Build assignment detail pages", "Implement submission forms", "Use Zod for validation", "Handle submission status flow"],
    },
    {
      weekNumber: 16, title: "Week 16 — Progress Engine & XP/Streak", theme: "Business logic, XP, streak, weekly score",
      phase: 4, estimatedHours: 24,
      goals: ["Implement XP event system", "Build streak calculation logic", "Compute weekly scores", "Detect overdue assignments"],
    },
    {
      weekNumber: 17, title: "Week 17 — Analytics Dashboard", theme: "Recharts, progress charts, study analytics",
      phase: 4, estimatedHours: 24,
      goals: ["Build analytics page with Recharts", "Study hours by week chart", "XP over time chart", "Track comparison progress bars"],
    },
    // PHASE 5: Production Polish & Capstone (Weeks 18–22)
    {
      weekNumber: 18, title: "Week 18 — AI Coach & Review System", theme: "AI coach UI, review panel, weekly retrospective",
      phase: 5, estimatedHours: 23,
      goals: ["Build AI coach panel with mock responses", "Implement weekly retrospective flow", "Add environment variable support for AI API", "Polish lesson and assignment UIs"],
    },
    {
      weekNumber: 19, title: "Week 19 — Portfolio & Proof of Work", theme: "Portfolio page, proof links, career-ready artifacts",
      phase: 5, estimatedHours: 22,
      goals: ["Build portfolio/proof-of-work page", "Aggregate completed assignments", "Display GitHub links and deployments", "Generate CV-ready skill list"],
    },
    {
      weekNumber: 20, title: "Week 20 — Testing & UX Polish", theme: "Playwright tests, accessibility, responsive design",
      phase: 5, estimatedHours: 23,
      goals: ["Write Playwright end-to-end tests", "Audit and improve accessibility", "Test responsive layout on mobile", "Fix UX issues from self-review"],
    },
    {
      weekNumber: 21, title: "Week 21 — Deployment & Documentation", theme: "Vercel deploy, README, architecture docs",
      phase: 5, estimatedHours: 22,
      goals: ["Deploy to Vercel with Neon Postgres", "Write complete README", "Document architecture and schema", "Set environment variables in production"],
    },
    {
      weekNumber: 22, title: "Week 22 — Capstone & Retrospective", theme: "Final capstone, portfolio summary, 22-week review",
      phase: 5, estimatedHours: 20,
      goals: ["Finalize Learning OS as portfolio project", "Write 22-week learning retrospective", "Update CV and LinkedIn with new skills", "Publish final portfolio summary"],
    },
  ];

  const now = new Date();
  function weekStatus(weekNum: number): string {
    const start = weekStart(weekNum);
    const end = weekEnd(weekNum);
    if (now >= start && now <= end) return "active";
    if (now > end) return "completed";
    return "locked";
  }

  const createdWeeks: Record<number, string> = {};
  for (const w of weeks) {
    const status = weekStatus(w.weekNumber);
    const sprint = await db.weekSprint.upsert({
      where: { weekNumber: w.weekNumber },
      update: { status },
      create: {
        weekNumber: w.weekNumber,
        title: w.title,
        theme: w.theme,
        phase: w.phase,
        startDate: weekStart(w.weekNumber),
        endDate: weekEnd(w.weekNumber),
        goals: w.goals,
        estimatedHours: w.estimatedHours,
        status,
      },
    });
    createdWeeks[w.weekNumber] = sprint.id;
  }
  console.log("✅ Week Sprints (22 weeks)");

  // ── Lessons ────────────────────────────────────────────────────────────────
  // Web lessons — Phase 1
  const webLessons = [
    // Week 1
    { week: 1, module: "js-foundations", title: "Setting Up Your Dev Environment", slug: "dev-environment-setup", objective: "Install Node.js, VS Code, Git, and configure a basic JavaScript project.", sourceName: "Node.js Official Docs", sourceType: "official-docs", sourceUrl: "https://nodejs.org/en/docs/guides", estimatedMinutes: 45, order: 1, difficulty: "beginner", keyConcepts: ["Node.js installation", "npm basics", "VS Code extensions", "Terminal basics"], checkpointQuestions: [{ type: "short-answer", question: "What command checks your Node.js version?" }, { type: "reflection", question: "What was the most confusing part of setting up?" }] },
    { week: 1, module: "js-foundations", title: "Variables: var, let, const", slug: "js-variables", objective: "Understand the differences between var, let, and const and when to use each.", sourceName: "MDN JavaScript Guide", sourceType: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types", estimatedMinutes: 50, order: 2, difficulty: "beginner", keyConcepts: ["var hoisting", "block scope with let", "const immutability", "temporal dead zone"], checkpointQuestions: [{ type: "multiple-choice", question: "Which keyword creates a block-scoped variable?", options: ["var", "let", "function", "global"], answer: "let" }, { type: "short-answer", question: "Explain why const doesn't mean the value is immutable." }] },
    { week: 1, module: "js-foundations", title: "Data Types & Type Coercion", slug: "js-data-types", objective: "Learn JavaScript's primitive types and how type coercion works.", sourceName: "MDN: JavaScript data types", sourceType: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures", estimatedMinutes: 60, order: 3, difficulty: "beginner", keyConcepts: ["string, number, boolean", "null vs undefined", "typeof operator", "type coercion"], checkpointQuestions: [{ type: "multiple-choice", question: "What does typeof null return?", options: ["null", "object", "undefined", "string"], answer: "object" }, { type: "reflection", question: "What surprised you most about type coercion?" }] },
    { week: 1, module: "js-foundations", title: "Operators & Expressions", slug: "js-operators", objective: "Master arithmetic, comparison, and logical operators in JavaScript.", sourceName: "MDN: Expressions and operators", sourceType: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators", estimatedMinutes: 45, order: 4, difficulty: "beginner", keyConcepts: ["arithmetic operators", "== vs ===", "logical AND/OR/NOT", "ternary operator"], checkpointQuestions: [{ type: "multiple-choice", question: "What does === check that == does not?", options: ["Value only", "Type only", "Both value and type", "Reference"], answer: "Both value and type" }] },
    // Week 2
    { week: 2, module: "js-foundations", title: "Control Flow: if, else, switch", slug: "js-control-flow", objective: "Use conditional statements to control program execution.", sourceName: "MDN: Control flow and error handling", sourceType: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling", estimatedMinutes: 55, order: 1, difficulty: "beginner", keyConcepts: ["if/else", "switch statements", "truthy/falsy values", "short-circuit evaluation"], checkpointQuestions: [{ type: "short-answer", question: "List 5 falsy values in JavaScript." }, { type: "reflection", question: "When would you use switch over if/else?" }] },
    { week: 2, module: "js-foundations", title: "Loops: for, while, forEach", slug: "js-loops", objective: "Iterate over data using different loop structures.", sourceName: "MDN: Loops and iteration", sourceType: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration", estimatedMinutes: 50, order: 2, difficulty: "beginner", keyConcepts: ["for loop", "while loop", "do...while", "forEach", "break and continue"], checkpointQuestions: [{ type: "multiple-choice", question: "Which loop always executes at least once?", options: ["for", "while", "do...while", "forEach"], answer: "do...while" }] },
    { week: 2, module: "js-foundations", title: "Functions: Declaration & Expression", slug: "js-functions-basics", objective: "Write reusable code with function declarations, expressions, and arrow functions.", sourceName: "MDN: Functions guide", sourceType: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions", estimatedMinutes: 65, order: 3, difficulty: "beginner", keyConcepts: ["function declaration", "function expression", "arrow functions", "parameters vs arguments", "return values"], checkpointQuestions: [{ type: "short-answer", question: "What is the difference between a function declaration and expression in terms of hoisting?" }, { type: "reflection", question: "When would arrow functions cause problems with `this`?" }] },
    { week: 2, module: "js-foundations", title: "DOM Manipulation Basics", slug: "js-dom-basics", objective: "Select elements and update the page using the DOM API.", sourceName: "MDN: Introduction to the DOM", sourceType: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction", estimatedMinutes: 60, order: 4, difficulty: "beginner", keyConcepts: ["querySelector", "innerHTML vs textContent", "classList", "addEventListener", "event object"], checkpointQuestions: [{ type: "multiple-choice", question: "Which method returns the first matching element?", options: ["getElementById", "querySelector", "querySelectorAll", "getElementsByClass"], answer: "querySelector" }] },
    // Week 3
    { week: 3, module: "js-foundations", title: "Arrays: Creation & Core Methods", slug: "js-arrays-basics", objective: "Create and manipulate arrays using built-in methods.", sourceName: "MDN: Array reference", sourceType: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array", estimatedMinutes: 60, order: 1, difficulty: "beginner", keyConcepts: ["push, pop, shift, unshift", "slice and splice", "indexOf and includes", "spread operator with arrays"], checkpointQuestions: [{ type: "short-answer", question: "What is the difference between slice and splice?" }] },
    { week: 3, module: "js-foundations", title: "Objects: Properties & Methods", slug: "js-objects-basics", objective: "Understand object structure, property access, and methods.", sourceName: "MDN: Working with objects", sourceType: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects", estimatedMinutes: 60, order: 2, difficulty: "beginner", keyConcepts: ["object literals", "dot vs bracket notation", "Object.keys/values/entries", "nested objects", "this keyword basics"], checkpointQuestions: [{ type: "reflection", question: "What is the difference between dot notation and bracket notation, and when would you use each?" }] },
    // Week 4
    { week: 4, module: "js-foundations", title: "Debugging JavaScript", slug: "js-debugging", objective: "Use browser DevTools and console methods to find and fix bugs.", sourceName: "MDN: Debugging JavaScript", sourceType: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing/Debugging_JavaScript", estimatedMinutes: 50, order: 1, difficulty: "beginner", keyConcepts: ["console.log strategies", "breakpoints", "call stack", "common errors: TypeError, ReferenceError"], checkpointQuestions: [{ type: "short-answer", question: "What is a stack trace and how do you read it?" }] },
    { week: 4, module: "js-foundations", title: "Git & GitHub Fundamentals", slug: "git-fundamentals", objective: "Use Git for version control and GitHub for remote collaboration.", sourceName: "Official Git Documentation", sourceType: "official-docs", sourceUrl: "https://git-scm.com/doc", estimatedMinutes: 60, order: 2, difficulty: "beginner", keyConcepts: ["git init, add, commit", "branches", "push and pull", "GitHub repos and READMEs"], checkpointQuestions: [{ type: "short-answer", question: "What is the difference between git add and git commit?" }] },
    // Week 5 — ES6+
    { week: 5, module: "js-deep-dive", title: "Destructuring & Spread/Rest", slug: "js-destructuring-spread", objective: "Write cleaner code using destructuring assignment and spread/rest syntax.", sourceName: "MDN: Destructuring assignment", sourceType: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment", estimatedMinutes: 55, order: 1, difficulty: "intermediate", keyConcepts: ["array destructuring", "object destructuring", "rest in functions", "spread for clone/merge"], checkpointQuestions: [{ type: "short-answer", question: "How do you rename a variable while destructuring an object?" }] },
    { week: 5, module: "js-deep-dive", title: "Array Methods: map, filter, reduce", slug: "js-array-methods", objective: "Transform and reduce data using functional array methods.", sourceName: "MDN: Array.prototype.map", sourceType: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map", estimatedMinutes: 65, order: 2, difficulty: "intermediate", keyConcepts: ["map for transformation", "filter for selection", "reduce for accumulation", "chaining methods"], checkpointQuestions: [{ type: "multiple-choice", question: "Which method returns a new array of the same length?", options: ["filter", "reduce", "map", "find"], answer: "map" }, { type: "reflection", question: "When would you chain map and filter together?" }] },
    { week: 5, module: "js-deep-dive", title: "Maps, Sets, and Symbols", slug: "js-maps-sets", objective: "Use Map and Set for structured, unique data collections.", sourceName: "MDN: Map reference", sourceType: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map", estimatedMinutes: 50, order: 3, difficulty: "intermediate", keyConcepts: ["Map vs Object", "Set for unique values", "WeakMap and WeakSet basics", "Symbol for unique keys"], checkpointQuestions: [{ type: "short-answer", question: "Give a real-world use case where Set is more appropriate than Array." }] },
    // Week 6
    { week: 6, module: "js-deep-dive", title: "Closures & Scope", slug: "js-closures", objective: "Understand how closures capture variables and use them effectively.", sourceName: "MDN: Closures", sourceType: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures", estimatedMinutes: 60, order: 1, difficulty: "intermediate", keyConcepts: ["lexical scope", "closure definition", "practical closure patterns", "IIFE"], checkpointQuestions: [{ type: "reflection", question: "Write a counter function using a closure." }] },
    { week: 6, module: "js-deep-dive", title: "OOP: Classes & Prototypes", slug: "js-oop-classes", objective: "Model real-world entities using JavaScript classes and prototypal inheritance.", sourceName: "MDN: Classes", sourceType: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes", estimatedMinutes: 70, order: 2, difficulty: "intermediate", keyConcepts: ["class keyword", "constructor method", "extends and super", "static methods", "private fields"], checkpointQuestions: [{ type: "short-answer", question: "What is the difference between a class and a prototype in JavaScript?" }] },
    { week: 6, module: "js-deep-dive", title: "ES Modules: import & export", slug: "js-modules", objective: "Split code into reusable modules using ES module syntax.", sourceName: "MDN: JavaScript modules", sourceType: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules", estimatedMinutes: 50, order: 3, difficulty: "intermediate", keyConcepts: ["named exports", "default exports", "import statements", "module scope"], checkpointQuestions: [{ type: "short-answer", question: "What is the difference between default and named exports?" }] },
    // Week 7
    { week: 7, module: "js-deep-dive", title: "Promises & Async/Await", slug: "js-async-promises", objective: "Handle asynchronous operations with Promises and async/await syntax.", sourceName: "MDN: Using Promises", sourceType: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises", estimatedMinutes: 70, order: 1, difficulty: "intermediate", keyConcepts: ["Promise states", "then/catch/finally", "async/await syntax", "Promise.all and Promise.race"], checkpointQuestions: [{ type: "multiple-choice", question: "What does async/await do to Promise rejection?", options: ["Ignores it", "Throws it as an exception", "Returns undefined", "Converts to null"], answer: "Throws it as an exception" }] },
    { week: 7, module: "js-deep-dive", title: "Fetch API & Working with JSON", slug: "js-fetch-api", objective: "Retrieve data from external APIs and handle responses.", sourceName: "MDN: Fetch API", sourceType: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch", estimatedMinutes: 55, order: 2, difficulty: "intermediate", keyConcepts: ["fetch() function", "Response object", "JSON.parse/stringify", "error handling with try/catch"], checkpointQuestions: [{ type: "short-answer", question: "Why do you need to call .json() on a fetch response?" }] },
    // Week 8
    { week: 8, module: "js-deep-dive", title: "Advanced Git: Branching Strategy", slug: "git-advanced-branching", objective: "Use Git branches, pull requests, and conventional commits in a solo workflow.", sourceName: "Official Git Documentation", sourceType: "official-docs", sourceUrl: "https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell", estimatedMinutes: 50, order: 1, difficulty: "intermediate", keyConcepts: ["feature branches", "merge vs rebase", "conventional commits", "PR description writing"], checkpointQuestions: [{ type: "reflection", question: "How will you structure your branches for the Learning OS project?" }] },
    // Week 9 — TypeScript
    { week: 9, module: "ts-fundamentals", title: "TypeScript: Why and How", slug: "ts-intro-why", objective: "Understand TypeScript's purpose and set up a TS project.", sourceName: "TypeScript Official Documentation", sourceType: "official-docs", sourceUrl: "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html", estimatedMinutes: 45, order: 1, difficulty: "intermediate", keyConcepts: ["static typing benefits", "tsconfig.json", "TS vs JS", "tsc compiler"], checkpointQuestions: [{ type: "short-answer", question: "What is the key benefit of TypeScript over JavaScript?" }] },
    { week: 9, module: "ts-fundamentals", title: "Everyday Types", slug: "ts-everyday-types", objective: "Annotate variables and functions with TypeScript's core types.", sourceName: "TypeScript Handbook: Everyday Types", sourceType: "official-docs", sourceUrl: "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html", estimatedMinutes: 60, order: 2, difficulty: "intermediate", keyConcepts: ["string, number, boolean, null", "arrays and tuples", "union types", "type inference"], checkpointQuestions: [{ type: "multiple-choice", question: "What is a union type?", options: ["Two types combined with &", "A type that can be one of several types (|)", "A class hierarchy", "A generic type"], answer: "A type that can be one of several types (|)" }] },
    { week: 9, module: "ts-fundamentals", title: "Interfaces & Type Aliases", slug: "ts-interfaces-types", objective: "Model data shapes with interfaces and type aliases.", sourceName: "TypeScript Handbook: Object Types", sourceType: "official-docs", sourceUrl: "https://www.typescriptlang.org/docs/handbook/2/objects.html", estimatedMinutes: 55, order: 3, difficulty: "intermediate", keyConcepts: ["interface vs type alias", "optional properties", "readonly", "extending interfaces"], checkpointQuestions: [{ type: "short-answer", question: "When would you use interface vs type alias?" }] },
    // Week 10
    { week: 10, module: "ts-fundamentals", title: "Typing Functions & Parameters", slug: "ts-function-types", objective: "Add types to function parameters, return values, and callbacks.", sourceName: "TypeScript Handbook: More on Functions", sourceType: "official-docs", sourceUrl: "https://www.typescriptlang.org/docs/handbook/2/functions.html", estimatedMinutes: 55, order: 1, difficulty: "intermediate", keyConcepts: ["parameter types", "return type annotation", "void and never", "overloads basics"], checkpointQuestions: [{ type: "short-answer", question: "What is the difference between void and never as return types?" }] },
    { week: 10, module: "ts-fundamentals", title: "Narrowing & Type Guards", slug: "ts-narrowing", objective: "Use type narrowing to handle union types safely.", sourceName: "TypeScript Handbook: Narrowing", sourceType: "official-docs", sourceUrl: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html", estimatedMinutes: 55, order: 2, difficulty: "intermediate", keyConcepts: ["typeof guard", "in operator", "instanceof guard", "discriminated unions"], checkpointQuestions: [{ type: "reflection", question: "How does TypeScript know which type a variable is after narrowing?" }] },
    // Week 11
    { week: 11, module: "ts-fundamentals", title: "Generics Basics", slug: "ts-generics-basics", objective: "Write reusable functions and components with generics.", sourceName: "TypeScript Handbook: Generics", sourceType: "official-docs", sourceUrl: "https://www.typescriptlang.org/docs/handbook/2/generics.html", estimatedMinutes: 60, order: 1, difficulty: "advanced", keyConcepts: ["generic functions", "generic interfaces", "constraints with extends", "keyof and typeof"], checkpointQuestions: [{ type: "short-answer", question: "Write a generic identity function in TypeScript." }] },
    { week: 11, module: "nextjs-react", title: "Next.js: Learn Next.js Official Course", slug: "nextjs-official-course-start", objective: "Start the official Learn Next.js course — chapters 1 through 3.", sourceName: "Learn Next.js (Official)", sourceType: "official-docs", sourceUrl: "https://nextjs.org/learn", estimatedMinutes: 90, order: 2, difficulty: "intermediate", keyConcepts: ["App Router basics", "pages and layouts", "linking between pages", "static and dynamic rendering"], checkpointQuestions: [{ type: "reflection", question: "What is the difference between a Server Component and a Client Component?" }] },
    // Week 12
    { week: 12, module: "nextjs-react", title: "Next.js: Fetching Data & Server Components", slug: "nextjs-data-fetching", objective: "Fetch data in Server Components using async/await and Prisma.", sourceName: "Next.js Docs: Data Fetching", sourceType: "official-docs", sourceUrl: "https://nextjs.org/docs/app/building-your-application/data-fetching", estimatedMinutes: 80, order: 1, difficulty: "intermediate", keyConcepts: ["async Server Components", "fetch in server", "Prisma queries", "React Suspense"], checkpointQuestions: [{ type: "short-answer", question: "Why is it preferred to fetch data in Server Components?" }] },
    // Week 13
    { week: 13, module: "nextjs-react", title: "App Router: Layouts & Navigation", slug: "nextjs-layouts-navigation", objective: "Build nested layouts and navigation with the Next.js App Router.", sourceName: "Next.js Docs: Routing", sourceType: "official-docs", sourceUrl: "https://nextjs.org/docs/app/building-your-application/routing", estimatedMinutes: 75, order: 1, difficulty: "intermediate", keyConcepts: ["root layout", "nested layouts", "Link component", "usePathname", "route groups"], checkpointQuestions: [{ type: "reflection", question: "How do route groups help organise pages without affecting URLs?" }] },
    { week: 13, module: "nextjs-react", title: "Server Actions & Forms", slug: "nextjs-server-actions", objective: "Use Server Actions to handle form submissions without an API route.", sourceName: "Next.js Docs: Server Actions", sourceType: "official-docs", sourceUrl: "https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations", estimatedMinutes: 70, order: 2, difficulty: "intermediate", keyConcepts: ["'use server' directive", "form action", "revalidatePath", "optimistic updates"], checkpointQuestions: [{ type: "short-answer", question: "What does revalidatePath do after a Server Action?" }] },
    // Week 14
    { week: 14, module: "nextjs-react", title: "Dynamic Routes & Params", slug: "nextjs-dynamic-routes", objective: "Create pages for individual resources using dynamic route segments.", sourceName: "Next.js Docs: Dynamic Routes", sourceType: "official-docs", sourceUrl: "https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes", estimatedMinutes: 60, order: 1, difficulty: "intermediate", keyConcepts: ["[slug] segments", "params prop", "generateStaticParams", "catch-all routes"], checkpointQuestions: [{ type: "short-answer", question: "How do you access route params in a Server Component?" }] },
    // Week 15
    { week: 15, module: "nextjs-react", title: "Zod Validation & Error Handling", slug: "zod-validation", objective: "Validate form input with Zod and surface errors to the user.", sourceName: "Zod Documentation", sourceType: "official-docs", sourceUrl: "https://zod.dev", estimatedMinutes: 55, order: 1, difficulty: "intermediate", keyConcepts: ["z.string(), z.number()", "schema.parse vs safeParse", "validation errors", "Zod with Server Actions"], checkpointQuestions: [{ type: "reflection", question: "Why is server-side validation necessary even if you have client-side validation?" }] },
    // Week 16
    { week: 16, module: "nextjs-react", title: "Prisma: CRUD Operations", slug: "prisma-crud", objective: "Perform create, read, update, and delete operations with Prisma Client.", sourceName: "Prisma Client Docs", sourceType: "official-docs", sourceUrl: "https://www.prisma.io/docs/orm/prisma-client", estimatedMinutes: 70, order: 1, difficulty: "intermediate", keyConcepts: ["findMany, findUnique", "create and update", "upsert", "transactions", "select and include"], checkpointQuestions: [{ type: "short-answer", question: "When would you use upsert instead of create?" }] },
    // Week 17
    { week: 17, module: "nextjs-react", title: "Recharts: Building Data Visualisations", slug: "recharts-intro", objective: "Add interactive charts to a Next.js page using Recharts.", sourceName: "Recharts Documentation", sourceType: "official-docs", sourceUrl: "https://recharts.org/en-US/api", estimatedMinutes: 65, order: 1, difficulty: "intermediate", keyConcepts: ["LineChart, BarChart, AreaChart", "ResponsiveContainer", "XAxis, YAxis, Tooltip", "custom tick formatters"], checkpointQuestions: [{ type: "reflection", question: "How do you make Recharts charts responsive on mobile?" }] },
    // Week 18
    { week: 18, module: "production-deployment", title: "Next.js: Caching & Revalidation", slug: "nextjs-caching", objective: "Understand Next.js caching layers and control data revalidation.", sourceName: "Next.js Docs: Caching", sourceType: "official-docs", sourceUrl: "https://nextjs.org/docs/app/building-your-application/caching", estimatedMinutes: 60, order: 1, difficulty: "advanced", keyConcepts: ["full route cache", "data cache", "revalidatePath vs revalidateTag", "on-demand revalidation"], checkpointQuestions: [{ type: "short-answer", question: "What is the difference between revalidatePath and revalidateTag?" }] },
    // Week 19
    { week: 19, module: "production-deployment", title: "Accessibility & Semantic HTML", slug: "a11y-semantic-html", objective: "Write accessible, semantic HTML that works for all users.", sourceName: "MDN: Accessibility", sourceType: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility", estimatedMinutes: 55, order: 1, difficulty: "intermediate", keyConcepts: ["ARIA labels", "keyboard navigation", "focus management", "colour contrast", "semantic elements"], checkpointQuestions: [{ type: "reflection", question: "What are the most common accessibility mistakes in web apps?" }] },
    // Week 20
    { week: 20, module: "production-deployment", title: "Playwright: End-to-End Testing", slug: "playwright-e2e", objective: "Write automated browser tests with Playwright for critical user flows.", sourceName: "Playwright Documentation", sourceType: "official-docs", sourceUrl: "https://playwright.dev/docs/intro", estimatedMinutes: 70, order: 1, difficulty: "intermediate", keyConcepts: ["test and expect", "locators", "page.goto and page.click", "screenshots on failure", "test fixtures"], checkpointQuestions: [{ type: "short-answer", question: "What is the advantage of using Playwright over manual testing?" }] },
    // Week 21
    { week: 21, module: "production-deployment", title: "Deploying Next.js to Vercel", slug: "nextjs-vercel-deploy", objective: "Deploy the Personal Learning OS to Vercel with environment variables.", sourceName: "Vercel Documentation", sourceType: "official-docs", sourceUrl: "https://vercel.com/docs", estimatedMinutes: 60, order: 1, difficulty: "intermediate", keyConcepts: ["Vercel project setup", "environment variables", "preview vs production", "Neon Postgres connection"], checkpointQuestions: [{ type: "reflection", question: "What environment variables must be set for the app to work in production?" }] },
    // Week 22
    { week: 22, module: "production-deployment", title: "22-Week Learning Retrospective", slug: "week-22-retro", objective: "Reflect on the full 22-week journey, document skills gained, and plan next steps.", sourceName: "Personal Reflection", sourceType: "article", sourceUrl: "https://github.com", estimatedMinutes: 90, order: 1, difficulty: "beginner", keyConcepts: ["skill mapping", "portfolio planning", "CV bullet points", "next learning goals"], checkpointQuestions: [{ type: "reflection", question: "List 5 things you built that demonstrate your new skills." }, { type: "reflection", question: "What would you do differently if you started again?" }] },
  ];

  // Data lessons — Phase 1
  const dataLessons = [
    // Week 1
    { week: 1, module: "sql-foundations", title: "SQL Basics: What is a Database?", slug: "sql-what-is-database", objective: "Understand relational databases, tables, and how SQL interacts with them.", sourceName: "PostgreSQL Official Documentation", sourceType: "official-docs", sourceUrl: "https://www.postgresql.org/docs/current/tutorial.html", estimatedMinutes: 40, order: 5, difficulty: "beginner", keyConcepts: ["relational model", "tables, rows, columns", "SQL dialect", "PostgreSQL vs MySQL"], checkpointQuestions: [{ type: "short-answer", question: "What is the difference between a row and a column?" }] },
    { week: 1, module: "sql-foundations", title: "SELECT: Reading Data", slug: "sql-select-basics", objective: "Write SELECT queries to retrieve data from a table.", sourceName: "Luke Barousse: SQL for Data Engineering", sourceType: "course", sourceUrl: "https://www.lukebarousse.com/sql", estimatedMinutes: 55, order: 6, difficulty: "beginner", keyConcepts: ["SELECT statement", "FROM clause", "column aliases", "DISTINCT keyword"], checkpointQuestions: [{ type: "multiple-choice", question: "Which keyword removes duplicate rows from results?", options: ["UNIQUE", "DISTINCT", "FILTER", "REMOVE"], answer: "DISTINCT" }] },
    { week: 1, module: "sql-foundations", title: "WHERE: Filtering Rows", slug: "sql-where-filtering", objective: "Filter query results using WHERE with comparison and logical operators.", sourceName: "Luke Barousse: SQL for Data Engineering", sourceType: "course", sourceUrl: "https://www.lukebarousse.com/sql", estimatedMinutes: 55, order: 7, difficulty: "beginner", keyConcepts: ["WHERE clause", "AND/OR/NOT", "BETWEEN", "IN operator", "LIKE and wildcards"], checkpointQuestions: [{ type: "short-answer", question: "Write a query to find all employees earning between 50000 and 80000." }] },
    { week: 1, module: "sql-foundations", title: "ORDER BY & LIMIT", slug: "sql-order-limit", objective: "Sort results and control the number of rows returned.", sourceName: "PostgreSQL Official Documentation", sourceType: "official-docs", sourceUrl: "https://www.postgresql.org/docs/current/queries-order.html", estimatedMinutes: 40, order: 8, difficulty: "beginner", keyConcepts: ["ORDER BY ASC/DESC", "LIMIT and OFFSET", "NULLs ordering", "combining filters and ordering"], checkpointQuestions: [{ type: "multiple-choice", question: "What does OFFSET do in a query?", options: ["Skips the first N rows", "Limits to N rows", "Sorts by column", "Filters nulls"], answer: "Skips the first N rows" }] },
    // Week 2
    { week: 2, module: "sql-foundations", title: "Aggregate Functions", slug: "sql-aggregations", objective: "Summarise data using COUNT, SUM, AVG, MIN, and MAX.", sourceName: "Luke Barousse: SQL for Data Engineering", sourceType: "course", sourceUrl: "https://www.lukebarousse.com/sql", estimatedMinutes: 55, order: 5, difficulty: "beginner", keyConcepts: ["COUNT(*) vs COUNT(col)", "SUM and AVG", "MIN and MAX", "NULL handling in aggregates"], checkpointQuestions: [{ type: "short-answer", question: "What is the difference between COUNT(*) and COUNT(column_name)?" }] },
    { week: 2, module: "sql-foundations", title: "GROUP BY & HAVING", slug: "sql-group-having", objective: "Group rows and filter groups with GROUP BY and HAVING.", sourceName: "Luke Barousse: SQL for Data Engineering", sourceType: "course", sourceUrl: "https://www.lukebarousse.com/sql", estimatedMinutes: 60, order: 6, difficulty: "beginner", keyConcepts: ["GROUP BY syntax", "HAVING vs WHERE", "grouping multiple columns", "common mistakes"], checkpointQuestions: [{ type: "multiple-choice", question: "When do you use HAVING instead of WHERE?", options: ["To filter individual rows", "To filter grouped results", "To sort data", "To join tables"], answer: "To filter grouped results" }] },
    // Week 3
    { week: 3, module: "sql-foundations", title: "INNER JOIN & LEFT JOIN", slug: "sql-joins-intro", objective: "Combine rows from multiple tables using JOIN operations.", sourceName: "Luke Barousse: SQL for Data Engineering", sourceType: "course", sourceUrl: "https://www.lukebarousse.com/sql", estimatedMinutes: 70, order: 5, difficulty: "beginner", keyConcepts: ["INNER JOIN", "LEFT JOIN", "ON clause", "join conditions", "aliases in joins"], checkpointQuestions: [{ type: "multiple-choice", question: "What does a LEFT JOIN return that INNER JOIN does not?", options: ["Only matching rows", "All rows from the right table", "All rows from the left table including non-matches", "Duplicate rows"], answer: "All rows from the left table including non-matches" }] },
    { week: 3, module: "sql-foundations", title: "RIGHT JOIN, FULL JOIN & Self-Joins", slug: "sql-joins-advanced", objective: "Use RIGHT JOIN, FULL OUTER JOIN, and self-joins for complex relationships.", sourceName: "PostgreSQL Official Documentation", sourceType: "official-docs", sourceUrl: "https://www.postgresql.org/docs/current/tutorial-join.html", estimatedMinutes: 55, order: 6, difficulty: "intermediate", keyConcepts: ["RIGHT JOIN", "FULL OUTER JOIN", "self-joins", "cross joins"], checkpointQuestions: [{ type: "reflection", question: "Give a real-world example where you would use a self-join." }] },
    // Week 4
    { week: 4, module: "sql-foundations", title: "NULL Handling in SQL", slug: "sql-null-handling", objective: "Correctly handle NULL values in queries and expressions.", sourceName: "PostgreSQL Official Documentation", sourceType: "official-docs", sourceUrl: "https://www.postgresql.org/docs/current/functions-comparison.html", estimatedMinutes: 45, order: 5, difficulty: "beginner", keyConcepts: ["IS NULL / IS NOT NULL", "COALESCE", "NULLIF", "NULL in comparisons"], checkpointQuestions: [{ type: "short-answer", question: "Why does NULL = NULL return false in SQL?" }] },
    // Week 5
    { week: 5, module: "advanced-sql", title: "Subqueries", slug: "sql-subqueries", objective: "Write subqueries in SELECT, WHERE, and FROM clauses.", sourceName: "PostgreSQL Official Documentation", sourceType: "official-docs", sourceUrl: "https://www.postgresql.org/docs/current/queries-table-expressions.html", estimatedMinutes: 60, order: 5, difficulty: "intermediate", keyConcepts: ["correlated subqueries", "EXISTS and NOT EXISTS", "scalar subqueries", "derived tables"], checkpointQuestions: [{ type: "short-answer", question: "What is the difference between a correlated and non-correlated subquery?" }] },
    { week: 5, module: "advanced-sql", title: "CTEs: WITH Clause", slug: "sql-ctes", objective: "Simplify complex queries with Common Table Expressions.", sourceName: "Luke Barousse: SQL for Data Engineering", sourceType: "course", sourceUrl: "https://www.lukebarousse.com/sql", estimatedMinutes: 60, order: 6, difficulty: "intermediate", keyConcepts: ["WITH clause syntax", "multiple CTEs", "recursive CTEs basics", "readability benefits"], checkpointQuestions: [{ type: "reflection", question: "How does using a CTE improve query readability over a nested subquery?" }] },
    // Week 6
    { week: 6, module: "advanced-sql", title: "Window Functions: ROW_NUMBER & RANK", slug: "sql-window-row-rank", objective: "Rank rows within partitions using window functions.", sourceName: "Luke Barousse: SQL for Data Engineering", sourceType: "course", sourceUrl: "https://www.lukebarousse.com/sql", estimatedMinutes: 65, order: 5, difficulty: "intermediate", keyConcepts: ["OVER clause", "PARTITION BY", "ROW_NUMBER()", "RANK() and DENSE_RANK()"], checkpointQuestions: [{ type: "multiple-choice", question: "What is the difference between RANK and DENSE_RANK?", options: ["No difference", "RANK leaves gaps after ties; DENSE_RANK does not", "DENSE_RANK leaves gaps", "RANK is faster"], answer: "RANK leaves gaps after ties; DENSE_RANK does not" }] },
    { week: 6, module: "advanced-sql", title: "Window Functions: LAG, LEAD & SUM OVER", slug: "sql-window-lag-lead", objective: "Access adjacent rows and compute running totals with window functions.", sourceName: "PostgreSQL Official Documentation", sourceType: "official-docs", sourceUrl: "https://www.postgresql.org/docs/current/tutorial-window.html", estimatedMinutes: 60, order: 6, difficulty: "intermediate", keyConcepts: ["LAG and LEAD", "running totals with SUM OVER", "ROWS BETWEEN frame", "practical analytics use cases"], checkpointQuestions: [{ type: "short-answer", question: "How would you use LAG to calculate week-over-week growth?" }] },
    // Week 7
    { week: 7, module: "advanced-sql", title: "Data Cleaning in SQL", slug: "sql-data-cleaning", objective: "Identify and clean messy data using SQL functions.", sourceName: "Luke Barousse: SQL for Data Engineering", sourceType: "course", sourceUrl: "https://www.lukebarousse.com/sql", estimatedMinutes: 65, order: 5, difficulty: "intermediate", keyConcepts: ["TRIM, UPPER, LOWER", "REPLACE and REGEXP_REPLACE", "CAST and type conversion", "identifying duplicates"], checkpointQuestions: [{ type: "reflection", question: "What are the first 3 things you check when you receive a new dataset?" }] },
    // Week 8
    { week: 8, module: "advanced-sql", title: "Exploratory Data Analysis with SQL", slug: "sql-eda", objective: "Conduct a full exploratory analysis on a dataset using SQL.", sourceName: "Luke Barousse: SQL for Data Engineering", sourceType: "course", sourceUrl: "https://www.lukebarousse.com/sql", estimatedMinutes: 90, order: 5, difficulty: "intermediate", keyConcepts: ["data profiling", "distribution analysis", "outlier detection", "documenting findings in README"], checkpointQuestions: [{ type: "reflection", question: "What SQL queries do you always run first on a new dataset?" }] },
    // Week 9
    { week: 9, module: "data-modelling", title: "Relational Database Design Principles", slug: "db-design-principles", objective: "Understand normalisation, entity-relationship modelling, and primary/foreign keys.", sourceName: "PostgreSQL Official Documentation", sourceType: "official-docs", sourceUrl: "https://www.postgresql.org/docs/current/ddl.html", estimatedMinutes: 60, order: 5, difficulty: "intermediate", keyConcepts: ["entities and relationships", "primary and foreign keys", "one-to-many, many-to-many", "ER diagrams"], checkpointQuestions: [{ type: "short-answer", question: "What is a composite primary key and when would you use one?" }] },
    { week: 9, module: "data-modelling", title: "Normalisation: 1NF, 2NF, 3NF", slug: "db-normalisation", objective: "Apply normalisation rules to reduce data redundancy.", sourceName: "PostgreSQL Official Documentation", sourceType: "official-docs", sourceUrl: "https://www.postgresql.org/docs/current/ddl.html", estimatedMinutes: 60, order: 6, difficulty: "intermediate", keyConcepts: ["first normal form", "second normal form", "third normal form", "when to denormalise"], checkpointQuestions: [{ type: "reflection", question: "Design a normalised schema for an e-commerce order system." }] },
    // Week 10
    { week: 10, module: "data-modelling", title: "OLTP vs OLAP Design", slug: "oltp-vs-olap", objective: "Understand the design trade-offs between transactional and analytical databases.", sourceName: "Data Vidhya: Data Engineering Roadmap", sourceType: "article", sourceUrl: "https://www.analyticsvidhya.com/blog/2022/05/data-engineering-roadmap/", estimatedMinutes: 55, order: 5, difficulty: "intermediate", keyConcepts: ["OLTP characteristics", "OLAP characteristics", "query patterns", "when to use each"], checkpointQuestions: [{ type: "multiple-choice", question: "Which system is optimised for many small read/write transactions?", options: ["OLAP", "Data Warehouse", "OLTP", "Data Lake"], answer: "OLTP" }] },
    { week: 10, module: "data-modelling", title: "Star Schema: Facts & Dimensions", slug: "star-schema-design", objective: "Design a star schema for an analytics use case.", sourceName: "Data Vidhya: Data Engineering Roadmap", sourceType: "article", sourceUrl: "https://www.analyticsvidhya.com/blog/2022/05/data-engineering-roadmap/", estimatedMinutes: 65, order: 6, difficulty: "intermediate", keyConcepts: ["fact tables", "dimension tables", "grain", "conformed dimensions", "snowflake vs star"], checkpointQuestions: [{ type: "short-answer", question: "What is the 'grain' of a fact table and why does it matter?" }] },
    // Week 11
    { week: 11, module: "data-warehousing", title: "Data Warehouse Concepts", slug: "data-warehouse-concepts", objective: "Understand the purpose and components of a modern data warehouse.", sourceName: "Data Vidhya: Data Engineering Roadmap", sourceType: "article", sourceUrl: "https://www.analyticsvidhya.com/blog/2022/05/data-engineering-roadmap/", estimatedMinutes: 55, order: 5, difficulty: "intermediate", keyConcepts: ["ETL vs ELT", "staging area", "data marts", "slowly changing dimensions"], checkpointQuestions: [{ type: "reflection", question: "What is the difference between a data warehouse and a data lake?" }] },
    // Week 12
    { week: 12, module: "data-modelling", title: "SQL Portfolio Project 2: Learning Analytics", slug: "sql-portfolio-project-2", objective: "Design and build a complete star schema for the Personal Learning OS analytics use case.", sourceName: "Personal Project", sourceType: "article", sourceUrl: "https://github.com", estimatedMinutes: 120, order: 5, difficulty: "advanced", keyConcepts: ["schema design", "fact table for study logs", "dimension tables", "PostgreSQL DDL"], checkpointQuestions: [{ type: "reflection", question: "What were the hardest design decisions in your schema?" }] },
    // Week 13-17 — data continues
    { week: 13, module: "etl-pipelines", title: "ETL vs ELT Patterns", slug: "etl-vs-elt", objective: "Understand the difference between ETL and ELT and when to use each.", sourceName: "Data Vidhya: Data Engineering Roadmap", sourceType: "article", sourceUrl: "https://www.analyticsvidhya.com/blog/2022/05/data-engineering-roadmap/", estimatedMinutes: 50, order: 5, difficulty: "intermediate", keyConcepts: ["extract, transform, load", "ELT with modern warehouses", "batch vs streaming", "pipeline tools overview"], checkpointQuestions: [{ type: "short-answer", question: "Why has ELT become more popular than ETL in recent years?" }] },
    { week: 14, module: "etl-pipelines", title: "Data Quality: Checks & Assertions", slug: "data-quality-checks", objective: "Implement data quality checks in SQL pipelines.", sourceName: "Data Vidhya: Data Engineering Roadmap", sourceType: "article", sourceUrl: "https://www.analyticsvidhya.com/blog/2022/05/data-engineering-roadmap/", estimatedMinutes: 55, order: 5, difficulty: "intermediate", keyConcepts: ["null checks", "uniqueness constraints", "range validation", "referential integrity", "dbt test concepts"], checkpointQuestions: [{ type: "reflection", question: "What data quality checks would you put on the study_logs table?" }] },
    { week: 15, module: "etl-pipelines", title: "Orchestration Concepts: Airflow Overview", slug: "airflow-concepts", objective: "Understand DAG-based orchestration and how Airflow structures data pipelines.", sourceName: "Apache Airflow Documentation", sourceType: "official-docs", sourceUrl: "https://airflow.apache.org/docs/apache-airflow/stable/index.html", estimatedMinutes: 60, order: 5, difficulty: "intermediate", keyConcepts: ["DAGs", "tasks and operators", "scheduling", "dependencies", "why orchestration matters"], checkpointQuestions: [{ type: "short-answer", question: "What is a DAG and why is it useful for pipeline scheduling?" }] },
    { week: 16, module: "etl-pipelines", title: "dbt Concepts: Transform in the Warehouse", slug: "dbt-concepts", objective: "Understand how dbt enables SQL-first data transformation.", sourceName: "dbt Documentation", sourceType: "official-docs", sourceUrl: "https://docs.getdbt.com/docs/introduction", estimatedMinutes: 55, order: 5, difficulty: "intermediate", keyConcepts: ["dbt models", "ref() function", "sources", "tests in dbt", "materialisation types"], checkpointQuestions: [{ type: "reflection", question: "How does dbt change the way data teams write SQL transformations?" }] },
    { week: 17, module: "data-warehousing", title: "Cloud Data Platforms: BigQuery & Snowflake Overview", slug: "cloud-data-platforms", objective: "Understand the architecture of modern cloud data warehouses.", sourceName: "Data Vidhya: Data Engineering Roadmap", sourceType: "article", sourceUrl: "https://www.analyticsvidhya.com/blog/2022/05/data-engineering-roadmap/", estimatedMinutes: 55, order: 5, difficulty: "intermediate", keyConcepts: ["columnar storage", "compute/storage separation", "BigQuery basics", "Snowflake architecture", "cost model"], checkpointQuestions: [{ type: "short-answer", question: "What is columnar storage and why is it better for analytics?" }] },
    // Week 18-22
    { week: 18, module: "data-warehousing", title: "Learning Analytics Pipeline Design", slug: "learning-analytics-pipeline", objective: "Design the data pipeline for the Personal Learning OS analytics feature.", sourceName: "Personal Project", sourceType: "article", sourceUrl: "https://github.com", estimatedMinutes: 90, order: 5, difficulty: "advanced", keyConcepts: ["pipeline design", "data sources", "transformation steps", "output tables", "scheduling"], checkpointQuestions: [{ type: "reflection", question: "Map out the full data flow from study logs to the analytics dashboard." }] },
    { week: 19, module: "data-capstone", title: "SQL Portfolio Project 3: Full Analysis", slug: "sql-portfolio-project-3", objective: "Complete a full exploratory SQL analysis with findings, visualisations, and a README.", sourceName: "Personal Project", sourceType: "article", sourceUrl: "https://github.com", estimatedMinutes: 120, order: 5, difficulty: "advanced", keyConcepts: ["EDA with SQL", "findings documentation", "chart data export", "GitHub publishing"], checkpointQuestions: [{ type: "reflection", question: "What was the most interesting pattern you found in the data?" }] },
    { week: 20, module: "data-capstone", title: "Data Engineering Skills Audit", slug: "data-engineering-skills-audit", objective: "Assess your Data Engineering skills, identify gaps, and document your learning.", sourceName: "Personal Reflection", sourceType: "article", sourceUrl: "https://github.com", estimatedMinutes: 60, order: 5, difficulty: "intermediate", keyConcepts: ["skills self-assessment", "gap analysis", "learning log", "next steps planning"], checkpointQuestions: [{ type: "reflection", question: "Which Data Engineering skills are you most confident in? Which need more work?" }] },
    { week: 21, module: "data-capstone", title: "Portfolio Data Project Documentation", slug: "data-portfolio-documentation", objective: "Write professional documentation for all completed SQL and data engineering projects.", sourceName: "Personal Project", sourceType: "article", sourceUrl: "https://github.com", estimatedMinutes: 75, order: 5, difficulty: "intermediate", keyConcepts: ["README structure", "schema diagrams", "findings summary", "skill demonstration"], checkpointQuestions: [{ type: "reflection", question: "What would you want a hiring manager to see first in your data portfolio?" }] },
    { week: 22, module: "data-capstone", title: "Data Engineering Capstone Summary", slug: "data-capstone-final", objective: "Summarise all data engineering work, create a skills portfolio, and plan next steps.", sourceName: "Personal Reflection", sourceType: "article", sourceUrl: "https://github.com", estimatedMinutes: 90, order: 5, difficulty: "intermediate", keyConcepts: ["portfolio summary", "skills gained", "CV bullets", "next career step"], checkpointQuestions: [{ type: "reflection", question: "Write 3 CV bullet points based on your data engineering work." }] },
  ];

  const allLessons = [...webLessons, ...dataLessons];
  let lessonCount = 0;
  for (const l of allLessons) {
    const moduleId = l.module.startsWith("sql-") || l.module.startsWith("data-") || l.module === "etl-pipelines" || l.module === "data-modelling" || l.module === "data-warehousing" || l.module === "data-capstone" || l.module === "advanced-sql"
      ? createdDataModules[l.module]
      : createdWebModules[l.module];

    if (!moduleId) {
      console.warn(`⚠️  Module not found: ${l.module} for lesson ${l.slug}`);
      continue;
    }
    const weekId = createdWeeks[l.week];
    if (!weekId) continue;

    const lessonStatus = weekStatus(l.week) !== "locked" ? "available" : "locked";
    await db.lesson.upsert({
      where: { slug: l.slug },
      update: { status: lessonStatus },
      create: {
        moduleId,
        weekId,
        title: l.title,
        slug: l.slug,
        objective: l.objective,
        sourceName: l.sourceName,
        sourceType: l.sourceType,
        sourceUrl: l.sourceUrl,
        estimatedMinutes: l.estimatedMinutes,
        order: l.order,
        difficulty: l.difficulty,
        keyConcepts: l.keyConcepts,
        checkpointQuestions: l.checkpointQuestions as object,
        status: lessonStatus,
      },
    });
    lessonCount++;
  }
  console.log(`✅ Lessons: ${lessonCount} created`);

  // ── Assignments ───────────────────────────────────────────────────────────
  const assignments = [
    { week: 1, title: "Week 1 Assignment: Calculator + SQL Basics", brief: "Build a simple JavaScript calculator that handles addition, subtraction, multiplication, and division — and write 20 SQL queries on the sample jobs dataset. Push both to GitHub.", difficulty: "beginner", xpReward: 80, rubric: [{ criterion: "JS Calculator", maxPoints: 30, description: "Works correctly for all 4 operations, handles edge cases like division by zero" }, { criterion: "SQL Queries", maxPoints: 30, description: "20 varied SELECT queries with WHERE, ORDER BY, LIMIT" }, { criterion: "GitHub Repo", maxPoints: 20, description: "Repo has a README, clean commits, .gitignore" }, { criterion: "Reflection", maxPoints: 20, description: "Thoughtful reflection on what was learned" }], requiredDeliverables: [{ type: "github", label: "GitHub repository link", required: true }, { type: "reflection", label: "Written reflection (what I learned, what was hard)", required: true }] },
    { week: 2, title: "Week 2 Assignment: DOM Task List + SQL Analysis", brief: "Build a browser-based task list using DOM manipulation (add, complete, delete tasks). Write SQL queries analysing a dataset using aggregations and GROUP BY.", difficulty: "beginner", xpReward: 80, rubric: [{ criterion: "Task List App", maxPoints: 35, description: "Add, complete (cross out), and delete tasks; persists nothing but works in session" }, { criterion: "SQL Analysis", maxPoints: 35, description: "10+ queries using COUNT, AVG, GROUP BY, HAVING" }, { criterion: "Code Quality", maxPoints: 15, description: "Clean, readable code with meaningful names" }, { criterion: "Reflection", maxPoints: 15, description: "Identifies what confused you and how you solved it" }], requiredDeliverables: [{ type: "github", label: "GitHub repository link", required: true }, { type: "reflection", label: "Reflection on blockers and breakthroughs", required: true }] },
    { week: 3, title: "Week 3 Assignment: Array Methods App + SQL Joins", brief: "Build a mini app that uses map, filter, and reduce on a data array. Write SQL queries using INNER JOIN, LEFT JOIN, and GROUP BY on related tables.", difficulty: "beginner", xpReward: 80, rubric: [{ criterion: "Array Methods App", maxPoints: 35, description: "Uses map, filter, and reduce on real data (not trivial examples)" }, { criterion: "SQL Joins", maxPoints: 35, description: "8+ queries demonstrating different join types with meaningful conditions" }, { criterion: "README", maxPoints: 15, description: "Project README explains what the code does" }, { criterion: "Reflection", maxPoints: 15, description: "Explains the hardest concept this week" }], requiredDeliverables: [{ type: "github", label: "GitHub repository link", required: true }, { type: "reflection", label: "What I found hardest about joins or array methods", required: true }] },
    { week: 4, title: "Week 4 Assignment: Combined Progress Report", brief: "Write a Markdown report comparing your Phase 1 JS learning with your Phase 1 SQL progress. Include code snippets, your GitHub links, and an honest self-assessment.", difficulty: "beginner", xpReward: 80, rubric: [{ criterion: "JS Summary", maxPoints: 25, description: "Covers key concepts, includes working code snippets" }, { criterion: "SQL Summary", maxPoints: 25, description: "Covers queries learned, includes sample SQL" }, { criterion: "Self-Assessment", maxPoints: 25, description: "Honest, specific, and useful for planning" }, { criterion: "Writing Quality", maxPoints: 25, description: "Clear, structured, and professional tone" }], requiredDeliverables: [{ type: "document", label: "Markdown report (in GitHub repo)", required: true }, { type: "github", label: "GitHub repo containing the report", required: true }] },
    { week: 5, title: "Week 5 Assignment: Data Fetching App + CTE Practice", brief: "Build a JavaScript app that fetches data from a public REST API and displays it with loading/error states. Write 5+ SQL CTEs on the jobs dataset.", difficulty: "intermediate", xpReward: 80, rubric: [{ criterion: "API Fetch App", maxPoints: 35, description: "Fetches real data, shows loading state, handles errors gracefully" }, { criterion: "SQL CTEs", maxPoints: 35, description: "5+ CTEs, each solving a meaningful analytical question" }, { criterion: "Code Quality", maxPoints: 15, description: "Async/await used correctly, no unhandled promise rejections" }, { criterion: "Reflection", maxPoints: 15, description: "Reflects on async confusion and how it was resolved" }], requiredDeliverables: [{ type: "github", label: "GitHub repo with app and SQL scripts", required: true }, { type: "reflection", label: "Reflection on async JavaScript challenges", required: true }] },
    { week: 6, title: "Week 6 Assignment: OOP Refactor + Window Functions Report", brief: "Refactor a previous JavaScript project to use classes. Write SQL window function queries to answer analytical questions.", difficulty: "intermediate", xpReward: 80, rubric: [{ criterion: "OOP Refactor", maxPoints: 35, description: "Previous project uses at least 2 meaningful classes with methods" }, { criterion: "Window Functions", maxPoints: 35, description: "Queries using ROW_NUMBER, RANK, LAG, running totals" }, { criterion: "Git History", maxPoints: 15, description: "Clean commit history showing progression" }, { criterion: "Reflection", maxPoints: 15, description: "Explains where OOP made the code better" }], requiredDeliverables: [{ type: "github", label: "GitHub repo with refactored JS + SQL", required: true }, { type: "reflection", label: "What OOP improved in your project", required: true }] },
    { week: 7, title: "Week 7 Assignment: Async Project + Data Cleaning Script", brief: "Build an async JS app with real loading, error, and empty states. Write a SQL data cleaning script with documented findings.", difficulty: "intermediate", xpReward: 80, rubric: [{ criterion: "Async App", maxPoints: 35, description: "Shows loading skeleton, error message, and empty state" }, { criterion: "Data Cleaning SQL", maxPoints: 35, description: "Identifies and cleans 5+ data quality issues with SQL" }, { criterion: "Documentation", maxPoints: 15, description: "README explains what issues were found and how they were fixed" }, { criterion: "Reflection", maxPoints: 15, description: "What data quality surprised you most?" }], requiredDeliverables: [{ type: "github", label: "GitHub repo with async app + SQL script", required: true }, { type: "sql-script", label: "Link to data cleaning SQL file", required: true }] },
    { week: 8, title: "Week 8 Assignment: SQL Portfolio Project 1 — Exploratory Analysis", brief: "Complete a full exploratory SQL analysis on a real dataset of your choice. Write a findings report in Markdown, document your queries, and publish to GitHub.", difficulty: "intermediate", xpReward: 120, rubric: [{ criterion: "Dataset Choice", maxPoints: 10, description: "Interesting, realistic dataset (not trivial)" }, { criterion: "SQL Analysis", maxPoints: 35, description: "15+ queries covering profiling, filtering, aggregation, joins, window functions" }, { criterion: "Findings", maxPoints: 30, description: "3+ meaningful insights documented clearly" }, { criterion: "README", maxPoints: 15, description: "Professional README with context, queries, and findings" }, { criterion: "Reflection", maxPoints: 10, description: "What would you do differently?" }], requiredDeliverables: [{ type: "github", label: "GitHub repo with SQL scripts and README", required: true }, { type: "reflection", label: "What you learned from the data", required: true }] },
    { week: 9, title: "Week 9 Assignment: TS Conversion + Normalised Schema Design", brief: "Convert a JavaScript utility file to TypeScript with proper types. Design a normalised 3NF database schema for a sample domain.", difficulty: "intermediate", xpReward: 80, rubric: [{ criterion: "TypeScript Conversion", maxPoints: 35, description: "All functions and variables have explicit types, no 'any'" }, { criterion: "Schema Design", maxPoints: 35, description: "Schema is in 3NF, relationships are correct, documented" }, { criterion: "TypeScript Config", maxPoints: 15, description: "tsconfig.json with strict mode enabled" }, { criterion: "Reflection", maxPoints: 15, description: "Hardest TypeScript concept this week" }], requiredDeliverables: [{ type: "github", label: "GitHub repo with TS file and schema SQL", required: true }, { type: "reflection", label: "TypeScript challenges encountered", required: true }] },
    { week: 10, title: "Week 10 Assignment: Typed Models + Star Schema", brief: "Build TypeScript interfaces for the Learning OS models (Lesson, Assignment, Progress). Design a star schema for the learning analytics use case.", difficulty: "intermediate", xpReward: 80, rubric: [{ criterion: "TypeScript Models", maxPoints: 35, description: "Complete, typed interfaces for 5+ models with correct optionality" }, { criterion: "Star Schema", maxPoints: 35, description: "Fact table with grain defined, 3+ dimension tables, documented" }, { criterion: "ERD or Diagram", maxPoints: 15, description: "Visual diagram of the schema" }, { criterion: "Reflection", maxPoints: 15, description: "Trade-offs in your schema design decisions" }], requiredDeliverables: [{ type: "github", label: "GitHub repo with TS interfaces + schema", required: true }, { type: "reflection", label: "Design decisions and trade-offs", required: true }] },
    { week: 11, title: "Week 11 Assignment: First Next.js Dashboard + Warehouse Tables", brief: "Build your first Next.js App Router page — a simple dashboard skeleton. Create warehouse-style PostgreSQL tables for the Learning OS analytics.", difficulty: "intermediate", xpReward: 80, rubric: [{ criterion: "Next.js Page", maxPoints: 35, description: "Working page with layout, server component, basic data display" }, { criterion: "Warehouse Tables", maxPoints: 35, description: "At least 3 fact/dimension tables with correct types and constraints" }, { criterion: "README", maxPoints: 15, description: "Documents the tech decisions made" }, { criterion: "Reflection", maxPoints: 15, description: "What was surprising about Next.js App Router?" }], requiredDeliverables: [{ type: "github", label: "GitHub repo with Next.js project + SQL DDL", required: true }, { type: "reflection", label: "First Next.js impressions", required: true }] },
    { week: 12, title: "Week 12 Assignment: Learning OS Database Schema", brief: "Design and document the complete database schema for the Personal Learning OS. Include Prisma schema file, SQL DDL, and an explanation of design decisions.", difficulty: "advanced", xpReward: 120, rubric: [{ criterion: "Prisma Schema", maxPoints: 30, description: "Complete schema with all models, relations, and correct types" }, { criterion: "SQL DDL", maxPoints: 25, description: "CREATE TABLE statements matching the schema" }, { criterion: "Design Document", maxPoints: 25, description: "Explains entity relationships and key decisions" }, { criterion: "Reflection", maxPoints: 20, description: "What would you change about the schema?" }], requiredDeliverables: [{ type: "github", label: "GitHub repo with schema files", required: true }, { type: "document", label: "Design document as Markdown", required: true }] },
    { week: 13, title: "Week 13 Assignment: App Shell with Auth", brief: "Build the complete Learning OS app shell: sidebar navigation, topbar, protected routes, and login page. The app should be a working skeleton.", difficulty: "intermediate", xpReward: 100, rubric: [{ criterion: "Auth Flow", maxPoints: 25, description: "Login works, redirects correctly, session persists" }, { criterion: "Navigation", maxPoints: 25, description: "Sidebar with all pages linked, active state highlighting" }, { criterion: "Layout", maxPoints: 25, description: "Responsive layout with proper structure" }, { criterion: "Code Quality", maxPoints: 25, description: "Clean components, TypeScript strict, no console.errors" }], requiredDeliverables: [{ type: "github", label: "GitHub repo link", required: true }, { type: "screenshot", label: "Screenshot of the working shell", required: true }] },
    { week: 14, title: "Week 14 Assignment: Roadmap & Lesson Pages", brief: "Build the Roadmap page showing both tracks, and a working Lesson detail page with notes and checkpoint questions.", difficulty: "intermediate", xpReward: 100, rubric: [{ criterion: "Roadmap UI", maxPoints: 30, description: "Both tracks displayed, modules grouped, status badges" }, { criterion: "Lesson Page", maxPoints: 30, description: "Shows lesson details, source link, and checkpoint questions" }, { criterion: "Data Fetching", maxPoints: 20, description: "Data fetched from Prisma in Server Components" }, { criterion: "UX Polish", maxPoints: 20, description: "Loading states, empty states, responsive" }], requiredDeliverables: [{ type: "github", label: "GitHub repo link", required: true }, { type: "screenshot", label: "Screenshots of both pages", required: true }] },
    { week: 15, title: "Week 15 Assignment: Assignment Submission System", brief: "Build the full assignment submission flow: list page, detail page, submission form with validation, and status tracking.", difficulty: "intermediate", xpReward: 100, rubric: [{ criterion: "Assignment List", maxPoints: 25, description: "Shows status, due dates, track badges" }, { criterion: "Submission Form", maxPoints: 30, description: "All fields, Zod validation, submission via Server Action" }, { criterion: "Status Updates", maxPoints: 25, description: "Status changes correctly after submission" }, { criterion: "Error Handling", maxPoints: 20, description: "Validation errors shown, network errors handled" }], requiredDeliverables: [{ type: "github", label: "GitHub repo link", required: true }, { type: "screenshot", label: "Screenshot of submission form", required: true }] },
    { week: 16, title: "Week 16 Assignment: XP, Streak & Progress Engine", brief: "Implement the full progress engine: XP events fire when lessons/assignments are completed, streak calculates daily, weekly score computes correctly.", difficulty: "advanced", xpReward: 120, rubric: [{ criterion: "XP System", maxPoints: 30, description: "XP events created correctly for all action types" }, { criterion: "Streak Logic", maxPoints: 25, description: "Streak increments and resets correctly based on daily activity" }, { criterion: "Weekly Score", maxPoints: 25, description: "Score computed as per rubric formula" }, { criterion: "Tests", maxPoints: 20, description: "Unit tests for XP calculation and streak logic" }], requiredDeliverables: [{ type: "github", label: "GitHub repo link", required: true }, { type: "reflection", label: "What edge cases did you discover in the streak logic?", required: true }] },
    { week: 17, title: "Week 17 Assignment: Analytics Dashboard", brief: "Build a full analytics dashboard page with Recharts charts: study hours, XP over time, track progress, and weekly score trend.", difficulty: "intermediate", xpReward: 100, rubric: [{ criterion: "Study Hours Chart", maxPoints: 25, description: "Bar chart of study hours per week" }, { criterion: "XP Chart", maxPoints: 25, description: "Line/area chart of XP earned over time" }, { criterion: "Track Progress", maxPoints: 25, description: "Progress comparison between both tracks" }, { criterion: "Responsiveness", maxPoints: 25, description: "Charts work on mobile, responsive containers" }], requiredDeliverables: [{ type: "github", label: "GitHub repo link", required: true }, { type: "screenshot", label: "Screenshot of analytics dashboard", required: true }] },
    { week: 18, title: "Week 18 Assignment: AI Coach Panel + Review System", brief: "Build the AI coach panel with mock responses and the weekly retrospective system. Implement review flow for completed weeks.", difficulty: "intermediate", xpReward: 100, rubric: [{ criterion: "AI Coach UI", maxPoints: 30, description: "Panel with all 7 actions, graceful disabled state without API key" }, { criterion: "Retrospective Flow", maxPoints: 30, description: "Weekly retrospective form that awards 30 XP on completion" }, { criterion: "Mock Responses", maxPoints: 20, description: "Realistic mock responses for all AI actions" }, { criterion: "Design Polish", maxPoints: 20, description: "Feels like a premium feature, not a placeholder" }], requiredDeliverables: [{ type: "github", label: "GitHub repo link", required: true }, { type: "screenshot", label: "Screenshot of AI coach panel", required: true }] },
    { week: 19, title: "Week 19 Assignment: Portfolio & Proof-of-Work Page", brief: "Build the portfolio page that aggregates all completed assignments, GitHub links, deployments, and skills demonstrated.", difficulty: "intermediate", xpReward: 100, rubric: [{ criterion: "Portfolio Layout", maxPoints: 30, description: "Clean, professional layout with all projects" }, { criterion: "Assignment Integration", maxPoints: 30, description: "All submitted assignments visible with links" }, { criterion: "Skills Section", maxPoints: 20, description: "Skills demonstrated, extracted from completed modules" }, { criterion: "CV Export Hint", maxPoints: 20, description: "Section or note on how to use this for a CV" }], requiredDeliverables: [{ type: "github", label: "GitHub repo link", required: true }, { type: "screenshot", label: "Screenshot of portfolio page", required: true }] },
    { week: 20, title: "Week 20 Assignment: Playwright Tests + Accessibility Audit", brief: "Write 10+ Playwright end-to-end tests covering the critical user flows. Run an accessibility audit and fix 5+ issues.", difficulty: "advanced", xpReward: 100, rubric: [{ criterion: "Playwright Tests", maxPoints: 35, description: "10+ passing tests covering login, dashboard, lesson, assignment flows" }, { criterion: "A11y Audit", maxPoints: 30, description: "5+ accessibility issues found and fixed" }, { criterion: "Test Coverage Report", maxPoints: 20, description: "Document what is tested and what is not" }, { criterion: "Reflection", maxPoints: 15, description: "What bugs did Playwright catch that you missed manually?" }], requiredDeliverables: [{ type: "github", label: "GitHub repo with tests", required: true }, { type: "reflection", label: "Testing reflection and audit findings", required: true }] },
    { week: 21, title: "Week 21 Assignment: Production Deployment", brief: "Deploy the Personal Learning OS to Vercel with a Neon Postgres database. Document the deployment steps and environment configuration.", difficulty: "intermediate", xpReward: 100, rubric: [{ criterion: "Deployment", maxPoints: 40, description: "App is live on Vercel, no build errors" }, { criterion: "Database", maxPoints: 25, description: "Neon Postgres connected, migrations run, seed executed" }, { criterion: "Environment Variables", maxPoints: 20, description: "All required env vars set in Vercel dashboard" }, { criterion: "Documentation", maxPoints: 15, description: "README has deployment instructions" }], requiredDeliverables: [{ type: "deployment", label: "Live Vercel deployment URL", required: true }, { type: "github", label: "GitHub repo link", required: true }] },
    { week: 22, title: "Week 22 Capstone: Personal Learning OS — Final Submission", brief: "The capstone. Submit your fully deployed Personal Learning OS with complete documentation, a portfolio summary, and a 22-week retrospective.", difficulty: "advanced", xpReward: 200, rubric: [{ criterion: "Live Deployment", maxPoints: 20, description: "App is deployed, accessible, and functional" }, { criterion: "Complete Features", maxPoints: 25, description: "All core features working: roadmap, lessons, assignments, analytics, portfolio" }, { criterion: "Documentation", maxPoints: 20, description: "README, ARCHITECTURE.md, CURRICULUM.md are complete" }, { criterion: "Portfolio Page", maxPoints: 20, description: "Portfolio page shows all completed work" }, { criterion: "22-Week Retrospective", maxPoints: 15, description: "Honest, thoughtful reflection on the journey" }], requiredDeliverables: [{ type: "deployment", label: "Live Vercel URL", required: true }, { type: "github", label: "Final GitHub repo", required: true }, { type: "reflection", label: "22-week retrospective document", required: true }] },
  ];

  for (const a of assignments) {
    const weekId = createdWeeks[a.week];
    if (!weekId) continue;
    await db.assignment.upsert({
      where: { id: `seed-assignment-week-${a.week}` },
      update: {},
      create: {
        id: `seed-assignment-week-${a.week}`,
        weekId,
        title: a.title,
        brief: a.brief,
        difficulty: a.difficulty,
        dueDate: friday(a.week),
        rubric: a.rubric as object,
        requiredDeliverables: a.requiredDeliverables as object,
        xpReward: a.xpReward,
        status: a.week === 1 ? "not-started" : "not-started",
      },
    });
  }
  console.log(`✅ Assignments: ${assignments.length} created`);

  // ── Sample XP Events ───────────────────────────────────────────────────────
  const sampleXpEvents = [
    { type: "study-log", points: 10, reason: "Logged study session" },
    { type: "study-log", points: 10, reason: "Logged study session" },
    { type: "note-added", points: 5, reason: "Added a note on variables" },
  ];

  for (const xp of sampleXpEvents) {
    await db.xpEvent.create({
      data: {
        userId: user.id,
        type: xp.type,
        points: xp.points,
        reason: xp.reason,
      },
    });
  }
  console.log("✅ Sample XP Events");

  // ── Sample Study Logs ──────────────────────────────────────────────────────
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const studyLogs = [
    { date: yesterday, minutes: 90, mood: "good", energy: 4, learned: "Completed JS variables lesson. var vs let vs const finally clicked when I saw the hoisting example.", nextStep: "Start control flow lesson", trackId: webTrack.id },
    { date: yesterday, minutes: 60, mood: "good", energy: 4, learned: "Ran my first SQL SELECT queries on the jobs dataset. COUNT and GROUP BY make sense now.", nextStep: "Practice WHERE with multiple conditions", trackId: dataTrack.id },
  ];

  for (const log of studyLogs) {
    await db.studyLog.create({ data: { userId: user.id, ...log } });
  }
  console.log("✅ Sample Study Logs");

  // ── Sample Notes ───────────────────────────────────────────────────────────
  const notes = [
    { title: "var vs let vs const — key differences", content: "## var vs let vs const\n\n**var** is function-scoped and gets hoisted (initialised as undefined). This causes bugs.\n\n**let** is block-scoped. Use this when the value will change.\n\n**const** is block-scoped and can't be reassigned. For objects/arrays, the contents can still change.\n\n```js\nconst user = { name: 'Alice' };\nuser.name = 'Bob'; // ✅ allowed\nuser = {}; // ❌ TypeError\n```\n\n**Rule:** Always prefer `const`. Use `let` when you must reassign. Avoid `var`.", tags: ["javascript", "variables", "fundamentals"], pinned: true, trackId: webTrack.id },
    { title: "SQL GROUP BY — common gotcha", content: "## GROUP BY gotcha\n\nEvery column in SELECT must either:\n1. Be in the GROUP BY clause, OR\n2. Be wrapped in an aggregate function (COUNT, SUM, etc.)\n\n```sql\n-- ❌ This will fail:\nSELECT company, salary, COUNT(*)\nFROM jobs\nGROUP BY company;\n\n-- ✅ This works:\nSELECT company, AVG(salary), COUNT(*)\nFROM jobs\nGROUP BY company;\n```\n\nHAVING filters AFTER grouping. WHERE filters BEFORE grouping.", tags: ["sql", "group-by", "aggregation"], confusing: false, trackId: dataTrack.id },
    { title: "Async/Await mental model", content: "## async/await is just sugar over Promises\n\n```js\n// Promise style:\nfetch('/api/data')\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));\n\n// async/await style:\nasync function getData() {\n  try {\n    const res = await fetch('/api/data');\n    const data = await res.json();\n    console.log(data);\n  } catch (err) {\n    console.error(err);\n  }\n}\n```\n\n**Key insight:** `await` only pauses the current async function, not the whole program. The event loop keeps running.", tags: ["javascript", "async", "promises"], reviewLater: true, trackId: webTrack.id },
  ];

  for (const note of notes) {
    await db.note.create({ data: { userId: user.id, ...note } });
  }
  console.log("✅ Sample Notes");

  // ── Sample Goals ───────────────────────────────────────────────────────────
  const goals = [
    { title: "Complete 22-week roadmap by October 11 2026", description: "Finish both tracks and deploy the Personal Learning OS as my flagship portfolio project.", targetDate: new Date("2026-10-11"), trackId: null },
    { title: "Earn 1000 XP in the first 4 weeks", description: "Build early momentum with consistent daily study habits.", targetDate: new Date("2026-06-06"), trackId: webTrack.id },
    { title: "Publish first SQL portfolio project to GitHub", description: "Have a professional SQL analysis project visible on my GitHub profile.", targetDate: new Date("2026-06-27"), trackId: dataTrack.id },
  ];

  for (const goal of goals) {
    await db.goal.create({ data: { userId: user.id, ...goal } });
  }
  console.log("✅ Sample Goals");

  // ── Progress Snapshot ──────────────────────────────────────────────────────
  await db.progressSnapshot.create({
    data: {
      userId: user.id,
      date: new Date(),
      totalXp: 25,
      streak: 1,
      webProgress: 0,
      dataProgress: 0,
      overallProgress: 0,
      studyMinutesThisWeek: 150,
      weeklyScore: 0,
    },
  });
  console.log("✅ Progress Snapshot");

  console.log("\n🎉 Seeding complete!");
  console.log(`   User: ${user.email}`);
  console.log(`   Tracks: 2`);
  console.log(`   Modules: ${webModules.length + dataModules.length}`);
  console.log(`   Weeks: ${weeks.length}`);
  console.log(`   Lessons: ${lessonCount}`);
  console.log(`   Assignments: ${assignments.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
