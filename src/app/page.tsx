/**
 * Homepage — The front door.
 *
 * Three sections, from top to bottom:
 *
 * 1. Hero — Name, tagline, and CTAs. The buttons dynamically
 *    adjust based on which sections are enabled in siteConfig.
 *    If projects is off, "About Me" gets promoted to primary.
 *
 * 2. Feature cards — Three pillars of what I do, driven by
 *    content.json so they're editable from the admin panel.
 *    Each card maps an icon identifier to an inline SVG.
 *
 * 3. Recent posts — The latest 3 blog posts, pulled at build time.
 *    Only renders if the blog section is enabled AND posts exist.
 *    A "View all" link takes visitors to the full blog index.
 *
 * // Confession: I spent more time choosing the hero font size
 * // than writing most of the blog posts. ✨Priorities✨
 */
import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/siteConfig";
import { formatPostDate } from "@/lib/dates";
import { content } from "@/lib/content";
import { ArrowLeftRight, Shield, Building2 } from "lucide-react";

/** Map icon identifiers from content.json to Lucide icon components. */
const featureIcons: Record<string, React.ReactNode> = {
  integration: <ArrowLeftRight className="w-5 h-5" />,
  security: <Shield className="w-5 h-5" />,
  architecture: <Building2 className="w-5 h-5" />,
};

export default function Home() {
  // Only fetch posts if the blog is enabled — no wasted I/O
  const recentPosts = siteConfig.sections.blog ? getAllPosts().slice(0, 3) : [];

  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* Hero */}
      <section className="py-24 md:py-32">
        <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-8 md:gap-12">
          <div>
            <p className="text-accent font-mono text-sm mb-4">{content.home.greeting}</p>
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
          </div>
          <Image
            src="/avatar.png"
            alt={siteConfig.name}
            width={200}
            height={200}
            priority
            className="rounded-full w-36 h-36 md:w-48 md:h-48 shrink-0"
          />
        </div>
      </section>

      {/* Quick intro cards */}
      <section className="py-16 border-t border-border">
        <div className="grid md:grid-cols-3 gap-8">
          {content.home.featureCards.map((card) => (
            <div key={card.title} className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-accent/8 flex items-center justify-center text-accent">
                {featureIcons[card.icon] ?? featureIcons.integration}
              </div>
              <h2 className="font-semibold text-base">{card.title}</h2>
              <p className="text-sm text-muted">{card.description}</p>
            </div>
          ))}
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
