# chadmoore.info

Personal homepage built with Next.js, React, and Tailwind CSS. Deployed to GitHub Pages.

**Live:** [https://chadmoore.info](https://chadmoore.info)

## Pages

- **Home** — Hero intro with recent blog posts
- **About** — Bio, skills, and contact info
- **Blog** — Markdown-based blog (posts in `content/blog/`)
- **CV** — Resume powered by `content/cv.json`
- **Projects** — GitHub repos via API (currently hidden)

## Site Config

Toggle sections on/off in `src/lib/siteConfig.ts`:

```ts
sections: {
  about: true,
  projects: false,
  blog: true,
  cv: true,
}
```

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
npm run dev       # http://localhost:3000
npm run build     # static export to ./out
```

## Deployment

Pushes to `main` auto-deploy via GitHub Actions to GitHub Pages. See `.github/workflows/deploy.yml`.

## Tech Stack

- [Next.js](https://nextjs.org) (App Router, static export)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com) v4
- [TypeScript](https://www.typescriptlang.org)
- [gray-matter](https://github.com/jonschlinkert/gray-matter) for blog frontmatter
