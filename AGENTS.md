# Copilot Instructions

## Workflow
- **TDD always.** Before changing existing code, run its tests first to confirm the baseline. Write a failing test before implementing. Red → Green → Refactor.
- Never implement a feature or fix a bug without a corresponding test.
- Small, focused commits with descriptive messages.

## Architecture
- Next.js App Router. React Server Components by default — `"use client"` only when state or effects are required.
- Tailwind CSS v4 only — no CSS modules, no styled-components.
- All site content lives in `content/` as JSON. No database.
- `src/app/api/` routes are excluded from the static export at build time (CI deletes the directory before `next build`).
- Icons: **Lucide React** only. No inline SVGs, no other icon libraries. Size with Tailwind (`className="w-4 h-4"`).
- Admin panel is decomposed into focused modules: `src/app/admin/hooks/` (state/logic) and `src/app/admin/components/` (one tab per file). The orchestrator `page.tsx` only wires them together.
- Admin Save and Publish are separate actions — Save writes to disk, Publish commits and pushes.

## Code Style
- TypeScript strict mode. No `any` without a comment explaining why.
- `interface` over `type` for object shapes.
- Named exports for utilities and hooks; default exports for page and component files.

## Testing
- Jest 30 + ts-jest + React Testing Library. Test files at `__tests__/<mirrored-src-path>/<name>.test.ts(x)`.
- Mock all external dependencies (fs, fetch, child_process, git) — never hit real APIs or the filesystem in tests.
- Prefer `.toBe()` / `.toEqual()` over `.toBeTruthy()`.

## Code Quality
- All new code must pass `npm run lint:quality` with zero warnings (ESLint + sonarjs).
- Thresholds: cyclomatic complexity ≤ 15, cognitive complexity ≤ 15, nesting depth ≤ 4. No exemptions — refactor by extracting named helpers instead.
- Duplicate string literals in `.ts` files (≥ 4 occurrences) must be extracted to a named constant. `.tsx` files are exempt.

## README
- Major features (new route, new user-visible behaviour, architecture change, new dev script) require a README update before the work is done.
- The README hardcodes the test count in two places — keep both current whenever the count changes:
  - Development section: `npm test # <N> tests across <S> suites`
  - Testing section prose: `Jest + React Testing Library with <N> tests...`
