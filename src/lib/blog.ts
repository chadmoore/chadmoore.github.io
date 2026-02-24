/**
 * Blog Engine — Markdown Files In, Blog Posts Out
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * The world's most over-engineered static blog? No.
 * The world's most *appropriately* engineered one? Maybe.
 *
 * Posts live in /content/blog/ as plain .md files with YAML frontmatter:
 *
 *   ---
 *   title: "My Post"
 *   date: "2026-02-23"
 *   excerpt: "Optional excerpt"
 *   tags: ["tag1", "tag2"]
 *   ---
 *   Content in Markdown...
 *
 * Everything is read at build time (fs.readFileSync) so the resulting
 * site is 100% static — no runtime, no database, no problems.
 *
 * gray-matter handles the frontmatter parsing. It's battle-tested
 * and has been around longer than most JavaScript frameworks.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

/** Shape of a parsed blog post. */
export interface BlogPost {
  slug: string;    // URL-safe identifier, derived from the filename
  title: string;   // From frontmatter, falls back to the slug
  date: string;    // ISO date string for sorting and display
  excerpt: string; // From frontmatter, or auto-generated from content
  content: string; // Raw markdown body (rendered by <Markdown />)
  tags: string[];  // Categorical tags for display (not yet filterable — PRs welcome)
}

/** Absolute path to the blog content directory. */
const POSTS_DIR = path.join(process.cwd(), "content", "blog");

/**
 * Builds a slug→title map by reading frontmatter from all post files.
 * Separate from parsePost to avoid circular calls with resolveWikiLinks.
 */
function buildTitleMap(): Map<string, string> {
  if (!fs.existsSync(POSTS_DIR)) return new Map();
  const titles = new Map<string, string>();
  for (const filename of fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
    const slug = filename.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf-8");
    const { data } = matter(raw);
    titles.set(slug, (data.title as string) || slug);
  }
  return titles;
}

/**
 * Resolves wiki-style links in markdown content.
 *
 * Supported syntax:
 *   [[slug]]             → [Post Title](/blog/slug)
 *   [[slug|custom text]] → [custom text](/blog/slug)
 *
 * If the target post doesn't exist, the link text falls back to the slug.
 * This runs at build time so we have full filesystem access.
 */
export function resolveWikiLinks(content: string, titleMap?: Map<string, string>): string {
  // Lazy-build the map only if the content actually has wiki-links
  if (!/\[\[/.test(content)) return content;
  const titles = titleMap ?? buildTitleMap();

  return content.replace(
    /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (_match, slug: string, customText?: string) => {
      const trimmedSlug = slug.trim();
      const displayText = customText?.trim() || titles.get(trimmedSlug) || trimmedSlug;
      return `[${displayText}](/blog/${trimmedSlug})`;
    }
  );
}

/**
 * Parses a single .md file into a BlogPost.
 * Extracted to keep getAllPosts and getPostBySlug DRY.
 */
function parsePost(filename: string, titleMap?: Map<string, string>): BlogPost {
  const slug = filename.replace(/\.md$/, "");
  const filePath = path.join(POSTS_DIR, filename);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return {
    slug,
    title: (data.title as string) || slug,
    date: (data.date as string) || "",
    excerpt: (data.excerpt as string) || content.slice(0, 160).trim() + "...",
    content: resolveWikiLinks(content, titleMap),
    tags: (data.tags as string[]) || [],
  };
}

/**
 * Returns all blog posts, sorted newest-first.
 * Gracefully returns [] if the content directory doesn't exist yet.
 */
export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const titleMap = buildTitleMap();
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parsePost(f, titleMap))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Fetches a single post by its slug (filename without .md).
 * Returns null if the file doesn't exist — the page will 404.
 */
export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return parsePost(`${slug}.md`);
}
