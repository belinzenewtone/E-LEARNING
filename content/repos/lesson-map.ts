// Maps lesson slugs to supplementary repo content files.
// Each entry: slug → paths relative to content/repos/
// Files are loaded server-side and rendered on the lesson page.

export const lessonRepoMap: Record<string, { label: string; files: string[] }[]> = {
  // ── Week 1: JS Fundamentals ──────────────────────────────────────────────────
  "dev-environment-setup": [
    {
      label: "You Don't Know JS: What Is JavaScript?",
      files: ["getify-You-Dont-Know-JS/get-started-ch1.md"],
    },
  ],
  "js-variables": [
    {
      label: "Clean Code JS: Variables",
      files: ["ryanmcdermott-clean-code-javascript/README.md"],
    },
    {
      label: "You Don't Know JS: Surveying JS",
      files: ["getify-You-Dont-Know-JS/get-started-ch2.md"],
    },
  ],
  "js-data-types": [
    {
      label: "You Don't Know JS: Types & Grammar",
      files: [
        "getify-You-Dont-Know-JS/types-grammar-ch1.md",
        "getify-You-Dont-Know-JS/types-grammar-ch2.md",
      ],
    },
  ],
  "js-operators": [
    {
      label: "33 JS Concepts: Primitive Types",
      files: ["leonardomso-33-js-concepts/README.md"],
    },
  ],

  // ── Week 2: Control Flow & Functions ─────────────────────────────────────────
  "js-control-flow": [
    {
      label: "Clean Code JS: Conditionals",
      files: ["ryanmcdermott-clean-code-javascript/README.md"],
    },
  ],
  "js-functions-basics": [
    {
      label: "Clean Code JS: Functions",
      files: ["ryanmcdermott-clean-code-javascript/README.md"],
    },
    {
      label: "You Don't Know JS: Scope & Closures",
      files: [
        "getify-You-Dont-Know-JS/scope-closures-ch1.md",
        "getify-You-Dont-Know-JS/scope-closures-ch2.md",
      ],
    },
  ],

  // ── Week 5: ES6+ Deep Dive ───────────────────────────────────────────────────
  "js-destructuring-spread": [
    {
      label: "You Don't Know JS: Scope & Closures (Ch 3-4)",
      files: [
        "getify-You-Dont-Know-JS/scope-closures-ch3.md",
        "getify-You-Dont-Know-JS/scope-closures-ch4.md",
      ],
    },
  ],
  "js-array-methods": [
    {
      label: "Clean Code JS: Arrays",
      files: ["ryanmcdermott-clean-code-javascript/README.md"],
    },
  ],

  // ── Week 6: Closures, OOP, Modules ───────────────────────────────────────────
  "js-closures": [
    {
      label: "You Don't Know JS: The Scope & Closures Deep Dive",
      files: [
        "getify-You-Dont-Know-JS/scope-closures-ch3.md",
        "getify-You-Dont-Know-JS/scope-closures-ch5.md",
        "getify-You-Dont-Know-JS/scope-closures-ch6.md",
        "getify-You-Dont-Know-JS/scope-closures-ch7.md",
        "getify-You-Dont-Know-JS/scope-closures-README.md",
      ],
    },
  ],
  "js-oop-classes": [
    {
      label: "You Don't Know JS: Objects & Classes",
      files: [
        "getify-You-Dont-Know-JS/objects-classes-ch1.md",
        "getify-You-Dont-Know-JS/objects-classes-ch2.md",
        "getify-You-Dont-Know-JS/objects-classes-ch3.md",
        "getify-You-Dont-Know-JS/objects-classes-ch4.md",
        "getify-You-Dont-Know-JS/objects-classes-ch5.md",
        "getify-You-Dont-Know-JS/objects-classes-README.md",
      ],
    },
    {
      label: "Clean Code JS: Objects & Data Structures",
      files: ["ryanmcdermott-clean-code-javascript/README.md"],
    },
  ],
  "js-modules": [
    {
      label: "You Don't Know JS: Scope & Closures (Ch 8)",
      files: ["getify-You-Dont-Know-JS/scope-closures-ch8.md"],
    },
  ],

  // ── Week 7: Async JS ─────────────────────────────────────────────────────────
  "js-async-promises": [
    {
      label: "33 JS Concepts: Promises & Async",
      files: ["leonardomso-33-js-concepts/README.md"],
    },
  ],
  "js-fetch-api": [
    {
      label: "Clean Code JS: Error Handling",
      files: ["ryanmcdermott-clean-code-javascript/README.md"],
    },
  ],

  // ── Week 8: Git Advanced ─────────────────────────────────────────────────────
  "git-advanced-branching": [
    {
      label: "33 JS Concepts",
      files: ["leonardomso-33-js-concepts/README.md"],
    },
  ],

  // ── Week 9-11: TypeScript ────────────────────────────────────────────────────
  "ts-intro-why": [
    {
      label: "You Don't Know JS: Get Started",
      files: ["getify-You-Dont-Know-JS/get-started-README.md"],
    },
  ],
  "ts-everyday-types": [
    {
      label: "JavaScript Questions: Types",
      files: ["lydiahallie-javascript-questions/README.md"],
    },
  ],
  "ts-generics-basics": [
    {
      label: "JavaScript Questions: Advanced",
      files: ["lydiahallie-javascript-questions/README.md"],
    },
  ],

  // ── Week 18: Testing ─────────────────────────────────────────────────────────
  "playwright-e2e": [
    {
      label: "JavaScript Testing Best Practices",
      files: ["goldbergyoni-javascript-testing-best-practices/readme.md"],
    },
  ],

  // ── Week 20: Accessibility ───────────────────────────────────────────────────
  "a11y-semantic-html": [
    {
      label: "Clean Code JS: Formatting & Comments",
      files: ["ryanmcdermott-clean-code-javascript/README.md"],
    },
  ],

  // ── Week 22: Retrospective ───────────────────────────────────────────────────
  "week-22-retro": [
    {
      label: "Developer Roadmap (overview)",
      files: ["leonardomso-33-js-concepts/README.md"],
    },
    {
      label: "Free Programming Books",
      files: ["EbookFoundation-free-programming-books/README.md"],
    },
  ],

  // ── SQL & Data Engineering ──────────────────────────────────────────────────
  "sql-what-is-database": [
    {
      label: "Data Engineering Zoomcamp: Overview",
      files: ["DataTalksClub-data-engineering-zoomcamp/README.md"],
    },
  ],
  "sql-select-basics": [
    {
      label: "Data Engineering Zoomcamp: Docker & Terraform (week 1)",
      files: ["DataTalksClub-data-engineering-zoomcamp/01-docker-terraform-README.md"],
    },
  ],
  "sql-ctes": [
    {
      label: "Data Engineering Zoomcamp: Workflow Orchestration (week 2)",
      files: ["DataTalksClub-data-engineering-zoomcamp/02-workflow-orchestration-README.md"],
    },
  ],
  "data-warehouse-concepts": [
    {
      label: "Data Engineering Zoomcamp: Data Warehouse (week 3)",
      files: ["DataTalksClub-data-engineering-zoomcamp/03-data-warehouse-README.md"],
    },
  ],
  "etl-vs-elt": [
    {
      label: "Data Engineering Zoomcamp: Analytics Engineering (week 4)",
      files: ["DataTalksClub-data-engineering-zoomcamp/04-analytics-engineering-README.md"],
    },
  ],
  "data-quality-checks": [
    {
      label: "Clean Code JS: Testing & Concurrency",
      files: ["ryanmcdermott-clean-code-javascript/README.md"],
    },
  ],
  "data-capstone-final": [
    {
      label: "Data Engineering Zoomcamp: Full Course",
      files: ["DataTalksClub-data-engineering-zoomcamp/README.md"],
    },
    {
      label: "Free Programming Books",
      files: ["EbookFoundation-free-programming-books/README.md"],
    },
  ],
};

export function getSupplementaryFiles(slug: string) {
  return lessonRepoMap[slug] ?? [];
}
