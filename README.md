# chadmoore.info

Personal homepage built with Next.js, React, and Tailwind CSS. Deployed to GitHub Pages as a fully static site — no server, no database, no CMS vendor.

**Live:** [https://chadmoore.info](https://chadmoore.info)

## Pages

- **Home** — Hero intro with recent blog posts
- **About** — Bio, interactive skills grid, and contact info
- **Blog** — Markdown-based blog (posts in `content/blog/`)
- **CV** — Resume powered by `content/content.json` with AI-tagged skill highlights
- **Projects** — GitHub repos via API (currently soft-launched behind a feature flag)

## How It Works

### Dual-Mode Build

The same codebase runs two ways depending on environment:

- **Development** (`npm run dev`): Full Next.js app with API routes, an admin panel at `/admin`, and live filesystem access for editing content.
- **Production** (`npm run build`): Pure static export. The CI pipeline *physically deletes* `src/app/api/` before building, so admin routes don't just get disabled — they cease to exist in the artifact.

This is controlled by a single env var in `next.config.ts`:

```ts
output: process.env.STATIC_EXPORT === "1" ? "export" : undefined
```

### Feature Flags

`src/lib/siteConfig.ts` toggles entire sections on/off. This cascades through the whole site — nav links, homepage CTAs, and even data-loading are all gated. Disabled pages still exist and are routable; they're just unlinked.

```ts
sections: {
  about: true,
  projects: false,
  blog: true,
  cv: true,
}
```

### Filterable CV Experience

The CV page's work history is interactive. Filter toggles at the top of the Experience section control which highlight bullets are visible by cross-referencing each bullet's skill tags against the skills dictionary (where every skill carries proficiency, preference, and status). A bullet with no skill tags is always shown. A role whose every bullet is filtered out dims rather than disappears — the job title and company stay visible so the timeline stays readable. A **relevance** sort mode floats the entries with the most matching highlights to the top; **date** (default) preserves the original reverse-chronological order.

### Three-Dimensional Skill System

Every skill is tagged on three orthogonal axes:

| Axis | Values | Purpose |
| ------ | -------- | --------- |
| **Proficiency** | expert, proficient, familiar | How well I know it |
| **Preference** | preferred, neutral | How much I want to use it |
| **Status** | active, legacy | Whether I'm currently using it |

These power an interactive `SkillsGrid` component with faceted filtering (toggle pills to hide dimensions) and multi-key weighted sorting. Expert+preferred+active floats to the top; familiar+neutral+legacy sinks to the bottom.

### Content as Flat Files

All content lives in `content/` — `content.json` for structured site and resume data and `.md` files with YAML frontmatter for blog posts. Both are read at build time with `fs.readFileSync`. No database, no headless CMS, no API calls during the build (except GitHub for the projects page, which fetches client-side to avoid rate limits in CI).

### Local-Only Admin Panel

The `/admin` page is a tabbed editor for site settings, homepage, about page, CV, skills, and blog posts that talks to local API routes which read/write files on disk. It features:

- **Dirty tracking** — Save buttons are disabled until you actually change something. Content data and blog posts are each compared against a JSON snapshot taken on load.
- **Save/Publish separation** — Save writes to disk (local only). Publish stages, commits, and pushes to git (triggering the deploy pipeline). The Publish button stays disabled until you've saved real changes.
- **Deep linking** — `DevEditLink` components on blog pages link to `/admin?tab=blog&edit={slug}`, auto-opening the editor for that post. These links are tree-shaken out of production builds.

### AI Skill Tagging

`scripts/tag-skills.ts` is an offline pipeline that reads `content.json`, sends each job's bullet points + the full skill vocabulary to OpenAI (`gpt-4o-mini`), and writes back enriched highlights like `{ text: "Built OAuth integration", skills: ["OAuth 2.0", "REST APIs"] }`. It's idempotent — re-running re-tags from scratch.

### Hand-Rolled Markdown

The blog renderer (`src/components/Markdown.tsx`) is ~40 lines of sequential regex replacements instead of a heavyweight markdown library. Handles fenced code blocks, headers, bold, italic, links, lists, and horizontal rules. Acceptable tradeoff for a single-author blog with no user-generated content.

## Blog Posts

Add a `.md` file to `content/blog/` with frontmatter:

```markdown
---
title: "Post Title"
date: "2026-02-23"
excerpt: "Short description."
tags: ["tag1", "tag2"]
---

Content here...
```

## Development

```bash
npm install
npm run dev       # http://localhost:3000 (with admin panel + API routes)
npm test          # 278 tests across 22 suites
npm run build     # static export to ./out
npm run lint:quality  # ESLint code-smell check (0 warnings allowed)
```

## Deployment

Pushes to `main` auto-deploy via GitHub Actions to GitHub Pages. The workflow deletes `src/app/api/` before building, then exports static HTML. See `.github/workflows/deploy.yml`.

## Testing

Jest + React Testing Library with 278 tests across 22 suites mirroring the `src/` structure. Mocking strategy: `fs` and `gray-matter` mocked in content tests, `child_process` mocked for git publish tests, `next/link` and `next/navigation` mocked in component tests. Tests assert current feature-flag values to catch accidental flips.

| Suite | Description |
|---|---|
| `app/` | Page-level smoke tests (7 suites) |
| `components/` | `DevEditLink`, `Footer`, `Header`, `Markdown`, `ProjectsList`, `SkillsGrid`, `TogglePill` |
| `content/` | CV JSON data shape |
| `lib/` | `admin`, `blog`, `dates`, `linkedin`, `siteConfig`, `skills` |

## Code Quality

`npm run lint:quality` runs ESLint with [eslint-plugin-sonarjs](https://github.com/SonarSource/SonarJS) and enforces the following thresholds (zero warnings allowed):

| Rule | Threshold |
|---|---|
| Cyclomatic complexity | ≤ 15 |
| Cognitive complexity | ≤ 15 |
| Nesting depth | ≤ 4 |
| Duplicate strings (`.ts` only) | < 4 occurrences |
| Identical functions, duplicated branches | error |

The sole exempt file is `src/app/admin/page.tsx`, which is an intentionally monolithic tabbed form.

## Tech Stack

- [Next.js](https://nextjs.org) (App Router, conditional static export)
- [React](https://react.dev) 19 with React Compiler
- [Tailwind CSS](https://tailwindcss.com) v4 (custom dark theme via `@theme inline` tokens)
- [TypeScript](https://www.typescriptlang.org)
- [Lucide React](https://lucide.dev) for icons (maintained Feather Icons fork)
- [gray-matter](https://github.com/jonschlinkert/gray-matter) for blog frontmatter
- [Jest](https://jestjs.io) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
