// PreToolUse hook (Edit|Write|MultiEdit|NotebookEdit): blocks writes to files that must never be edited by an agent.
// Exit code 2 blocks the tool call and shows stderr to Claude.
import { relative, resolve, sep } from "node:path";

const PROTECTED = [
  { test: (p) => /(^|\/)\.env(\..+)?$/.test(p) && !p.endsWith(".env.example"), why: "it holds secrets" },
  { test: (p) => /^[^/]+\.pdf$/i.test(p), why: "personal documents at the repo root are private" },
  { test: (p) => p === "pnpm-lock.yaml", why: "the lockfile is generated; use pnpm add/remove/update" },
  {
    test: (p) => /^(build|dist|coverage|node_modules|\.react-router|playwright-report|test-results)\//.test(p),
    why: "it is generated output",
  },
  { test: (p) => p.startsWith(".git/"), why: "git internals must not be edited" },
];

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let toolInput = {};
try {
  toolInput = JSON.parse(raw).tool_input ?? {};
} catch {
  process.exit(0); // Not a tool call we understand; let the normal permission flow decide.
}
const filePath = toolInput.file_path ?? toolInput.notebook_path;
if (!filePath) process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const relativePath = relative(projectDir, resolve(projectDir, filePath)).split(sep).join("/");

const rule = PROTECTED.find(({ test }) => test(relativePath));
if (rule) {
  console.error(
    `Blocked: ${relativePath} is protected because ${rule.why}. Ask the user if this change is really needed.`,
  );
  process.exit(2);
}
