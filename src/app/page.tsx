/**
 * Homepage — The front door.
 *
 * Three sections, from top to bottom:
 *
 * 1. Hero — Name, tagline, and CTAs. The buttons dynamically
 *    adjust based on which sections are enabled in siteConfig.
 *    If projects is off, "About Me" gets promoted to primary.
 *
 * 2. Feature cards — Three pillars of what I do, each with an
 *    SVG icon. These are intentionally not data-driven because
 *    there are exactly three and they won't change often.
 *
 * 3. Recent posts — The latest 3 blog posts, pulled at build time.
 *    Only renders if the blog section is enabled AND posts exist.
 *    A "View all" link takes visitors to the full blog index.
 *
 * // Confession: I spent more time choosing the hero font size
 * // than writing most of the blog posts. Priorities.
 */
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import siteConfig from "@/lib/siteConfig";

export default function Home() {
  // Only fetch posts if the blog is enabled — no wasted I/O
  const recentPosts = siteConfig.sections.blog ? getAllPosts().slice(0, 3) : [];

  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* Hero */}
      <section className="py-24 md:py-32">
        <p className="text-accent font-mono text-sm mb-4">Hi, I&apos;m</p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          {siteConfig.name}
        </h1>
        <p className="text-xl md:text-2xl text-muted max-w-2xl mb-8">
          {siteConfig.tagline}
        </p>
        <div className="flex gap-4">
          {siteConfig.sections.projects && (
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              View Projects
            </Link>
          )}
          {siteConfig.sections.about && (
            <Link
              href="/about"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                siteConfig.sections.projects
                  ? "border border-border hover:border-accent text-muted hover:text-accent"
                  : "bg-accent hover:bg-accent-hover text-white"
              }`}
            >
              About Me
            </Link>
          )}
          {siteConfig.sections.cv && (
            <Link
              href="/cv"
              className="inline-flex items-center gap-2 border border-border hover:border-accent text-muted hover:text-accent px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              View CV
            </Link>
          )}
        </div>
      </section>

      {/* Quick intro cards */}
      <section className="py-16 border-t border-border">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="font-semibold">Full Stack Development</h3>
            <p className="text-sm text-muted">
              Building end-to-end solutions from database design to polished user interfaces.
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold">Data Driven</h3>
            <p className="text-sm text-muted">
              Turning complex data into actionable insights and intelligent applications.
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="font-semibold">Creative Solutions</h3>
            <p className="text-sm text-muted">
              Approaching problems with creativity and pragmatic engineering.
            </p>
          </div>
        </div>
      </section>

      {/* Recent blog posts */}
      {recentPosts.length > 0 && (
        <section className="py-16 border-t border-border">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-xl font-semibold tracking-tight">Recent Posts</h2>
            <Link
              href="/blog"
              className="text-sm text-muted hover:text-accent transition-colors"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="space-y-1">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 py-4 border-b border-border hover:bg-surface-hover -mx-4 px-4 rounded-lg transition-colors"
              >
                <span className="font-medium group-hover:text-accent transition-colors">
                  {post.title}
                </span>
                <time className="text-sm text-muted shrink-0 font-mono">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
