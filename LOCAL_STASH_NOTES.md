# Local Stash Notes

> These are the 4 unpushed local commits (`de15863`→`e112e38`) that diverged
> from `origin/main` at commit `0183706` ("update work location for Qlik").
> The backup branch `local-stash-feb26` preserves them exactly.
>
> The remote had meanwhile accumulated 25 commits on the same base, so most of
> this work was **superseded** — but some pieces may still need re-applying.

---

## Commit 1 — `de15863` "add SEO/Analytics"

### New files

| File | What it does |
|------|--------------|
| `src/app/robots.ts` | Next.js `MetadataRoute.robots` handler — outputs `robots.txt` disallowing `/admin`, `allowed: "/"` |
| `src/app/sitemap.ts` | Next.js `MetadataRoute.sitemap` handler — static pages + all blog slugs with dates, weekly/daily changefreq |
| `__tests__/app/robots.test.ts` | Unit tests for robots route |
| `__tests__/app/sitemap.test.ts` | Unit tests for sitemap (mocks blog list, checks all URLs emitted) |
| `__tests__/components/CVExperience.test.tsx` | Component tests for the expanded CVExperience filter bar |

### Modified files

**`src/app/layout.tsx`** — Added full Next.js metadata block:
- `metadataBase` pointing to `siteConfig.siteUrl`
- `title.default` / `title.template` pattern
- `openGraph` block (website type, locale, url, siteName, description)
- `twitter` card block (`summary`)
- JSON-LD structured data `<script type="application/ld+json">` — `Person` schema with name, url, email, jobTitle, sameAs (GitHub + LinkedIn)
- Cloudflare Web Analytics `<script>` tag — production-only, using `siteConfig.cloudflareAnalyticsToken`

**`src/components/CVExperience.tsx`** — Expanded significantly:
- Added filter bar with proficiency / preference / status toggles (TogglePill)
- Added client-side filtering logic
- Moved from pure server component to `"use client"` with filter state

**`src/lib/siteConfig.ts`** — Added:
- `siteUrl: "https://chadmoore.info"` 
- `cloudflareAnalyticsToken` (env var or empty string fallback)

**`content/content.json`** — Added `seo` sub-object (keywords array, canonicalUrl).

---

## Commit 2 — `5f751f1` "fix nested link"

### Modified files

**`src/app/blog/page.tsx`** — Fixed HTML spec violation where `<Link>` was wrapping a block containing `<DevEditLink>` (which renders an `<a>`), causing nested `<a>` tags:
- Changed outer `<Link>` to `<div>` with same hover classes
- Made inner `<Link>` wrap only the post content (title, date, excerpt, tags)
- Moved `<DevEditLink>` outside the `<Link>`, directly inside the `<div>`

**`src/app/layout.tsx`** — Minor: reorganised import order.

---

## Commit 3 — `c7525c4` "Update content via admin"

The **big refactor** — split the 1378-line monolithic `src/app/admin/page.tsx` into separate components and hooks.

### New components (`src/app/admin/components/`)

| File | Responsibility |
|------|----------------|
| `Field.tsx` | Shared label+input wrapper; exports `inputClass` constant |
| `AboutTab.tsx` | About page intro paragraphs (add/edit/remove) |
| `BlogTab.tsx` | Blog list + full post editor (title, slug, date, excerpt, tags, markdown content) |
| `CVTab.tsx` | Experience, education, headline, location editor |
| `HomeTab.tsx` | Homepage hero text + feature cards editor |
| `ImportTab.tsx` | LinkedIn ZIP upload → parse → preview → apply workflow |
| `ProjectsTab.tsx` | Projects page heading + description |
| `SiteTab.tsx` | Site name, tagline, links (email/GitHub/LinkedIn), section visibility checkboxes |
| `SkillsTab.tsx` | Skills by category — proficiency / preference / status dropdowns, add/remove skills and categories |

### New hooks (`src/app/admin/hooks/`)

| File | Responsibility |
|------|----------------|
| `useAdminContent.ts` | Fetches `content.json`, owns `data` state, `updateField<K>` generic setter, `save` (PUT to API + dirty tracking), `reset` (revert to last saved), `publish` (POST to publish API), `hasUnpublished` flag |
| `useBlogEditor.ts` | Blog post list fetch, `openEditor(slug)`, `startNewPost`, `saveBlogPost` (POST/PUT), `deletePost`, `updateEditingPost`, deep-link handling via URL `?tab=blog&edit=slug` / `?new=1` |
| `useAboutMutations.ts` | `updateIntroParagraph`, `addIntroParagraph`, `removeIntroParagraph` |
| `useCardMutations.ts` | `updateCard`, `addCard`, `removeCard` for homepage feature cards |
| `useLinkedInImport.ts` | File state, `handleLinkedInImport` (POST to `/api/admin/linkedin`), `applyLinkedInImport`, `handleFileChange` |
| `useSkillMutations.ts` | `updateSkill`, `removeSkill`, `addSkill`, `addCategory`, `removeCategory` |
| `useTabDragReorder.ts` | Drag-and-drop tab reordering (mousedown/mousemove/mouseup) |

### New support files

| File | Contents |
|------|----------|
| `src/app/admin/constants.ts` | `PROFICIENCY_OPTIONS`, `PREFERENCE_OPTIONS`, `STATUS_OPTIONS`, `ICON_OPTIONS` arrays |
| `src/app/admin/types.ts` | `BlogPostMeta` and `BlogPostFull` interfaces |

### Other changes

- `src/app/globals.css` — added a few utility class definitions used by admin UI
- `eslint.config.mjs` — removed the complexity override for `admin/page.tsx` (no longer needed after extraction)

---

## Commit 4 — `e112e38` "improve: update site content and configuration"

### New/changed library files

**`src/lib/content.ts`** (new) — Typed re-export of `content.json`:
```ts
import rawContent from "@/../content/content.json";
import type { ContentData } from "@/lib/contentData";
export const content = rawContent as unknown as ContentData;
```
Eliminates the repeated `rawContent as unknown as ContentData` pattern across every page file.

**`src/lib/siteConfig.ts`** — Simplified: removed redundant fields, consolidated env-var reading.

### Pages updated to use `import { content } from "@/lib/content"`

- `src/app/page.tsx`
- `src/app/blog/page.tsx`
- `src/app/about/page.tsx`
- `src/app/cv/page.tsx`
- `src/app/projects/page.tsx`
- `src/app/layout.tsx`

### Blog page improvements

- Added "+ Post" dev-only link in heading row:
  ```tsx
  {process.env.NODE_ENV !== 'production' && (
    <a href="/admin?tab=blog&new=1">+ Post</a>
  )}
  ```
- Description paragraph moved to `mt-4` after heading flex row

### Admin panel (`src/app/admin/page.tsx`)

- Updated to wire in the extracted hooks and tab components
- Slimmed from 1378 to ~15 lines of composition code

### Component tweaks

- `src/components/CVExperience.tsx` — minor refinement to filter bar classes
- `src/components/TogglePill.tsx` — added `aria-pressed` attribute
- `src/components/Markdown.tsx` — added `prose-a:break-words` to class list

### Infrastructure

- `.gitignore` — added `.agentic-tools-mcp/` and `*.local` entries
- `.vscode/settings.json` — added editor settings (formatOnSave, defaultFormatter)
- `public/robots.txt` — **deleted** (superseded by `src/app/robots.ts`)
- `package.json` — bumped `@types/node`, adjusted scripts
- `scripts/tag-skills.ts` — minor type fix

### Test updates

- `__tests__/app/home.test.tsx` — added test for "+ Post" link absence in production
- `__tests__/components/Header.test.tsx` — updated for any nav-link changes
- `__tests__/lib/admin.test.ts` — minor snapshot update
- `__tests__/lib/blog.test.ts` — minor update
- `__tests__/lib/siteConfig.test.ts` — updated for new siteConfig shape
- `README.md` — updated test count and descriptions

---

## Likely already superseded by remote

| Local change | Remote equivalent |
|---|---|
| `robots.ts` + `sitemap.ts` (new) | `04f20be` "feat: add SEO metadata, robots/sitemap" |
| `layout.tsx` metadata / OG / JSON-LD | `04f20be` same commit |
| Admin component extraction (commit 3) | Remote has continued building on admin — CVTab editor, LighthouseTab, CV experience editor all added on top |
| Nested link fix in blog page | `04f20be` or related — blog page was also touched |
| `content.ts` typed wrapper | Likely already there — check `src/lib/content.ts` after pull |

## Status after pulling `origin/main` (verified Feb 26 2026)

| Local change | Status in remote |
|---|---|
| `robots.ts` / `sitemap.ts` | ✅ Already present |
| `layout.tsx` OG / JSON-LD / Cloudflare Analytics | ✅ Already present |
| Admin component extraction (commit 3) | ✅ Remote built further on top |
| Nested link fix in blog page | ✅ Already present |
| `src/lib/content.ts` typed wrapper | ✅ Already present |
| `+ Post` dev shortcut on blog page | ✅ Already present (`/admin?tab=blog&new=1`) |
| `TogglePill` `aria-pressed` | ✅ Already present |
| Cloudflare Analytics in `layout.tsx` | ✅ Already present |

## Still genuinely missing — needs re-applying

| Item | File | Change |
|---|---|---|
| `prose-a:break-words` | `src/components/Markdown.tsx` | Add to the prose className list so long URLs in markdown posts don't overflow |

That's it — everything else landed in the remote. The effort to reimplement is minimal: one line in Markdown.tsx.
