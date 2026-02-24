---
title: Iteration with agents can be exhilarating
date: '2026-02-24'
excerpt: How I use a structured copilot-instructions file and conversational TDD to build features at speed with AI agents.
tags:
  - meta
  - agentic workflows
  - ai
---

## The Loop

Something clicked for me recently about working with agentic AI. Not the "type a prompt, get some code" kind — the conversational kind, where you're iterating with an agent across a whole session, building real features in a real codebase.

This site is the proving ground. It's a Next.js static site deployed to GitHub Pages, and I've been building it almost entirely through conversation with an AI coding agent. Not copy-pasting snippets — actually pair-programming, where the agent has full context of the project and I steer direction while it handles implementation.

The speed is genuinely startling sometimes.

## The Instructions File

The key piece that makes this work is a file called `.github/copilot-instructions.md`. It's project-level guidance that every AI agent session loads automatically. Mine lays out four core principles:

- **TDD** — Red, green, refactor. Write a failing test first, then the minimal code to pass it. Never implement without a corresponding test.
- **KISS** — Favor the simplest solution. A junior engineer should be able to read the code.
- **DRY** — Extract shared logic. If you're copy-pasting, stop.
- **GoF patterns** — Use them when they naturally fit. Don't force them.

It also defines the project's conventions: TypeScript strict mode, Tailwind v4, content as flat JSON files, how tests are structured, even that we prefer `interface` over `type` for object shapes.

The result is that every agent session starts with shared context about *how* we work, not just *what* we're building. I don't have to re-explain "write a test first" every time. The agent just does it.

## How a Feature Gets Built

Here's a real example from today. I wanted wiki-style internal links between blog posts — the kind where you write `[[hello-world]]` and it becomes a link to that post with its title as the display text.

The conversation went roughly like this:

1. I described what I wanted in plain English
2. The agent researched the codebase — found the markdown renderer, the blog engine, the existing test patterns
3. It proposed wiki-style `[[slug]]` syntax (the Obsidian/MediaWiki convention) and I agreed
4. It implemented `resolveWikiLinks()` in the blog engine, with a title map built from frontmatter
5. It updated the markdown renderer to distinguish internal links (no `target="_blank"`) from external ones
6. It wrote 7 new tests covering the feature
7. Everything passed, it committed

That whole cycle — from "I want this" to "it's committed with tests" — took minutes. Not hours.

## When Things Break

The interesting part is what happens when something doesn't work. I wrote this post to test the new wiki-link feature, and I included an example showing the syntax in backticks: `[[hello-world]]`. But the wiki-link resolver didn't know about code spans — it resolved both the example *and* the actual link, producing two links instead of one code sample and one link.

So I told the agent "the backtick example didn't work." It immediately understood the problem: the resolver was processing wiki-links inside inline code. It fixed it by stashing code blocks and inline code spans as placeholders before resolving links, then restoring them after. Three new tests to cover the edge cases. Done.

That's the loop. Build, use, find the edge case, fix it. The agent maintains enough context across the conversation that fixes are surgical — it doesn't need to re-discover the codebase each time.

## The Dev Server as a Content Tool

One pattern I really like in this project: the admin panel only exists in development. When I run `npm run dev`, there's a six-tab editor at `/admin` where I can modify site settings, homepage content, CV data, skills, and blog posts. Every page in the site has a little pencil icon in the header that deep-links to the right admin tab for that page.

But in production? The CI pipeline physically deletes the API routes before building. The admin panel doesn't get "disabled" — it ceases to exist in the artifact. The deployed site is pure static HTML with zero server-side code.

All the content lives in flat files — `content/content.json` for structured data, markdown files for blog posts. The admin panel just reads and writes those files through local API routes. Save writes to disk. Publish commits and pushes to git. That's it.

## Why This Works

I think the reason this workflow is effective comes down to a few things:

**Shared conventions reduce friction.** The instructions file means I'm not re-negotiating code style or testing strategy every session. The agent writes code that looks like *my* code.

**Tests create confidence at speed.** Because every feature ships with tests, I can move fast without worrying about regressions. The agent runs the full suite before committing — if something breaks, it fixes it before I even see it.

**Conversation preserves context.** Unlike fire-and-forget prompts, a session-long conversation means the agent accumulates understanding. By the time I'm on my third or fourth request, it knows the patterns, the file structure, the type system. Fixes get faster as the session goes on.

**The codebase stays clean.** This is the part that surprised me most. Because the agent follows the instructions file, the code doesn't accumulate the kind of debt you'd expect from rapid iteration. It refactors as it goes. It extracts shared logic. It writes comments that explain *why*, not *what*.

If you're interested in the setup, the [[hello-world]] post has more detail on the blog engine, and the full source is [on GitHub](https://github.com/chadmoore/chadmoore.github.io/).
