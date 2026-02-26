/**
 * Admin helpers — read and write content.json and blog posts from disk.
 *
 * Server-side only (used by Route Handlers). These functions
 * give the admin API a clean interface to the content directory
 * without scattering fs calls around the codebase.
 *
 * // Note to future self: this file touches the filesystem.
 * // Don't import it from client components or you'll have a bad time.
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { execSync } from "child_process";
import type { ContentData } from "@/lib/contentData";
import { generateCvPdf } from "../../scripts/generate-cv-pdf";

const CONTENT_PATH = path.resolve(process.cwd(), "content/content.json");
const BLOG_DIR = path.resolve(process.cwd(), "content/blog");

// ─── Content Helpers ────────────────────────────────────────────────

/** Read and parse content.json. Throws if the file is missing or corrupt. */
export function readContentData(): ContentData {
  const raw = fs.readFileSync(CONTENT_PATH, "utf-8");
  return JSON.parse(raw);
}

/** Write data back to content.json with pretty-printing. */
export function writeContentData(data: ContentData): void {
  fs.writeFileSync(CONTENT_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

// ─── Blog Helpers ───────────────────────────────────────────────────

/** Shape of a blog post for admin APIs (metadata + raw content). */
export interface AdminBlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  content: string;
}

/** List all blog posts (metadata only, no content body). Sorted newest-first. */
export function listBlogPosts(): Omit<AdminBlogPost, "content">[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
      const { data } = matter(raw);
      return {
        slug,
        title: (data.title as string) || slug,
        date: (data.date as string) || "",
        excerpt: (data.excerpt as string) || "",
        tags: (data.tags as string[]) || [],
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** Read a single blog post by slug. Returns null if not found. */
export function readBlogPost(slug: string): AdminBlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: (data.title as string) || slug,
    date: (data.date as string) || "",
    excerpt: (data.excerpt as string) || "",
    tags: (data.tags as string[]) || [],
    content,
  };
}

/** Create a new blog post. Throws if the slug already exists. */
export function createBlogPost(post: AdminBlogPost): void {
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }

  const filePath = path.join(BLOG_DIR, `${post.slug}.md`);
  if (fs.existsSync(filePath)) {
    throw new Error(`Post "${post.slug}" already exists`);
  }

  const md = matter.stringify(post.content || "", {
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    tags: post.tags || [],
  });
  fs.writeFileSync(filePath, md, "utf-8");
}

/** Update an existing blog post. Throws if the file doesn't exist. */
export function updateBlogPost(slug: string, post: Omit<AdminBlogPost, "slug">): void {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Post "${slug}" not found`);
  }

  const md = matter.stringify(post.content || "", {
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    tags: post.tags || [],
  });
  fs.writeFileSync(filePath, md, "utf-8");
}

/** Delete a blog post. Throws if the file doesn't exist. */
export function deleteBlogPost(slug: string): void {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Post "${slug}" not found`);
  }
  fs.unlinkSync(filePath);
}

// ─── Git Publish ────────────────────────────────────────────────────

const REPO_ROOT = process.cwd();

/** Derive the PDF output path from the current content configuration. */
function getPdfOutputPath(data: { site: { cvLabel?: string } }): string {
  const slug = data.site.cvLabel === "cv" ? "cv" : "resume";
  return path.resolve(REPO_ROOT, "public", `${slug}.pdf`);
}

/** Regenerate the CV PDF from current content.json data. */
export async function regenerateCvPdf(): Promise<void> {
  const data = readContentData();
  await generateCvPdf(data, getPdfOutputPath(data));
}

/** Stage, commit, and push content changes. Returns the commit hash. */
export async function publishChanges(message: string): Promise<string> {
  await regenerateCvPdf();

  const opts = { cwd: REPO_ROOT, encoding: "utf-8" as const };

  // Pull remote changes first so our commit goes cleanly on top,
  // avoiding a rebase conflict if remote has moved since last push.
  execSync("git pull --rebase", opts);

  execSync("git add -A", opts);

  // If there's nothing to commit, skip
  const status = execSync("git status --porcelain", opts).trim();
  if (!status) return "no-changes";

  execSync(`git commit -m ${JSON.stringify(message)}`, opts);
  execSync("git push", opts);

  return execSync("git rev-parse --short HEAD", opts).trim();
}
