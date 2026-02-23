/**
 * Blog Index — All posts, newest first.
 *
 * Reads every .md file from /content/blog/ at build time
 * and renders them as a clean, scannable list.
 *
 * Each entry shows:
 *  - Title (linked to the full post)
 *  - Date in a monospaced font for alignment
 *  - Excerpt (clamped to 2 lines)
 *  - Tags as colored pills
 *
 * If there are no posts yet, shows a polite empty state.
 *
 * The hover effect uses negative margin + padding to create
 * a full-bleed highlight without breaking the layout. Classic trick.
 *
 * // You know what's harder than writing code? Writing blog posts.
 * // But here we are. Committed to both.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog | Chad Moore",
  description: "Thoughts and writing by Chad Moore",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Blog
        </h1>
        <p className="text-muted">
          Thoughts on software, data, and building things.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="border border-border rounded-xl p-12 text-center">
          <p className="text-muted">No posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-1">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block py-6 border-b border-border hover:bg-surface-hover -mx-4 px-4 rounded-lg transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 mb-2">
                <h2 className="text-lg font-semibold group-hover:text-accent transition-colors">
                  {post.title}
                </h2>
                <time className="text-sm text-muted shrink-0 font-mono">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </div>
              <p className="text-sm text-muted line-clamp-2">{post.excerpt}</p>
              {post.tags.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-accent/10 text-accent px-2.5 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
