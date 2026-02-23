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
 * Parses a single .md file into a BlogPost.
 * Extracted to keep getAllPosts and getPostBySlug DRY.
 */
function parsePost(filename: string): BlogPost {
  const slug = filename.replace(/\.md$/, "");
  const filePath = path.join(POSTS_DIR, filename);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return {
    slug,
    title: (data.title as string) || slug,
    date: (data.date as string) || "",
    excerpt: (data.excerpt as string) || content.slice(0, 160).trim() + "...",
    content,
    tags: (data.tags as string[]) || [],
  };
}

/**
 * Returns all blog posts, sorted newest-first.
 * Gracefully returns [] if the content directory doesn't exist yet.
 */
export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(parsePost)
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
