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
 * // than writing most of the blog posts. ✨Priorities✨
 */
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/siteConfig";
import { formatPostDate } from "@/lib/dates";

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="font-semibold">Enterprise Integration</h3>
            <p className="text-sm text-muted">
              Connecting systems that weren&apos;t designed to talk to each other — from
              legacy terminals to modern cloud platforms.
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="font-semibold">Secure Identity &amp; APIs</h3>
            <p className="text-sm text-muted">
              Deep expertise in OAuth, SAML, OIDC, and SSO — designing
              authentication and authorization systems at scale.
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-semibold">Architecture &amp; Technical Leadership</h3>
            <p className="text-sm text-muted">
              Owning system design and technical direction across complex
              enterprise engagements for Fortune 50 organizations.
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
                  {formatPostDate(post.date)}
                </time>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
