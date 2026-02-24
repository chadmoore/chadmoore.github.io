/**
 * Blog Post Page — Individual post rendered from markdown.
 *
 * This is a dynamic route ([slug]) that's pre-rendered at build time
 * via generateStaticParams(). Every .md file in /content/blog/ gets
 * its own static HTML page — zero JavaScript needed to read a post.
 *
 * The flow:
 *  1. generateStaticParams() lists all slugs for static generation
 *  2. generateMetadata() sets the <title> and description per-post
 *  3. The page component fetches the post and renders it via <Markdown />
 *  4. If the slug doesn't match a file, notFound() triggers the 404 page
 *
 * // Pro tip for future me: if you rename a blog post file,
 * // the old URL will 404. Set up redirects if you care about that.
 * // (You probably don't. It's a personal blog.)
 */
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Markdown from "@/components/Markdown";
import DevEditLink from "@/components/DevEditLink";
import { formatPostDate } from "@/lib/dates";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Chad Moore`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <Link
        href="/blog"
        className="text-sm text-muted hover:text-accent transition-colors mb-8 inline-flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to blog
      </Link>

      <article>
        <header className="mb-10">
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {post.title}
            </h1>
            <DevEditLink slug={post.slug} />
          </div>
          <time className="text-sm text-muted font-mono mt-3 block">
            {formatPostDate(post.date, "long")}
          </time>
          {post.tags.length > 0 && (
            <div className="flex gap-2 mt-4">
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
        </header>

        <Markdown content={post.content} />
      </article>
    </div>
  );
}
