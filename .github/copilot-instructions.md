# Copilot Instructions

Project-level guidance for all AI agents working in this codebase.

## Core Principles

### TDD — Test-Driven Development

- **Red → Green → Refactor.** Write a failing test first, then the minimal code to pass it, then refactor.
- Never implement a feature or fix a bug without a corresponding test.
- Tests live in `__tests__/` mirroring `src/` structure. Use Jest + ts-jest.
- Prefer small, focused test cases over large integration tests.
- When modifying existing code, run the relevant tests first to confirm the current state before changing anything.

### KISS — Keep It Simple, Stupid

- Favor the simplest solution that meets the requirement.
- Avoid premature abstraction — don't build frameworks for one use case.
- Prefer readable code over clever code. A junior engineer should understand it.
- If a comment is needed to explain *what* the code does (not *why*), the code is too complex.

### DRY — Don't Repeat Yourself

- Extract shared logic into reusable functions or components.
- Shared types belong in dedicated type files or alongside their primary module.
- If you copy-paste code, stop and extract it instead.
- Exception: test files may repeat setup for clarity — prefer readability over DRY in tests.

### GoF Design Patterns — Use Where Optimal

- Apply Gang of Four patterns when they naturally fit the problem, not to show off.
- **Strategy** for swappable behaviors (e.g., sort modes, filter logic).
- **Observer** via React's built-in state/effect model — don't reinvent it.
- **Factory** when object creation logic is complex or conditional.
- **Composite** for tree structures (component hierarchies already are this).
- **Don't force it.** If a pattern adds complexity without clear benefit, skip it.

## Project Conventions

### Architecture

- Next.js App Router with React Server Components by default; `"use client"` only when state/effects are needed.
- Tailwind CSS v4 for styling — no CSS modules, no styled-components.
- Content lives in `content/` as JSON files, not in the database.
- API routes in `src/app/api/` are excluded from static export at build time.
- Icons use **Lucide React** — do not add inline SVGs or other icon libraries. Import named icon components from `lucide-react` and size them with Tailwind (`className="w-4 h-4"`). The `SkillIcon` component maps category strings to Lucide icons via a lookup table.

### Code Style

- TypeScript strict mode — no `any` unless absolutely unavoidable (and commented why).
- Prefer `interface` over `type` for object shapes.
- Prefer named exports for utilities, default exports for page/component files.
- Use descriptive variable names — no single-letter variables outside loop indices.

### Testing

- Jest 30 + ts-jest, React Testing Library for components.
- Test file naming: `__tests__/<path>/<name>.test.ts(x)`.
- Mock external dependencies (fs, fetch, git) — never hit real APIs in tests.
- Assertions should be specific: prefer `.toBe()` / `.toEqual()` over `.toBeTruthy()`.

### Documentation

- **README is a first-class deliverable.** Any major feature addition must include a corresponding README update before the work is considered done.
- A "major feature" is anything that: adds a new page or route, introduces a new user-visible behavior, changes the architecture or build pipeline, or adds a new developer-facing script or workflow.
- Minor changes (bug fixes, refactors, dependency bumps) do not require README updates unless they change user-observable behavior.
- **Keep the test suite summary current.** The README contains a hardcoded test count in two places — the `npm test` command comment in the Development section and the Testing section prose. Update both whenever the count changes.
  - Development command: `` npm test # <N> tests across <S> suites ``
  - Testing section: ``Jest + React Testing Library with <N> tests...``
- When adding a new `__tests__/` file, check whether a new suite description belongs in the Testing section of the README.

### Code Quality

- **All new code must pass `npm run lint:quality` with zero warnings.** This runs ESLint with `eslint-plugin-sonarjs` and built-in complexity rules.
- Thresholds: cyclomatic complexity ≤ 15, cognitive complexity ≤ 15, nesting depth ≤ 4.
- Additional smell rules: no identical functions, no duplicated branches, no redundant boolean logic, no collapsible ifs.
- Duplicate string literals (`.ts` files, threshold ≥ 4) are flagged as warnings — extract to a named constant.
- The only override is `src/app/admin/page.tsx` (intentionally monolithic tabbed form — complexity exempted).
- When a function exceeds cognitive complexity 15, refactor it by extracting named helper functions rather than adding an override.
- `"use client"` components with Tailwind class strings are exempt from the no-duplicate-string rule (`.tsx` files excluded).

### Git & Workflow

- Small, focused commits with descriptive messages.
- The admin panel's Publish button triggers git commit + push — Save and Publish are separate actions.
