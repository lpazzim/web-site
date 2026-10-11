@AGENTS.md

## Claude Code specifics

- **Skills**: `/verify` (full quality gate), `/add-case-study`, `/add-page`, `/upgrade-deps`. Prefer them over ad-hoc steps.
- **Hooks** (`.claude/settings.json`): edits to secrets, the lockfile and generated folders are blocked by
  `.claude/hooks/protect-files.mjs`. If a block looks wrong, ask the user instead of working around it.
- **Previewing**: start the dev server through the preview tools with `.claude/launch.json`. After UI changes, check the
  page in the browser and read the console: hydration warnings mean the pre-rendered HTML and the client render differ.
- **Language**: talk to the user in Brazilian Portuguese; write code, comments and docs in English.

## Environment gotchas (Windows + Git Bash)

- Git Bash rewrites arguments that look like Unix paths (`"/about"` becomes `C:/Program Files/Git/about`). Never pass
  app paths as CLI arguments to scripts; edit files with the Edit/Write tools instead.
- Template literals (backticks) inside `bash -c`/heredoc-in-`node -e` get executed by the shell. Use Edit/Write for any
  code containing backticks.
- Files are LF (`.gitattributes`); Prettier rewrites files on `pnpm format`, so re-read a file before editing it again.
