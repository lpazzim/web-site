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
  `text-primary` (electric cyan), `border-border`, `border-separator`; decorative `--grid-line`, `--glow`, `--hud`).
  The old beige `accent` token is no longer used for hover states: use `primary`. Add new tokens there,
  for both `:root` and `.dark`, rather than hard-coding colors.
- Shared utilities are `@utility` blocks in `src/index.css` (`container-wide`, `text-display`, `text-label`,
  `text-hud`, `hover-highlight`, `bg-grid`, `scanlines`, `noise`, `glow-text`). Prefer composing utilities over new CSS.
- Class names must be literal strings so Tailwind can detect them (see `RESULT_COLUMNS` in `routes/project.tsx`).
- Typography: Space Grotesk for everything (`font-serif`, `font-sans` and `font-display` all map to it; the class
  names are historical), JetBrains Mono (`font-mono`) for HUD micro-labels (`text-hud`, `text-label`).
- The visual language is a dark "tech HUD": square corners, numbered sections (`SectionLabel`), corner brackets
  (`HudFrame`), scanlines, large uppercase headings, a WebGL contour-line backdrop. Do not name a utility like a token
  (`text-glow` collided with `--color-glow`): check that the generated class does what you expect.
- Contrast is enforced by `src/theme/contrast.test.ts` for both themes; run it after changing a token.

## Motion

- Import from `motion/react`. `MotionConfig reducedMotion="user"` and the CSS media query already handle reduced
  motion; keep animations decorative (content must be readable without them).
- Avoid layout-shifting entrance animations on above-the-fold content, and do them in CSS (`Enter`,
  `animate-line-up`): a motion `initial` state is in the SSR HTML and hides the content until hydration (LCP).
- Page transitions use View Transitions (`viewTransition` on `LocaleLink`); keep the fixed canvas out of named groups.
- Keep `.site-header`'s `view-transition-name` and never put a `transform` on `<header>` while visible: it becomes the
  containing block of the fixed mobile menu and collapses it.
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
