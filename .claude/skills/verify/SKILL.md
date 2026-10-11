---
name: verify
description: Run the project's full quality gate (format, lint, typecheck, unit tests, build, e2e and secret-leak check) and report the results. Use before committing, before opening a PR, or when the user asks to check, validate or test the project.
argument-hint: "[quick]"
allowed-tools: Bash(pnpm format:check), Bash(pnpm lint), Bash(pnpm typecheck), Bash(pnpm test), Bash(pnpm build), Bash(pnpm test:e2e), Bash(git status:*), Bash(git diff:*)
---

Run the quality gate for this repository and report the outcome. With the argument `quick`, skip steps 5–7.

1. `pnpm format:check` — if it fails, run `pnpm format`, then show which files changed.
2. `pnpm lint`
3. `pnpm typecheck` (runs `react-router typegen` first)
4. `pnpm test`
5. `pnpm build` — note whether blog posts were pre-rendered (a "Notion credentials missing" warning is expected without `.env`).
6. Secret-leak check on the build output; it must print nothing:
   `grep -rlE "api\.notion\.com|NOTION_API_TOKEN|ntn_|secret_" build/client`
7. `pnpm test:e2e` (builds and serves the site itself; runs desktop and mobile projects plus the SEO crawl).

Rules:

- Stop at the first failing step, show the relevant error output, diagnose the root cause and propose (or, if the user
  asked for fixes, apply) a fix. Then rerun from the failing step.
- Never make a step pass by weakening it (skipping tests, disabling lint rules, `@ts-ignore`, lowering assertions).
- Finish with a short table: step, result, and notable details (test counts, warnings).
