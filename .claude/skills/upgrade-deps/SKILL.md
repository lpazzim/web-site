---
name: upgrade-deps
description: Safely upgrade npm dependencies (patch, minor or a specific major) with changelog review, verification and one commit per logical upgrade. Use when the user asks to update packages, fix vulnerabilities or handle Dependabot PRs.
argument-hint: "[package | all | security]"
disable-model-invocation: true
---

Upgrade dependencies: $ARGUMENTS (default: all non-major updates).

1. Inspect: `pnpm outdated` and `pnpm audit --prod`. Group packages that must move together:
   `react`, `react-dom` and `@types/react*`; `react-router` and `@react-router/dev`; `vite` and `@vitejs/plugin-react`;
   `tailwindcss` and `@tailwindcss/vite`; `vitest` and `@vitest/*`; `eslint`, `@eslint/js` and `typescript-eslint`.
   The same groups are configured in `.github/dependabot.yml`.
2. Check peer dependencies before installing: `pnpm view <pkg>@<version> peerDependencies`.
3. For major versions, read the official migration guide/changelog first and list the breaking changes that affect
   this codebase. Ask the user before starting a major upgrade that is not explicitly requested.
4. Install with `pnpm add` / `pnpm add -D` (never edit `pnpm-lock.yaml` by hand), apply the required code changes,
   remove deprecated usages instead of silencing warnings.
5. Run `/verify`. For upgrades touching rendering (React, React Router, Vite, Tailwind, motion), also preview a few pages
   in the browser and check the console for hydration errors.
6. Commit one logical upgrade per commit (`chore(deps): ...`), noting breaking changes handled.

Never add new dependencies as part of an upgrade, and never downgrade to make tests pass without explaining why.
