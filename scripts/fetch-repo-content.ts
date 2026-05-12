import fs from "fs";
import path from "path";

const REPO_DIR = path.join(process.cwd(), "content", "repos");

// ─── Repo file manifest ─────────────────────────────────────────────────────
// Each entry maps a GitHub repo to specific files to download.
// Files are saved under content/repos/{repo-name}/{file-path}.md
const MANIFEST: { repo: string; branch: string; files: string[]; label: string }[] = [
  // ── JavaScript Deep Dives ──────────────────────────────────────────────────
  {
    repo: "getify/You-Dont-Know-JS",
    branch: "2nd-ed",
    label: "You Don't Know JS (2nd ed.)",
    files: [
      "get-started/README.md",
      "get-started/ch1.md",
      "get-started/ch2.md",
      "get-started/ch3.md",
      "scope-closures/README.md",
      "scope-closures/ch1.md",
      "scope-closures/ch2.md",
      "scope-closures/ch3.md",
      "scope-closures/ch4.md",
      "scope-closures/ch5.md",
      "scope-closures/ch6.md",
      "scope-closures/ch7.md",
      "scope-closures/ch8.md",
      "objects-classes/README.md",
      "objects-classes/ch1.md",
      "objects-classes/ch2.md",
      "objects-classes/ch3.md",
      "objects-classes/ch4.md",
      "objects-classes/ch5.md",
      "types-grammar/README.md",
      "types-grammar/ch1.md",
      "types-grammar/ch2.md",
    ],
  },
  // ── Clean Code Patterns ────────────────────────────────────────────────────
  {
    repo: "ryanmcdermott/clean-code-javascript",
    branch: "master",
    label: "Clean Code JavaScript",
    files: ["README.md"],
  },
  // ── JavaScript Quiz Bank ───────────────────────────────────────────────────
  {
    repo: "lydiahallie/javascript-questions",
    branch: "master",
    label: "JavaScript Interview Questions",
    files: ["README.md"],
  },
  // ── Testing Best Practices ─────────────────────────────────────────────────
  {
    repo: "goldbergyoni/javascript-testing-best-practices",
    branch: "master",
    label: "JavaScript Testing Best Practices",
    files: ["readme.md"],
  },
  // ── 33 JS Concepts ─────────────────────────────────────────────────────────
  {
    repo: "leonardomso/33-js-concepts",
    branch: "master",
    label: "33 Concepts Every JavaScript Developer Should Know",
    files: ["README.md"],
  },
  // ── Data Engineering Zoomcamp ──────────────────────────────────────────────
  {
    repo: "DataTalksClub/data-engineering-zoomcamp",
    branch: "main",
    label: "Data Engineering Zoomcamp",
    files: [
      "README.md",
      "01-docker-terraform/README.md",
      "02-workflow-orchestration/README.md",
      "03-data-warehouse/README.md",
      "04-analytics-engineering/README.md",
    ],
  },
  // ── Developer Roadmap ──────────────────────────────────────────────────────
  {
    repo: "kamranahmedse/developer-roadmap",
    branch: "master",
    label: "Developer Roadmap",
    files: ["readme.md"],
  },
  // ── Free Programming Books ─────────────────────────────────────────────────
  {
    repo: "EbookFoundation/free-programming-books",
    branch: "main",
    label: "Free Programming Books",
    files: ["README.md"],
  },
];

async function downloadFile(repo: string, branch: string, filePath: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${repo}/${branch}/${filePath}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.warn(`  ⚠️  ${response.status} — ${url}`);
    return "";
  }

  const text = await response.text();

  // Add source attribution header
  const header = [
    `> **Source:** [${repo}/${branch}/${filePath}](https://github.com/${repo}/blob/${branch}/${filePath})`,
    `> **License:** View the [repo](https://github.com/${repo}) for license terms.`,
    `> This content is cached for personal offline use.\n`,
  ].join("\n");

  return `${header}\n${text}`;
}

async function main() {
  console.log("📥 Fetching supplementary repo content…\n");

  fs.mkdirSync(REPO_DIR, { recursive: true });

  let totalFiles = 0;
  let downloadedFiles = 0;

  for (const item of MANIFEST) {
    const repoDir = path.join(REPO_DIR, item.repo.replace("/", "-"));
    fs.mkdirSync(repoDir, { recursive: true });

    console.log(`📦 ${item.repo} (${item.label})`);

    for (const filePath of item.files) {
      totalFiles++;
      const destPath = path.join(repoDir, filePath.replace(/\//g, "-"));

      // Skip if already fetched and less than 1 hour old
      if (fs.existsSync(destPath)) {
        const stat = fs.statSync(destPath);
        if (Date.now() - stat.mtimeMs < 3600_000) {
          console.log(`   ✅ ${filePath} (cached)`);
          downloadedFiles++;
          continue;
        }
      }

      process.stdout.write(`   ⬇️  ${filePath}… `);
      const content = await downloadFile(item.repo, item.branch, filePath);

      if (content) {
        fs.writeFileSync(destPath, content, "utf-8");
        console.log("done");
        downloadedFiles++;
      } else {
        console.log("skipped");
      }

      // Be nice to GitHub — small delay between requests
      await new Promise((r) => setTimeout(r, 200));
    }
    console.log();
  }

  // Write manifest metadata
  const manifestMeta = MANIFEST.map((item) => ({
    repo: item.repo,
    label: item.label,
    dir: item.repo.replace("/", "-"),
    files: item.files.map((f) => f.replace(/\//g, "-")),
  }));

  fs.writeFileSync(
    path.join(REPO_DIR, "manifest.json"),
    JSON.stringify(manifestMeta, null, 2),
    "utf-8"
  );

  console.log(`✅ Done — ${downloadedFiles}/${totalFiles} files downloaded.`);
  console.log(`   Content saved to ${REPO_DIR}`);
  console.log(`   Run again to update (skips files < 1 hour old).`);
}

main().catch((e) => {
  console.error("❌ Fetch failed:", e.message);
  process.exit(1);
});
