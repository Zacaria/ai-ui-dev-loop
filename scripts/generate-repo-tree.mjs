import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const readmePath = path.join(repoRoot, "README.md");
const outputPath = path.join(repoRoot, "docs", "repo-tree.txt");
const maxDepth = Number(process.env.REPO_TREE_DEPTH ?? 3);

const IGNORE_NAMES = new Set([
  ".git",
  ".next",
  "node_modules",
  "dist",
  "out",
  "playwright-report",
  "test-results",
  ".DS_Store",
  "coverage",
  ".turbo",
]);

function shouldIgnore(entryName, relativePath) {
  if (IGNORE_NAMES.has(entryName)) return true;
  if (relativePath.startsWith(".git" + path.sep)) return true;
  return false;
}

function listEntries(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const filtered = entries.filter((entry) => !shouldIgnore(entry.name, entry.name));
  const dirs = filtered.filter((e) => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));
  const files = filtered.filter((e) => !e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));
  return [...dirs, ...files];
}

function buildTreeLines(dir, depth, prefix, relativeRoot = "") {
  if (depth > maxDepth) return [];
  const entries = listEntries(dir);
  const lines = [];

  entries.forEach((entry, index) => {
    const isLast = index === entries.length - 1;
    const connector = isLast ? "`-- " : "|-- ";
    const nextPrefix = prefix + (isLast ? "    " : "|   ");
    const entryPath = path.join(dir, entry.name);
    const entryRel = path.join(relativeRoot, entry.name);

    lines.push(`${prefix}${connector}${entry.name}${entry.isDirectory() ? "/" : ""}`);

    if (entry.isDirectory()) {
      if (depth < maxDepth) {
        lines.push(...buildTreeLines(entryPath, depth + 1, nextPrefix, entryRel));
      }
    }
  });

  return lines;
}

function replaceBetween(content, startToken, endToken, replacement) {
  const startIndex = content.indexOf(startToken);
  const endIndex = content.indexOf(endToken);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error("README is missing repo tree markers.");
  }
  const before = content.slice(0, startIndex + startToken.length);
  const after = content.slice(endIndex);
  return `${before}\n${replacement}\n${after}`;
}

const rootLabel = `${path.basename(repoRoot)}/`;
const treeLines = [rootLabel, ...buildTreeLines(repoRoot, 1, "")];
const treeText = treeLines.join("\n");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, treeText);

const readme = fs.readFileSync(readmePath, "utf8");
const block = `\`\`\`text\n${treeText}\n\`\`\``;
const updated = replaceBetween(readme, "<!-- BEGIN REPO TREE -->", "<!-- END REPO TREE -->", block);
fs.writeFileSync(readmePath, updated);

console.log(`Repo tree generated at ${path.relative(repoRoot, outputPath)}`);
