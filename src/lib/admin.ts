/**
 * Admin helpers — read and write cv.json and blog posts from disk.
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

const CV_PATH = path.resolve(process.cwd(), "content/cv.json");
const BLOG_DIR = path.resolve(process.cwd(), "content/blog");

// ─── CV Helpers ─────────────────────────────────────────────────────

/** Read and parse cv.json. Throws if the file is missing or corrupt. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function readCvData(): Record<string, any> {
  const raw = fs.readFileSync(CV_PATH, "utf-8");
  return JSON.parse(raw);
}

/** Write data back to cv.json with pretty-printing. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function writeCvData(data: Record<string, any>): void {
  fs.writeFileSync(CV_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
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
    .filter((f) => f.endsWith(".md"))
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
