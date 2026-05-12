import fs from "fs";
import path from "path";
import { getSupplementaryFiles } from "@/content/repos/lesson-map";

const REPOS_DIR = path.join(process.cwd(), "content", "repos");

interface SupplementaryFile {
  label: string;
  content: string;
  sourceUrl: string;
}

export function getSupplementaryContent(slug: string): SupplementaryFile[] {
  const groups = getSupplementaryFiles(slug);
  if (!groups.length) return [];

  const results: SupplementaryFile[] = [];

  for (const group of groups) {
    const contents: string[] = [];

    for (const filePath of group.files) {
      const fullPath = path.join(REPOS_DIR, filePath);
      if (fs.existsSync(fullPath)) {
        contents.push(fs.readFileSync(fullPath, "utf-8"));
      }
    }

    if (contents.length > 0) {
      results.push({
        label: group.label,
        content: contents.join("\n\n---\n\n"),
        sourceUrl: "", // extracted from content header
      });
    }
  }

  return results;
}
