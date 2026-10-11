---
paths:
  - "src/components/**"
  - "src/routes/**/*.tsx"
  - "src/index.css"
  - "src/theme/**"
---

# Components, styling and accessibility

## React

- React 19 with the React Compiler: no manual `useMemo`/`useCallback`/`memo`. Write plain components; the compiler
  memoizes. ESLint (`react-hooks` v7) reports patterns the compiler cannot optimize; fix them, do not disable the rule.
- Derive values during render instead of syncing them with `useEffect` + `setState`. Effects are for subscriptions and
  external systems (DOM listeners, storage), and must clean up.
- Context: `<Context value={...}>` (React 19 syntax). Hooks that read a context throw when the provider is missing.

## Styling (Tailwind v4)

- Use the design tokens from `src/index.css` (`bg-background`, `text-foreground`, `text-muted-foreground`,
  `text-primary`, `bg-accent`/`text-accent-foreground`, `border-border`, `border-separator`). Add new tokens there,
  for both `:root` and `.dark`, rather than hard-coding colors.
- Shared utilities are `@utility` blocks in `src/index.css` (`container-wide`, `text-display`, `text-label`,
  `hover-highlight`). Prefer composing utilities over new CSS.
- Class names must be literal strings so Tailwind can detect them (see `RESULT_COLUMNS` in `routes/project.tsx`).
- Typography: serif (Times New Roman) for headings/body, `font-display` (Syne) for brand/nav, `font-sans` (Inter) for labels.
- The visual language is editorial: square corners, generous whitespace, large uppercase serif headings.

## Motion

- Import from `motion/react`. `MotionConfig reducedMotion="user"` and the CSS media query already handle reduced
  motion; keep animations decorative (content must be readable without them).
- Avoid layout-shifting entrance animations on above-the-fold content.
- Elements that fade out but stay in the DOM must also stop receiving pointer events (see the home hero).

## Accessibility (WCAG 2.2 AA)

- One `<h1>` per page, ordered headings, landmarks (`header`, `nav` with `aria-label`, `main`, `footer`).
- Links navigate (`LocaleLink`, `NavLink`), buttons act. Icon-only controls need `aria-label`.
- Custom widgets expose state (`aria-expanded`, `aria-current`, `aria-pressed`) and work with the keyboard
  (Escape closes overlays; hidden panels use `inert`).
- Images need meaningful `alt` (empty `alt=""` only when decorative). Below-the-fold images use `loading="lazy"`.
- Keep text contrast at AA in both themes.

## Icons

- `lucide-react` for UI icons. Brand logos are not in lucide v1: add them to `src/components/icons/brand.tsx`
  (Simple Icons paths, CC0).
